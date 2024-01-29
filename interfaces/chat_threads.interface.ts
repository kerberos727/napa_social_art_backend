import { ChatThreadTypeEnum } from "types/types";

export interface ChatThreadsInterface {
  rowId: string;
  streamId: string;
  threadId: string;
  profileId: string;
  name: string;
  threadStatus: ChatThreadTypeEnum;
  createdAt?: Date;
  updatedAt?: Date;
}
