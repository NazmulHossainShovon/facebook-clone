import crypto from "crypto";
import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { google } from "googleapis";
import { User, UserModel } from "../models/userModel";
import {
  SegmentDestination,
  SegmentDestinationModel,
  SegmentDestinationType,
} from "../models/segmentDestinationModel";
import { SegmentRawEventModel } from "../models/segmentRawEventModel";
import { generateToken, isAuth } from "../utils";

const pgPools = new Map<string, Pool>();

type SegmentUserResponse = {
  _id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt?: Date;
};

type SegmentUserLike = {
  _id: string;
  name: string;
  email: string;
  apiKey?: string;
  createdAt?: Date;
};

type GoogleSheetsConfig = {
  spreadsheetId: string;
  sheetName: string;
};

type PostgresConfig = {
  connectionString: string;
  tableName: string;
};

const toSegmentUserResponse = (user: SegmentUserLike): SegmentUserResponse => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  apiKey: user.apiKey || '',
  createdAt: user.createdAt,
});

const getOrCreatePgPool = (connectionString: string) => {
  if (!pgPools.has(connectionString)) {
    pgPools.set(connectionString, new Pool({ connectionString }));
  }
  const pool = pgPools.get(connectionString);
  if (!pool) {
    throw new Error('Failed to initialize postgres pool');
  }
  return pool;
};

const ensureUniqueApiKey = async () => {
  let apiKey = "";
  let exists = true;

  while (exists) {
    apiKey = crypto.randomBytes(32).toString("hex");
    const user = await UserModel.findOne({ apiKey }).select("_id").lean();
    exists = !!user;
  }

  return apiKey;
};

const sanitizeTableName = (tableName: string) => {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) ? tableName : "events";
};

const getIpAddress = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.ip;
};

const validateDestinationConfig = (
  type: SegmentDestinationType,
  config: Record<string, unknown>
) => {
  if (type === "google_sheets") {
    const spreadsheetId =
      typeof config.spreadsheetId === "string"
        ? config.spreadsheetId.trim()
        : (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "").trim();
    const sheetName =
      typeof config.sheetName === "string" && config.sheetName.trim().length > 0
        ? config.sheetName.trim()
        : "Sheet1";

    if (!spreadsheetId) {
      throw new Error("spreadsheetId is required for google_sheets destination");
    }

    return { spreadsheetId, sheetName } as GoogleSheetsConfig;
  }

  const connectionString =
    typeof config.connectionString === "string"
      ? config.connectionString.trim()
      : (process.env.POSTGRES_DESTINATION_URL || "").trim();
  const tableName =
    typeof config.tableName === "string" && config.tableName.trim().length > 0
      ? sanitizeTableName(config.tableName.trim())
      : "events";

  if (!connectionString) {
    throw new Error("connectionString is required for postgres destination");
  }

  return { connectionString, tableName } as PostgresConfig;
};

const appendToGoogleSheets = async (
  destination: SegmentDestination,
  payload: {
    eventName: string;
    externalUserId?: string;
    properties?: Record<string, unknown>;
    createdAt: Date;
  }
) => {
  const config = (destination.config || {}) as Record<string, unknown>;
  const validatedConfig = validateDestinationConfig(
    "google_sheets",
    config
  ) as GoogleSheetsConfig;
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "";

  if (!privateKey || !clientEmail) {
    throw new Error("Google Sheets credentials are not configured");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: validatedConfig.spreadsheetId,
    range: `${validatedConfig.sheetName}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          payload.createdAt.toISOString(),
          payload.eventName,
          payload.externalUserId || "",
          JSON.stringify(payload.properties || {}),
        ],
      ],
    },
  });
};

const appendToPostgres = async (
  destination: SegmentDestination,
  payload: {
    eventName: string;
    externalUserId?: string;
    properties?: Record<string, unknown>;
    createdAt: Date;
  }
) => {
  const config = (destination.config || {}) as Record<string, unknown>;
  const validatedConfig = validateDestinationConfig(
    "postgres",
    config
  ) as PostgresConfig;
  const pool = getOrCreatePgPool(validatedConfig.connectionString);
  const tableName = sanitizeTableName(validatedConfig.tableName);

  await pool.query(
    `CREATE TABLE IF NOT EXISTS "${tableName}" (
      id SERIAL PRIMARY KEY,
      event_name TEXT,
      user_id TEXT,
      properties JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );`
  );

  await pool.query(
    `INSERT INTO "${tableName}" (event_name, user_id, properties, created_at) VALUES ($1, $2, $3::jsonb, $4)`,
    [
      payload.eventName,
      payload.externalUserId || "",
      JSON.stringify(payload.properties || {}),
      payload.createdAt,
    ]
  );
};

const shouldForwardEvent = (eventName: string, filters?: string[]) => {
  if (!filters || filters.length === 0) {
    return true;
  }
  return filters.includes(eventName);
};

const seedDestinations = async (userId: string) => {
  await SegmentDestinationModel.insertMany([
    {
      userId,
      type: "google_sheets",
      enabled: false,
      config: {
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
        sheetName: "Sheet1",
      },
      eventFilters: [],
    },
    {
      userId,
      type: "postgres",
      enabled: false,
      config: {
        connectionString: process.env.POSTGRES_DESTINATION_URL || "",
        tableName: "events",
      },
      eventFilters: [],
    },
  ]);
};

export const segmentRouter = express.Router();

segmentRouter.post(
  "/auth/register",
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const apiKey = await ensureUniqueApiKey();
    const name = email.split("@")[0] || `user_${Date.now()}`;
    const user = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password),
      apiKey,
      authProvider: "local",
      receivedFriendReqs: [],
      sentFriendReqs: [],
      friends: [],
    });

    res.status(201).json({
      token: generateToken(user as User),
      user: toSegmentUserResponse(user.toObject()),
    });
  })
);

segmentRouter.post(
  "/auth/login",
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!user.apiKey) {
      user.apiKey = await ensureUniqueApiKey();
      await user.save();
    }

    res.json({
      token: generateToken(user as User),
      user: toSegmentUserResponse(user.toObject()),
    });
  })
);

segmentRouter.get(
  "/auth/me",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.apiKey) {
      user.apiKey = await ensureUniqueApiKey();
      await user.save();
    }

    res.json({ user: toSegmentUserResponse(user.toObject()) });
  })
);

segmentRouter.get(
  "/destinations",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let destinations = await SegmentDestinationModel.find({ userId }).lean();
    if (destinations.length === 0) {
      await seedDestinations(userId);
      destinations = await SegmentDestinationModel.find({ userId }).lean();
    }

    res.json(destinations);
  })
);

segmentRouter.put(
  "/destinations/:id",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const destination = await SegmentDestinationModel.findOne({
      _id: req.params.id,
      userId,
    });

    if (!destination) {
      res.status(404).json({ message: "Destination not found" });
      return;
    }

    if (req.body.enabled !== undefined) {
      destination.enabled = Boolean(req.body.enabled);
    }

    if (req.body.eventFilters !== undefined) {
      if (!Array.isArray(req.body.eventFilters)) {
        res.status(400).json({ message: "eventFilters must be an array" });
        return;
      }

      const validFilters = req.body.eventFilters
        .map((item: unknown) => String(item || "").trim())
        .filter((item: string) => item.length > 0);
      destination.eventFilters = validFilters;
    }

    if (req.body.config !== undefined) {
      const mergedConfig = {
        ...(destination.config || {}),
        ...(req.body.config || {}),
      } as Record<string, unknown>;

      destination.config = validateDestinationConfig(destination.type, mergedConfig);
    }

    const updated = await destination.save();
    res.json(updated);
  })
);

segmentRouter.post(
  "/events/track",
  asyncHandler(async (req: Request, res: Response) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing API key" });
      return;
    }

    const apiKey = authorization.slice(7).trim();
    const user = await UserModel.findOne({ apiKey }).lean<User & { _id: string }>();
    if (!user) {
      res.status(401).json({ message: "Invalid API key" });
      return;
    }

    const eventName = String(req.body.event || "").trim();
    const externalUserId =
      req.body.userId !== undefined ? String(req.body.userId) : undefined;
    const properties =
      req.body.properties && typeof req.body.properties === "object"
        ? req.body.properties
        : {};

    if (!eventName) {
      res.status(400).json({ message: "event is required" });
      return;
    }

    const rawEvent = await SegmentRawEventModel.create({
      userId: user._id,
      eventName,
      externalUserId,
      properties,
      ipAddress: getIpAddress(req),
      processed: false,
      createdAt: new Date(),
    });

    const destinations = await SegmentDestinationModel.find({
      userId: user._id,
      enabled: true,
    }).lean();

    const createdAt = rawEvent.createdAt || new Date();
    const forwardingJobs = destinations
      .filter(destination => shouldForwardEvent(eventName, destination.eventFilters))
      .map(async destination => {
        if (destination.type === "google_sheets") {
          await appendToGoogleSheets(destination as SegmentDestination, {
            eventName,
            externalUserId,
            properties,
            createdAt,
          });
          return;
        }

        await appendToPostgres(destination as SegmentDestination, {
          eventName,
          externalUserId,
          properties,
          createdAt,
        });
      });

    Promise.allSettled(forwardingJobs)
      .then(results => {
        results.forEach(result => {
          if (result.status === "rejected") {
            console.error("Segment destination forwarding error:", result.reason);
          }
        });
      })
      .catch(error => {
        console.error("Segment forwarding batch error:", error);
      })
      .finally(async () => {
        await SegmentRawEventModel.findByIdAndUpdate(rawEvent._id, {
          processed: true,
        });
      });

    res.json({ success: true, eventId: rawEvent._id });
  })
);

segmentRouter.get(
  "/events/recent",
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const events = await SegmentRawEventModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(events);
  })
);