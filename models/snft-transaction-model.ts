import moment from "moment";
import { socialArtDB } from "../index";
import { v4 as uuidv4 } from "uuid";

class SnftTransaction {
  static async create(data) {
    try {
      const uuid = uuidv4();
      const SnftTableQuery =
        "CREATE TABLE IF NOT EXISTS snft_transactions (rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY, snftTxId VARCHAR(45) PRIMARY KEY NOT NULL, postId VARCHAR(45), profileId VARCHAR(45), mintId VARCHAR(45), awards INTEGER, payoutsCategory VARCHAR(45), liveStart TEXT NOT NULL, liveEnd TEXT NOT NULL, closingDate TEXT, finalPrice VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId), FOREIGN KEY (postId) REFERENCES posted_videos (postId), FOREIGN KEY (mintId) REFERENCES minted_posts (mintId))";

      await socialArtDB.query(SnftTableQuery);

      const insertQuery = `INSERT INTO snft_transactions (snftTxId, postId, profileId, mintId, awards, payoutsCategory, liveStart, liveEnd, closingDate, finalPrice, createdAt, updatedAt) VALUES (
        "${uuid}",
        "${data.postId || ""}",
        "${data.profileId || ""}",
        "${data.mintId || ""}",
        "${0}",
        "${"0"}",
        "${data.mintedTime || ""}",
        "${moment(data.timeMinted).add(1, "hours").format() || ""}",
        "${""}",
        "${""}",
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
        )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM snft_transactions WHERE snftTxId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async update(awards, postId) {
    try {
      const DAUsql = `SELECT profileId FROM users WHERE dailyActive = "true"`;
      const [DAU] = await socialArtDB.query(DAUsql);

      let payoutsCategory = "0";
      //@ts-ignore
      let rewardsTierCap = DAU.length * 0.0005;
      let category_1, category_2, category_3, category_4, category_5;

      Array.from({ length: 5 }).map(async (_, index) => {
        rewardsTierCap =
          index == 0 ? rewardsTierCap : rewardsTierCap * 0.2 + rewardsTierCap;
        if (index == 0) {
          category_1 = (rewardsTierCap / 10).toFixed(8);
          return;
        } else if (index == 1) {
          category_2 = (rewardsTierCap / 10).toFixed(8);
          return;
        } else if (index == 2) {
          category_3 = (rewardsTierCap / 10).toFixed(8);
          return;
        } else if (index == 3) {
          category_4 = (rewardsTierCap / 10).toFixed(8);
          return;
        } else if (index == 4) {
          category_5 = (rewardsTierCap / 10).toFixed(8);
          return;
        }
      });

      if (awards >= category_1 && awards < category_2) {
        payoutsCategory = "1";
      }
      if (awards >= category_2 && awards < category_3) {
        payoutsCategory = "2";
      }
      if (awards >= category_3 && awards < category_4) {
        payoutsCategory = "3";
      }
      if (awards >= category_4 && awards < category_5) {
        payoutsCategory = "4";
      }
      if (awards >= category_5) {
        payoutsCategory = "5";
      }

      const updateQuery = `UPDATE snft_transactions SET awards = "${awards}", payoutsCategory = "${payoutsCategory}", updatedAt = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${postId}"`;

      await socialArtDB.query(updateQuery);

      global.SocketService.handlePayoutCategoryUpdate({
        event: "payout-category-update",
        // @ts-ignore
        post: { postId: postId, payoutsCategory },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  static async redeem(postId) {
    try {
      const updateQuery = `UPDATE snft_transactions SET closingDate = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${postId}"`;

      await socialArtDB.query(updateQuery);

      const sql = `SELECT * FROM snft_transactions WHERE postId = "${postId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default SnftTransaction;
