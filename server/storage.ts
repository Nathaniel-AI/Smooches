import { 
  users, videos, comments, follows,
  type User, type Video, type Comment, type Follow,
  type InsertUser, type InsertVideo, type InsertComment, type InsertFollow,
  type RadioStation, type InsertRadioStation, type RadioSchedule, type InsertRadioSchedule
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, lte, gte } from "drizzle-orm";

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

  // Radio Stations
  getRadioStation(id: number): Promise<RadioStation | undefined>;
  getRadioStations(): Promise<RadioStation[]>;
  createRadioStation(station: InsertRadioStation): Promise<RadioStation>;

  // Radio Schedules
  getRadioSchedule(id: number): Promise<RadioSchedule | undefined>;
  getStationSchedules(stationId: number): Promise<RadioSchedule[]>;
  createRadioSchedule(schedule: InsertRadioSchedule): Promise<RadioSchedule>;
  getCurrentSchedule(stationId: number): Promise<RadioSchedule | undefined>;
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

    // Update video comment count using a subquery
    if (comment.videoId) {
      const commentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(eq(comments.videoId, comment.videoId));

      await db
        .update(videos)
        .set({ comments: commentCount[0].count })
        .where(eq(videos.id, comment.videoId));
    }

    return comment;
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();

    // Update follower counts using subqueries
    if (follow.followerId && follow.followingId) {
      const followingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, follow.followerId));

      const followerCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, follow.followingId));

      await db
        .update(users)
        .set({ following: followingCount[0].count })
        .where(eq(users.id, follow.followerId));

      await db
        .update(users)
        .set({ followers: followerCount[0].count })
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

    // Update follower counts using subqueries
    const followingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, followerId));

    const followerCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, followingId));

    await db
      .update(users)
      .set({ following: followingCount[0].count })
      .where(eq(users.id, followerId));

    await db
      .update(users)
      .set({ followers: followerCount[0].count })
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

  async getRadioStation(id: number): Promise<RadioStation | undefined> {
    const [station] = await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.id, id));
    return station;
  }

  async getRadioStations(): Promise<RadioStation[]> {
    return await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.isActive, true));
  }

  async createRadioStation(station: InsertRadioStation): Promise<RadioStation> {
    const [newStation] = await db
      .insert(radioStations)
      .values(station)
      .returning();
    return newStation;
  }

  async getRadioSchedule(id: number): Promise<RadioSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(radioSchedules)
      .where(eq(radioSchedules.id, id));
    return schedule;
  }

  async getStationSchedules(stationId: number): Promise<RadioSchedule[]> {
    return await db
      .select()
      .from(radioSchedules)
      .where(eq(radioSchedules.stationId, stationId));
  }

  async createRadioSchedule(schedule: InsertRadioSchedule): Promise<RadioSchedule> {
    const [newSchedule] = await db
      .insert(radioSchedules)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  async getCurrentSchedule(stationId: number): Promise<RadioSchedule | undefined> {
    const now = new Date();
    const [currentShow] = await db
      .select()
      .from(radioSchedules)
      .where(
        and(
          eq(radioSchedules.stationId, stationId),
          lte(radioSchedules.startTime, now),
          gte(radioSchedules.endTime, now)
        )
      );
    return currentShow;
  }
}

export const storage = new DatabaseStorage();