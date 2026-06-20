import crypto from "crypto";
import { Pool } from "pg";
import { google } from "googleapis";
import { Request } from "express";
import { UserModel } from "../../models/userModel";
import {
  SegmentDestination,
  SegmentDestinationModel,
  SegmentDestinationType,
} from "../../models/segmentDestinationModel";
import { SegmentRawEventModel } from "../../models/segmentRawEventModel";

const pgPools = new Map<string, Pool>();

export type SegmentUserLike = {
  _id: string;
  name: string;
  email: string;
  apiKey?: string;
  createdAt?: Date;
};

export const toSegmentUserResponse = (user: SegmentUserLike) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  apiKey: user.apiKey || "",
  createdAt: user.createdAt,
});

export const getOrCreatePgPool = (connectionString: string) => {
  if (!pgPools.has(connectionString)) {
    pgPools.set(connectionString, new Pool({ connectionString }));
  }
  const pool = pgPools.get(connectionString);
  if (!pool) {
    throw new Error("Failed to initialize postgres pool");
  }
  return pool;
};

export const ensureUniqueApiKey = async () => {
  let apiKey = "";
  let exists = true;

  while (exists) {
    apiKey = crypto.randomBytes(32).toString("hex");
    const user = await UserModel.findOne({ apiKey }).select("_id").lean();
    exists = !!user;
  }

  return apiKey;
};

export const sanitizeTableName = (tableName: string) => {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) ? tableName : "events";
};

export const getIpAddress = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.ip;
};

export const validateDestinationConfig = (
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

    return { spreadsheetId, sheetName } as {
      spreadsheetId: string;
      sheetName: string;
    };
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

  return { connectionString, tableName } as { connectionString: string; tableName: string };
};

export const appendToGoogleSheets = async (
  destination: SegmentDestination,
  payload: {
    eventName: string;
    externalUserId?: string;
    properties?: Record<string, unknown>;
    createdAt: Date;
  }
) => {
  const config = (destination.config || {}) as Record<string, unknown>;
  const validatedConfig = validateDestinationConfig("google_sheets", config) as {
    spreadsheetId: string;
    sheetName: string;
  };
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
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

export const appendToPostgres = async (
  destination: SegmentDestination,
  payload: {
    eventName: string;
    externalUserId?: string;
    properties?: Record<string, unknown>;
    createdAt: Date;
  }
) => {
  const config = (destination.config || {}) as Record<string, unknown>;
  const validatedConfig = validateDestinationConfig("postgres", config) as {
    connectionString: string;
    tableName: string;
  };
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

export const shouldForwardEvent = (eventName: string, filters?: string[]) => {
  if (!filters || filters.length === 0) {
    return true;
  }
  return filters.includes(eventName);
};

export const seedDestinations = async (userId: string) => {
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

