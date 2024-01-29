export interface PostedVideoInterface {
  postId?: string;
  videoURL?: string;
  mobileVideoURL?: string;
  videoType?: string;
  videoTitle?: string;
  videoCaption?: string;
  accountId?: string;
  postedBy?: string;
  profileId?: string;
  userName: string;
  userImage: string;
  minted?: string;
  createdAt?: string;
  updatedAt?: string;
  likedByUsers?: string;
  commentByUsers?: string;
  awardsByUsers?: string;
  mintedTimeStamp?: string;
  isExpired: string;
  genre?: string;
  videoThumbnail: string;
  views: number;
}
