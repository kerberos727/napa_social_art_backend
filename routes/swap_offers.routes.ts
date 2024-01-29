import OffersController from "../controllers/swap_offers.controller";
import express from "express";
const router = express.Router();

router.post("/swapping/new_offer",OffersController.createOffer );
router.patch("/swapping/offer/update",OffersController.updateOffer)
router.get("/swapping/offer",OffersController.getOffers)
module.exports = router;