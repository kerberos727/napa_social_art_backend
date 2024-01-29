import { socialArtDB } from "../index";
import moment from "moment";
import { OffersInterface } from "../interfaces/offers.interface";

class Offers {
  offer: OffersInterface;
  constructor(offer: OffersInterface) {
    this.offer = offer;
  }
  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS offers (offerId VARCHAR(45) PRIMARY KEY NOT NULL, snftId VARCHAR(45), profileId VARCHAR(45), amount VARCHAR(45), expiresIn VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId), FOREIGN KEY (snftId) REFERENCES marketplace (snftId))";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO offers (offerId, snftId, profileId, amount, expiresIn, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.offer.snftId || ""}",
          "${this.offer.profileId || ""}",
          "${this.offer.amount || ""}",
          "${this.offer.expiresIn || ""}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT o.*, u.profileName as userName FROM offers o JOIN users u ON o.profileId = u.profileId WHERE o.offerId = "${uuid}" AND o.profileId = "${this.offer.profileId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
  static getOffers(id) {
    try {
      const sql = `SELECT o.*, u.profileName as userName FROM offers o JOIN users u ON o.profileId = u.profileId WHERE o.snftId = "${id}" ORDER BY o.createdAt DESC`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Offers;
