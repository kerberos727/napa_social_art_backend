import moment from "moment";
import { socialArtDB } from "../index";
import { SwapOfferInterface } from "../interfaces/swap_offers.interface";

class SwapOffers {
    offer: SwapOfferInterface;
    constructor(offer: SwapOfferInterface) {
        this.offer = offer;
    }

    async create(uuid) {
        try {

            const createTableQuery = `CREATE TABLE IF NOT EXISTS swap_offers (
                profileId VARCHAR(45),
                wallet VARCHAR(255),
                offerId VARCHAR(45) PRIMARY KEY NOT NULL,
                swap_expiration DATETIME,
                price_range_min DECIMAL(10,2),
                price_range_max DECIMAL(10,2),
                traits TEXT,
                collection_name VARCHAR(255),
                offer_collection_name VARCHAR(255),
                offer_collection_id CHAR(36),
                offer_status ENUM('1','2','3','4') DEFAULT '1',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (profileId) REFERENCES users(profileId)
              )`;

            await socialArtDB.query(createTableQuery);

            const insertQuery = `INSERT INTO swap_offers (
                profileId,
                wallet,
                offerId,
                swap_expiration,
                price_range_min,
                price_range_max,
                traits,
                collection_name,
                offer_collection_name,
                offer_collection_id,
                createdAt,
                updatedAt
              ) VALUES (
      
      "${this.offer.profileId || ""}",
      "${this.offer.wallet || ""}",
      "${uuid}",
      "${this.offer.swap_expiration || ""}",
      "${this.offer.price_range_min || ""}",
      "${this.offer.price_range_max || ""}",
      "${this.offer.traits || ""}",
      "${this.offer.collection_name || ""}",
      "${this.offer.offer_collection_name || ""}",
      "${uuid}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
      "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
      )`;

            await socialArtDB.query(insertQuery);

            const sql = `SELECT swap_offers.*, u.profileName, u.avatar FROM swap_offers JOIN users u ON swap_offers.profileId = u.profileId WHERE offerId = "${uuid}"`;

            return socialArtDB.query(sql);
        } catch (error) {
            console.log("error", error)
            throw new Error(error);
        }
    }


    static updateOffers(offerId, offer_status) {
        try {
            const updateQuery = `UPDATE swap_offers SET offer_status = '${offer_status}' WHERE offerId = '${offerId}'`;
            return socialArtDB.query(updateQuery);
        } catch (error) {
            console.log("error", error)
            throw new Error(error);
        }
    }



    static getSwapOffers(params) {
        let query = `SELECT * FROM swap_offers`;

        if (params.offerId || params.profileId || params.offer_status || params.offer_creation_date_to || params.offer_creation_date_from) {
            query += ` WHERE`;

            if (params.offerId) {
                query += ` offerId = '${params.offerId}'`;
            }

            if (params.profileId) {
                if (params.offerId) {
                    query += ` OR`;
                }
                query += ` profileId = '${params.profileId}'`;
            }

            if (params.offer_status) {
                if (params.offerId || params.profileId) {
                    query += ` OR`;
                }
                query += ` offer_status = '${params.offer_status}'`;
            }

            if (params.offer_creation_date_to) {
                if (params.offerId || params.profileId || params.offer_status) {
                    query += ` OR`;
                }
                query += ` createdAt <= '${params.offer_creation_date_to}'`;
            }

            if (params.offer_creation_date_from) {
                if (params.offerId || params.profileId || params.offer_status || params.offer_creation_date_to) {
                    query += ` OR`;
                }
                query += ` createdAt >= '${params.offer_creation_date_from}'`;
            }
        }

        query += ` ORDER BY createdAt`;
        return socialArtDB.query(query);

    } catch(error) {
        console.log("error", error)
        throw new Error(error);
    }



    static getAllOffers() {
        try {
            const sql = `SELECT * FROM swap_offers`;
            return socialArtDB.query(sql);
        } catch (error) {
            console.log("error", error)
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

export default SwapOffers;









