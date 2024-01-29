import moment from "moment";
import { socialArtDB } from "../index";
import { LiveStreamItemsInterface } from "../interfaces/live_stream_items.interface";

class LiveStreamItems {
  liveStreamItems: LiveStreamItemsInterface;
  constructor(liveStreamItems: LiveStreamItemsInterface) {
    this.liveStreamItems = liveStreamItems;
  }

  async create(uuid) {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS live_stream_items (
                    itemID INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY,
                    itemUuid VARCHAR(45) PRIMARY KEY NOT NULL,
                    streamId VARCHAR(45),
                    profileId VARCHAR(45),
                    walletAddress VARCHAR(255) NOT NULL,
                    itemName VARCHAR(255) DEFAULT NULL,
                    itemDescription VARCHAR(255) DEFAULT NULL,
                    itemImage VARCHAR(255) DEFAULT NULL,
                    streamTitle VARCHAR(255) DEFAULT NULL,
                    itemAddress VARCHAR(255) DEFAULT NULL,
                    tokenized BOOLEAN,
                    transactionType ENUM('1', '2') DEFAULT NULL,
                    price VARCHAR(45),
                    transactionStatus ENUM('0','1','3','4') DEFAULT '0',
                    buyerProfileId VARCHAR(45),
                    buyerWallet VARCHAR(255) DEFAULT NULL,
                    transactionDate DATETIME,
                    txId VARCHAR(255) DEFAULT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (streamId) REFERENCES livestreams(streamId),
                    FOREIGN KEY (profileId) REFERENCES users(profileId)
                )`;
      await socialArtDB.query(createTableQuery);
      const insertQuery = `
                INSERT INTO live_stream_items (
                    itemID,
                    itemUuid,
                    streamId,
                    profileId,
                    itemName,
                    itemDescription,
                    itemImage,
                    streamTitle,
                    walletAddress,
                    itemAddress,
                    tokenized,
                    transactionType,
                    price,
                    transactionStatus,
                    buyerProfileId,
                    buyerWallet,
                    transactionDate,
                    txId,
                    createdAt,
                    updatedAt
                ) VALUES (
                    "${this.liveStreamItems.itemID || ""}",
                    "${uuid}",
                    "${this.liveStreamItems.streamId || ""}",
                    "${this.liveStreamItems.profileId || ""}",
                    "${this.liveStreamItems.itemName || ""}",
                    "${this.liveStreamItems.itemDescription || ""}",
                    "${this.liveStreamItems.itemImage || ""}",
                    "${this.liveStreamItems.streamTitle || ""}",
                    "${this.liveStreamItems.walletAddress || ""}",
                    "${this.liveStreamItems.itemAddress || ""}",
                    "${this.liveStreamItems.tokenized || false}",
                    "${this.liveStreamItems.transactionType || ""}",
                    "${this.liveStreamItems.price || ""}",
                    "${this.liveStreamItems.transactionStatus || 0}",
                    "${this.liveStreamItems.buyerProfileId || ""}",
                    "${this.liveStreamItems.buyerWallet || ""}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${this.liveStreamItems.txId || ""}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
                )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT live_stream_items.*, u.profileName, u.avatar FROM live_stream_items JOIN users u ON live_stream_items.profileId = u.profileId WHERE itemUuid = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static updateLiveStreamItems(
    itemUuid,
    itemName,
    itemDescription,
    itemImage,
    walletAddress,
    itemAddress,
    transactionType,
    price,
    tokenized,
  ) {
    try {
      let updateQuery = `UPDATE live_stream_items SET `;

      if (itemName) {
        updateQuery += `itemName = '${itemName}'`;
      }

      if (itemDescription) {
        updateQuery += `, itemDescription = '${itemDescription}'`;
      }

      if (itemImage) {
        updateQuery += `, itemImage = '${itemImage}'`;
      }

      if (walletAddress) {
        updateQuery += `, walletAddress = '${walletAddress}'`;
      }

      if (itemAddress) {
        updateQuery += `, itemAddress = '${itemAddress}'`;
      }

      if (transactionType) {
        updateQuery += `, transactionType = '${transactionType}'`;
      }

      if (price) {
        updateQuery += `, price = '${price}'`;
      }

      if (tokenized == 1) {
        updateQuery += `, tokenized = '${tokenized}'`;
      }
      else if(tokenized == 0){
        updateQuery += `, tokenized = '${tokenized}'`;
      }

      updateQuery += ` WHERE itemUuid = '${itemUuid}'`;
      return socialArtDB.query(updateQuery);
    } catch (error) {
      throw new Error(error);
    }
  }


  static purchaseLiveStreamItems(
    itemUuid,
    buyerProfileId,
    buyerWallet,
  ) {
    try {
      let updateQuery = `UPDATE live_stream_items SET `;

      if (buyerProfileId) {
        updateQuery += `buyerProfileId = '${buyerProfileId}'`;
      }

      if (buyerWallet) {
        updateQuery += `, buyerWallet = '${buyerWallet}'`;
      }

      // update transaction date and change transaction status
      updateQuery += `, transactionDate = '${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}', transactionStatus = '1' WHERE itemUuid = '${itemUuid}'`;
      return socialArtDB.query(updateQuery);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getLiveStreamItem(params) {
    let query = `SELECT live_stream_items.*, u.profileName, u.avatar FROM live_stream_items JOIN users u ON live_stream_items.profileId = u.profileId`;

    if (
      params.streamId ||
      params.itemUuid
      ) {
      query += ` Where live_stream_items.transactionStatus = '0' AND (`;

      if (params.streamId) {
        query += ` live_stream_items.streamId = '${params.streamId}'`;
      }

      if (params.itemUuid) {
        if (params.streamId) {
          query += ` OR`;
        }
        query += ` live_stream_items.itemUuid = '${params.itemUuid}'`;
      }


      query += ` ) ORDER BY live_stream_items.createdAt DESC`;
      return socialArtDB.query(query);
    }
    else 
    {
      query += ` ORDER BY live_stream_items.createdAt DESC`;
      return socialArtDB.query(query);
    }

  }
  catch(error) {
    throw new Error(error);
  }

  static async deleteLiveStreamItem(itemUuid) {
    try {
      const deleteQuery = `DELETE FROM live_stream_items WHERE itemUuid = "${itemUuid}"`;
      await socialArtDB.query(deleteQuery);

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
export default LiveStreamItems;
