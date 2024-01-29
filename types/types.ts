enum LiveEnum {
  live = 1,
  expired = 2,
  canceled = 3,
  paused = 4,
  terminatedByNapa = 5,
}

enum PayOutApprovedEnum {
  currentlyLive = 0,
  approved = 1,
  pendingReview = 2,
  paid = 3,
  denied = 4,
}
enum StatusEnum {
  livePost = 0,
  sentForReview = 1,
  inProgress = 2,
  pendingFurtherReview = 3,
  Approved = 4,
  Declined = 5,
}

enum currencyTypeEnum {
  NAPA = 0,
  USDT = 1,
  ETH = 2,
}

enum listedTypeEnum {
  delisted = 0,
  listed = 1,
  sold = 2,
  pending = 3, // this means that the item is not available for salei while transaction is processing // 
}

enum OfferStatusEnum {
  Open = 1,
  Accepted = 2,
  Processed = 3,
  Cancelled = 4,
}

enum SwappingStatusEnum {
  Requested = 1,
  Accepted = 2,
  Processed = 3,
  Rejected = 4,
  Cancelled = 5,
}

enum CollectionTypeEnum {
  SNFT = 1,
  NFT = 2,
}

enum LiveStreamTypeEnum {
  Pending = 0,
  Started = 1,
  Ended = 2,
  Abandoned = 3,
}

enum TransactionTypeEnum {
  auction = 1,
  fixed = 2,
}

enum TransactionStatusTypeEnum {
  Open = 0,
  Sold = 1,
  Shipped = 3,
  OwnershipTransferred = 4,
}

enum WebHookTypeEnum {
  available = 1,
  failed = 2,
}

enum ChatThreadTypeEnum {
  active = 1,
  close = 2,
}

enum fanStatusEnum {
  following = '1',
  unfollow = '2',
  requested = '3',
  approved = '4',
  declined = '5'
}

export {
  LiveEnum,
  PayOutApprovedEnum,
  StatusEnum,
  currencyTypeEnum,
  listedTypeEnum,
  OfferStatusEnum,
  SwappingStatusEnum,
  CollectionTypeEnum,
  LiveStreamTypeEnum,
  WebHookTypeEnum,
  TransactionTypeEnum,
  TransactionStatusTypeEnum,
  ChatThreadTypeEnum,
  fanStatusEnum
};
