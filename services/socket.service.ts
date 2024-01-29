class SocketService {
  wss;
  successMessage;
  failMessage;
  constructor(wss) {
    this.wss = wss;
    this.failMessage =
      "Auth failed Please connect with socket API with following url ws://domain/connect&auth=token";
    this.successMessage =
      "You have been connected successfully to the socket API use the following format to communicate:  {type:string,data:{}}";
  }

  init() {
    this.wss.on("connection", (socket) => {
      console.log("connected successfully");

      socket.on("error", function (event) {
        console.log("WebSocket error: ", event);
      });
      socket.on("close", (event) => {
        console.log("The connection has been closed successfully.", event);
      });
      socket.on("message", function (event) {
        console.log("Message from server ", event.data);
      });
      socket.on("open", (event) => {
        console.log("open from server ", event.data);
      });
    });
    setInterval(() => {
      this.wss.clients.forEach((socket) => {
        socket.ping((err) => {
          console.log(err);
        });
      });
    }, 50000);
  }

  stringify(data) {
    return JSON.stringify(data);
  }

  handleGetPosts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Posts send with websocket");
      socket.send(
        this.stringify({
          event: "posts",
          posts: payload.posts,
        })
      );
    });
  }

  handleRejectPost(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Posts send with websocket");
      socket.send(
        this.stringify({
          event: `post-rejected-${payload.profileId}`,
          profileId: payload.profileId,
        })
      );
    });
  }

  handleGetUsersCount(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Users Count send with websocket");
      socket.send(
        this.stringify({
          event: "users-count",
          count: payload.count,
        })
      );
    });
  }

  handlePostLikesLength(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Posts send with websocket");
      socket.send(
        this.stringify({
          event: `post-likes-count`,
          likes: payload.likes,
          postId: payload.postId,
        })
      );
    });
  }

  handleAwardsLength(payload) {
    this.wss.clients.forEach((socket) => {
      socket.send(
        this.stringify({
          event: `post-award-count`,
          awards: payload.awards,
          postId: payload.postId,
        })
      );
    });
  }

  handlePostCommentsLength(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Posts send with websocket");
      socket.send(
        this.stringify({
          event: `post-comments-count`,
          comments: payload.comments,
          postId: payload.postId,
        })
      );
    });
  }

  handleDeletePostComment(payload) {
    this.wss.clients.forEach((socket) => {
      socket.send(
        this.stringify({
          event: `delete-post-comment-${payload.postId}`,
          comment: payload,
        })
      );
    });
  }

  handleGetMintedPosts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Minted posts send with websocket");
      socket.send(
        this.stringify({
          event: `mints-${payload.posts.generatorId}`,
          posts: payload.posts,
        })
      );
    });
  }

  handleGetUpdatedPost(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Minted posts send with websocket");
      socket.send(
        this.stringify({
          event: "updated-post",
          post: payload.post,
          postId: payload.postId,
        })
      );
    });
  }

  handleGetComments(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Comments send with websocket");
      socket.send(
        this.stringify({
          event: "comments",
          comments: payload.comments,
        })
      );
    });
  }

  handleLikeComments(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Comment Like send with websocket");
      socket.send(
        this.stringify({
          event: "likeComment",
          comments: payload.comments,
        })
      );
    });
  }

  handleMintPostStatusUpdate(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Update mint post status send with websocket");
      socket.send(
        this.stringify({
          event: "mint-post-status-update",
          mint: payload.mint,
          mintId: payload.mintId,
        })
      );
    });
  }

  handleGetNapaTokenPrice(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Napa token price send with websocket");
      socket.send(
        this.stringify({
          event: "napa-token-price",
          price: payload.price,
        })
      );
    });
  }

  handleGetMostLikedPosts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Most Liked Posts send with websocket");
      socket.send(
        this.stringify({
          event: "most-liked-posts",
          posts: payload.posts,
        })
      );
    });
  }

  handleGetMostAwardedPosts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Most Awarded Posts send with websocket");
      socket.send(
        this.stringify({
          event: "most-awarded-posts",
          posts: payload.posts,
        })
      );
    });
  }

  handleGetViewsCount(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Views count send with websocket");
      socket.send(
        this.stringify({
          event: "post-views-count",
          post: payload.post,
        })
      );
    });
  }

  handleGetMostDiscussedPosts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Most Discussed Posts send with websocket");
      socket.send(
        this.stringify({
          event: "most-discussed-posts",
          posts: payload.posts,
        })
      );
    });
  }

  handleGetRecentSnfts(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Recent SNFTs send with websocket");
      socket.send(
        this.stringify({
          event: "recent-snfts",
          snft: payload.snft,
        })
      );
    });
  }

  handleGetNewOffer(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("New offer send with websocket");
      socket.send(
        this.stringify({
          event: "new-offer",
          offer: payload.offer,
        })
      );
    });
  }

  handlePayoutCategoryUpdate(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Payout category send with websocket");
      socket.send(
        this.stringify({
          event: "payout-category-update",
          post: payload.post,
        })
      );
    });
  }

  handleRedeemToken(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Redeem token send with websocket");
      socket.send(
        this.stringify({
          event: "redeem-token",
          post: payload.post,
        })
      );
    });
  }

  handleNewStakingTransaction(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("New staking transaction send with websocket");
      socket.send(
        this.stringify({
          event: "new-staking-transaction",
          transaction: payload.transaction,
        })
      );
    });
  }

  handleLiveStreamUpdate(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream status with websocket");
      socket.send(
        this.stringify({
          event: `stream-update`,
          data: payload.data,
          streamId: payload.streamId,
        })
      );
    });
  }

  handleLiveStreamAdd(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream added with websocket");
      socket.send(
        this.stringify({
          event: `stream-added`,
          data: payload.data,
          streamId: payload.streamId,
        })
      );
    });
  }

  handleLiveStreamEnd(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream end with websocket");
      socket.send(
        this.stringify({
          event: `stream-end`,
          data: payload.data,
          streamId: payload.streamId,
        })
      );
    });
  }

  handleLiveStreamJoin(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream join with websocket");
      socket.send(
        this.stringify({
          event: `stream-join`,
          data: payload.data,
          streamId: payload.streamId,
        })
      );
    });
  }

  handleLiveStreamItemAdd(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream item added with websocket");
      socket.send(
        this.stringify({
          event: `live-stream-item-add`,
          data: payload.data,
          itemUuid: payload.itemUuid,
        })
      );
    });
  }

  handleLiveStreamItemUpdate(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream item added with websocket");
      socket.send(
        this.stringify({
          event: `live-stream-item-update`,
          data: payload.data,
          itemUuid: payload.itemUuid,
        })
      );
    });
  }

  handleLiveStreamItemPurchase(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream item purchase with websocket");
      socket.send(
        this.stringify({
          event: `live-stream-item-sale`,
          data: payload.data,
          itemUuid: payload.itemUuid,
        })
      );
    });
  }

  handleLiveStreamItemDelete(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream item delete with websocket");
      socket.send(
        this.stringify({
          event: `live-stream-item-delete`,
          data: payload.data,
          itemUuid: payload.itemUuid,
        })
      );
    });
  }


  handleLiveStreamSendMessage(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Live stream chat with websocket");
      socket.send(
        this.stringify({
          event: `live-stream-send-message`,
          data: payload.data,
          streamId: payload.streamId,
          threadId: payload.streamId,
        })
      );
    });
  }

  handleUpdatedSaleStatus(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Update Sale Status send with websocket");
      socket.send(
        this.stringify({
          event: `update-sale-status-${payload?.snftId}`,
          item: payload
        })
      );
    });
  }

  handleNewAddedThread(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Thread info with websocket");
      socket.send(
        this.stringify({
          event: `thread-added`,
          data: payload.data,
          threadId: payload.streamId,
        })
      );
    });
  }

  handleThreadSendMessage(payload) {
    this.wss.clients.forEach((socket) => {
      console.log("Thread chat with websocket");
      socket.send(
        this.stringify({
          event: `thread-send-message`,
          data: payload.data,
          threadId: payload.streamId,
        })
      );
    });
  }
  
}

export default SocketService;
