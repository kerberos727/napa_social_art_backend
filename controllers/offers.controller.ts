import { Offers, PostedVideos } from "../models/index.models";
import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";
import { socialArtDB } from "../index";

const OffersController = {
  create: async (req, res) => {
    try {
      const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      // @ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const snftQuery = `SELECT * FROM marketplace WHERE snftId = "${req.body.snftId}"`;
      const [snft] = await socialArtDB.query(snftQuery);

      // @ts-ignore
      if (!snft.length) {
        return ApiResponse.validationErrorWithData(res, "SNFT Not Found");
      }

      const offerQuery = `SELECT * FROM offers WHERE snftId = "${req.body.snftId}" AND profileId = "${req.body.profileId}"`;
      const [offer] = await socialArtDB.query(offerQuery);

      // @ts-ignore
      if (offer.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "You have already submitted an offer"
        );
      }

      const offerLengthQuery = `SELECT * FROM offers`;
      const [offers] = await socialArtDB.query(offerLengthQuery);

      // @ts-ignore
      if (offers.length == 10) {
        return ApiResponse.validationErrorWithData(
          res,
          "Max number of offers limit reached"
        );
      }

      const uuid = uuidv4();
      console.log("Create Offer Api Pending");
      const newOffer = new Offers(req.body);
      const [offerData] = await newOffer.create(uuid);

      global.SocketService.handleGetNewOffer({
        event: "new-offer",
        // @ts-ignore
        offer: offerData[0],
      });

      console.log("Create Offer Api Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Offer Created Successfully",
        offerData[0]
      );
    } catch (error) {
      console.log("Create Offer Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getOffers: async (req, res) => {
    try {
      console.log("Get Offers Pending");
      const [offers] = await Offers.getOffers(req.query.id);
      // @ts-ignore
      if (!offers.length) {
        return ApiResponse.validationErrorWithData(res, "Offers Not Found");
      }
      console.log("Get Snft Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Offers Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Offers Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch offers");
    }
  },
};

export default OffersController;
