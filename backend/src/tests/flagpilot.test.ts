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
      // 1. Let's trigger a second impression for a different user (anonUserB) to reach total impressions = 2 (our threshold)
      const resEvalB = await request(app)
        .post("/api/flagpilot/v1/evaluate")
        .set("x-api-key", apiKeyAlice)
        .set("x-anon-user-id", anonUserB)
        .send({
          flagKey: "promo_banner_test",
          goalEvent: "banner_clicked",
        });
      
      const assignedVariantB = resEvalB.body.variant;

      // Ensure total impressions is exactly 2 now
      const flagBeforeConversion = await FlagpilotFeatureFlag.findById(flagIdAlice);
      const totalImpressions = flagBeforeConversion?.variants.reduce((sum, v) => sum + v.impressions, 0) || 0;
      expect(totalImpressions).toBe(2);

      // 2. Track conversion for anonUserB (which meets/exceeds the threshold of 2 and triggers recalculation!)
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

      // 3. Verify flag has non-equal weights now (it self-optimized!)
      const updatedFlag = await FlagpilotFeatureFlag.findById(flagIdAlice);
      expect(updatedFlag).not.toBeNull();

      const variantWinner = updatedFlag?.variants.find((v) => v.key === assignedVariantB);
      const variantLoser = updatedFlag?.variants.find((v) => v.key !== assignedVariantB);

      // The winner must have 1 conversion, and its calculated weight should be higher than the loser's weight
      expect(variantWinner?.conversions).toBe(1);
      expect(variantWinner?.currentWeight).toBeGreaterThan(variantLoser?.currentWeight || 0);
    });
  });
});
