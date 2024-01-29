import { fanStatusEnum } from "../types/types";

export interface FanInterface {
    rowId?: string;
    requestId?: string;
    requesterId?: string;
    targetId?: string;
    status?: fanStatusEnum;
    createdAt?: string;
    updatedAt: string;
  }
  