import { CommentInterface } from "interfaces/comments.interface";
import moment from "moment";
import { socialArtDB } from "../index";

class Comments {
  comment: CommentInterface;
  constructor(comment: CommentInterface) {
    this.comment = comment;
  }

  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS comments (commentId VARCHAR(45) PRIMARY KEY NOT NULL, commentText VARCHAR(500) NOT NULL, postId VARCHAR(45) NOT NULL, profileId VARCHAR(45) NOT NULL, likedByUsers TEXT, parentCommentId VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId), FOREIGN KEY (postId) REFERENCES posted_videos (postId))";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO comments (commentId, commentText, postId, profileId, likedByUsers, parentCommentId, createdAt, updatedAt) VALUES (
      "${uuid}",
      "${this.comment.commentText || ""}",
      "${this.comment.postId || ""}",
      "${this.comment.profileId || ""}",
      "${this.comment.likedByUsers || ""}",
      "${this.comment.parentCommentId || ""}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
      )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT comments.*, u.profileName, u.avatar FROM comments JOIN users u ON comments.profileId = u.profileId WHERE commentId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getCommentsByPostId(postId: string) {
    try {
      const sql = `SELECT * FROM comments WHERE postId = "${postId}" ORDER BY createdAt`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static query(query: string) {
    try {
      return socialArtDB.query(query);
    } catch (error) {
      throw new Error(error);
    }
  }

  async likeComment(postId: string) {
    try {
      const updateSql = `UPDATE comments SET likedByUsers = "${
        this.comment.likedByUsers || ""
      }", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE postId = "${postId}" AND commentId = "${
        this.comment.commentId || ""
      }"`;

      await socialArtDB.query(updateSql);

      const sql = `SELECT c.*, u.profileName, u.avatar FROM comments c JOIN users u ON c.profileId = u.profileId
      WHERE c.postId = "${postId}" AND c.commentId = "${
        this.comment.commentId || ""
      }"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Comments;
