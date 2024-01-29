import { socialArtDB } from "../index";
import moment from "moment";
import { RewardsTrackingInterface } from "../interfaces/rewards-tracking.interface";
import { v4 as uuidv4 } from "uuid";

class RewardsTracking {
  rewardsTracking: RewardsTrackingInterface;
  constructor(rewardsTracking: RewardsTrackingInterface) {
    this.rewardsTracking = rewardsTracking;
  }
  async create() {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS payouts_tracking (rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY, updateUUID VARCHAR(45) PRIMARY KEY NOT NULL, category_1 DECIMAL(9,8), category_2 DECIMAL(9,8), category_3 DECIMAL(9,8), category_4 DECIMAL(9,8), category_5 DECIMAL(9,8), tokenPrice DECIMAL(9,8),createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)";

      await socialArtDB.query(tableQuery);

      const DAUsql = `SELECT profileId FROM users WHERE dailyActive = "true"`;
      const [DAU] = await socialArtDB.query(DAUsql);

      // @ts-ignore
      let rewardsTierCap = DAU.legth * 0.0005;
      let category_1, category_2, category_3, category_4, category_5;

      const uuid = uuidv4();

      await Promise.all(
        Array.from({ length: 5 }).map(async (_, index) => {
          rewardsTierCap =
            index == 0 ? rewardsTierCap : rewardsTierCap * 0.2 + rewardsTierCap;
          if (index == 0) {
            category_1 = rewardsTierCap;
            return;
          } else if (index == 1) {
            category_2 = rewardsTierCap;
            return;
          } else if (index == 2) {
            category_3 = rewardsTierCap;
            return;
          } else if (index == 3) {
            category_4 = rewardsTierCap;
            return;
          } else if (index == 4) {
            category_5 = rewardsTierCap;
            return;
          }
        })
      );

      const insertQuery = `INSERT INTO payouts_tracking (updateUUID, category_1, category_2, category_3, category_4, category_5, tokenPrice, createdAt, updatedAt) VALUES (
        "${uuid}",
        "${(category_1 / 10).toFixed(8)}",
        "${(category_2 / 10).toFixed(8)}",
        "${(category_3 / 10).toFixed(8)}",
        "${(category_4 / 10).toFixed(8)}",
        "${(category_5 / 10).toFixed(8)}",
        "${this.rewardsTracking.tokenPrice || ""}",
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
        "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
        )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM payouts_tracking ORDER BY rowId`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default RewardsTracking;
