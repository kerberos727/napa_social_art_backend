import { v4 as uuidv4 } from "uuid";
import { PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB } from "../index";
import Collections from "../models/collections.models";

const CollectionsController = {
    createCollection: async (req, res) => {
        const { walletAccount } = req.body;
        try {
            const uuid = uuidv4();

            const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
            const [profile] = await PostedVideos.query(profileQuery);

            //@ts-ignore
            if (!profile.length) {
                return ApiResponse.validationErrorWithData(res, "Profile Not Found");
            }


            const checkNapaAccountsQuery = `SELECT * FROM napa_accounts WHERE profileId = "${req.body.profileId}"`;
            const [existingNapaAccount] = await napaDB.query(checkNapaAccountsQuery);

            //@ts-ignore
            if (!existingNapaAccount.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "A napa account does not exist for this profile"
                );
            }

            const checkNapaWalletQuery = `SELECT * FROM napa_accounts WHERE (NWA_1_AC = "${walletAccount}" OR NWA_2_AC = "${walletAccount}" OR NWA_3_AC = "${walletAccount}" OR NWA_4_AC = "${walletAccount}" OR NWA_5_AC = "${walletAccount}" ) LIMIT 1`;
            const [existingWallet] = await napaDB.query(checkNapaWalletQuery);

            //@ts-ignore
            if (!existingWallet.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Invalid NapaWalletAccount"
                );
            }

            const newCollections = new Collections(req.body);
            const [collectionData] = await newCollections.create(uuid);

            return ApiResponse.successResponseWithData(
                res,
                "Short Collection Created Successfully",
                collectionData[0]
            );
        }

        catch (error) {
            console.log("Create Collection Api Rejected");
            console.error(error);
            return ApiResponse.ErrorResponse(res, error.message);
        }
    },


    updateCollection: async (req, res) => {
        const {
            collectionId,
            collection_name,
            collection_description,
            collection_whitepaper,
            website,
            social_link_twitter,
            social_link_instagram,
            social_link_facebook,
            collection_type,
            collection_network,
            total_assets_included
        } = req.body;

        try {
            const collectionQuery = `SELECT * FROM collections WHERE collectionId = "${collectionId}"`;
            const [collection] = await PostedVideos.query(collectionQuery);

            //@ts-ignore
            if (!collection.length) {
                return ApiResponse.validationErrorWithData(res, "Collection Not Found");
            }

            await Collections.updateCollection(
                collectionId,
                collection_name,
                collection_description,
                collection_whitepaper,
                website,
                social_link_twitter,
                social_link_instagram,
                social_link_facebook,
                collection_type,
                collection_network,
                total_assets_included
            );

            return ApiResponse.successResponse(
                res,
                "Collection updated successfully"
            );
        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while updating the collection');
        }
    },



    getCollection: async (req, res) => {

        try {
            const [collection] = await Collections.getCollections(req.query);
            // @ts-ignore
            if (!collection.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Collection Not Found"
                );
            }
            return ApiResponse.successResponseWithData(
                res,
                "Get Collection Successfully",
                // @ts-ignore
                collection.length ? collection : null
            );

        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while getting the collection');
        }
    }
};
export default CollectionsController;
