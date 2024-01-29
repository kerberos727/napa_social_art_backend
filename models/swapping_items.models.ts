import { SwappingItemsInterface } from "../interfaces/swapping_items.interface";
import { socialArtDB } from "../index";

class SwappingItem {
    swapping: SwappingItemsInterface;

    constructor(swapping: SwappingItemsInterface) {
        this.swapping = swapping;
    }

    async create(uuid: string) {
        try {
            const createTableQuery = `CREATE TABLE IF NOT EXISTS swapping_item (
        swapId VARCHAR(45),
        mintId VARCHAR(45),
        PRIMARY KEY (swapId, mintId),
        FOREIGN KEY (swapId) REFERENCES swappingg(swapId),
        FOREIGN KEY (mintId) REFERENCES minted_posts(mintId)
      )`;
            await socialArtDB.query(createTableQuery);

            const insertQuery = `INSERT INTO swapping_item (
        swapId,
        mintId
      ) VALUES (
        "${this.swapping.swapId || ""}",
        "${this.swapping.mintId || ""}"
      )`;
            await socialArtDB.query(insertQuery);
        } catch (error) {
            console.log("error", error);
            throw new Error(error);
        }
    }

}


export default SwappingItem;
