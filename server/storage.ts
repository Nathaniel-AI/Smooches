import { 
  users, videos, comments, follows,
  type User, type Video, type Comment, type Follow,
  type InsertUser, type InsertVideo, type InsertComment, type InsertFollow
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Videos
  getVideo(id: number): Promise<Video | undefined>;
  getVideos(): Promise<Video[]>;
  getUserVideos(userId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;

  // Comments
  getComments(videoId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Follows
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private comments: Map<number, Comment>;
  private follows: Map<number, Follow>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.comments = new Map();
    this.follows = new Map();
    this.currentIds = {
      users: 1,
      videos: 1,
      comments: 1,
      follows: 1
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = {
      ...insertUser,
      id,
      followers: 0,
      following: 0,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null
    };
    this.users.set(id, user);
    return user;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getUserVideos(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentIds.videos++;
    const video: Video = {
      ...insertVideo,
      id,
      userId: insertVideo.userId || null,
      description: insertVideo.description || null,
      thumbnail: insertVideo.thumbnail || null,
      likes: 0,
      comments: 0,
      isLive: insertVideo.isLive || false,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async getComments(videoId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.videoId === videoId
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comments++;
    const comment: Comment = {
      ...insertComment,
      id,
      userId: insertComment.userId || null,
      videoId: insertComment.videoId || null,
      createdAt: new Date()
    };
    this.comments.set(id, comment);

    if (comment.videoId !== null) {
      const video = await this.getVideo(comment.videoId);
      if (video) {
        video.comments = (video.comments || 0) + 1;
        this.videos.set(video.id, video);
      }
    }

    return comment;
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = this.currentIds.follows++;
    const follow: Follow = {
      ...insertFollow,
      id,
      followerId: insertFollow.followerId || null,
      followingId: insertFollow.followingId || null,
      createdAt: new Date()
    };
    this.follows.set(id, follow);

    if (follow.followerId !== null && follow.followingId !== null) {
      const follower = await this.getUser(follow.followerId);
      const following = await this.getUser(follow.followingId);

      if (follower) {
        follower.following = (follower.following || 0) + 1;
        this.users.set(follower.id, follower);
      }
      if (following) {
        following.followers = (following.followers || 0) + 1;
        this.users.set(following.id, following);
      }
    }

    return follow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );

    if (follow) {
      this.follows.delete(follow.id);

      const follower = await this.getUser(followerId);
      const following = await this.getUser(followingId);

      if (follower && follower.following !== null) {
        follower.following--;
        this.users.set(follower.id, follower);
      }
      if (following && following.followers !== null) {
        following.followers--;
        this.users.set(following.id, following);
      }
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(f => f.followingId === userId)
      .map(f => f.followerId)
      .filter((id): id is number => id !== null);

    return Array.from(this.users.values())
      .filter(user => followerIds.includes(user.id));
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(f => f.followerId === userId)
      .map(f => f.followingId)
      .filter((id): id is number => id !== null);

    return Array.from(this.users.values())
      .filter(user => followingIds.includes(user.id));
  }
}

export const storage = new MemStorage();