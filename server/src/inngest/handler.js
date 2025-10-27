import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { clerkUserCreated, clerkUserUpdated, clerkUserDeleted } from "./functions/clerkUsers.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [clerkUserCreated, clerkUserUpdated, clerkUserDeleted],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
