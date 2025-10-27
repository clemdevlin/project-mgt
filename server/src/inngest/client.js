import { Inngest } from "inngest";
import { env } from "../config/env.js";

export const inngest = new Inngest({
  id: env.inngestAppId,
});
