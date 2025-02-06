import { 
  users, videos, comments, follows,
  type User, type Video, type Comment, type Follow,
  type InsertUser, type InsertVideo, type InsertComment, type InsertFollow
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getUserVideos(userId: number): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.userId, userId));
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(insertVideo).returning();
    return video;
  }

  async getComments(videoId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.videoId, videoId));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();

    // Update video comment count
    if (comment.videoId) {
      await db.update(videos)
        .set({ comments: db.select().from(comments)
          .where(eq(comments.videoId, comment.videoId))
          .count() })
        .where(eq(videos.id, comment.videoId));
    }

    return comment;
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();

    // Update follower counts
    if (follow.followerId && follow.followingId) {
      await db.update(users)
        .set({ following: db.select().from(follows)
          .where(eq(follows.followerId, follow.followerId))
          .count() })
        .where(eq(users.id, follow.followerId));

      await db.update(users)
        .set({ followers: db.select().from(follows)
          .where(eq(follows.followingId, follow.followingId))
          .count() })
        .where(eq(users.id, follow.followingId));
    }

    return follow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );

    // Update follower counts
    await db.update(users)
      .set({ following: db.select().from(follows)
        .where(eq(follows.followerId, followerId))
        .count() })
      .where(eq(users.id, followerId));

    await db.update(users)
      .set({ followers: db.select().from(follows)
        .where(eq(follows.followingId, followingId))
        .count() })
      .where(eq(users.id, followingId));
  }

  async getFollowers(userId: number): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(users.id, follows.followerId))
      .where(eq(follows.followingId, userId));

    return result.map(r => r.user);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(users.id, follows.followingId))
      .where(eq(follows.followerId, userId));

    return result.map(r => r.user);
  }
}

export const storage = new DatabaseStorage();