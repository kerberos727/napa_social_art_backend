import { SwappingStatusEnum } from "types/types";

export interface SwappingInterface {
    profileId: string;
    wallet: string;
    swapId: string; 
    snftId: string; 
    offerId?: string;
    swapMintId?: string; 
    swapNftId?: string; 
    traits: string; 
    collection_name: string; 
    items?: string; 
    swap_collection_name: string; 
    swap_collection_id: string; 
    swap_creation_date?: Date;
    swap_status:SwappingStatusEnum; 
    createdAt?: Date;
    updatedAt?: Date;
  }
  