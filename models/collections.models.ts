import moment from "moment";
import { socialArtDB } from "../index";
import { CollectionsInterface } from "../interfaces/collections.interface";

class Collections {
    collection: CollectionsInterface;
    constructor(collection: CollectionsInterface) {
        this.collection = collection;
    }

    async create(uuid) {
        try {

            const createTableQuery = `CREATE TABLE IF NOT EXISTS collections (
                rowId INT AUTO_INCREMENT UNIQUE KEY,
                profileId VARCHAR(255),
                collectionId VARCHAR(255) PRIMARY KEY NOT NULL,
                walletAccount VARCHAR(255),
                collection_name VARCHAR(255),
                collection_description TEXT,
                collection_whitepaper VARCHAR(255),
                website VARCHAR(255),
                social_link_twitter VARCHAR(255),
                social_link_instagram VARCHAR(255),
                social_link_facebook VARCHAR(255),
                collection_type ENUM('NFT', 'SNFT'),
                collection_network VARCHAR(255),
                total_assets_included INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              )`;

            await socialArtDB.query(createTableQuery);

            const insertQuery = `INSERT INTO collections (
                profileId,
                collectionId,
                walletAccount,
                collection_name,
                collection_description,
                collection_whitepaper,
                website,
                social_link_twitter,
                social_link_instagram,
                social_link_facebook,
                collection_type,
                collection_network,
                total_assets_included,
                createdAt,
                updatedAt
            ) VALUES (
                "${this.collection.profileId || ""}",
                "${uuid}",
                "${this.collection.walletAccount || ""}",
                "${this.collection.collection_name || ""}",
                "${this.collection.collection_description || ""}",
                "${this.collection.collection_whitepaper || ""}",
                "${this.collection.website || ""}",
                "${this.collection.social_link_twitter || ""}",
                "${this.collection.social_link_instagram || ""}",
                "${this.collection.social_link_facebook || ""}",
                "${this.collection.collection_type || ""}",
                "${this.collection.collection_network || ""}",
                "${this.collection.total_assets_included || ""}",
                "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
            )`;

            await socialArtDB.query(insertQuery);

            const sql = `SELECT collections.*, u.profileName, u.avatar FROM collections JOIN users u ON collections.profileId = u.profileId WHERE collectionId = "${uuid}"`;

            return socialArtDB.query(sql);
        } catch (error) {
            console.log("error", error)
            throw new Error(error);
        }
    }



    static updateCollection(collectionId, collection_name, collection_description, collection_whitepaper, website, social_link_twitter, social_link_instagram, social_link_facebook, collection_type, collection_network, total_assets_included) {
        try {
            const updateQuery = `UPDATE collections SET
            ${collection_name ? `collection_name = "${collection_name}",` : 'collection_name = collection_name,'}
            ${collection_description ? `collection_description = "${collection_description}",` : 'collection_description = collection_description,'}
            ${collection_whitepaper ? `collection_whitepaper = "${collection_whitepaper}",` : 'collection_whitepaper = collection_whitepaper,'}
            ${website ? `website = "${website}",` : 'website = website,'}
            ${social_link_twitter ? `social_link_twitter = "${social_link_twitter}",` : 'social_link_twitter = social_link_twitter,'}
            ${social_link_instagram ? `social_link_instagram = "${social_link_instagram}",` : 'social_link_instagram = social_link_instagram,'}
            ${social_link_facebook ? `social_link_facebook = "${social_link_facebook}",` : 'social_link_facebook = social_link_facebook,'}
            ${collection_type ? `collection_type = "${collection_type}",` : 'collection_type = collection_type,'}
            ${collection_network ? `collection_network = "${collection_network}",` : 'collection_network = collection_network,'}
            ${typeof total_assets_included !== 'undefined' ? `total_assets_included = ${total_assets_included},` : 'total_assets_included = total_assets_included,'}
            updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
            WHERE collectionId = "${collectionId}"`;

            return socialArtDB.query(updateQuery);


        } catch (error) {
            console.log("error", error);
            throw new Error(error);
        }
    }


    static getCollections(params) {
        let query = `SELECT * FROM collections`;

        if (params.collectionId || params.WalletAccount) {
            query += ` WHERE`;

            if (params.collectionId) {
                query += ` collectionId = '${params.collectionId}'`;
            }

            if (params.WalletAccount) {
                if (params.collectionId) {
                    query += ` OR`;
                }
                query += ` WalletAccount = '${params.WalletAccount}'`;
            }
        }

        query += ` ORDER BY createdAt`;
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

export default Collections;









