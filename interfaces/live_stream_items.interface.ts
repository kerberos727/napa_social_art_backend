import { TransactionTypeEnum, TransactionStatusTypeEnum } from "types/types";

export interface LiveStreamItemsInterface {
  itemID: string;
  streamId: string;
  profileId: string;
  itemName: string;
  itemDescription: string;
  itemImage: string;
  streamTitle?: Date;
  walletAddress: string;
  itemAddress?: string;
  tokenized: boolean;
  transactionType: TransactionTypeEnum;
  price: string;
  transactionStatus: TransactionStatusTypeEnum;
  buyerProfileId: string;
  buyerWallet: string;
  transactionDate: Date;
  txId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
