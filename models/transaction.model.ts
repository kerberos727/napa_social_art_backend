import { socialArtDB } from "../index";
import moment from "moment";
import { TransactionInterface } from "../interfaces/transaction.interface";

class Transaction {
  transaction: TransactionInterface;
  constructor(transaction: TransactionInterface) {
    this.transaction = transaction;
  }
  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS marketplace_transactions (rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY, transactionUUID VARCHAR(45) PRIMARY KEY NOT NULL, sellerWallet VARCHAR(45), buyerWallet VARCHAR(45), type VARCHAR(45), itemId VARCHAR(45), amount VARCHAR(45), currencyType VARCHAR(45), status VARCHAR(45), txId VARCHAR(45), contractAddress VARCHAR(45), tokenId INTEGER, wallet VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO marketplace_transactions (transactionUUID, sellerWallet, buyerWallet, type, itemId, amount, currencyType, status, txId, contractAddress, tokenId, wallet, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.transaction.sellerWallet || ""}",
          "${this.transaction.buyerWallet || ""}",
          "${this.transaction.type || ""}",
          "${this.transaction.itemId || ""}",
          "${this.transaction.amount || ""}",
          "${this.transaction.currencyType || ""}",
          "${this.transaction.status || ""}",
          "${this.transaction.txId || ""}",
          "${this.transaction.contractAddress || ""}",
          "${this.transaction.tokenId || ""}",
          "${this.transaction.wallet || ""}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM marketplace_transactions WHERE transactionUUID = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Transaction;
