import { SnftTransaction } from "../models/index.models";
import ApiResponse from "../utils/api-response";

const SnftTransactionController = {
  create: async (req, res) => {
    try {
      console.log("Create SNFT Transaction Api Pending");
      const [transaction] = await SnftTransaction.create(req.body);
      // @ts-ignore
      if (!transaction.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Events Data Not Found"
        );
      }
      console.log("Create SNFT Transaction Api Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Create SNFT Transaction Api Successfully",
        // @ts-ignore
        transaction.length ? transaction[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Create SNFT Transaction Api Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to create snft transaction"
      );
    }
  },
  redeem: async (req, res) => {
    try {
      console.log("Redeem SNFT Transaction Api Pending");
      const [transaction] = await SnftTransaction.redeem(req.params.id);
      // @ts-ignore
      if (!transaction.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Snft Transaction Not Found"
        );
      }

      global.SocketService.handleRedeemToken({
        event: "redeem-token",
        // @ts-ignore
        post: {
          postId: transaction[0].postId,
          closingDate: transaction[0].closingDate,
        },
      });

      console.log("Redeem SNFT Transaction Api Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Redeem SNFT Transaction Api Successfully",
        // @ts-ignore
        transaction.length ? transaction[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Redeem SNFT Transaction Api Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to create Redeem SNFT Transaction"
      );
    }
  },
};

export default SnftTransactionController;
