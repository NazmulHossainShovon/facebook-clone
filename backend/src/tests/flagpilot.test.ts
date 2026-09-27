import request from "supertest";
import mongoose from "mongoose";
import { app } from "../index";
import { generateToken } from "../utils";
import { FlagpilotProject } from "../models/flagpilotProjectModel";
import { FlagpilotFeatureFlag } from "../models/flagpilotFeatureFlagModel";
import { FlagpilotEvaluationLog } from "../models/flagpilotEvaluationLogModel";

describe("Flagpilot API Endpoints Integration Tests", () => {
  // Suppress console.log output during test execution to keep output clean
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // Mock users
  const userA = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "User Alice",
    email: "alice@example.com",
    isAdmin: false,
  };

  const userB = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "User Bob",
    email: "bob@example.com",
    isAdmin: false,
  };

  const tokenA = generateToken(userA as any);
  const tokenB = generateToken(userB as any);

  let projectIdAlice: string;
  let flagIdAlice: string;
  let apiKeyAlice: string;

  beforeAll(async () => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Construct isolated Test DB URI
    const baseUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/flagpilot-test";
    const testUri = baseUri.includes("-test") ? baseUri : `${baseUri}-test`;

    // Ensure isolated test connection is ready
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testUri);
    }

    // Clean/drop the entire test database completely before running any test
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  afterAll(async () => {
    // Clean/drop the entire test database completely after testing
    if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Close mongoose connection safely so Jest exits cleanly
    await mongoose.connection.close();
  });

  describe("Project Management & Isolation", () => {
    it("should allow Alice to create a project, setting her orgId and generating an apiKey", async () => {
      const res = await request(app)
        .post("/api/flagpilot/projects")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ name: "Alice Marketing UI" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe("Alice Marketing UI");
      expect(res.body.orgId).toBe(userA._id);
      expect(res.body).toHaveProperty("apiKey");

      projectIdAlice = res.body._id;
      apiKeyAlice = res.body.apiKey;
    });

    it("should return only Alice's projects when Alice queries projects", async () => {
      // First let Bob create a project
      await request(app)
        .post("/api/flagpilot/projects")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ name: "Bob Analytics Server" });

      const res = await request(app)
        .get("/api/flagpilot/projects")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toBe(projectIdAlice);
      expect(res.body[0].name).toBe("Alice Marketing UI");
    });

    it("should prevent Bob from accessing Alice's project", async () => {
      const res = await request(app)
        .get(`/api/flagpilot/projects/${projectIdAlice}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(404); // Returns 404/not found for isolation
    });

    it("should allow Alice to fetch her own project by ID", async () => {
      const res = await request(app)
        .get(`/api/flagpilot/projects/${projectIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(projectIdAlice);
      expect(res.body.name).toBe("Alice Marketing UI");
    });
  });

  describe("Flag Management & Security Checks", () => {
    it("should prevent Bob from creating a flag under Alice's project", async () => {
      const res = await request(app)
        .post("/api/flagpilot/flags")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
          projectId: projectIdAlice,
          key: "promo_banner_test",
          minImpressionsBeforeOptimization: 10,
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_b", value: { title: "Special Discount", color: "blue" } },
          ],
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Unauthorized");
    });

    it("should allow Alice to create a flag with valid variants under her project", async () => {
      const res = await request(app)
        .post("/api/flagpilot/flags")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          projectId: projectIdAlice,
          key: "promo_banner_test",
          minImpressionsBeforeOptimization: 2, // Low threshold for easy testing
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_b", value: { title: "Special Discount", color: "blue" } },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.key).toBe("promo_banner_test");
      expect(res.body.minImpressionsBeforeOptimization).toBe(2);
      expect(res.body.variants.length).toBe(2);

      flagIdAlice = res.body._id;
    });

    it("should allow Alice to list her project's flags, but reject Bob", async () => {
      // Alice request
      const resAlice = await request(app)
        .get(`/api/flagpilot/flags?projectId=${projectIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(resAlice.status).toBe(200);
      expect(resAlice.body.length).toBe(1);
      expect(resAlice.body[0]._id).toBe(flagIdAlice);

      // Bob request
      const resBob = await request(app)
        .get(`/api/flagpilot/flags?projectId=${projectIdAlice}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(resBob.status).toBe(403);
    });
  });

  describe("Public Evaluation & Conversion Tracking Loop (MAB)", () => {
    const anonUserA = "anon_user_alpha_test";
    const anonUserB = "anon_user_beta_test";

    it("should evaluate flag correctly for anonymous visitor sessions without needing auth headers", async () => {
      const res = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonUserA)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("variant");
      expect(res.body).toHaveProperty("value");
      expect(res.body.anonUserId).toBe(anonUserA);

      // Verify a sticky log was successfully created in the db
      const log = await FlagpilotEvaluationLog.findOne({
        flag: flagIdAlice,
        userId: anonUserA,
        goalEvent: "banner_clicked",
      });
      expect(log).not.toBeNull();
      expect(log?.variantKey).toBe(res.body.variant);
    });

    it("should serve the exact same sticky variant on subsequent evaluations for the same user", async () => {
      // Fetch 1st time (already completed in test above)
      const initialLog = await FlagpilotEvaluationLog.findOne({ flag: flagIdAlice, userId: anonUserA });
      const expectedVariant = initialLog?.variantKey;

      // Fetch 2nd time
      const res = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonUserA)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });

      expect(res.status).toBe(200);
      expect(res.body.variant).toBe(expectedVariant);
    });

    it("should dynamically optimize traffic splits (Thompson Sampling) once threshold is met on conversions", async () => {
      // 1. Evaluate anonUserB to create an unconverted log in the database
      const resEvalB = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonUserB)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });

      const assignedVariantB = resEvalB.body.variant;

      // 2. Manually set impressions and conversions to guarantee statistical significance
      await FlagpilotFeatureFlag.updateOne(
        { _id: flagIdAlice },
        {
          $set: {
            "variants.0.impressions": 5,
            "variants.0.conversions": 0,
            "variants.1.impressions": 5,
            "variants.1.conversions": 5,
          },
        }
      );

      // 3. Track conversion for anonUserB (which meets/exceeds the threshold and triggers recalculation!)
      const resTrack = await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonUserB)
        .send({
          eventName: "banner_clicked",
        });

      expect(resTrack.status).toBe(200);
      expect(resTrack.body.status).toBe("queued");

      // Small tick delay to let background async promises finish updating DB weights
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 4. Verify flag has non-equal weights now (it self-optimized!)
      const updatedFlag = await FlagpilotFeatureFlag.findById(flagIdAlice);
      expect(updatedFlag).not.toBeNull();

      const variantWinner = updatedFlag?.variants.find((v) => v.key === "variant_b");
      const variantLoser = updatedFlag?.variants.find((v) => v.key === "control");

      // The winner must have conversions and its weight should be much higher than the loser's weight
      expect(variantWinner?.currentWeight).toBeGreaterThan(variantLoser?.currentWeight || 0);
    });
  });

  describe("Variant Immutability & Safety Rules (No Variant Jumping)", () => {
    it("should preserve variant historical stats and weights on normal update", async () => {
      // Fetch initial details of our flag
      const flagBefore = await FlagpilotFeatureFlag.findById(flagIdAlice);
      expect(flagBefore).not.toBeNull();

      // Alice updates the flag's description, keeping the variants same.
      // We set minImpressionsBeforeOptimization to 1000 so it doesn't trigger recalculation of weights.
      const res = await request(app)
        .put(`/api/flagpilot/flags/${flagIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          description: "New updated banner experiment description",
          minImpressionsBeforeOptimization: 1000,
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_b", value: { title: "Special Discount", color: "blue" } },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.description).toBe("New updated banner experiment description");

      // Verify stats and weights are fully preserved and NOT reset to 0 or 0.5
      const flagAfter = await FlagpilotFeatureFlag.findById(flagIdAlice);
      expect(flagAfter?.variants[0].impressions).toBe(flagBefore?.variants[0].impressions);
      expect(flagAfter?.variants[0].currentWeight).toBe(flagBefore?.variants[0].currentWeight);
      expect(flagAfter?.variants[1].conversions).toBe(flagBefore?.variants[1].conversions);
    });

    it("should prevent Alice from deleting an existing variant that has impressions", async () => {
      // Guarantee both variants have impressions in the DB
      await FlagpilotFeatureFlag.updateOne(
        { _id: flagIdAlice },
        {
          $set: {
            "variants.0.impressions": 1,
            "variants.1.impressions": 1,
          },
        }
      );

      // Try to save by deleting variant_b and adding variant_c
      const res = await request(app)
        .put(`/api/flagpilot/flags/${flagIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_c", value: { title: "New Dynamic Option", color: "green" } },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Cannot delete variant 'variant_b'");
    });

    it("should allow Alice to modify the value of an existing variant (e.g. for typo fixes) while preserving statistics", async () => {
      // Guarantee variant_b has impressions and conversions in the DB
      await FlagpilotFeatureFlag.updateOne(
        { _id: flagIdAlice },
        {
          $set: {
            "variants.0.impressions": 1,
            "variants.1.impressions": 5,
            "variants.1.conversions": 3,
          },
        }
      );

      // Try to correct the value of variant_b (e.g. fixing typo/wording)
      const res = await request(app)
        .put(`/api/flagpilot/flags/${flagIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_b", value: { title: "Special Premium Discount!", color: "blue" } },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.variants[1].value.title).toBe("Special Premium Discount!");

      // Verify that its impressions, conversions and weights are completely preserved and NOT reset
      expect(res.body.variants[1].impressions).toBe(5);
      expect(res.body.variants[1].conversions).toBe(3);
    });

    it("should allow adding a new variant, resetting weights to fair 1/N split while preserving impressions/conversions", async () => {
      const flagBefore = await FlagpilotFeatureFlag.findById(flagIdAlice);

      // Add a third variant "variant_c"
      const res = await request(app)
        .put(`/api/flagpilot/flags/${flagIdAlice}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          variants: [
            { key: "control", value: { title: "Standard Banner", color: "gray" } },
            { key: "variant_b", value: { title: "Special Discount", color: "blue" } },
            { key: "variant_c", value: { title: "New Dynamic Option", color: "green" } },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.variants.length).toBe(3);

      // Check weights split uniformly to 1/3 (0.3333)
      expect(res.body.variants[0].currentWeight).toBeCloseTo(0.3333, 3);
      expect(res.body.variants[2].currentWeight).toBeCloseTo(0.3333, 3);

      // Ensure historical stats for existing variants were preserved
      expect(res.body.variants[0].impressions).toBe(flagBefore?.variants[0].impressions);
      expect(res.body.variants[1].conversions).toBe(flagBefore?.variants[1].conversions);
    });
  });

  describe("Identity Resolution & Merging Flow (Anonymous -> User)", () => {
    const anonVisitorId = "anon_A7F9K2";
    const authenticatedUserId = "user_123456";
    let assignedVariant: string;

    it("should assign variant to anonymous visitor on first visit", async () => {
      const res = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonVisitorId)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("variant");
      assignedVariant = res.body.variant;
    });

    it("should merge anonymous identity to authenticated userId via /v1/identify", async () => {
      const res = await request(app)
        .post("/api/flagpilot/v1/identify")
        .set("x-api-key", apiKeyAlice)
        .send({
          anonymousId: anonVisitorId,
          userId: authenticatedUserId,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.mergedCount).toBeGreaterThanOrEqual(1);

      // Verify the log in database was upgraded to userId
      const log = await FlagpilotEvaluationLog.findOne({
        flag: flagIdAlice,
        userId: authenticatedUserId,
      });
      expect(log).not.toBeNull();
      expect(log?.variantKey).toBe(assignedVariant);
    });

    it("should return the exact same variant when user logs in on a new device (without anon cookie)", async () => {
      const res = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-user-id", authenticatedUserId)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });

      expect(res.status).toBe(200);
      expect(res.body.variant).toBe(assignedVariant);
      expect(res.body.userId).toBe(authenticatedUserId);
    });

    it("should attribute conversion to the assigned variant when authenticated user converts", async () => {
      const resTrack = await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-user-id", authenticatedUserId)
        .send({
          eventName: "banner_clicked",
        });

      expect(resTrack.status).toBe(200);
      expect(resTrack.body.status).toBe("queued");

      await new Promise((resolve) => setTimeout(resolve, 200));

      const updatedLog = await FlagpilotEvaluationLog.findOne({
        flag: flagIdAlice,
        userId: authenticatedUserId,
      });
      expect(updatedLog?.converted).toBe(true);
    });
  });

  describe("Goal Strategies & Idempotency Rules", () => {
    let flagId: string;
    const anonId = "anon_goal_strategy_user";

    beforeAll(async () => {
      // 1. Create a new flag with both unique and repeatable goals configured
      const res = await request(app)
        .post("/api/flagpilot/flags")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          projectId: projectIdAlice,
          key: "checkout_flow_experiment",
          minImpressionsBeforeOptimization: 100,
          goalSettings: [
            { eventName: "signup_completed", type: "unique" },
            { eventName: "purchase_completed", type: "repeatable" },
          ],
          variants: [
            { key: "control", value: "Standard Checkout" },
            { key: "variant_b", value: "Simplified Checkout" },
          ],
        });

      expect(res.status).toBe(201);
      flagId = res.body._id;
    });

    it("should evaluate flag and initialize session log for both goals", async () => {
      // Evaluate unique goal
      await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({
          flagKey: "checkout_flow_experiment",
          goalEvent: "signup_completed",
        });

      // Evaluate repeatable goal
      await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({
          flagKey: "checkout_flow_experiment",
          goalEvent: "purchase_completed",
        });

      const logs = await FlagpilotEvaluationLog.find({ flag: flagId, userId: anonId });
      expect(logs.length).toBe(2);
    });

    it("should deduct/ignore duplicate conversions for UNIQUE goals (only count once)", async () => {
      const flagBefore = await FlagpilotFeatureFlag.findById(flagId).lean();
      const variantKey = (await FlagpilotEvaluationLog.findOne({ flag: flagId, userId: anonId, goalEvent: "signup_completed" }))?.variantKey;

      // Track unique goal once
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "signup_completed" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      let flagAfter = await FlagpilotFeatureFlag.findById(flagId).lean();
      const matchedIdx = flagAfter?.variants.findIndex((v) => v.key === variantKey) ?? -1;
      expect(flagAfter?.variants[matchedIdx].conversions).toBe((flagBefore?.variants[matchedIdx].conversions || 0) + 1);

      // Track same unique goal a second time (should be ignored!)
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "signup_completed" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      flagAfter = await FlagpilotFeatureFlag.findById(flagId).lean();
      expect(flagAfter?.variants[matchedIdx].conversions).toBe((flagBefore?.variants[matchedIdx].conversions || 0) + 1);
    });

    it("should allow and count multiple occurrences of REPEATABLE goals", async () => {
      const flagBefore = await FlagpilotFeatureFlag.findById(flagId).lean();
      const variantKey = (await FlagpilotEvaluationLog.findOne({ flag: flagId, userId: anonId, goalEvent: "purchase_completed" }))?.variantKey;
      const matchedIdx = flagBefore?.variants.findIndex((v) => v.key === variantKey) ?? -1;

      // Track repeatable goal once
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "purchase_completed" });

      // Track repeatable goal twice
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "purchase_completed" });

      await new Promise((resolve) => setTimeout(resolve, 200));

      const flagAfter = await FlagpilotFeatureFlag.findById(flagId).lean();
      expect(flagAfter?.variants[matchedIdx].conversions).toBe((flagBefore?.variants[matchedIdx].conversions || 0) + 2);
    });

    it("should protect against automatic duplicate retries using eventId idempotency", async () => {
      const flagBefore = await FlagpilotFeatureFlag.findById(flagId).lean();
      const variantKey = (await FlagpilotEvaluationLog.findOne({ flag: flagId, userId: anonId, goalEvent: "purchase_completed" }))?.variantKey;
      const matchedIdx = flagBefore?.variants.findIndex((v) => v.key === variantKey) ?? -1;

      const dupEventId = "retry_protection_event_9a8b";

      // Track repeatable goal with unique eventId (first try)
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "purchase_completed", eventId: dupEventId });

      // Track repeatable goal with same eventId (second try / retry)
      await request(app)
        .post("/api/flagpilot/v1/track")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonId)
        .send({ eventName: "purchase_completed", eventId: dupEventId });

      await new Promise((resolve) => setTimeout(resolve, 200));

      const flagAfter = await FlagpilotFeatureFlag.findById(flagId).lean();
      // Should only increment conversions by 1 instead of 2!
      expect(flagAfter?.variants[matchedIdx].conversions).toBe((flagBefore?.variants[matchedIdx].conversions || 0) + 1);
    });
  });
});
