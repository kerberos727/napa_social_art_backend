import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { Comments, PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";

const CommentsController = {
  createComment: async (req, res) => {
    try {
      const uuid = uuidv4();

      console.log("Create Comment Api Pending");

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

      if (req.body.parentCommentId) {
        const parentCommentQuery = `SELECT * FROM comments WHERE commentId = "${req.body.parentCommentId}"`;
        const [parentComment] = await PostedVideos.query(parentCommentQuery);

        // @ts-ignore
        if (!parentComment.length) {
          return ApiResponse.validationErrorWithData(
            res,
            "Parent Comment Not Found"
          );
        }
      }

      const newComment = new Comments(req.body);
      const [commentData] = await newComment.create(uuid);

      const postDataQuery = `SELECT * FROM posted_videos WHERE postId = "${req.body.postId}"`;

      const [commentByUsers] = await PostedVideos.query(postDataQuery);

      const existComments = commentByUsers[0].commentByUser;

      const updatedComments = existComments ? existComments.split(",") : [];

      updatedComments.push(req.body.profileId);

      const updatePostQuery = `UPDATE posted_videos SET commentByUser = "${String(
        updatedComments
      )}", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE postId = "${req.body.postId}"`;

      await PostedVideos.query(updatePostQuery);

      global.SocketService.handleGetComments({
        comments: commentData[0],
      });
      global.SocketService.handlePostCommentsLength({
        postId: req.body.postId,
        comments: String(updatedComments),
      });

      return ApiResponse.successResponseWithData(
        res,
        "Comment Created Successfully",
        commentData[0]
      );
    } catch (error) {
      console.log("Create Comment Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getCommentsByPostId: async (req, res) => {
    try {
      console.log("Get Comments Pending");
      const getPostCommentQuery = `SELECT c.*, u.profileName, u.avatar
      FROM comments c
      JOIN users u ON c.profileId = u.profileId
      WHERE c.postId = "${req.params.postId}" ORDER BY c.createdAt DESC`;
      // const getPostCommentQuery = `SELECT c.*, u.profileName, u.avatar, r.commentText as replyText,
      // r.createdAt as replyCreateAt, u2.profileName as replyProfileName, u2.avatar as replyAvatar,
      // r.parentCommentId as replyParentId
      // FROM comments c
      // JOIN users u ON c.profileId = u.profileId
      // LEFT JOIN comments r ON c.commentId = r.parentCommentId
      // JOIN users u2 ON r.profileId = u2.profileId
      // WHERE c.postId = "${req.params.postId}"`.
      const [result] = await Comments.query(getPostCommentQuery);
      // @ts-ignore
      if (!result.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Comments Data Not Found"
        );
      }
      // @ts-ignore
      const comments = result.filter((comment) => !comment?.parentCommentId);
      const newComments = comments.map((item) => {
        return {
          ...item,
          // @ts-ignore
          replies: result.filter(
            (reply) => reply.parentCommentId === item.commentId
          ),
        };
      });
      console.log("Get Comments Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Comments Successfully",
        // @ts-ignore
        newComments.length ? newComments : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Comments Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch comments");
    }
  },

  getCommentsCountByPosId: async (req, res) => {
    try {
      console.log("Get Comments Count Pending");

      const countQuery = `SELECT COUNT(*) FROM comments WHERE comments.postId = "${req.params.postId}"`;

      const [result] = await Comments.query(countQuery);

      console.log("Get Comments Count Fullfilled");

      // @ts-ignore
      if (!result.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Comments Count Not Found"
        );
      }

      return ApiResponse.successResponseWithData(
        res,
        "Get Comments Count Successfully",
        // @ts-ignore
        result.length ? result[0]["COUNT(*)"] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Comments Count Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch comments");
    }
  },

  likeComment: async (req, res) => {
    try {
      console.log("Like Comment Api Pending");
      const newLike = new Comments(req.body);
      await newLike.likeComment(req.params.postId);

      const getPostCommentQuery = `SELECT c.*, u.profileName, u.avatar
      FROM comments c
      JOIN users u ON c.profileId = u.profileId
      WHERE c.postId = "${req.params.postId}" ORDER BY c.createdAt DESC`;
      const [result] = await Comments.query(getPostCommentQuery);
      // @ts-ignore
      const comments = result.filter((comment) => !comment?.parentCommentId);
      const newComments = comments.map((item) => {
        return {
          ...item,
          // @ts-ignore
          replies: result.filter(
            (reply) => reply.parentCommentId === item.commentId
          ),
        };
      });

      global.SocketService.handleLikeComments({
        comments: newComments,
      });
      return ApiResponse.successResponseWithData(
        res,
        "Like Comment Api Successfully",
        newComments
      );
    } catch (error) {
      console.log(error);
      console.log("Like Comment Api Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch comments");
    }
  },

  deleteComment: async (req, res) => {
    try {
      console.log("Delete Comment Api Pending");

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

      const getCommentQuery = `SELECT * FROM comments WHERE commentId = "${req.body.commentId}"`;
      const [isCommnetExit] = await PostedVideos.query(getCommentQuery);

      // @ts-ignore
      if (!isCommnetExit.length) {
        return ApiResponse.validationErrorWithData(res, "Comment Not Found");
      }

      const commentQuery = `SELECT c.*, u.profileName, u.avatar
      FROM comments c
      JOIN users u ON c.profileId = u.profileId
      WHERE c.postId = "${req.body.postId}" AND c.profileId = "${req.body.profileId}" AND c.commentId = "${req.body.commentId}"`;
      const [comment] = await PostedVideos.query(commentQuery);

      // @ts-ignore
      if (!comment.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "You can not delete someone else comments"
        );
      }
      
      const deleteCommentQuery = `DELETE FROM comments WHERE commentId = "${req.body.commentId}"`;
      await PostedVideos.query(deleteCommentQuery);

      global.SocketService.handleDeletePostComment({
        postId: req.body.postId,
        commentId: req.body.commentId,
      });

      return ApiResponse.successResponseWithData(
        res,
        "Comment Deleted Successfully",
        comment[0]
      );
    } catch (error) {
      console.log("Deleted Comment Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default CommentsController;
