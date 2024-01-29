import { v4 as uuidv4 } from "uuid";
import { MintedPosts, SnftTransaction } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { PostedVideos } from "../models/index.models";
import { napaDB, socialArtDB } from "../index";
import moment from "moment";
import { uploadS3 } from "../utils/upload-s3";
import { sendNotification } from "../utils/send-notification";

const MintedPostController = {
  mintPost: async (req, res) => {
    try {
      if (!req.file) {
        return ApiResponse.validationErrorWithData(res, "Please upload a file");
      }
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      // @ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const ex = (req.file.mimetype as string).split("/")[1];
      const params = {
        Bucket: process.env.SOCIAL_ART_SNFT_COVER,
        Key: `${uuid}.${ex}`,
        ContentType: `image/${ex}`,
        Body: req.file.buffer,
        ACL: "public-read",
      };

      const result = await uploadS3(params);

      req.body.thumbnail = result.Location;

      const postQuery = `SELECT * FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [post] = await PostedVideos.query(postQuery);

      // @ts-ignore
      if (!post.length) {
        return ApiResponse.validationErrorWithData(res, "Post Not Found");
      }

      const tokenUri = uuidv4();
      const reqData = req.body;
      console.log("Create Minted Post Api Pending");
      const mintedTime = moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ");

      // create mint post
      const requestBody = new MintedPosts(reqData);
      const [postsData] = await requestBody.create(uuid, mintedTime, tokenUri);

      // update post mint status
      const query = `UPDATE posted_videos SET minted = "true", mintedTimeStamp = "${mintedTime}", updatedAt = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${req.body.postId}"`;
      await PostedVideos.query(query);

      // set awards to user schema
      const userProfileGetQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [userProfileResponse] = await napaDB.query(userProfileGetQuery);
      await socialArtDB.query(userProfileGetQuery);
      const userProfile = userProfileResponse[0];
      userProfile["awardsEarned"] += 5;
      userProfile["netAwardsAvailable"] += 5;
      const userProfileUpdateQuery = `UPDATE users SET awardsEarned = "${
        userProfile["awardsEarned"]
      }", netAwardsAvailable = "${
        userProfile["netAwardsAvailable"]
      }", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE profileId = "${req.body.profileId}" `;
      await napaDB.query(userProfileUpdateQuery);
      await socialArtDB.query(userProfileUpdateQuery);

      const updatePostQuery = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE postId = "${req.body.postId}"`;
      const [updatedPost] = await PostedVideos.query(updatePostQuery);

      const mintedPost = postsData[0];

      req.body = {
        ...req.body,
        mintedTime: mintedTime,
        mintId: mintedPost.mintId,
      };

      await SnftTransaction.create(req.body);

      const getMintedPostWithPayouts = `SELECT minted_posts.*, snft_transactions.payoutsCategory, snft_transactions.closingDate FROM minted_posts JOIN snft_transactions ON minted_posts.mintId = snft_transactions.mintId WHERE minted_posts.postId = "${req.body.postId}"`;
      const [mintedPostWithPayouts] = await socialArtDB.query(
        getMintedPostWithPayouts
      );

      console.log("Create Minted Post Api Fullfilled");
      global.SocketService.handleGetMintedPosts({
        posts: mintedPostWithPayouts[0],
      });
      global.SocketService.handleGetUpdatedPost({
        post: updatedPost[0],
        postId: req.body.postId,
      });

      return ApiResponse.successResponseWithData(
        res,
        "SNFT Minted Successfully",
        {
          postId: mintedPost.postId,
          mintedId: mintedPost.mintId,
          SNFTAddress: mintedPost.SNFTAddress,
          networkTxId: mintedPost.networkTxId,
          owner: mintedPost.owner,
        }
      );
    } catch (error) {
      console.log("Create Minted Post Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getAllMintedPosts: async (req, res) => {
    try {
      console.log("Get Mint Posts Pending");
      const [posts]: any = await MintedPosts.getAllMintedPosts(
        req.query.accountId,
        req.query.offset
      );
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Mint Posts Data Not Found"
        );
      }

      await Promise.all(
        posts.map(async (post: any, index) => {
          const getAllTimeViews = `SELECT prev_allTime_views FROM views WHERE postId = "${post.postId}"`;
          const [allTimeView] = await socialArtDB.query(getAllTimeViews);
          posts[index].allTimeViews = allTimeView[0]?.prev_allTime_views
            ? allTimeView[0]?.prev_allTime_views
            : 0;
        })
      );

      // await Promise.all(
      //   // @ts-ignore
      //   posts.map(async (post, index) => {
      //     const getPayoutsCategory = `SELECT payoutsCategory FROM snft_transactions WHERE postId = "${posts[index].postId}"`;
      //     const [payoutsCategory] = await socialArtDB.query(getPayoutsCategory);
      //     posts[index].payoutsCategory = payoutsCategory[0]?.payoutsCategory
      //       ? payoutsCategory[0]?.payoutsCategory
      //       : "0";
      //   })
      // );

      console.log("Get Mint Posts Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Get Mint Posts Successfully",
        // @ts-ignore
        posts.length ? posts : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Mint Posts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch mint posts");
    }
  },

  getMintedPost: async (req, res) => {
    try {
      console.log("Get Mint Post Pending");

      if (!req.query.id) {
        return ApiResponse.validationErrorWithData(
          res,
          "id is required in query params"
        );
      }

      const [post] = await MintedPosts.getMintedPost(req.query.id);
      // @ts-ignore
      if (!post.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Mint Post Data Not Found"
        );
      }
      console.log("Get Mint Post Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Get Mint Post Successfully",
        // @ts-ignore
        post.length ? post[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Mint Post Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch mint post");
    }
  },

  updateMintPosts: async (req, res) => {
    try {
      console.log("Get Mint Posts Pending");

      const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      // @ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const postQuery = `SELECT * FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [post] = await PostedVideos.query(postQuery);

      // @ts-ignore
      if (!post.length) {
        return ApiResponse.validationErrorWithData(res, "Post Not Found");
      }

      const mintPostQuery = `SELECT * FROM minted_posts WHERE mintId = "${req.params.mintId}"`;
      const [mintPost] = await PostedVideos.query(mintPostQuery);

      // @ts-ignore
      if (!mintPost.length) {
        return ApiResponse.validationErrorWithData(res, "Mint Post Not Found");
      }

      const updateQuery = `UPDATE minted_posts SET marketplace_listed = "${req.body.marketplace_listed}", postId = "${req.body.postId}", profileId = "${req.body.profileId}" WHERE mintId = "${req.params.mintId}"`;

      const [result] = await socialArtDB.query(updateQuery);

      console.log("result ===>", result);

      console.log("Update Mint Posts Fullfilled");

      return ApiResponse.successResponse(res, "Mint Post Updated Successfully");
    } catch (error) {
      console.log("Update Mint Posts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to update mint post");
    }
  },

  updateMinPostStatus: async (req, res) => {
    try {
      console.log("Update Mint Posts Status Pending");

      const curTime = moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ");

      const getPostQuery = `SELECT isExpired FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [postQuery] = await socialArtDB.query(getPostQuery);

      if (postQuery[0]?.isExpired == "true") {
        return ApiResponse.validationErrorWithData(
          res,
          "Post is already expired"
        );
      }

      const updatePostQuery = `UPDATE posted_videos SET isExpired = "true", updatedAt="${curTime}"  WHERE postId = "${req.body.postId}"`;
      await socialArtDB.query(updatePostQuery);

      const updateQuery = `UPDATE minted_posts SET status = "${req.body.status}", napaTokenEarned = "${req.body.napaTokenEarned}" , updatedAt="${curTime}" WHERE postId = "${req.body.postId}"`;

      const [result] = await socialArtDB.query(updateQuery);

      const getMintedPostWithPayouts = `SELECT minted_posts.*, snft_transactions.payoutsCategory, snft_transactions.closingDate FROM minted_posts JOIN snft_transactions ON minted_posts.mintId = snft_transactions.mintId WHERE minted_posts.postId = "${req.body.postId}"`;
      const [mintedPostWithPayouts] = await socialArtDB.query(
        getMintedPostWithPayouts
      );

      const updatedSnftTransactionQuery = `UPDATE snft_transactions SET finalPrice = "${
        req.body.tokenPrice
      }", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE postId = "${req.body.postId}"`;

      await socialArtDB.query(updatedSnftTransactionQuery);

      const getPostAwards = `SELECT profileId, awardsByUsers FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [awards] = await socialArtDB.query(getPostAwards);

      const awardsCount = awards[0]?.awardsByUsers
        ? awards[0]?.awardsByUsers.split(",")
        : [];

      const getDeviceToken = `SELECT deviceToken FROM users WHERE profileId = "${awards[0]?.profileId}"`;
      const [deviceToken] = await socialArtDB.query(getDeviceToken);

      sendNotification(
        deviceToken[0]?.deviceToken,
        "SNFT Live Period Ended",
        `SNFT ${mintedPostWithPayouts[0]?.SNFTTitle} Live Period Has Ended With ${awardsCount?.length} Awards`
      );

      global.SocketService.handleMintPostStatusUpdate({
        mint: mintedPostWithPayouts[0],
        mintId: mintedPostWithPayouts[0].mintId,
      });

      console.log("result ===>", result);

      console.log("Update Mint Posts Status Fullfilled");

      return ApiResponse.successResponse(
        res,
        "Mint Post Status Updated Successfully"
      );
    } catch (error) {
      console.log("Update Mint Posts Status Rejected", error);
      return ApiResponse.ErrorResponse(
        res,
        "Unable to update mint post status"
      );
    }
  },

  getRecentMintedPosts: async (req, res) => {
    try {
      console.log("Get Recent Mint Posts Pending");
      const [posts] = await MintedPosts.getRecentMintedPosts();
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Mint Posts Data Not Found"
        );
      }
      console.log("Get Recent Mint Posts Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Get Recent Mint Posts Successfully",
        // @ts-ignore
        posts.length ? (posts.length > 5 ? posts.slice(0, 5) : posts) : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Recent Mint Posts Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to fetch Get recent mint posts"
      );
    }
  },

  getHighestEarningMintedPost: async (req, res) => {
    try {
      console.log("Get Highest Earning Minted Post Pending");
      const { profileId } = req.query;
      const [posts] = await MintedPosts.getHighestEarningMintedPost(profileId);
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Mint Posts Data Not Found"
        );
      }
      console.log("Get Highest Earning Minted Post Fullfilled");
      return ApiResponse.successResponseWithData(
        res,
        "Get Highest Earning Minted Post Successfully",
        // @ts-ignore
        posts[0]
      );
    } catch (error) {
      console.log(error);
      console.log("Get Highest Earning Minted Post Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to fetch Highest Earning Minted Post"
      );
    }
  },
};

export default MintedPostController;
