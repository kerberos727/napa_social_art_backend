import { socialArtDB } from "../index";
import { SnftInterface } from "../interfaces/nft.interface";
import moment from "moment";
import pinataSDK from '@pinata/sdk';
import axios from 'axios';
import streamifier from 'streamifier';
import { sendNotification } from "../utils/send-notification";

class MarketPlace {
  snft: SnftInterface;
  constructor(snft: SnftInterface) {
    this.snft = snft;
  }
  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS marketplace (snftId VARCHAR(45) PRIMARY KEY NOT NULL, currencyType ENUM('0', '1', '2') NOT NULL DEFAULT '1', type VARCHAR(45), amount VARCHAR(45), duration VARCHAR(45), onSale VARCHAR(45), maxOffer VARCHAR(45), creatorFees VARCHAR(45), specificBuyer VARCHAR(100), eligibleForCoBatching VARCHAR(45), offerSpread VARCHAR(45), mintId VARCHAR(45), profileId VARCHAR(45), postId VARCHAR(45), lazyMinted TEXT NOT NULL, listed ENUM('0', '1', '2') NOT NULL DEFAULT '1', createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId), FOREIGN KEY (mintId) REFERENCES minted_posts (mintId), FOREIGN KEY (postId) REFERENCES posted_videos (postId))";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO marketplace (snftId, currencyType, type, amount, duration, onSale, maxOffer, creatorFees, specificBuyer, eligibleForCoBatching, offerSpread, mintId, profileId, postId, lazyMinted, listed, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.snft.currencyType || 1}",
          "${this.snft.type || ""}",
          "${this.snft.amount || ""}",
          "${this.snft.duration || ""}",
          "false",
          "${this.snft.maxOffer || ""}",
          "${this.snft.creatorFees || "0"}",
          "${this.snft.specificBuyer || ""}",
          "${this.snft.eligibleForCoBatching || "false"}",
          "${this.snft.offerSpread || "0"}",
          "${this.snft.mintId || ""}",
          "${this.snft.profileId || ""}",
          "${this.snft.postId || ""}",
          "${this.snft.lazyMinted || "false"}",
          "${this.snft.listed || 1}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.thumbnail, posted_videos.videoURL, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE marketplace.snftId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static getAllSnfts(limit) {
    try {
      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.SNFTTitle, minted_posts.thumbnail, posted_videos.videoURL, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE marketplace.listed = "1" ORDER BY marketplace.createdAt DESC LIMIT 0, ${limit}`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static getMySnfts(address) {
    try {
      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.SNFTTitle, minted_posts.thumbnail, posted_videos.videoURL, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE minted_posts.owner = "${address}" AND marketplace.listed = "1" ORDER BY marketplace.createdAt DESC`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static getSnft(id) {
    try {
      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.owner, minted_posts.SNFTTitle, minted_posts.SNFTCollection, minted_posts.SNFTAddress, minted_posts.marketplace_listed, minted_posts.thumbnail, minted_posts.tokenUri, minted_posts.tokenId, minted_posts.generatorId, minted_posts.napaTokenEarned, posted_videos.videoURL, posted_videos.genre, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE marketplace.snftId = "${id}" OR marketplace.mintId = "${id}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static async pinToIPFS(data) {
    let base64Data, bufferData, imageResponse
    try {
      const pinata = new pinataSDK({
        pinataApiKey: "60b6f40d19ff82e8547a",
        pinataSecretApiKey:
          "bf8632acaad65c73cce04654ed9db02138961f6c80655b4996fa753941751522",
      });

      if(data.thumbnail.includes(";base64,"))
      {
        base64Data = data.thumbnail;
        bufferData = streamifier.createReadStream(
          Buffer.from(base64Data.split(";base64,").pop(), "base64")
        );
      }
      else {
        imageResponse = await axios.get(data.thumbnail, {
          responseType: "stream",
        });
      }

      //@ts-ignore
      const options = {
        pinataMetadata: {
          name: "TestPin",
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const options2 = {
        pinataMetadata: {
          name: "TestPin",
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

     const imageResult = await pinata
        //@ts-ignore
        .pinFileToIPFS(data.thumbnail.includes(";base64,") ? bufferData : imageResponse.data, options)
        console.log(imageResult, "Image response");
        const url = data.videoURL;
        const videoResponse = await axios.get(url, {
          responseType: "stream",
        });

       const videoResult = await pinata
          //@ts-ignore
          .pinFileToIPFS(videoResponse.data, options2)
          console.log(videoResult, "Video Result");
          const body = {
            id: data.id,
            name: data.userName,
            avatar: data.avatar,
            image: `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`,
            video_url: `https://gateway.pinata.cloud/ipfs/${videoResult.IpfsHash}`,
            description: data.description,
            title: data.title,
            createdAt: Date.now()
          };
          //@ts-ignore
          const options3 = {
            pinataMetadata: {
              name: data.title,
            },
            pinataOptions: {
              cidVersion: 0,
            },
          };
         const jsonPinResult = await pinata
            //@ts-ignore
            .pinJSONToIPFS(body, options3)

            console.log("JSON Pin", imageResult, videoResult);
            return {
              IpfsHashURL: `https://gateway.pinata.cloud/ipfs/${jsonPinResult.IpfsHash}`,
            };
    } catch (error) {
      throw new Error(error);
    }
  }
  static async deleteSnft(id) {
    try {
      const deleteQuery = `DELETE FROM marketplace WHERE snftId = "${id}"`;
      await socialArtDB.query(deleteQuery);

      const updateQuery = `UPDATE minted_posts SET marketplace_listed = "false", snftId = "" WHERE snftId = "${id}"`;
      await socialArtDB.query(updateQuery);

      const getDeviceToken = `SELECT u.deviceToken, p.SNFTTitle FROM users u JOIN minted_posts p ON u.profileId = p.profileId WHERE p.snftId = "${id}"`
      const [deviceToken] = await socialArtDB.query(getDeviceToken)
      sendNotification(deviceToken[0]?.deviceToken, "Markeplplace item expired", `Your marketplace item ${deviceToken[0]?.SNFTTitle} has expired`)
      
    } catch (error) {
      throw new Error(error);
    }
  }
  static async updateSnft(data) {
    try {
      const updateQuery = `UPDATE marketplace SET lazyMinted = "false", listed = "1", currencyType = "${
        data.currencyType
      }", type = "${data.type}", amount="${data.amount}", duration = "${
        data.duration
      }", maxOffer = "${
        data.maxOffer
      }", creatorFees = "${data.creatorFees || "0"}", specificBuyer = "${data.specificBuyer || ""}", eligibleForCoBatching = "${data.eligibleForCoBatching || "false"}", offerSpread = "${data.offerSpread || "0"}", updatedAt = "${moment(new Date()).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      )}" WHERE mintId = "${data.mintId}"`;
      await socialArtDB.query(updateQuery);
      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.thumbnail, posted_videos.videoURL, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE marketplace.mintId = "${data.mintId}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static async buySnft(id) {
    try {
      const updateQuery = `UPDATE marketplace SET lazyMinted = "true", listed = "2", updatedAt = "${moment(
        new Date()
      ).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE snftId = "${id}"`;
      await socialArtDB.query(updateQuery);
      const sql = `SELECT * FROM marketplace where snftId = "${id}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static async updateSaleStatus(id: string, status: string) {
    try {
      const updateQuery = `UPDATE marketplace SET listed = "${status}" WHERE snftId = "${id}"`;
      await socialArtDB.query(updateQuery);
      const sql = `SELECT marketplace.*, users.profileName as userName, users.avatar as userImage, minted_posts.SNFTDescription, minted_posts.thumbnail, posted_videos.videoURL, posted_videos.mobileVideoURL, posted_videos.videoThumbnail FROM marketplace JOIN users ON marketplace.profileId = users.profileId JOIN minted_posts ON marketplace.mintId = minted_posts.mintId JOIN posted_videos ON marketplace.postId = posted_videos.postId WHERE marketplace.snftId = "${id}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default MarketPlace;
