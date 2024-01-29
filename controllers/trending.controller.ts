import { Trending } from "../models/index.models";
import ApiResponse from "../utils/api-response";

const TrendingController = {
  getAllTrendings: async (req, res) => {
    try {
      console.log("Get All Trendings Pending");
      const [trendings] = await Trending.getAllTrendingFeeds("1");
      // @ts-ignore
      if (!trendings.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Trendings Data Not Found"
        );
      }
      console.log("Get All Trendings Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get All Trendings Successfully",
        // @ts-ignore
        trendings.length ? trendings : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get All Trendings Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch trendings");
    }
  },

  getTrending: async (req, res) => {
    try {
      console.log("Get Trending Api Pending");
      const { articleId } = req.params;
      const [article] = await Trending.getTrending(articleId);
      // @ts-ignore
      if (!article.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Event Data Not Found"
        );
      }
      console.log("Get Trending Api Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Trending Api Successfully",
        // @ts-ignore
        article.length ? article[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Trending Api Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to get Trending");
    }
  },
};

export default TrendingController;
