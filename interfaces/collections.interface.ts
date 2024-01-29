import { CollectionTypeEnum } from "../types/types";

export interface CollectionsInterface {
    rowId: string;
    profileId: string;
    collectionId: string;
    walletAccount: string;
    collection_name: string;
    collection_description: string;
    collection_whitepaper: string;
    website: string;
    social_link_twitter: string;
    social_link_instagram: string;
    social_link_facebook: string;
    collection_type: CollectionTypeEnum;
    collection_network: string;
    total_assets_included: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  