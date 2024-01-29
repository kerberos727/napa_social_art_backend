import { v4 as uuidv4 } from "uuid";
import { MintedPosts, PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB, socialArtDB } from "../index";
import OffersItem from "../models/swap_offers_items.models";
import SwapOffers from "../models/swap_offers.models";

const OffersController = {
    createOffer: async (req, res) => {
        const { wallet } = req.body;
        try {
            const uuid = uuidv4();

            const profileQuery = `SELECT * FROM users WHERE profileId = "${req.body.profileId}"`;
            const [profile] = await PostedVideos.query(profileQuery);

            //@ts-ignore
            if (!profile.length) {
                return ApiResponse.validationErrorWithData(res, "Profile Not Found");
            }

            // const snftQuery = `SELECT * FROM marketplace`;
            // const [snft] = await socialArtDB.query(snftQuery);

            // //@ts-ignore
            // if (!snft.length) {
            //     return ApiResponse.validationErrorWithData(res, "SNFT Not Found");
            // }

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

            const newOffer = new SwapOffers(req.body);
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

                    const offerItem = new OffersItem({
                        offerId: offerData[0].offerId,
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
                "Offer Created Successfully",
                offerData[0]
            );
        }

        catch (error) {
            console.log("Create Offer Api Rejected");
            console.error(error);
            return ApiResponse.ErrorResponse(res, error.message);
        }
    },


    updateOffer: async (req, res) => {
        const { offerId, offer_status } = req.body;

        try {
            const offerQuery = `SELECT * FROM swap_offers WHERE offerId = "${req.body.offerId}"`;
            const [offer] = await PostedVideos.query(offerQuery);

            //@ts-ignore
            if (!offer.length) {
                return ApiResponse.validationErrorWithData(res, "Offer Not Found");
            }
            const [updateOffer] = await SwapOffers.updateOffers(offerId, offer_status);
            return ApiResponse.successResponseWithData(
                res,
                "Offer updated successfully",
                updateOffer[0]

            );
        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while updating the offer');
        }
    },

    getOffers: async (req, res) => {

        try {
            const [offers] = await SwapOffers.getSwapOffers(req.query);
            // @ts-ignore
            if (!offers.length) {
                return ApiResponse.validationErrorWithData(
                    res,
                    "Offers Not Found"
                );
            }
            return ApiResponse.successResponseWithData(
                res,
                "Get Offers Successfully",
                // @ts-ignore
                offers.length ? offers : null
            );

        } catch (error) {
            console.log('Error:', error);
            return ApiResponse.validationErrorWithData(res, 'An error occurred while getting the offer');
        }
    }
};
export default OffersController;
