import { Transaction } from "../models/index.models";
import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";
import { socialArtDB } from "../index";
import { sendNotification } from "../utils/send-notification";

const TransactionController = {
  create: async (req, res) => {
    try {
      const uuid = uuidv4();
      console.log("Create Transaction Api Pending");
      const newTransaction = new Transaction(req.body);
      const [transactionData] = await newTransaction.create(uuid);

      const updatePostQuery = `UPDATE minted_posts SET profileId = "${req.body.profileId}", owner = "${req.body.owner}" WHERE snftId = "${req.body.itemId}"`;
      await socialArtDB.query(updatePostQuery);

      const updateMarketplaceItem = `UPDATE marketplace SET amount = "", currencyType = "0", creatorFees = "0", specificBuyer = "", eligibleForCoBatching = "false", offerSpread="0", duration = "", onSale = "false", maxOffer = "", type = "Fixed Price", lazyMinted = "false", listed = "0", profileId = "${req.body.profileId}" WHERE snftId = "${req.body.itemId}"`;
      await socialArtDB.query(updateMarketplaceItem);

      const getSnftTitle = `SELECT SNFTTitle FROM minted_posts WHERE snftId = "${req.body.itemId}"`;
      const [snftTitle]: any = await socialArtDB.query(getSnftTitle);

      const getDeviceToken = `SELECT deviceToken FROM users WHERE profileId = "${req.body.profileId}"`;
      const [deviceToken]: any = await socialArtDB.query(getDeviceToken);

      console.log("snftTitle", snftTitle);
      console.log("deviceToken", deviceToken[0]);

      if (deviceToken.length) {
        sendNotification(
          deviceToken[0]?.deviceToken,
          "Users SNFT has been sold",
          `Congratulations Your ${snftTitle[0]?.SNFTTitle} Has Been Purchased!`,
          'transaction'
        );
      }

      console.log("Create Transaction Api Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Nft Created Successfully",
        transactionData[0]
      );
    } catch (error) {
      console.log("Create Transaction Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default TransactionController;
