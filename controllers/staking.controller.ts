import { Staking } from "../models/index.models";
import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";

const StakingController = {
  create: async (req, res) => {
    try {
      const uuid = uuidv4();
      console.log("Create Staking Api Pending");
      const newStaking = new Staking(req.body);
      const [stakingData] = await newStaking.create(uuid);

      console.log("Create Staking Api Fullfilled");

      global.SocketService.handleNewStakingTransaction({
        event: "new-staking-transaction",
        // @ts-ignore
        transaction: stakingData[0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Staking Created Successfully",
        stakingData[0]
      );
    } catch (error) {
      console.log("Create Staking Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  get: async (req, res) => {
    try {
      console.log("Get Stakings Api Pending");
      const newStaking = new Staking(req.body);
      const [stakingData] = await newStaking.get();

      console.log("Get Stakings Api Fullfilled");

      return ApiResponse.successResponseWithData(
        res,
        "Get Stakings Successfully",
        // @ts-ignore
        stakingData.length ? stakingData : null
      );
    } catch (error) {
      console.log("Get Stakings Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default StakingController;
