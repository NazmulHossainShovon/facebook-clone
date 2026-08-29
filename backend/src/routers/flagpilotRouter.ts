import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { FlagpilotProject } from "../models/flagpilotProjectModel";
import {
  FlagpilotFeatureFlag,
  IFlagpilotFeatureFlag,
  IFlagpilotVariant,
} from "../models/flagpilotFeatureFlagModel";
import { FlagpilotEvaluationLog } from "../models/flagpilotEvaluationLogModel";
import { calculateThompsonWeights } from "../lib/mab";
import { isAuth } from "../utils";

const router = express.Router();

type CreateVariantInput = {
  key: string;
  value: unknown;
};

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const trimmed = part.trim();
    const idx = trimmed.indexOf("=");
    if (idx <= 0) return acc;
    const key = trimmed.slice(0, idx);
    const value = decodeURIComponent(trimmed.slice(idx + 1));
    acc[key] = value;
    return acc;
  }, {});
}

function getAnonymousUserId(req: express.Request): { anonUserId: string; created: boolean } {
  const anonUserId = getExistingAnonymousUserId(req);

  if (anonUserId) {
    return { anonUserId, created: false };
  }

  return { anonUserId: `anon_${crypto.randomUUID()}`, created: true };
}

function getExistingAnonymousUserId(req: express.Request): string | undefined {
  const headerAnon = req.header("x-anon-user-id") || undefined;
  const cookieMap = parseCookieHeader(req.header("cookie"));
  const cookieAnon = cookieMap.af_anon_id;
  return cookieAnon || headerAnon;
}

function buildCookieHeader(value: string): string {
  const oneYearSeconds = 60 * 60 * 24 * 365;
  return `af_anon_id=${encodeURIComponent(value)}; Max-Age=${oneYearSeconds}; Path=/; HttpOnly; SameSite=Lax`;
}

function normalizeVariants(variants: CreateVariantInput[]): IFlagpilotVariant[] {
  if (!Array.isArray(variants) || variants.length < 2) {
    throw new Error("At least two variants are required");
  }

  const dedupe = new Set<string>();
  return variants.map((variant) => {
    const key = (variant.key || "").trim();
    if (!key) {
      throw new Error("Variant key is required");
    }
    if (dedupe.has(key)) {
      throw new Error(`Duplicate variant key: ${key}`);
    }
    dedupe.add(key);

    return {
      key,
      value: variant.value,
      impressions: 0,
      conversions: 0,
      currentWeight: 1 / variants.length,
    } as IFlagpilotVariant;
  });
}

function selectWeightedVariant(variants: IFlagpilotVariant[]): IFlagpilotVariant {
  const rand = Math.random();
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.currentWeight;
    if (rand <= cumulative) {
      return variant;
    }
  }
  return variants[variants.length - 1];
}

async function recalculateFlagWeights(flag: IFlagpilotFeatureFlag): Promise<void> {
  const newWeights = calculateThompsonWeights(flag.variants);

  const updatedVariants = flag.variants.map((variant) => ({
    key: variant.key,
    value: variant.value,
    impressions: variant.impressions,
    conversions: variant.conversions,
    currentWeight: newWeights[variant.key] ?? variant.currentWeight,
  }));

  await FlagpilotFeatureFlag.updateOne({ _id: flag._id }, { $set: { variants: updatedVariants } });
}

router.post("/projects", isAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const orgId = req.user!._id;

    const project = new FlagpilotProject({
      name,
      orgId,
      apiKey: `fp_proj_${crypto.randomBytes(12).toString("hex")}`,
    });

    await project.save();
    return res.status(201).json(project);
  } catch (_err) {
    return res.status(500).json({ error: "failed to create project" });
  }
});

router.get("/projects", isAuth, async (req, res) => {
  try {
    const projects = await FlagpilotProject.find({ orgId: req.user!._id }).sort({ createdAt: -1 }).lean();
    return res.json(projects);
  } catch (_err) {
    return res.status(500).json({ error: "failed to fetch projects" });
  }
});

router.get("/projects/:id", isAuth, async (req, res) => {
  try {
    const project = await FlagpilotProject.findOne({ _id: req.params.id, orgId: req.user!._id }).lean();
    if (!project) {
      return res.status(404).json({ error: "project not found" });
    }
    return res.json(project);
  } catch (_err) {
    return res.status(500).json({ error: "failed to fetch project" });
  }
});

router.post("/flags", isAuth, async (req, res) => {
  try {
    const {
      projectId,
      key,
      description,
      status,
      variants,
      minImpressionsBeforeOptimization,
    } = req.body;

    if (!projectId || !key || !variants) {
      return res.status(400).json({
        error: "projectId, key, and variants are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "invalid projectId" });
    }

    // Verify project ownership
    const project = await FlagpilotProject.findOne({ _id: projectId, orgId: req.user!._id }).lean();
    if (!project) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    const normalizedVariants = normalizeVariants(variants);

    const flag = new FlagpilotFeatureFlag({
      project: projectId,
      key,
      description,
      status: status || "active",
      minImpressionsBeforeOptimization: minImpressionsBeforeOptimization || 100,
      trackedGoals: [],
      variants: normalizedVariants,
    });

    await flag.save();
    return res.status(201).json(flag);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === 11000) {
      return res.status(400).json({ error: "duplicate flag key for project" });
    }

    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "failed to create flag" });
  }
});

router.get("/flags", isAuth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
      return res.status(400).json({ error: "invalid projectId" });
    }

    // Verify project ownership
    const project = await FlagpilotProject.findOne({ _id: projectId, orgId: req.user!._id }).lean();
    if (!project) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    const flags = await FlagpilotFeatureFlag.find({ project: projectId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(flags);
  } catch (_err) {
    return res.status(500).json({ error: "failed to fetch flags" });
  }
});

router.get("/flags/:id", isAuth, async (req, res) => {
  try {
    const flag = await FlagpilotFeatureFlag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ error: "flag not found" });
    }

    // Verify project ownership
    const project = await FlagpilotProject.findOne({ _id: flag.project, orgId: req.user!._id }).lean();
    if (!project) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    return res.json(flag);
  } catch (_err) {
    return res.status(500).json({ error: "failed to fetch flag" });
  }
});

router.put("/flags/:id", isAuth, async (req, res) => {
  try {
    const flagToUpdate = await FlagpilotFeatureFlag.findById(req.params.id);
    if (!flagToUpdate) {
      return res.status(404).json({ error: "flag not found" });
    }

    // Verify project ownership
    const project = await FlagpilotProject.findOne({ _id: flagToUpdate.project, orgId: req.user!._id }).lean();
    if (!project) {
      return res.status(403).json({ error: "Unauthorized access to project" });
    }

    const update: Record<string, unknown> = {};
    const allowed = ["description", "status", "minImpressionsBeforeOptimization", "variants"];

    for (const key of allowed) {
      if (key in req.body) {
        update[key] = req.body[key];
      }
    }

    if (Array.isArray(update.variants)) {
      update.variants = normalizeVariants(update.variants as CreateVariantInput[]);
    }

    const flag = await FlagpilotFeatureFlag.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!flag) {
      return res.status(404).json({ error: "flag not found" });
    }

    // Automatically recalculate weights if we now meet or exceed the optimization threshold
    const totalImpressions = flag.variants.reduce((sum, v) => sum + v.impressions, 0);
    if (totalImpressions >= flag.minImpressionsBeforeOptimization) {
      await recalculateFlagWeights(flag);
      const updatedFlag = await FlagpilotFeatureFlag.findById(flag._id).lean();
      return res.json(updatedFlag);
    }

    return res.json(flag);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "failed to update flag" });
  }
});

// Evaluate & track remain public/unauthenticated endpoints since they are called from external client SDKs
router.post("/v1/evaluate", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    const { flagKey, goalEvent } = req.body;

    if (!apiKey || !flagKey || !goalEvent) {
      return res.status(400).json({
        error: "Missing required parameters: flagKey and goalEvent are required.",
      });
    }

    const { anonUserId, created } = getAnonymousUserId(req);

    const project = await FlagpilotProject.findOne({ apiKey }).lean();
    if (!project) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    const flag = await FlagpilotFeatureFlag.findOne({
      project: project._id,
      key: flagKey,
      status: "active",
    });

    if (!flag) {
      return res.status(404).json({ error: "Flag not found or inactive" });
    }

    if (!flag.trackedGoals.includes(goalEvent)) {
      await FlagpilotFeatureFlag.updateOne({ _id: flag._id }, { $addToSet: { trackedGoals: goalEvent } });
      flag.trackedGoals.push(goalEvent);
    }

    if (created) {
      res.setHeader("Set-Cookie", buildCookieHeader(anonUserId));
    }

    const existingLog = await FlagpilotEvaluationLog.findOne({
      flag: flag._id,
      userId: anonUserId,
      goalEvent,
    }).lean();

    if (existingLog) {
      const existingVariant = flag.variants.find((variant) => variant.key === existingLog.variantKey);
      if (!existingVariant) {
        return res.status(409).json({ error: "Assigned variant no longer exists for this flag" });
      }

      return res.json({
        variant: existingVariant.key,
        value: existingVariant.value,
        anonUserId,
      });
    }

    const selectedVariant = selectWeightedVariant(flag.variants);

    await Promise.all([
      FlagpilotEvaluationLog.create({
        flag: flag._id,
        userId: anonUserId,
        variantKey: selectedVariant.key,
        goalEvent,
      }),
      FlagpilotFeatureFlag.updateOne(
        { _id: flag._id, "variants.key": selectedVariant.key },
        { $inc: { "variants.$.impressions": 1 } }
      ),
    ]).catch((error) => {
      console.error("Flagpilot evaluate side effects failed", error);
    });

    return res.json({
      variant: selectedVariant.key,
      value: selectedVariant.value,
      anonUserId,
    });
  } catch (_err) {
    return res.status(500).json({ error: "failed to evaluate flag" });
  }
});

router.post("/v1/track", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    const { eventName } = req.body;
    const anonUserId = getExistingAnonymousUserId(req);

    if (!apiKey || !eventName || !anonUserId) {
      return res.status(400).json({ error: "Missing parameters or uninitialized session." });
    }

    const project = await FlagpilotProject.findOne({ apiKey }).lean();
    if (!project) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    res.status(200).json({ status: "queued" });

    const matchingFlags = await FlagpilotFeatureFlag.find({
      project: project._id,
      trackedGoals: eventName,
      status: "active",
    });

    for (const flag of matchingFlags) {
      const evalLog = await FlagpilotEvaluationLog.findOneAndUpdate(
        {
          flag: flag._id,
          userId: anonUserId,
          goalEvent: eventName,
          converted: false,
        },
        { $set: { converted: true } },
        { new: true }
      );

      if (!evalLog) {
        continue;
      }

      await FlagpilotFeatureFlag.updateOne(
        { _id: flag._id, "variants.key": evalLog.variantKey },
        { $inc: { "variants.$.conversions": 1 } }
      );

      const updatedFlag = await FlagpilotFeatureFlag.findById(flag._id);
      if (!updatedFlag) {
        continue;
      }

      const totalImpressions = updatedFlag.variants.reduce(
        (sum, variant) => sum + variant.impressions,
        0
      );

      if (totalImpressions >= updatedFlag.minImpressionsBeforeOptimization) {
        await recalculateFlagWeights(updatedFlag);
      }
    }
  } catch (error) {
    console.error("Flagpilot track failed", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "failed to track event" });
    }
  }
});

export default router;
