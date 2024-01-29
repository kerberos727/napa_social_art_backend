export interface TransactionInterface {
  rowId: string;
  transactionUUID: string;
  sellerWallet: string;
  buyerWallet: string;
  type: string;
  itemId: string;
  amount: string;
  currencyType: string;
  status: string;
  txId: string;
  contractAddress: string;
  tokenId: number;
  wallet: string;
  createdAt: string;
  updatedAt: string;
}
