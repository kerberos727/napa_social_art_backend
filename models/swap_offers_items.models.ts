import moment from "moment";
import { socialArtDB } from "../index";
import { SwapOfferItemsInterface } from "interfaces/swap_offers_items.interface";

class OffersItem {
    offer: SwapOfferItemsInterface;

    constructor(offer: SwapOfferItemsInterface) {
        this.offer = offer;
    }

    async create(uuid: string) {
        try {
            const createTableQuery = `CREATE TABLE IF NOT EXISTS swap_offer_minted_post (
        offerId VARCHAR(45),
        mintId VARCHAR(45),
        PRIMARY KEY (offerId, mintId),
        FOREIGN KEY (offerId) REFERENCES swap_offers(offerId),
        FOREIGN KEY (mintId) REFERENCES minted_posts(mintId)
      )`;
            await socialArtDB.query(createTableQuery);

            const insertQuery = `INSERT INTO swap_offer_minted_post (
        offerId,
        mintId
      ) VALUES (
        "${this.offer.offerId || ""}",
        "${this.offer.mintId || ""}"
      )`;
            await socialArtDB.query(insertQuery);
        } catch (error) {
            console.log("error", error);
            throw new Error(error);
        }
    }

}


export default OffersItem;
