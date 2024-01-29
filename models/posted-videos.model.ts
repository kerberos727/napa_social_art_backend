import moment from "moment";
import { socialArtDB } from "../index";
import { PostedVideoInterface } from "../interfaces/posted-videos.interface";

class PostedVideos {
  postedVideos: PostedVideoInterface;
  constructor(postedVideos: PostedVideoInterface) {
    this.postedVideos = postedVideos;
  }

  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS posted_videos (postId VARCHAR(45) PRIMARY KEY NOT NULL, videoURL LONGTEXT, mobileVideoURL LONGTEXT, videoThumbnail LONGTEXT, videoType VARCHAR(45), videoTitle VARCHAR(50), videoCaption VARCHAR(256), accountId VARCHAR(45), postedBy VARCHAR(45), profileId VARCHAR(45), minted VARCHAR(45), likedByUsers TEXT, awardsByUsers TEXT, commentByUser TEXT, mintedTimeStamp TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, isExpired VARCHAR(45) NOT NULL, genre VARCHAR(255), views INT DEFAULT 0, FOREIGN KEY (profileId) REFERENCES users (profileId))";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO posted_videos (postId, videoURL, mobileVideoURL, videoThumbnail, videoType, videoTitle, videoCaption, accountId, postedBy, profileId, minted, likedByUsers, awardsByUsers, commentByUser, mintedTimeStamp, createdAt, updatedAt, isExpired, genre, views) VALUES (
      "${uuid}",
      "${this.postedVideos.videoURL || ""}",
      "${this.postedVideos.mobileVideoURL || ""}",
      "${this.postedVideos.videoThumbnail || ""}",
      "${this.postedVideos.videoType || ""}",
      "${this.postedVideos.videoTitle || ""}",
      "${this.postedVideos.videoCaption || ""}",
      "${this.postedVideos.accountId || ""}",
      "${this.postedVideos.postedBy || ""}",
      "${this.postedVideos.profileId || ""}",
      "${this.postedVideos.minted || "false"}",
      "${this.postedVideos.likedByUsers || ""}",
      "${this.postedVideos.awardsByUsers || ""}",
      "${this.postedVideos.commentByUsers || ""}",
      "${this.postedVideos.mintedTimeStamp || ""}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
      "${this.postedVideos.isExpired || "false"}",
      "${this.postedVideos.genre || ""}",
      "${this.postedVideos.views || 0}"
      )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE postId = "${uuid}"`;

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

  static getAllPosts(offset, targetIds, profileId) {
    // const date = moment(new Date())
    //   .add(1, "day")
    //   .format("YYYY-MM-DDTHH:mm:ssZ");
    // const prevDate = moment(new Date())
    //   .subtract(1, "days")
    //   .format("YYYY-MM-DDTHH:mm:ssZ");
    try {
      let sql;
      if (targetIds) {
        sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE (posted_videos.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AND (posted_videos.profileId IN (${targetIds}) || posted_videos.profileId = "${profileId}") ORDER BY posted_videos.createdAt DESC LIMIT ${offset}, 10`;
      } else {
        sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE posted_videos.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ORDER BY posted_videos.createdAt DESC LIMIT ${offset}, 10`;
      }

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getMyPosts(offset, profileId) {
    try {
      const sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE posted_videos.profileId = "${profileId}" AND posted_videos.videoURL <> '' ORDER BY posted_videos.createdAt DESC LIMIT ${offset}, 10`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getPostDetails(postId) {
    try {
      const sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE posted_videos.postId = "${postId}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getMonthlyPosts() {
    try {
      const sql = `SELECT postId, profileId, createdAt FROM posted_videos WHERE createdAt >=CURDATE() - INTERVAL 1 MONTH AND minted = 'true'`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getWeeklyPosts() {
    try {
      const sql = `SELECT postId, profileId, createdAt FROM posted_videos WHERE createdAt >=CURDATE() - INTERVAL 1 WEEK AND minted = 'true'`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getAllUsers() {
    try {
      const sql = `SELECT profileId FROM users ORDER BY createdAt DESC`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getMostViewedPosts() {
    const date = moment(new Date())
      .add(1, "day")
      .format("YYYY-MM-DDTHH:mm:ssZ");
    const prevDate = moment(new Date())
      .subtract(3, "days")
      .format("YYYY-MM-DDTHH:mm:ssZ");
    try {
      const sql = `SELECT posted_videos.postId, posted_videos.videoThumbnail as thumbnail, posted_videos.likedByUsers, posted_videos.awardsByUsers, posted_videos.commentByUser, users.profileName, users.avatar, minted_posts.mintId FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId JOIN minted_posts ON posted_videos.postId = minted_posts.postId WHERE minted_posts.createdAt BETWEEN "${prevDate}" AND "${date}" ORDER BY minted_posts.createdAt DESC`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updateVideoThumbnail(data: any) {
    try {
      const query = `UPDATE posted_videos SET videoThumbnail = "${data?.videoThumbnail}" WHERE postId = "${data?.postId}"`;
      await socialArtDB.query(query);
      const sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE postId = "${data?.postId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updateViewsCount(postId: string) {
    try {
      const getViews = `SELECT views FROM posted_videos WHERE postId = "${postId}"`;
      const [views] = await socialArtDB.query(getViews);
      const updatedViewsCount = views[0]?.views + 1;
      const query = `UPDATE posted_videos SET views = "${updatedViewsCount}", updatedAt = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${postId}"`;
      await socialArtDB.query(query);

      const getAllTimeViews = `UPDATE views SET prev_allTime_views = "${updatedViewsCount}" WHERE postId = "${postId}"`;
      await socialArtDB.query(getAllTimeViews);

      const sql = `SELECT posted_videos.*, users.profileName, users.avatar FROM posted_videos JOIN users ON posted_videos.profileId = users.profileId WHERE postId = "${postId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async deletePost(postId) {
    try {
      const deleteQuery = `DELETE FROM posted_videos WHERE postId = "${postId}"`;
      return socialArtDB.query(deleteQuery);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getPost(postId) {
    try {
      const sql = `SELECT profileId FROM posted_videos WHERE postId = "${postId}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getAllPostsViews() {
    try {
      const sql = `SELECT views, postId FROM posted_videos ORDER BY createdAt DESC`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default PostedVideos;
