import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";
import { Fan, FanHistory } from "../models/index.models";
import { napaDB, socialArtDB } from "../index";
import { sendNotification } from "../utils/send-notification";

const FanController = {
  create: async (req, res) => {
    try {
      const uuidFanTable = uuidv4();
      const uuidFanHistoryTable = uuidv4();
      console.log("Create New Fan Api Pending");

      const requesterQuery = `SELECT profileId, profileName FROM users WHERE profileId = "${req.body.requesterId}"`;
      const [requester] = await Fan.query(requesterQuery);

      // @ts-ignore
      if (!requester.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Requester Profile Not Found"
        );
      }

      const targetQuery = `SELECT profileId, deviceToken FROM users WHERE profileId = "${req.body.targetId}"`;
      const [target] = await Fan.query(targetQuery);

      // @ts-ignore
      if (!target.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Target Profile Not Found"
        );
      }

      const deviceToken = target[0].deviceToken
      const profileName = requester[0].profileName



      const isExitQuery = `SELECT * FROM fan_table_connection WHERE requesterId = "${req.body.requesterId}" AND targetId = "${req.body.targetId}"`;
      const [isExit] = await Fan.query(isExitQuery);

      // @ts-ignore
      if (!isExit.length) {
        const newFan = new Fan(req.body);
        const [fan] = await newFan.create(uuidFanTable);

        const newFanHistory = new FanHistory(req.body);
        await newFanHistory.create(uuidFanHistoryTable);

        const getRequesterFansOf = `SELECT fansOf FROM users WHERE profileId = "${req.body.requesterId}"`;
        const [requesterFansOf] = await socialArtDB.query(getRequesterFansOf);
        const updateRequesterFansOf = `UPDATE users SET fansOf = "${requesterFansOf[0].fansOf + 1
          }" WHERE profileId = "${req.body.requesterId}"`;
        await socialArtDB.query(updateRequesterFansOf);
        await napaDB.query(updateRequesterFansOf);

        const getTargetFans = `SELECT fans FROM users WHERE profileId = "${req.body.targetId}"`;
        const [targetFans] = await socialArtDB.query(getTargetFans);
        const updateTargetFans = `UPDATE users SET fans = "${targetFans[0].fans + 1
          }" WHERE profileId = "${req.body.targetId}"`;
        await socialArtDB.query(updateTargetFans);
        await napaDB.query(updateTargetFans);

        console.log("Create New Fan Api Fullfilled");
        if (deviceToken.length) {
          sendNotification(
            deviceToken,
            `You got a New Fan!`,
            `Heads up! ${profileName} is Now Your Fan`,
            'follower'
          );
        }

        return ApiResponse.successResponseWithData(
          res,
          "New Fan Created Successfully",
          fan[0]
        );
      } else {
        req.body.status = "1";
        const newFan = new Fan(req.body);
        const [fan] = await newFan.update(
          req.body.requesterId,
          req.body.targetId
        );

        const newFanHistory = new FanHistory(req.body);
        await newFanHistory.create(uuidFanHistoryTable);

        const getRequesterFansOf = `SELECT fansOf FROM users WHERE profileId = "${req.body.requesterId}"`;
        const [requesterFansOf] = await socialArtDB.query(getRequesterFansOf);
        const updateRequesterFansOf = `UPDATE users SET fansOf = "${requesterFansOf[0].fansOf + 1
          }" WHERE profileId = "${req.body.requesterId}"`;
        await socialArtDB.query(updateRequesterFansOf);
        await napaDB.query(updateRequesterFansOf);

        const getTargetFans = `SELECT fans FROM users WHERE profileId = "${req.body.targetId}"`;
        const [targetFans] = await socialArtDB.query(getTargetFans);
        const updateTargetFans = `UPDATE users SET fans = "${targetFans[0].fans + 1
          }" WHERE profileId = "${req.body.targetId}"`;
        await socialArtDB.query(updateTargetFans);
        await napaDB.query(updateTargetFans);

        console.log("Create New Fan Api Fullfilled");
        if (deviceToken.length) {
          sendNotification(
            deviceToken,
            `You got a New Fan!`,
            `Heads up! ${profileName} is Now Your Fan`,
            'follower'
          );
        }

        return ApiResponse.successResponseWithData(
          res,
          "New Fan Created Successfully",
          fan[0]
        );
      }
    } catch (error) {
      console.log("Create New Fan Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  update: async (req, res) => {
    try {
      const uuidFanHistoryTable = uuidv4();
      console.log("Update Fan Api Pending");

      const requesterQuery = `SELECT profileId FROM users WHERE profileId = "${req.body.requesterId}"`;
      const [requester] = await Fan.query(requesterQuery);

      // @ts-ignore
      if (!requester.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Requester Profile Not Found"
        );
      }

      const targetQuery = `SELECT profileId FROM users WHERE profileId = "${req.body.targetId}"`;
      const [target] = await Fan.query(targetQuery);

      // @ts-ignore
      if (!target.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Target Profile Not Found"
        );
      }

      const deviceToken = target[0].deviceToken
      const profileName = requester[0].profileName

      const newFan = new Fan(req.body);
      const [fan] = await newFan.update(
        req.body.requesterId,
        req.body.targetId
      );

      const newFanHistory = new FanHistory(req.body);
      await newFanHistory.create(uuidFanHistoryTable);

      const getRequesterFansOf = `SELECT fansOf FROM users WHERE profileId = "${req.body.requesterId}"`;
      const [requesterFansOf] = await socialArtDB.query(getRequesterFansOf);
      const updateRequesterFansOf = `UPDATE users SET fansOf = "${requesterFansOf[0].fansOf - 1
        }" WHERE profileId = "${req.body.requesterId}"`;
      await socialArtDB.query(updateRequesterFansOf);
      await napaDB.query(updateRequesterFansOf);

      const getTargetFans = `SELECT fans FROM users WHERE profileId = "${req.body.targetId}"`;
      const [targetFans] = await socialArtDB.query(getTargetFans);
      const updateTargetFans = `UPDATE users SET fans = "${targetFans[0].fans - 1
        }" WHERE profileId = "${req.body.targetId}"`;
      await socialArtDB.query(updateTargetFans);
      await napaDB.query(updateTargetFans);

      console.log("Update Fan Api Fullfilled");

      if (deviceToken.length) {
        sendNotification(
          deviceToken,
          `You got a New Fan!`,
          `Heads up! ${profileName} is Now Your Fan`
        );
      }

      return ApiResponse.successResponseWithData(
        res,
        "Update Fan Api Successfully",
        fan[0]
      );
    } catch (error) {
      console.log("Update Fan Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getYourFans: async (req, res) => {
    try {
      console.log("Get Followers Api Pending");

      const myFollowers = [];

      const query = `SELECT * FROM fan_table_connection WHERE targetId = "${req.query.id}" AND status = "1"`;
      const [followers]: any = await Fan.query(query);

      await Promise.all(
        // @ts-ignore
        followers.map(async (follower) => {
          const getFollowerDetail = `SELECT profileId, avatar, profileName FROM users WHERE profileId = "${follower.requesterId}"`;
          const [followerDetail] = await socialArtDB.query(getFollowerDetail);
          myFollowers.push(followerDetail[0]);
        })
      );

      const sortedData = myFollowers
        ?.slice()
        ?.sort((a, b) => a.profileName.localeCompare(b.profileName));

      console.log("Get Followers Api Fullfilled");

      return ApiResponse.successResponseWithData(
        res,
        "Get Followers Api Successfully",
        sortedData?.length ? sortedData : null
      );
    } catch (error) {
      console.log("Get Followers Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getFansYouFollow: async (req, res) => {
    try {
      console.log("Get Following Api Pending");

      const myFollowing = [];

      const query = `SELECT * FROM fan_table_connection WHERE requesterId = "${req.query.id}" AND status = "1"`;
      const [following]: any = await Fan.query(query);

      await Promise.all(
        // @ts-ignore
        following.map(async (follower) => {
          const getFollowerDetail = `SELECT profileId, avatar, profileName FROM users WHERE profileId = "${follower.targetId}"`;
          const [followerDetail] = await socialArtDB.query(getFollowerDetail);
          myFollowing.push(followerDetail[0]);
        })
      );

      const sortedData = myFollowing
        ?.slice()
        ?.sort((a, b) => a.profileName.localeCompare(b.profileName));

      console.log("Get Following Api Fullfilled");

      return ApiResponse.successResponseWithData(
        res,
        "Get Following Api Successfully",
        sortedData?.length ? sortedData : null
      );
    } catch (error) {
      console.log("Get Following Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  serarchUsers: async (req, res) => {
    try {
      console.log("Search Users Api Pending");
      const { userName } = req.query;

      if (!userName) {
        return ApiResponse.validationErrorWithData(res, "User name required");
      }

      const searchQuery = `SELECT profileId, profileName, avatar FROM users WHERE LOWER(profileName) LIKE ('%${userName}%')`;
      const [users] = await socialArtDB.query(searchQuery);

      // @ts-ignore
      if (!users.length) {
        return ApiResponse.validationErrorWithData(res, "User Not Found");
      }

      console.log("Search Users Api Fullfilled");

      return ApiResponse.successResponseWithData(
        res,
        "Search Users Api Successfully",
        users
      );
    } catch (error) {
      console.log("Search Users Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  }
};

export default FanController;
