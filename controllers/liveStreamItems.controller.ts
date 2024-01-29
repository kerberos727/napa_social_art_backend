import { v4 as uuidv4 } from "uuid";
import { PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB, socialArtDB } from "../index";
import LiveStreamItems from "../models/live_stream_items.models";
import { uploadS3 } from "../utils/upload-s3";

const liveStreamItemsController = {
  createLiveStreamItem: async (req, res) => {
    const { streamId, profileId, walletAddress, streamTitle, itemName } =
      req.body;

    try {
      if (!req.file) {
        return ApiResponse.validationErrorWithData(res, "Please upload a file");
      }

      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${profileId}"`;
      const [profile] = await napaDB.query(profileQuery);

      //@ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const checkNapaAccountsQuery = `SELECT * FROM napa_accounts WHERE profileId = "${profileId}"`;
      const [existingNapaAccount] = await napaDB.query(checkNapaAccountsQuery);

      //@ts-ignore
      if (!existingNapaAccount.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "A napa account does not exist for this profile"
        );
      }

      const checkNapaWalletQuery = `SELECT * FROM napa_accounts WHERE (NWA_1_AC = "${walletAddress}" OR NWA_2_AC = "${walletAddress}" OR NWA_3_AC = "${walletAddress}" OR NWA_4_AC = "${walletAddress}" OR NWA_5_AC = "${walletAddress}" ) LIMIT 1`;
      const [existingWallet] = await napaDB.query(checkNapaWalletQuery);

      //@ts-ignore
      if (!existingWallet.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Invalid NapaWalletAccount"
        );
      }

      const checkStreamIdQuery = `SELECT * FROM livestreams WHERE streamId = "${streamId}"`;
      const [existingStreamId] = await socialArtDB.query(checkStreamIdQuery);

      //@ts-ignore
      if (!existingStreamId.length) {
        return ApiResponse.validationErrorWithData(res, "Invalid StreamId");
      }

      if (req.file) {
        // upload image
        const fileName =
          streamTitle?.replace(/ /g, "_") + "-" + itemName?.replace(/ /g, "_");
        const ex = (req.file.mimetype as string).split("/")[1];

        const params = {
          Bucket: process.env.LIVE_STREAM_BUCKET,
          Key: `${uuid}-${fileName}.${ex}`,
          ContentType: `image/${ex}`,
          Body: req.file.buffer,
          // ACL: "public-read",
        };

        const result = await uploadS3(params);

        req.body.itemImage = result.Location;
      }

      const newLiveStreamItems = new LiveStreamItems(req.body);
      const [liveStreamItems] = await newLiveStreamItems.create(uuid);

      global.SocketService.handleLiveStreamItemAdd({
        itemUuid: liveStreamItems[0]?.itemUuid,
        data: liveStreamItems[0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Live Stream Item Created Successfully",
        liveStreamItems[0]
      );
    } catch (error) {
      console.log("Create Live Stream Item Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  updateLiveStreamItem: async (req, res) => {
    const {
      itemUuid,
      itemName,
      itemDescription,
      walletAddress,
      itemAddress,
      transactionType,
      price,
      tokenized,
    } = req.body;

    try {
      const liveStreamQuery = `SELECT * FROM live_stream_items WHERE itemUuid = "${itemUuid}"`;
      const [liveStream] = await socialArtDB.query(liveStreamQuery);

      //@ts-ignore
      if (!liveStream.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Item Not Found"
        );
      }

      let itemImage = liveStream[0]?.itemImage;
      if (req.file) {
        const streamTitle = liveStream[0]?.streamTitle;
        const itemName = liveStream[0]?.itemName;

        const fileName =
          streamTitle?.replace(/ /g, "_") + "-" + itemName?.replace(/ /g, "_");
        const ex = (req.file.mimetype as string).split("/")[1];

        const params = {
          Bucket: process.env.LIVE_STREAM_BUCKET,
          Key: `${itemUuid}-${fileName}.${ex}`,
          ContentType: `image/${ex}`,
          Body: req.file.buffer,
          // ACL: "public-read",
        };

        const result = await uploadS3(params);

        itemImage = result.Location;
      }

      const [liveStreamItems] = await LiveStreamItems.updateLiveStreamItems(
        itemUuid,
        itemName,
        itemDescription,
        itemImage,
        walletAddress,
        itemAddress,
        transactionType,
        price,
        tokenized
      );

      const liveStreamItemData = await LiveStreamItems.getLiveStreamItem({
        itemUuid,
      });
      global.SocketService.handleLiveStreamItemUpdate({
        itemUuid: itemUuid,
        data: liveStreamItemData[0][0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Livestream item updated successfully",
        liveStreamItems[0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while updating the Live Stream Item ( " +
          error +
          " )"
      );
    }
  },

  purchaseLiveStreamItem: async (req, res) => {
    const { itemUuid, buyerProfileId, buyerWallet } = req.body;

    try {
      const liveStreamQuery = `SELECT * FROM live_stream_items WHERE itemUuid = "${itemUuid}"`;
      const [liveStream] = await socialArtDB.query(liveStreamQuery);

      //@ts-ignore
      if (!liveStream.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Item Not Found"
        );
      }

      const profileQuery = `SELECT * FROM users WHERE profileId = "${buyerProfileId}"`;
      const [profile] = await napaDB.query(profileQuery);

      //@ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const [liveStreamItems] = await LiveStreamItems.purchaseLiveStreamItems(
        itemUuid,
        buyerProfileId,
        buyerWallet
      );

      const liveStreamItemData = await LiveStreamItems.getLiveStreamItem({
        itemUuid,
      });

      global.SocketService.handleLiveStreamItemPurchase({
        itemUuid: itemUuid,
        data: liveStreamItemData[0][0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Live Stream Item Purchase Successfully",
        liveStreamItems[0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while purchasing the live stream item ( " +
          error +
          " )"
      );
    }
  },

  getLiveStreamItems: async (req, res) => {
    try {
      const [liveStreamItems] = await LiveStreamItems.getLiveStreamItem(
        req.query
      );
      // @ts-ignore
      if (!liveStreamItems.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Items Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Live Stream Items Successfully",
        // @ts-ignore
        liveStreamItems.length ? liveStreamItems : null
      );
    } catch (error) {
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the live stream item"
      );
    }
  },
  getAllLiveStreams: async (req, res) => {
    try {
      const [liveStreamItems] = await LiveStreamItems.getLiveStreamItem(
        req.query
      );
      // @ts-ignore
      if (!liveStreamItems.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Items Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Live Stream Items Successfully",
        // @ts-ignore
        liveStreamItems.length ? liveStreamItems : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the live stream"
      );
    }
  },
  deleteLiveStreamItems: async (req, res) => {
    try {
      if (req.params.itemUuid) {
        const [liveStreamItems] = await LiveStreamItems.getLiveStreamItem({
          itemUuid: req.params.itemUuid,
        });
        // @ts-ignore
        if (!liveStreamItems.length) {
          return ApiResponse.validationErrorWithData(
            res,
            "Live Stream Item Not Found"
          );
        }
        await LiveStreamItems.deleteLiveStreamItem(req.params.itemUuid);

        global.SocketService.handleLiveStreamItemDelete({
          itemUuid: req.params.itemUuid,
          data: "",
        });

        return ApiResponse.successResponse(
          res,
          "Live Stream Item Deleted Successfully"
        );
      } else {
        return ApiResponse.validationErrorWithData(
          res,
          "lLive Stream Item Not Found"
        );
      }
    } catch (error) {
      console.log(error);
      console.log("Delete Live Stream Item Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to delete Live Stream Item"
      );
    }
  },
};
export default liveStreamItemsController;
