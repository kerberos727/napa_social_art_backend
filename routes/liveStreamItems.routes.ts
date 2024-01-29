import LiveStreamItemsController from "../controllers/liveStreamItems.controller";
import {
  typeValidation,
} from "../middleware/index.middleware";
import { validationRules } from "../utils/index.utils";
import express from "express";
import multer from "multer";
const router = express.Router();
const imageUpload = multer({
    fileFilter(req, file, cb) {
      if (
        !file.originalname.endsWith(".png") &&
        !file.originalname.endsWith(".jpg") &&
        !file.originalname.endsWith(".jpeg")
      ) {
        cb(new Error("Please select a jpg or png file"));
      }
      const fileSize = parseInt(req.headers['content-length']);
      if (fileSize > 1048576) {
        cb(new Error("Please upload image size less then 10 mb"));
      }
      cb(undefined, true);
    },
    limits: {
      fileSize: 1048576, // 10 Mb
    },
});

router.post(
    "/socialrt/liveStreamItem/new_saleitem",
    imageUpload.single("itemImage"),
    typeValidation(validationRules.liveSreamItemRule),
    LiveStreamItemsController.createLiveStreamItem
);

router.patch(
  "/socialrt/liveStreamItem/update",
  imageUpload.single("itemImage"),
  typeValidation(validationRules.liveSreamItemEditRule),
  LiveStreamItemsController.updateLiveStreamItem
);

router.patch(
  "/socialrt/liveStreamItem/purchase",
  typeValidation(validationRules.liveSreamItemPurchaseRule),
  LiveStreamItemsController.purchaseLiveStreamItem
);

router.get("/socialrt/liveStreamItem",LiveStreamItemsController.getLiveStreamItems)
router.post("/socialrt/liveStreamItem/delete/:itemUuid", LiveStreamItemsController.deleteLiveStreamItems);
module.exports = router;