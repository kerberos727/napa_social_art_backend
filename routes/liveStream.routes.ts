import LiveStreamController from "../controllers/liveStream.controller";
import express from "express";
const router = express.Router();

router.post("/liveStream/newLiveStream",LiveStreamController.createLiveStream );
router.patch("/liveStream/update",LiveStreamController.updateLiveStream)
router.patch("/liveStream/increaseUserCount",LiveStreamController.increaseUserCount)
router.patch("/liveStream/decreaseUserCount",LiveStreamController.decreaseUserCount)
router.get("/liveStream",LiveStreamController.getLiveStream)

module.exports = router;