import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVideoSchema, 
  insertCommentSchema,
  insertFollowSchema,
  insertRadioStationSchema,
  insertRadioScheduleSchema,
  insertReactionSchema
} from "@shared/schema";
import { mockUsers, mockVideos, mockComments } from "../client/src/lib/mock-data";

// Keep track of connected clients for each target (video/radio/live)
const streamClients = new Map<number, Set<WebSocket>>();
const reactionClients = new Map<string, Set<WebSocket>>();

// Initialize mock data
async function initializeMockData() {
  try {
    // Add mock users if they don't exist
    for (const user of mockUsers) {
      const existingUser = await storage.getUserByUsername(user.username);
      if (!existingUser) {
        await storage.createUser({
          username: user.username,
          password: "password123",
          displayName: user.displayName,
          avatar: user.avatar,
          bio: user.bio
        });
      }
    }

    // Add mock videos
    for (const video of mockVideos) {
      const existingVideos = await storage.getUserVideos(video.userId);
      if (!existingVideos.some(v => v.title === video.title)) {
        await storage.createVideo({
          userId: video.userId,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
          isLive: video.isLive
        });
      }
    }

    // Add mock comments
    for (const comment of mockComments) {
      await storage.createComment({
        userId: comment.userId,
        videoId: comment.videoId,
        content: comment.content
      });
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}

export function registerRoutes(app: Express): Server {
  // Initialize mock data when server starts
  initializeMockData().catch(console.error);

  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    let streamId: number | undefined = undefined;
    let reactionTarget: string | undefined = undefined;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
            streamId = message.streamId;
            if (typeof streamId === 'number') {
              if (!streamClients.has(streamId)) {
                streamClients.set(streamId, new Set());
              }
              streamClients.get(streamId)?.add(ws);
            }
            break;

          case 'join_reactions':
            reactionTarget = `${message.targetType}_${message.targetId}`;
            if (!reactionClients.has(reactionTarget)) {
              reactionClients.set(reactionTarget, new Set());
            }
            reactionClients.get(reactionTarget)?.add(ws);
            break;

          case 'reaction':
            if (reactionTarget && reactionClients.has(reactionTarget)) {
              const reactionMessage = {
                type: 'reaction',
                emoji: message.emoji,
                targetType: message.targetType,
                targetId: message.targetId,
                timestamp: new Date().toISOString()
              };

              reactionClients.get(reactionTarget)?.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(reactionMessage));
                }
              });
            }
            break;

          case 'chat':
            if (streamId && streamClients.has(streamId)) {
              const chatMessage = {
                type: 'chat',
                userId: message.userId,
                username: message.username,
                content: message.content,
                timestamp: new Date().toISOString()
              };

              streamClients.get(streamId)?.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(chatMessage));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (streamId && streamClients.has(streamId)) {
        streamClients.get(streamId)?.delete(ws);
        if (streamClients.get(streamId)?.size === 0) {
          streamClients.delete(streamId);
        }
      }

      if (reactionTarget && reactionClients.has(reactionTarget)) {
        reactionClients.get(reactionTarget)?.delete(ws);
        if (reactionClients.get(reactionTarget)?.size === 0) {
          reactionClients.delete(reactionTarget);
        }
      }
    });
  });

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

  // Radio Stations
  app.get("/api/radio-stations", async (_req, res) => {
    const stations = await storage.getRadioStations();
    res.json(stations);
  });

  app.get("/api/radio-stations/:id", async (req, res) => {
    const station = await storage.getRadioStation(parseInt(req.params.id));
    if (!station) {
      return res.status(404).json({ message: "Radio station not found" });
    }
    res.json(station);
  });

  app.post("/api/radio-stations", async (req, res) => {
    const result = insertRadioStationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid radio station data" });
    }
    const station = await storage.createRadioStation(result.data);
    res.json(station);
  });

  // Radio Schedules
  app.get("/api/radio-stations/:id/schedule", async (req, res) => {
    const schedules = await storage.getStationSchedules(parseInt(req.params.id));
    res.json(schedules);
  });

  app.get("/api/radio-stations/:id/current-show", async (req, res) => {
    const show = await storage.getCurrentSchedule(parseInt(req.params.id));
    if (!show) {
      return res.status(404).json({ message: "No show currently playing" });
    }
    res.json(show);
  });

  app.post("/api/radio-schedules", async (req, res) => {
    const result = insertRadioScheduleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid schedule data" });
    }
    const schedule = await storage.createRadioSchedule(result.data);
    res.json(schedule);
  });

  // Reactions API
  app.post("/api/reactions", async (req, res) => {
    const result = insertReactionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid reaction data" });
    }
    const reaction = await storage.createReaction(result.data);
    res.json(reaction);
  });

  app.get("/api/reactions/:targetType/:targetId", async (req, res) => {
    const reactions = await storage.getReactions(
      req.params.targetType,
      parseInt(req.params.targetId)
    );
    res.json(reactions);
  });

  return httpServer;
}