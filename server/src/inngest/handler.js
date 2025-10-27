import { serve } from 'inngest/express';
import { inngest } from './client.js';
import { functions } from './functions/index.js';

export const inngestHandler = serve({
  client: inngest,
  functions,
});
