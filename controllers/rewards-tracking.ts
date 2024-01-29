import ApiResponse from "../utils/api-response";
import RewardsTracking from "../models/rewards-tracking.model";

const RewardsTrackingController = {
  create: async (req, res) => {
    try {
      console.log("Create Rewards Tracking Table Api Pending");
      const rewardsTrackingTable = new RewardsTracking(req.body);
      const [rewardsTrackingData] = await rewardsTrackingTable.create();

      console.log("Create Rewards Tracking Table Api Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Create Rewards Tracking Table Successfully",
        rewardsTrackingData
      );
    } catch (error) {
      console.log("Create Rewards Tracking Table Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default RewardsTrackingController;
