import { v4 as uuidv4 } from "uuid";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB, socialArtDB } from "../index";
import LiveStream from "../models/live_stream.models";

const appID = "c6b5f53b210d45d2a83a24d27db3dfca";
const appCertificate = "a7e828103e42417484bf0fd78236d7a2";
const role = RtcRole.PUBLISHER;

const LiveStreamController = {
  createLiveStream: async (req, res) => {
    const { walletAddress, profileId, streamTitle } = req.body;

    try {
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

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

      const expirationTimeInSeconds = 7200;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const streamToken = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        streamTitle,
        0,
        role,
        privilegeExpiredTs
      );

      req.body.streamToken = streamToken;

      const newLiveStream = new LiveStream(req.body);
      const [liveStreamData] = await newLiveStream.create(uuid);

      global.SocketService.handleLiveStreamAdd({
        streamId: liveStreamData[0]?.streamId,
        data: liveStreamData[0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Live Stream Created Successfully",
        liveStreamData[0]
      );
    } catch (error) {
      console.log("Create Live Stream Api Rejected");
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  updateLiveStream: async (req, res) => {
    const {
      streamId,
      streamStatus,
      streamHostUid = "",
    } = req.body;

    try {
      const liveStreamQuery = `SELECT * FROM livestreams WHERE streamId = "${streamId}"`;
      const [liveStream] = await socialArtDB.query(liveStreamQuery);

      //@ts-ignore
      if (!liveStream.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Not Found"
        );
      }

      if ((streamStatus || streamHostUid) && streamId) {
        const [updateLiveStream] = await LiveStream.updateLiveStream(
          streamId,
          streamStatus,
          streamHostUid,
        );
      }

      const liveStreamData = await LiveStream.getLiveStream({ streamId });
      if (streamStatus == 1) {
        global.SocketService.handleLiveStreamUpdate({
          streamId: streamId,
          data: liveStreamData[0][0],
        });
        global.SocketService.handleLiveStreamJoin({
          streamId: streamId,
          data: liveStreamData[0][0],
        });
      } else {
        global.SocketService.handleLiveStreamEnd({
          streamId: streamId,
          data: liveStreamData[0][0],
        });
      }

      return ApiResponse.successResponseWithData(
        res,
        "Livestream updated successfully",
        liveStreamData[0][0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while updating the Live Stream"
      );
    }
  },

  increaseUserCount: async (req, res) => {
    const {
      streamId,
    } = req.body;

    try {
      const liveStreamQuery = `SELECT * FROM livestreams WHERE streamId = "${streamId}"`;
      const [liveStream] = await socialArtDB.query(liveStreamQuery);

      //@ts-ignore
      if (!liveStream.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Not Found"
        );
      }

      await LiveStream.increaseUserCount(
        streamId
      );

      const liveStreamData = await LiveStream.getLiveStream({ streamId });

      global.SocketService.handleLiveStreamJoin({
        streamId: streamId,
        data: liveStreamData[0][0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Live Stream User Count Update Successfully",
        liveStreamData[0][0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while updating the Live Stream"
      );
    }
  },


  decreaseUserCount: async (req, res) => {
    const {
      streamId,
    } = req.body;

    try {
      const liveStreamQuery = `SELECT * FROM livestreams WHERE streamId = "${streamId}"`;
      const [liveStream] = await socialArtDB.query(liveStreamQuery);

      //@ts-ignore
      if (!liveStream.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Not Found"
        );
      }

      const checkStreamCount:any = await LiveStream.checkStreamCount({ streamId });

      if(checkStreamCount > 0)
      {
        await LiveStream.decreaseUserCount(
          streamId
        );
      }

      const liveStreamData = await LiveStream.getLiveStream({ streamId });

      global.SocketService.handleLiveStreamJoin({
        streamId: streamId,
        data: liveStreamData[0][0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Live Stream User Count Update Successfully",
        liveStreamData[0][0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while updating the Live Stream"
      );
    }
  },

  getLiveStream: async (req, res) => {
    try {
      const [offers] = await LiveStream.getLiveStream(req.query);
      // @ts-ignore
      if (!offers.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Live Stream Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the live stream"
      );
    }
  },

  getAllLiveStreams: async (req, res) => {
    try {
      const [offers] = await LiveStream.getLiveStream(req.query);
      // @ts-ignore
      if (!offers.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Live Stream Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Live Stream Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the live stream"
      );
    }
  },
};
export default LiveStreamController;
