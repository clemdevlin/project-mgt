import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5002,
  inngestAppId: process.env.INNGEST_APP_ID || "project-management",
  inngestSigningKey: process.env.INNGEST_SIGNING_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  directUrl: process.env.DIRECT_URL || "",
};
