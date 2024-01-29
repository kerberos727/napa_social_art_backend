import { OfferStatusEnum } from "../types/types";

export interface SwapOfferInterface {
    profileId: string;
    wallet: string;
    offerId: string;
    swap_expiration: string;
    snftId:  string;
    price_range_min?: number;
    price_range_max?: number;
    traits: string;
    collection_name: string;
    items: string;
    offer_collection_name: string;
    offer_collection_id: string;
    offer_status: OfferStatusEnum;
    createdAt?: string;
    updatedAt?: string;
  }