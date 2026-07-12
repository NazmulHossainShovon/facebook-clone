import express from "express";
import crypto from "crypto";
import { FlagpilotProject } from "../models/flagpilotProjectModel";
import { FlagpilotEnvironment } from "../models/flagpilotEnvironmentModel";
import { FlagpilotFeatureFlag } from "../models/flagpilotFeatureFlagModel";
import mongoose from "mongoose";

const router = express.Router();

// Create Project
router.post("/projects", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const project = new FlagpilotProject({ name });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "failed to create project" });
  }
});

// List Projects
router.get("/projects", async (_req, res) => {
  try {
    const projects = await FlagpilotProject.find().sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch projects" });
  }
});

// Create Environment
router.post("/environments", async (req, res) => {
  try {
    const { name, projectId } = req.body;
    if (!name || !projectId) return res.status(400).json({ error: "name and projectId required" });
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: "invalid projectId" });
    const apiKey = `fp_env_${crypto.randomBytes(8).toString("hex")}`;
    const env = new FlagpilotEnvironment({ name, project: projectId, apiKey });
    await env.save();
    res.json(env);
  } catch (err) {
    res.status(500).json({ error: "failed to create environment" });
  }
});

// List Environments for a project
router.get("/environments", async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });
    const envs = await FlagpilotEnvironment.find({ project: projectId }).sort({ createdAt: -1 }).lean();
    res.json(envs);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch environments" });
  }
});

// Create Feature Flag
router.post("/flags", async (req, res) => {
  try {
    const { environmentId, key, name, type, enabled, value, description } = req.body;
    if (!environmentId || !key || !name) return res.status(400).json({ error: "environmentId, key and name required" });
    const flag = new FlagpilotFeatureFlag({
      environment: environmentId,
      key,
      name,
      type: type || "BOOLEAN",
      enabled: !!enabled,
      value: value || "",
      description: description || "",
    });
    await flag.save();
    res.json(flag);
  } catch (err: any) {
    if (err && err.code === 11000) {
      return res.status(400).json({ error: "duplicate flag key for environment" });
    }
    res.status(500).json({ error: "failed to create flag" });
  }
});

// List Flags by environment
router.get("/flags", async (req, res) => {
  try {
    const { environmentId } = req.query;
    if (!environmentId) return res.status(400).json({ error: "environmentId is required" });
    const flags = await FlagpilotFeatureFlag.find({ environment: environmentId }).sort({ createdAt: -1 }).lean();
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch flags" });
  }
});

// Update Flag
router.put("/flags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update: any = {};
    const allowed = ["enabled", "value", "name", "description", "type"];
    for (const k of allowed) {
      if (k in req.body) update[k] = req.body[k];
    }
    const flag = await FlagpilotFeatureFlag.findByIdAndUpdate(id, update, { new: true });
    if (!flag) return res.status(404).json({ error: "flag not found" });
    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: "failed to update flag" });
  }
});

// Delete Flag
router.delete("/flags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await FlagpilotFeatureFlag.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "failed to delete flag" });
  }
});

// Public client SDK endpoint
router.get("/public/flags", async (req, res) => {
  try {
    const apiKey = (req.header("X-Environment-Key") || req.header("x-environment-key")) as string;
    if (!apiKey) return res.status(400).json({ error: "X-Environment-Key header required" });
    const env = await FlagpilotEnvironment.findOne({ apiKey }).lean();
    if (!env) return res.status(404).json({ error: "environment not found" });
    const flags = await FlagpilotFeatureFlag.find({ environment: env._id }).lean();
    const payload: Record<string, { enabled: boolean; value: string }> = {};
    for (const f of flags) {
      payload[f.key] = { enabled: !!f.enabled, value: f.value || "" };
    }
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch public flags" });
  }
});

export default router;
