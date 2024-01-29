import moment from "moment";
import { socialArtDB } from "../index";
import { LiveStreamInterface } from "../interfaces/live_stream.interface";

class LiveStream {
  liveStream: LiveStreamInterface;
  constructor(liveStream: LiveStreamInterface) {
    this.liveStream = liveStream;
  }

  async create(uuid) {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS livestreams (
                    rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY,
                    streamId VARCHAR(45) PRIMARY KEY NOT NULL,
                    streamHostUid VARCHAR(45) DEFAULT NULL, 
                    profileId VARCHAR(45),
                    streamTitle VARCHAR(255),
                    streamToken VARCHAR(255),
                    streamStatus ENUM('0', '1', '2', '3') DEFAULT '0',
                    walletAddress VARCHAR(255),
                    streamStartTime DATETIME,
                    streamEndTime DATETIME,
                    sellItems BOOLEAN,
                    webhook BOOLEAN,
                    webhookStatus ENUM('1', '2') DEFAULT '1',
                    streamUserCount INT DEFAULT 0,
                    webhookTimeStamp DATETIME,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (profileId) REFERENCES users(profileId)
                )`;
      await socialArtDB.query(createTableQuery);
      const insertQuery = `
                INSERT INTO livestreams (
                    rowId,
                    streamId,
                    streamHostUid,
                    profileId,
                    streamTitle,
                    streamToken,
                    streamStatus,
                    walletAddress,
                    streamStartTime,
                    streamEndTime,
                    sellItems,
                    webhook,
                    webhookStatus,
                    streamUserCount,
                    webhookTimeStamp,
                    createdAt,
                    updatedAt
                ) VALUES (
                    "${this.liveStream.rowId || ""}",
                    "${uuid}",
                    "${this.liveStream.streamHostUid || ""}",
                    "${this.liveStream.profileId || ""}",
                    "${this.liveStream.streamTitle || ""}",
                    "${this.liveStream.streamToken || ""}",
                    "${this.liveStream.streamStatus || 0}",
                    "${this.liveStream.walletAddress || ""}",
                    "${this.liveStream.streamStartTime || ""}",
                    "${this.liveStream.streamEndTime || ""}",
                    "${this.liveStream.sellItems || false}",
                    "${this.liveStream.webhook || false}",
                    "${this.liveStream.webhookStatus || 1}",
                    "${this.liveStream.streamUserCount || 0}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
                )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT livestreams.*, u.profileName, u.avatar FROM livestreams JOIN users u ON livestreams.profileId = u.profileId WHERE streamId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static updateLiveStream(
    streamId,
    streamStatus,
    streamHostUid = "",
  ) {
    try {
      
      if ((streamStatus || streamHostUid) && streamId) {
        let updateQuery = `UPDATE livestreams SET streamStatus = '${streamStatus}'`;

        if (streamStatus == 1) {
          updateQuery += `, streamUserCount = 1`;
        }

        if (streamHostUid) {
          updateQuery += `, streamHostUid = '${streamHostUid}'`;
        }

        updateQuery += ` WHERE streamId = '${streamId}'`;

        return socialArtDB.query(updateQuery);
      }
      return null;
    } catch (error) {
      throw new Error(error);
    }
  }

  static increaseUserCount(
    streamId,
  ) {
    try {
      let updateQuery = `UPDATE livestreams SET streamUserCount = streamUserCount+1`;

      updateQuery += ` WHERE streamId = '${streamId}'`;

      return socialArtDB.query(updateQuery);
    } catch (error) {
      throw new Error(error);
    }
  }


  static decreaseUserCount(
    streamId,
  ) {
    try {
      let updateQuery = `UPDATE livestreams SET streamUserCount = streamUserCount-1`;

      updateQuery += ` WHERE streamId = '${streamId}'`;

      return socialArtDB.query(updateQuery);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async checkStreamCount(params) {
    const query = `  SELECT streamUserCount FROM livestreams WHERE livestreams.streamId = '${params.streamId}'`;
    const rawData = await socialArtDB.query(query);
    const {streamUserCount = 0} = rawData[0][0]; 
    return streamUserCount;
  }

  static getLiveStream(params) {
    let query = `SELECT *, u.profileName, u.avatar FROM livestreams JOIN users u ON livestreams.profileId = u.profileId`;

    if (
      params.streamId ||
      params.profileId ||
      params.streamStatus ||
      params.stream_creation_date_to ||
      params.stream_creation_date_from
    ) {
      query += ` Where `;

      if (params.streamId) {
        query += ` livestreams.streamId = '${params.streamId}'`;
      }

      if (params.profileId) {
        if (params.swapId) {
          query += ` OR`;
        }
        query += ` livestreams.profileId = '${params.profileId}'`;
      }

      if (params.stream_creation_date_to) {
        if (params.streamId || params.profileId || params.streamStatus) {
          query += ` OR`;
        }
        query += ` livestreams.createdAt <= '${params.stream_creation_date_to}'`;
      }

      if (params.stream_creation_date_from) {
        if (
          params.streamId ||
          params.profileId ||
          params.streamStatus ||
          params.stream_creation_date_to
        ) {
          query += ` OR`;
        }
        query += ` livestreams.createdAt >= '${params.stream_creation_date_from}'`;
      }
    } else {
      query += ` WHERE date(livestreams.createdAt) = CURDATE() AND livestreams.streamStatus = "1" `;
    }

    query += ` ORDER BY livestreams.createdAt DESC`;
    return socialArtDB.query(query);
  }
  catch(error) {
    throw new Error(error);
  }

  static query(query: string) {
    try {
      return socialArtDB.query(query);
    } catch (error) {
      throw new Error(error);
    }
  }
}
export default LiveStream;
