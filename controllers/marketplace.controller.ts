import { MarketPlace } from "../models/index.models";
import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";
import { socialArtDB } from "../index";

const MarketPlaceController = {
  createSnft: async (req, res) => {
    try {
      const uuid = uuidv4();
      console.log("Create Snft Api Pending");
      const newSnft = new MarketPlace(req.body);
      const [snftData] = await newSnft.create(uuid);
      const updateQuery = `UPDATE minted_posts SET marketplace_listed = "true", snftId = "${snftData[0].snftId}" WHERE mintId = "${req.body.mintId}"`;
      await socialArtDB.query(updateQuery);

      global.SocketService.handleGetRecentSnfts({
        event: "recent-snfts",
        // @ts-ignore
        snft: snftData[0],
      });

      console.log("Create Snft Api Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Nft Created Successfully",
        snftData[0]
      );
    } catch (error) {
      console.log("Create Snft Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getAllSnfts: async (req, res) => {
    try {
      console.log("Get Snfts Pending");
      const [snfts] = await MarketPlace.getAllSnfts(req.query.limit);
      // @ts-ignore
      if (!snfts.length) {
        return ApiResponse.validationErrorWithData(res, "Snfts Data Not Found");
      }
      console.log("Get Snfts Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Snfts Successfully",
        // @ts-ignore
        snfts.length ? snfts : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Snfts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch snfts");
    }
  },

  getMySnfts: async (req, res) => {
    try {
      console.log("Get My Snfts Pending");
      const [mySnfts] = await MarketPlace.getMySnfts(req.query.address);
      // @ts-ignore
      if (!mySnfts.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "My Snfts Data Not Found"
        );
      }
      console.log("Get My Snfts Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get My Snfts Successfully",
        // @ts-ignore
        mySnfts.length ? mySnfts : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get My Snfts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch my Snfts");
    }
  },

  getSnft: async (req, res) => {
    try {
      console.log("Get Snft Pending");
      const [snft] = await MarketPlace.getSnft(req.params.snftId);
      // @ts-ignore
      if (!snft.length) {
        return ApiResponse.validationErrorWithData(res, "Snft Data Not Found");
      }
      const getPayoutsCategory = `SELECT payoutsCategory FROM snft_transactions WHERE postId = "${snft[0].postId}"`;
      const [payoutsCategory] = await socialArtDB.query(getPayoutsCategory);
      const getGeneratorName = `SELECT profileName FROM users WHERE profileId = "${snft[0].profileId}"`;
      const [GeneratorName] = await socialArtDB.query(getGeneratorName);
      console.log("Get Snft Successfully");
      snft[0].payoutsCategory = payoutsCategory[0]?.payoutsCategory
        ? payoutsCategory[0]?.payoutsCategory
        : "0";
      //@ts-ignore
      snft[0].generatorName = [GeneratorName][0][0].profileName;
      return ApiResponse.successResponseWithData(
        res,
        "Get Snft Successfully",
        // @ts-ignore
        snft.length ? snft[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Snft Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch snft");
    }
  },

  deleteSnft: async (req, res) => {
    try {
      console.log("Delete Snft Pending");
      const [snftData] = await MarketPlace.getSnft(req.params.id);
      // @ts-ignore
      if (!snftData.length) {
        return ApiResponse.validationErrorWithData(res, "Snft Data Not Found");
      }
      await MarketPlace.deleteSnft(req.params.id);
      console.log("Delete Snft Successfully");
      return ApiResponse.successResponse(res, "Snft Deleted Successfully");
    } catch (error) {
      console.log(error);
      console.log("Delete Snft Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to delete snft");
    }
  },

  updateSnft: async (req, res) => {
    try {
      console.log("Update Snft Pending");
      const [snftData] = await MarketPlace.getSnft(req.params.id);
      // @ts-ignore
      if (!snftData.length) {
        return ApiResponse.validationErrorWithData(res, "Snft Data Not Found");
      }
      const [updatedData] = await MarketPlace.updateSnft(req.body);
      console.log("Update Snft Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "DOT updated successfully",
        // @ts-ignore
        updatedData.length ? updatedData[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Update Snft Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Update snft");
    }
  },

  buySnft: async (req, res) => {
    try {
      console.log("Buy Snft Pending");
      const [snftData] = await MarketPlace.getSnft(req.params.id);
      // @ts-ignore
      if (!snftData.length) {
        return ApiResponse.validationErrorWithData(res, "Snft Data Not Found");
      }
      const [updatedData] = await MarketPlace.buySnft(req.params.id);
      console.log("Buy Snft Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Buy Snft Successfully",
        // @ts-ignore
        updatedData.length ? updatedData[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Buy Snft Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Buy snft");
    }
  },

  pinToIPFS: async (req, res) => {
    try {
      console.log("Pin To IPFS Pending");
      const result = await MarketPlace.pinToIPFS(req.body);
      console.log("result", result);

      console.log("Pin To IPFS Pending");
      return ApiResponse.successResponseWithData(
        res,
        "Pin To IPFS Successfully",
        // @ts-ignore
        result
      );
    } catch (error) {
      console.log(error);
      console.log("Pin To IPFS Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Pin To IPFS");
    }
  },

  updateSaleStatus: async (req, res) => {
    try {
      console.log("Update Sale Status Pending");
      const [updatedItem] = await MarketPlace.updateSaleStatus(req.body.id, req.body.status);
      // @ts-ignore
      global.SocketService.handleUpdatedSaleStatus(updatedItem?.length ? updatedItem[0] : null);
    } catch (error) {
      console.log(error);
      console.log("Update Sale Status Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Update Sale Status");
    }
  },
};

export default MarketPlaceController;
