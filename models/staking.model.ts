import { socialArtDB } from "../index";
import moment from "moment";
import { StakingInterface } from "interfaces/staking.interface";

class Staking {
  staking: StakingInterface;
  constructor(staking: StakingInterface) {
    this.staking = staking;
  }
  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS staking_transactions (transactionUUID VARCHAR(45) PRIMARY KEY NOT NULL, profileId VARCHAR(45), accountNumber VARCHAR(45), stakingPeriod VARCHAR(45), lockDuration VARCHAR(45), amountStaked VARCHAR(45), lockStartDate VARCHAR(45), lockEndDate VARCHAR(45), apy VARCHAR(45), dailyApy VARCHAR(45), maturityDate VARCHAR(45), amountAccruedTD VARCHAR(45), amountAccruedDaily VARCHAR(45), redeemed VARCHAR(45), lockedTxID VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId))";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO staking_transactions (transactionUUID, profileId, accountNumber, stakingPeriod, lockDuration, amountStaked, lockStartDate, lockEndDate, apy, dailyApy, maturityDate, amountAccruedTD, amountAccruedDaily, redeemed, lockedTxID, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.staking.profileId || ""}",
          "${this.staking.accountNumber || ""}",
          "${this.staking.stakingPeriod || ""}",
          "${this.staking.lockDuration || ""}",
          "${this.staking.amountStaked || ""}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date())
            .add(Number(this.staking.lockDuration), "days")
            .format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${this.staking.apy || ""}",
          "${this.staking.dailyApy || ""}",
          "${this.staking.maturityDate || ""}",
          "${this.staking.amountAccruedTD || ""}",
          "${this.staking.amountAccruedDaily || ""}",
          "${this.staking.redeemed || "false"}",
          "${this.staking.lockedTxID || ""}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM staking_transactions WHERE transactionUUID = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  async get() {
    try {
      const sql = `SELECT * FROM staking_transactions ORDER BY createdAt DESC`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Staking;
