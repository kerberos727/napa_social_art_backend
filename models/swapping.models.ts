import moment from "moment";
import { socialArtDB } from "../index";
import { SwappingInterface } from "../interfaces/swapping.interface";

class Swapping {
    swapping: SwappingInterface;
    constructor(swapping: SwappingInterface) {
        this.swapping = swapping;
    }

    async create(uuid) {
        try {

            const createTableQuery = `
  CREATE TABLE IF NOT EXISTS swappingg (
    profileId VARCHAR(45),
    wallet VARCHAR(255),
    swapId VARCHAR(45) PRIMARY KEY NOT NULL,
    offerId VARCHAR(45),
    swapMintId VARCHAR(45),
    swapNftId VARCHAR(45),
    traits TEXT,
    collection_name VARCHAR(255),
    swap_collection_name VARCHAR(255),
    swap_collection_id VARCHAR(45),
    swap_creation_date DATETIME,
    swap_status ENUM('1', '2', '3', '4', '5') DEFAULT '1',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profileId) REFERENCES users(profileId),
    FOREIGN KEY (offerId) REFERENCES swap_offers(offerId)
  )`;
            await socialArtDB.query(createTableQuery);

            const insertQuery = `
  INSERT INTO swappingg (
    profileId,
    wallet,
    swapId,
    offerId,
    swapMintId,
    swapNftId,
    traits,
    collection_name,
    swap_collection_name,
    swap_collection_id,
    swap_creation_date,
    createdAt,
    updatedAt
  ) VALUES (
    "${this.swapping.profileId || ""}",
    "${this.swapping.wallet || ""}",
    "${uuid}",
    "${this.swapping.offerId || ""}",
    "${this.swapping.swapMintId || ""}",
    "${this.swapping.swapNftId || ""}",
    "${this.swapping.traits || ""}",
    "${this.swapping.collection_name || ""}",
    "${this.swapping.swap_collection_name || ""}",
    "${uuid}",
    "${this.swapping.swap_creation_date || ""}",
    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
  )`;
            await socialArtDB.query(insertQuery);

            const sql = `SELECT swappingg.*, u.profileName, u.avatar FROM swappingg JOIN users u ON swappingg.profileId = u.profileId WHERE swapId = "${uuid}"`;

            return socialArtDB.query(sql);
        } catch (error) {
            console.log("error", error)
            throw new Error(error);
        }
    }

    static updateSwapping(swapId, swap_status) {
        try {
            const updateQuery = `UPDATE swappingg SET swap_status = '${swap_status}' WHERE swapId = '${swapId}'`;
            return socialArtDB.query(updateQuery);
        } catch (error) {
            console.log("error", error)
            throw new Error(error);
        }
    }



    static getSwapping(params) {
        let query = `SELECT * FROM swappingg`;

        if (params.swapId || params.profileId || params.swap_status || params.swap_creation_date_to || params.swap_creation_date_from) {
            query += ` WHERE`;

            if (params.swapId) {
                query += ` swapId = '${params.swapId}'`;
            }

            if (params.profileId) {
                if (params.swapId) {
                    query += ` OR`;
                }
                query += ` profileId = '${params.profileId}'`;
            }

            if (params.swap_status) {
                if (params.swapId || params.profileId) {
                    query += ` OR`;
                }
                query += ` swapStatus = '${params.swap_status}'`;
            }

            if (params.swap_creation_date_to) {
                if (params.swapId || params.profileId || params.swap_status) {
                    query += ` OR`;
                }
                query += ` createdAt <= '${params.swap_creation_date_to}'`;
            }

            if (params.swap_creation_date_from) {
                if (params.swapId || params.profileId || params.swap_status || params.swap_creation_date_to) {
                    query += ` OR`;
                }
                query += ` createdAt >= '${params.swap_creation_date_from}'`;
            }
        }

        query += ` ORDER BY createdAt`;
        console.log(params, query);
        return socialArtDB.query(query);


    } catch(error) {
        console.log("error", error)
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
export default Swapping;