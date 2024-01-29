import { LiveStreamTypeEnum, WebHookTypeEnum } from "types/types";

export interface LiveStreamInterface {
  rowId: string;
  streamId: string;
  streamHostUid: string;
  profileId: string;
  streamTitle: string;
  streamToken: string;
  streamStatus: LiveStreamTypeEnum;
  walletAddress?: string;
  streamStartTime?: Date;
  streamEndTime?: Date;
  sellItems?: boolean;
  webhook?: boolean;
  webhookStatus: WebHookTypeEnum;
  streamUserCount: number;
  webhookTimeStamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
