import SwappingController from "../controllers/swapping.controller";
import express from "express";
const router = express.Router();

router.post("/swapping/new_swapping",SwappingController.createSwapping );
router.patch("/swapping/update",SwappingController.updateSwapping)
router.get("/swapping",SwappingController.getSwapping)

module.exports = router;