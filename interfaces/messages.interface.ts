
export interface MessagesInterface {
  rowId: string;
  messageId: string;
  streamId: string;
  threadId: string;
  profileId: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}
