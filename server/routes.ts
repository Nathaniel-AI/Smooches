import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVideoSchema, 
  insertCommentSchema,
  insertFollowSchema 
} from "@shared/schema";
import { mockUsers, mockVideos, mockComments } from "../client/src/lib/mock-data";

// Initialize mock data
async function initializeMockData() {
  // Add mock users
  for (const user of mockUsers) {
    await storage.createUser({
      username: user.username,
      password: "password123", // Mock password
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio
    });
  }

  // Add mock videos
  for (const video of mockVideos) {
    await storage.createVideo({
      userId: video.userId,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      isLive: video.isLive
    });
  }

  // Add mock comments
  for (const comment of mockComments) {
    await storage.createComment({
      userId: comment.userId,
      videoId: comment.videoId,
      content: comment.content
    });
  }
}

export function registerRoutes(app: Express): Server {
  // Initialize mock data when server starts
  initializeMockData().catch(console.error);

  // Users
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }
    const user = await storage.createUser(result.data);
    res.json(user);
  });

  // Videos
  app.get("/api/videos", async (_req, res) => {
    const videos = await storage.getVideos();
    res.json(videos);
  });

  app.get("/api/videos/:id", async (req, res) => {
    const video = await storage.getVideo(parseInt(req.params.id));
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  });

  app.get("/api/users/:id/videos", async (req, res) => {
    const videos = await storage.getUserVideos(parseInt(req.params.id));
    res.json(videos);
  });

  app.post("/api/videos", async (req, res) => {
    const result = insertVideoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid video data" });
    }
    const video = await storage.createVideo(result.data);
    res.json(video);
  });

  // Comments
  app.get("/api/videos/:id/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  });

  app.post("/api/comments", async (req, res) => {
    const result = insertCommentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid comment data" });
    }
    const comment = await storage.createComment(result.data);
    res.json(comment);
  });

  // Follows
  app.post("/api/follows", async (req, res) => {
    const result = insertFollowSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid follow data" });
    }
    const follow = await storage.createFollow(result.data);
    res.json(follow);
  });

  app.delete("/api/follows/:followerId/:followingId", async (req, res) => {
    await storage.deleteFollow(
      parseInt(req.params.followerId),
      parseInt(req.params.followingId)
    );
    res.status(204).send();
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    const followers = await storage.getFollowers(parseInt(req.params.id));
    res.json(followers);
  });

  app.get("/api/users/:id/following", async (req, res) => {
    const following = await storage.getFollowing(parseInt(req.params.id));
    res.json(following);
  });

  const httpServer = createServer(app);
  return httpServer;
}