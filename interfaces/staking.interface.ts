export interface StakingInterface {
  transactionUUID: string;
  profileId: string;
  accountNumber: string;
  stakingPeriod: string;
  lockDuration: string;
  amountStaked: string;
  lockStartDate: string;
  lockEndDate: string;
  apy: string;
  dailyApy: string;
  maturityDate: string;
  amountAccruedTD: string;
  amountAccruedDaily: string;
  redeemed: string;
  lockedTxID: string;
  createdAt: string;
  updatedAt: string;
}
