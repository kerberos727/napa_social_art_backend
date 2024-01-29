const validationRules = {
  videoValidationRules: {
    videoType: "required|string",
    // videoTitle: "required|string",
    // videoCaption: "required|string",
    accountId: "required|string",
    profileId: "required|string",
  },
  likePostRule: {
    profileId: "required|string",
    postId: "required|string",
  },
  awardPostRule: {
    profileId: "required|string",
    postId: "required|string",
  },
  mintPostRule: {
    postId: "required|string",
    generatorId: "required|string",
    profileId: "required|string",
    // SNFTTitle: "required|string",
    // SNFTCollection: "required|string",
    // SNFTDescription: "required|string",
    // thumbnail: "required|string",
  },
  updateMintPostRule: {
    postId: "required|string",
    profileId: "required|string",
    marketplace_listed: "required|string",
  },
  newCommentRule: {
    commentText: "required|string",
    postId: "required|string",
    profileId: "required|string",
  },
  liveSreamItemRule: {
    profileId: "required|string",
    streamId: "required|string",
    streamTitle: "required|string",
    walletAddress: "required|string",
    itemName: "required|string",
    itemDescription: "required|string",
    transactionType: "required",
    tokenized: "required|boolean",
    price: "required|numeric",
  },
  liveSreamItemEditRule: {
    itemUuid: "required|string",
    profileId: "required|string",
    streamId: "required|string",
    streamTitle: "required|string",
    itemName: "required|string",
    itemDescription: "required|string",
    transactionType: "required",
    tokenized: "required|boolean",
    price: "required|numeric",
  },
  liveSreamItemPurchaseRule: {
    itemUuid: "required|string",
    buyerProfileId: "required|string",
    buyerWallet: "required|string",
  },
  fanValidationRules: {
    requesterId: "required|string",
    targetId: "required|string",
  },
};

export default validationRules;
