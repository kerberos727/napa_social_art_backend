import { LiveEnum, PayOutApprovedEnum, StatusEnum } from "types/types";

export interface MintedPostsInterface {
  id?: string;
  postId?: string;
  mintId?: string;
  videoType?: string;
  generatorId?: string;
  profileId?: string;
  network?: string;
  status?: StatusEnum;
  SNFTTitle?: string;
  SNFTCollection?: string;
  SNFTDescription?: string;
  location?: string;
  taggedPeople?: string[];
  genre?: string;
  tags?: string;
  live?: LiveEnum;
  payoutApproved?: PayOutApprovedEnum;
  SNFTAddress?: string;
  networkTxId?: string;
  owner?: string;
  thumbnail: string;
  timeMinted: string;
  createdAt?: string;
  updatedAt?: string;
  marketplace_listed?: string;
  napaTokenEarned?: string;
  tokenUri: string;
  tokenId: string;
}
