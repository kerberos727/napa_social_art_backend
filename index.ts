/* eslint-disable @typescript-eslint/no-var-requires */
import { NextFunction, Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
import server from "http";
import mysql from "mysql2";
import setUpRoutes from "./routes/index.routes";
import { SocketService } from "./services/index.services";
import WebSocket from "ws";
require("./utils/monthly-user-cron");
require("./utils/daily-user-cron");
require("./utils/napa-token-price-cron");
require("./utils/most-viewed-posts-cron");
require("./utils/views-cron")
require("./utils/post-watch")

const FCM = require("fcm-node");

const httpServer = server.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });
const socketService = new SocketService(wss);

dotenv.config({ path: "./.env" });
global.SocketService = socketService;

const serverKey = process.env.FCM_KEY
const fcm = new FCM(serverKey);

const socialArtPool = mysql.createPool({
  host: process.env.RDS_NAPA_HOSTNAME,
  user: process.env.RDS_NAPA_USERNAME,
  database: process.env.RDS_SOCIAL_ART_DB_NAME,
  password: process.env.RDS_NAPA_PASSWORD,
});

const napaPool = mysql.createPool({
  host: process.env.RDS_NAPA_HOSTNAME,
  user: process.env.RDS_NAPA_USERNAME,
  database: process.env.RDS_NAPA_NAME,
  password: process.env.RDS_NAPA_PASSWORD,
});

const socialArtDB = socialArtPool.promise();
const napaDB = napaPool.promise();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
socketService.init();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const PORT = process.env.PORT || 8001;

setUpRoutes(app);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

export { socialArtDB, napaDB, fcm };

export default app;
