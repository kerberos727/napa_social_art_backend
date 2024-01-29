import { currencyTypeEnum, listedTypeEnum } from "types/types";

export interface SnftInterface {
  type: string;
  currencyType?: currencyTypeEnum;
  amount?: string;
  duration?: string;
  maxOffer?: string;
  mintId?: string;
  profileId: string;
  postId: string;
  lazyMinted: listedTypeEnum;
  listed: string;
  createdAt?: string;
  updatedAt?: string;
  creatorFees?: string;
  specificBuyer: string;
  eligibleForCoBatching: string;
  offerSpread: string;
  onSale: string;
}
