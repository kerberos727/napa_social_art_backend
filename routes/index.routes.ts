import PostedVideosRouter from "../routes/posted-videos.routes";
import HealthRouter = require("../routes/health.routes");
import ReportRouter = require("../routes/reports.routes");
import OfferRouter = require("./swap_offers.routes");
import SwappingRouter = require("./swapping.routes");
import CollectionRouter = require("./collection.routes");
import LiveStream = require("./liveStream.routes");
import liveStreamItems = require("./liveStreamItems.routes");
import Message = require("./message.routes");
const setUpRoutes = (app) => {
  app.use("/user", PostedVideosRouter);
  app.use("/report", ReportRouter);
  app.use("/health", HealthRouter);
  app.use("/marketplace",OfferRouter);
  app.use("/marketplace",SwappingRouter);
  app.use("/marketplace",SwappingRouter);
  app.use("/user", CollectionRouter);
  app.use("/user", LiveStream);
  app.use("/user", Message);
  app.use("/user", liveStreamItems);

};

export default setUpRoutes;
