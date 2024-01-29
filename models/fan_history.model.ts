import { socialArtDB } from "../index";
import moment from "moment";
import { FanInterface } from "interfaces/fan.interface";

class FanHistory {
  fan: FanInterface;
  constructor(fan: FanInterface) {
    this.fan = fan;
  }
  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS fan_table_history (rowId INT AUTO_INCREMENT NOT NULL UNIQUE KEY, requestId VARCHAR(45) PRIMARY KEY NOT NULL, requesterId VARCHAR(45) NOT NULL, targetId VARCHAR(45) NOT NULL, status ENUM('1', '2', '3', '4', '5') DEFAULT '1', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO fan_table_history (requestId, requesterId, targetId, status, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.fan.requesterId || ""}",
          "${this.fan.targetId || ""}",
          "${this.fan.status || "1"}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM fan_table_history WHERE requestId = "${uuid}"`;

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
}

export default FanHistory;
