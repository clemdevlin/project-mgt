import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import morgan from "morgan";

import { morganStream } from "./config/logger.js";
import healthRouter from "./routes/health.js";
import { inngestHandler } from "./inngest/handler.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: morganStream }));

app.use("/api/health", healthRouter);
app.use("/api/inngest", inngestHandler);

app.use(notFound);
app.use(errorHandler);

export default app;
