import { v4 as uuidv4 } from "uuid";
import { MintedPosts, PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB, socialArtDB } from "../index";
import Swapping from "../models/swapping.models";
import SwappingItem from "../models/swapping_items.models";

const SwappingController = {
    createSwapping: async (req, res) => {

        const { wallet } = req.body;
        try {
            const uuid = uuidv4();

            const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
            const [profile] = await PostedVideos.query(profileQuery);

            //@ts-ignore
            if (!profile.length) {
                return ApiResponse.validationErrorWithData(res, "Profile Not Found");
            }

            const offerQuery = `SELECT * FROM swap_offers WHERE offerId = "${req.body.offerId}"`;
            const [offer] = await socialArtDB.query(offerQuery);

            //@ts-ignore
            if (!offer.length) {
                return ApiResponse.validationErrorWithData(res, "Offer Not Found");
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

            const checkNapaWalletQuery = `SELECT * FROM napa_accounts WHERE (NWA_1_AC = "${wallet}" OR NWA_2_AC = "${wallet}" OR NWA_3_AC = "${wallet}" OR NWA_4_AC = "${wallet}" OR NWA_5_AC = "${wallet}" ) LIMIT 1`;
            const [existingWallet] = await napaDB.query(checkNapaWalletQuery);

            //@ts-ignore
            if (!existingWallet.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Invalid NapaWalletAccount"
                );
            }

            const newOffer = new Swapping(req.body);
            const [offerData] = await newOffer.create(uuid);

            const items = req.body.items || [];


            if (items.length > 0 && items.length <= 5) {
                for (const mintId of items) {
                    const [mint] = await MintedPosts.getMintedPost(mintId);

                    //@ts-ignore
                    if (!mint.length) {
                        return ApiResponse.validationErrorWithData(
                            res,
                            "Mint Post Data Not Found"
                        );
                    }

                    const offerItem = new SwappingItem({
                        swapId: offerData[0].swapId,
                        mintId: mintId,
                    });
                    await offerItem.create(uuid);
                }
            } else {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Maximum 5 items can be selected"
                );
            }

            return ApiResponse.successResponseWithData(
                res,
                "Swapping Created Successfully",
                offerData[0]
            );
        }

        catch (error) {
            console.log("Create Offer Api Rejected");
            console.error(error);
            return ApiResponse.ErrorResponse(res, error.message);
        }



    },


    updateSwapping: async (req, res) => {
        const { swapId, swap_status } = req.body;

        try {
            const swappingQuery = `SELECT * FROM swappingg WHERE swapId = "${req.body.swapId}"`;
            const [swapping] = await PostedVideos.query(swappingQuery);

            //@ts-ignore
            if (!swapping.length) {
                return ApiResponse.validationErrorWithData(res, "Swapping Not Found");
            }
            const [updateSwapping] = await Swapping.updateSwapping(swapId, swap_status);
            return ApiResponse.successResponseWithData(
                res,
                "Swap updated successfully",
                updateSwapping[0]

            );
        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while updating the swapping');
        }
    },

    getSwapping: async (req, res) => {

        try {
            const [offers] = await Swapping.getSwapping(req.query);
            // @ts-ignore
            if (!offers.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Swapping Not Found"
                );
            }
            return ApiResponse.successResponseWithData(
                res,
                "Get Swapping Successfully",
                // @ts-ignore
                offers.length ? offers : null
            );

        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while getting the swapping');
        }
    }
};
export default SwappingController;
