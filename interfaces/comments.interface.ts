export interface CommentInterface {
  commentId?: string;
  commentText?: string;
  postId?: string;
  profileId?: string;
  parentCommentId?: string;
  likedByUsers?: string;
  isReply: string;
  createdAt?: string;
  updatedAt?: string;
}
