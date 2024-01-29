/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 as uuidv4 } from "uuid";
import { Fan, PostedVideos, SnftTransaction } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { uploadS3 } from "../utils/upload-s3";
import { napaDB, socialArtDB } from "../index";
import moment from "moment";

const { sendEmail } = require("../utils/nodemailer");
const ejs = require("ejs");
import path from "path";
import { sendNotification } from "../utils/send-notification";
import { removeDuplicates } from "../utils/removeDuplicates";

const PostedVideosController = {
  createPost: async (req, res) => {
    try {         
      if (!req.files?.videoFile) {
        return ApiResponse.validationErrorWithData(res, "Please upload a file");
      }
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      // @ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      console.log("Create Post Api Pending");

      if(req?.files?.videoFile)
      {
        const ex = (req?.files?.videoFile[0]?.mimetype as string)?.split("/")[1] || 'mp4';
        const params = {
          Bucket: process.env.SOCIAL_ART_BUCKET_NAME,
          Key: `${uuid}.${ex == "octet-stream" ? "mp4" : ex}`,
          ContentType: `video/${ex == "octet-stream" ? "mp4" : ex}`,
          Body: req?.files?.videoFile[0]?.buffer,
          ACL: "public-read",
        };

        const result = await uploadS3(params);
        req.body.videoURL = result?.Location;
        req.body.mobileVideoURL = result?.Location;
      }

      if(req?.files?.videoThumbnail)
      {
        const ex = (req?.files?.videoThumbnail[0]?.mimetype as string).split("/")[1] || 'png';
        const params = {
          Bucket: process.env.SOCIAL_ART_SNFT_COVER,
          Key: `${uuid}.${ex}`,
          ContentType: `image/${ex}`,
          Body: req?.files?.videoThumbnail[0]?.buffer,
          ACL: "public-read",
        };

        const result = await uploadS3(params);
        req.body.videoThumbnail = result?.Location;
      }

      const newPost = new PostedVideos(req.body);
      const [postData] = await newPost.create(uuid);
      const uuidViews = uuidv4();
      const insertQuery = `INSERT INTO views (viewsUUID, postId, prev_7_days_views, prev_7_days_views_date, prev_14_days_views, prev_14_days_views_date, prev_21_days_views, prev_21_days_views_date, prev_28_days_views, prev_28_days_views_date, prev_35_days_views, prev_35_days_views_date, prev_42_days_views, prev_42_days_views_date, prev_allTime_views, prev_allTime_views_date, weekCount, createdAt, updatedAt) VALUES (
        "${uuidViews}",
        "${postData[0].postId}",
        0,
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
        0,
        "",
        0,
        "",
        0,
        "",
        0,
        "",
        0,
        "",
        0,
        "",
        1,
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
        )`;
      await socialArtDB.query(insertQuery);
      console.log("Create Post Api Fullfilled");
      global.SocketService.handleGetPosts({
        posts: postData[0],
      });
      return ApiResponse.successResponseWithData(
        res,
        "Post Created Successfully",
        postData[0]
      );
    } catch (error) {
      console.log("Create Post Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getAllPosts: async (req, res) => {
    try {
      const { profileId } = req.query;
      console.log("Get Posts Pending");
      const followingFansQuery = `SELECT targetId FROM fan_table_connection WHERE requesterId = "${profileId}" AND status = "1"`;
      const [following]: any = await Fan.query(followingFansQuery);
      const commaSeparatedString = following
        ?.map((obj) => `'${obj.targetId}'`)
        .join(",");

      const [posts] = await PostedVideos.getAllPosts(
        req.query.offset,
        commaSeparatedString,
        profileId
      );
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(res, "Posts Data Not Found");
      }
      console.log("Get Posts Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Posts Successfully",
        // @ts-ignore
        posts.length ? posts : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Posts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch posts");
    }
  },

  getMyPosts: async (req, res) => {
    try {
      const { offset, profileId } = req.query;
      console.log("Get my Posts Pending");
      const [posts] = await PostedVideos.getMyPosts(offset, profileId);
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(res, "Posts Data Not Found");
      }
      console.log("Get My Posts Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get MY Posts Successfully",
        // @ts-ignore
        posts.length ? posts : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get My Posts Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch my posts");
    }
  },

  getPostDetails: async (req, res) => {
    try {
      const { postId } = req.params;
      console.log("Get Post Details Pending");
      const [posts] = await PostedVideos.getPostDetails(postId);
      // @ts-ignore
      if (!posts.length) {
        return ApiResponse.validationErrorWithData(res, "Post Data Not Found");
      }
      console.log("Get Post Details Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Post Details Successfully",
        // @ts-ignore
        posts.length ? posts[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Post Details Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch post details");
    }
  },

  likePost: async (req, res) => {
    try {
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

      const likedUsersDataQuery = `SELECT likedByUsers FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [likedByUsers] = await PostedVideos.query(likedUsersDataQuery);
      let existResults = likedByUsers[0].likedByUsers
        ? likedByUsers[0].likedByUsers.split(",")
        : [];

      if (existResults.includes(req.body.profileId)) {
        existResults = existResults.filter((id) => req.body.profileId != id);
      } else {
        existResults.push(req.body.profileId);
      }
      const query = `UPDATE posted_videos SET likedByUsers = "${String(
        existResults
      )}", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE postId = "${req.body.postId}"`;
      await PostedVideos.query(query);
      global.SocketService.handlePostLikesLength({
        postId: req.body.postId,
        likes: existResults,
      });
      return ApiResponse.successResponseWithData(
        res,
        "Like post Api Successfully",
        existResults.length
      );
    } catch (error) {
      console.error(error);
      return ApiResponse.ErrorResponse(res, "Something went wrong");
    }
  },

  awardPost: async (req, res) => {
    try {
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

      //check award given validation
      const userProfileGetQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
      const [userProfileResponse] = await napaDB.query(userProfileGetQuery);
      const userProfile = userProfileResponse[0];
      if (userProfile["netAwardsAvailable"] <= 0)
        return ApiResponse.ErrorResponse(
          res,
          "oops! you are not able to give rewards now."
        );

      // get current awards of the video
      const getAwardsOfPostQuery = `SELECT awardsByUsers, profileId FROM posted_videos WHERE postId = "${req.body.postId}"`;
      const [response] = await PostedVideos.query(getAwardsOfPostQuery);

      // check user can not give reward to his own video
      if (response[0].profileId == req.body.profileId)
        return ApiResponse.ErrorResponse(
          res,
          "You cannot award your own post"
        );
      const existResults = response[0].awardsByUsers
        ? response[0].awardsByUsers.split(",")
        : [];

      // check user already give reward to the video
      if (existResults.includes(req.body.profileId))
        return ApiResponse.ErrorResponse(
          res,
          "You have already given reward to this video!"
        );
      existResults.push(req.body.profileId);

      // update video table after added award
      const updatePostQeury = `UPDATE posted_videos SET awardsByUsers = "${String(
        existResults
      )}", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE postId = "${req.body.postId}"`;
      await PostedVideos.query(updatePostQeury);

      // deduct award from the user profile
      userProfile["netAwardsAvailable"] -= 1;
      userProfile["awardsGiven"] += 1;
      const userProfileUpdateQuery = `UPDATE users SET netAwardsAvailable = "${
        userProfile["netAwardsAvailable"]
      }", awardsGiven = "${userProfile["awardsGiven"]}", updatedAt = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE profileId = "${
        req.body.profileId
      }" `;
      await napaDB.query(userProfileUpdateQuery);

      await SnftTransaction.update(existResults.length, req.body.postId);

      global.SocketService.handleAwardsLength({
        postId: req.body.postId,
        awards: String(existResults),
      });
      return ApiResponse.successResponseWithData(
        res,
        "award video Api Successfully",
        existResults
      );
    } catch (error) {
      console.error(error);
      return ApiResponse.ErrorResponse(res, "Something went wrong");
    }
  },

  sendNotification: async (req, res) => {
    try {
      console.log("Send Post Notification Pending");
      const postQuery = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE postId = "${req.body.postId}"`;
      const [postData] = await PostedVideos.query(postQuery);

      const file = await ejs.renderFile(
        path.join(__dirname, "..", "views/post-notification.ejs"),
        {
          snft_title: postData[0].SNFTTitle,
          snft_description: postData[0].SNFTDescription,
          ethereum_address: postData[0].network,
          date_minted: postData[0].timeMinted,
          awarded_tier: "",
          total_tokens_earned: "",
          status: postData[0].status,
          user_name: postData[0].profileName,
        }
      );
      sendEmail(
        process.env.REPORT_EMAIL,
        file,
        `Your ${postData[0].SNFTTitle} post live period has ended!`
      );
      return ApiResponse.successResponseWithData(
        res,
        "Post Notification Sent Successfully",
        postData[0]
      );
    } catch (error) {
      console.log(error);
      console.log("Send Post Notification Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Send Post Notification");
    }
  },

  getActiveUsersCount: async (req, res) => {
    try {
      console.log("Get Active Users Count Pending");
      const weeklyCountQuery = `SELECT * FROM users WHERE dailyActive = "true"`;
      const [weeklyActiveUsers] = await PostedVideos.query(weeklyCountQuery);

      const monthlyCountQuery = `SELECT * FROM users WHERE monthlyActive = "true"`;
      const [monthlyActiveUsers] = await PostedVideos.query(monthlyCountQuery);
      console.log("Get Active Users Count Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Active Users Count Successfully",
        // @ts-ignore
        {
          weeklyActiveUsers: weeklyActiveUsers[0]?.length
            ? String(weeklyActiveUsers[0]?.length)
            : "0",
          monthlyActiveUsers: monthlyActiveUsers[0]?.length
            ? String(monthlyActiveUsers[0]?.length)
            : "0",
        }
      );
    } catch (error) {
      console.log(error);
      console.log("Get Active Users Count Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch active users");
    }
  },

  getTotalNapaUsersCount: async (req, res) => {
    try {
      console.log("Get Total Napa Users Count Pending");
      const [allUsers] = await PostedVideos.getAllUsers();
      console.log("Get Total Napa Users Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Total Napa Users Successfully",
        {
          // @ts-ignore
          totalUsers: allUsers?.length ? String(allUsers?.length) : "0",
        }
      );
    } catch (error) {
      console.log(error);
      console.log("Get Total Napa Users Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch total napa users");
    }
  },

  getMostViewed: async (req, res) => {
    try {
      console.log("Get Most Viewed Posts Pending");
      const [posts] = await PostedVideos.getMostViewedPosts();

      const uniqueArray = removeDuplicates(posts, (a, b) => a?.postId === b?.postId);

      console.log("Get Most Viewed Posts Successfully");
      const likedPosts = [];
      const discussedPosts = [];
      const awardedPosts = [];
      // @ts-ignore
      uniqueArray.forEach((post) => {
        const likedByUsers = post.likedByUsers
          ? post.likedByUsers.split(",")
          : [];
        likedPosts.push({
          postId: post.postId,
          likes: likedByUsers.length,
          userName: post.profileName,
          avatar: post.avatar,
          mintId: post.mintId,
          thumbnail: post.thumbnail,
        });
      });

      const mostLikedPosts = [...likedPosts];
      mostLikedPosts.sort((a, b) => b.likes - a.likes);

      const filteredLikedPosts = mostLikedPosts.filter((p) => p.likes > 0);

      // @ts-ignore
      uniqueArray.forEach((post) => {
        const commentByUser = post.commentByUser
          ? post.commentByUser.split(",")
          : [];
        discussedPosts.push({
          postId: post.postId,
          comments: commentByUser.length,
          userName: post.profileName,
          avatar: post.avatar,
          mintId: post.mintId,
          thumbnail: post.thumbnail,
        });
      });

      const mostCommentedPosts = [...discussedPosts];
      mostCommentedPosts.sort((a, b) => b.comments - a.comments);

      const filteredDiscussedPostsPosts = mostCommentedPosts.filter(
        (p) => p.comments > 0
      );

      // @ts-ignore
      uniqueArray.forEach((post) => {
        const awardsByUsers = post.awardsByUsers
          ? post.awardsByUsers.split(",")
          : [];
        awardedPosts.push({
          postId: post.postId,
          awards: awardsByUsers.length,
          userName: post.profileName,
          avatar: post.avatar,
          mintId: post.mintId,
          thumbnail: post.thumbnail,
        });
      });

      const mostAwardedPosts = [...awardedPosts];
      mostAwardedPosts.sort((a, b) => b.awards - a.awards);

      const filteredAwardedPosts = mostAwardedPosts.filter((p) => p.awards > 0);

      return ApiResponse.successResponseWithData(
        res,
        "Get Most Viewed Posts Successfully",
        // @ts-ignore
        // posts
        posts.length
          ? {
              likedPosts: filteredLikedPosts.length
                ? filteredLikedPosts.length > 10
                  ? filteredLikedPosts.slice(0, 10)
                  : filteredLikedPosts
                : null,
              discussedPosts: filteredDiscussedPostsPosts.length
                ? filteredDiscussedPostsPosts.length > 10
                  ? filteredDiscussedPostsPosts.slice(0, 10)
                  : filteredDiscussedPostsPosts
                : null,
              awardedPosts: filteredAwardedPosts.length
                ? filteredAwardedPosts.length > 10
                  ? filteredAwardedPosts.slice(0, 10)
                  : filteredAwardedPosts
                : null,
            }
          : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Most Viewed Posts Rejected");
      return ApiResponse.ErrorResponse(
        res,
        "Unable to fetch most viewed posts"
      );
    }
  },

  updateViewsCount: async (req, res) => {
    try {
      console.log("Update views count api pending");
      const { postId } = req.query;

      const postQuery = `SELECT * FROM posted_videos WHERE postId = "${postId}"`;
      const [post] = await PostedVideos.query(postQuery);

      // @ts-ignore
      if (!post.length) {
        return ApiResponse.validationErrorWithData(res, "Post Not Found");
      }

      const [postData] = await PostedVideos.updateViewsCount(postId);
      console.log("Update views count api successfully");
      global.SocketService.handleGetViewsCount({
        post: postData[0],
      });
      return ApiResponse.successResponseWithData(
        res,
        "Update views count successfully",
        // @ts-ignore
        postData[0]
      );
    } catch (error) {
      console.log(error);
      console.log("Update views count api rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Update views count");
    }
  },

  getViews: async (req, res) => {
    try {
      console.log("Get views api pending");
      const { postId } = req.query;

      const postViews = `SELECT views FROM posted_videos WHERE postId = "${postId}"`;
      const [views] = await PostedVideos.query(postViews);

      const postQuery = `SELECT * FROM views WHERE postId = "${postId}"`;
      const [post] = await PostedVideos.query(postQuery);

      // @ts-ignore
      if (!post.length) {
        return ApiResponse.validationErrorWithData(res, "Post Not Found");
      }

      return ApiResponse.successResponseWithData(
        res,
        "Get views api successfully",
        // @ts-ignore
        {
          ...post[0],
          rolling_7_Days: views[0].views - post[0].prev_7_days_views,
        }
      );
    } catch (error) {
      console.log(error);
      console.log("Get views api rejected");
      return ApiResponse.ErrorResponse(res, "Unable to get views");
    }
  },

  getLambdaOutput: async (req, res) => {
    try {
      console.log("Update video thumbnail api pending");
      const data = {
        postId: req?.body?.Job?.UserMetadata?.Guid || "",
        videoThumbnail: req?.body?.Outputs?.THUMB_NAILS[0] || "",
      };
      const [postData] = await PostedVideos.updateVideoThumbnail(data);
      console.log("Update video thumbnail api successfully");
      global.SocketService.handleGetPosts({
        posts: postData[0],
      });
    } catch (error) {
      console.log(error);
      console.log("Update video thumbnail api rejected");
      return ApiResponse.ErrorResponse(res, "Unable to update video thumbnail");
    }
  },

  getLambdaError: async (req, res) => {
    try {
      console.log("Reject post api Pending");
      const { srcVideo } = req.body;
      const postId = srcVideo.split("/")[1].split(".")[0];
      const [postData] = await PostedVideos.getPost(postId);
      await PostedVideos.deletePost(postId);
      console.log("Reject post api Fullfilled");
      global.SocketService.handleRejectPost({
        profileId: postData[0]?.profileId,
      });
    } catch (error) {
      console.log(error);
      console.log("Reject post api Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Reject post");
    }
  },
};

export default PostedVideosController;
