import { Inngest } from "inngest";
import { env } from "../config/env";

export const inngest = new Inngest({
  id: env.inngestAppId,
});
