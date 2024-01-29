import express from "express";
const router = express.Router();
import CollectionsController from "../controllers/collections.controller";

router.post("/socialrt/collection/new", CollectionsController.createCollection);
router.patch("/socialrt/update/collection", CollectionsController.updateCollection);
router.get("/socialart/collection", CollectionsController.getCollection);

module.exports = router;