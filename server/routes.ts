import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getCurrentUserId } from "./auth";
import {
  insertUserSchema,
  insertVideoSchema,
  insertCommentSchema,
  insertFollowSchema,
  insertRadioStationSchema,
  insertRadioScheduleSchema,
  insertReactionSchema,
  insertTransactionSchema,
  insertSubscriptionSchema,
  insertEarningsSchema,
  insertClipSchema
} from "@shared/schema";
import {
  mockUsers,
  mockVideos,
  mockComments,
  mockTransactions,
  mockEarnings,
  mockRadioStations,
  mockSchedules,
  mockClips
} from "../client/src/lib/mock-data";
import { createCanvas } from 'canvas';
import { z } from 'zod';

// Keep track of connected clients for each target (video/radio/live)
const streamClients = new Map<number, Set<WebSocket>>();
const reactionClients = new Map<string, Set<WebSocket>>();

// Skip mock data initialization - clean database without demo content
async function initializeMockData() {
  console.log('Mock data initialization skipped - clean database with no demo content');
}

const clipRequestSchema = z.object({
  audioUrl: z.string().url(),
  startTime: z.number(),
  endTime: z.number(),
  showName: z.string()
});

export function registerRoutes(app: Express): Server {

  // Set up authentication (this includes all auth routes)
  setupAuth(app);

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

  // Transactions
  app.post("/api/transactions", async (req, res) => {
    const result = insertTransactionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }
    const transaction = await storage.createTransaction(result.data);
    res.json(transaction);
  });

  app.get("/api/transactions", async (_req, res) => {
    // TODO: Get userId from session
    const userId = 1; // Mock user ID for now
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  // Subscriptions
  app.post("/api/subscriptions", async (req, res) => {
    const result = insertSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid subscription data" });
    }
    const subscription = await storage.createSubscription(result.data);
    res.json(subscription);
  });

  app.get("/api/subscriptions", async (_req, res) => {
    // TODO: Get userId from session
    const userId = 1; // Mock user ID for now
    const subscriptions = await storage.getSubscriptions(userId);
    res.json(subscriptions);
  });

  app.get("/api/subscriptions/subscribers", async (_req, res) => {
    // TODO: Get userId from session
    const userId = 1; // Mock user ID for now
    const subscribers = await storage.getSubscribers(userId);
    res.json(subscribers);
  });

  // Earnings
  app.get("/api/earnings", async (_req, res) => {
    // TODO: Get userId from session
    const userId = 1; // Mock user ID for now
    const earnings = await storage.getEarnings(userId);
    res.json(earnings);
  });

  app.post("/api/earnings", async (req, res) => {
    const result = insertEarningsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid earnings data" });
    }
    const earnings = await storage.createEarnings(result.data);
    res.json(earnings);
  });

  // Clips
  app.get("/api/clips", async (_req, res) => {
    const clips = await storage.getClips();
    res.json(clips);
  });

  app.get("/api/clips/:id", async (req, res) => {
    const clip = await storage.getClip(parseInt(req.params.id));
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    res.json(clip);
  });

  app.get("/api/users/:id/clips", async (req, res) => {
    const clips = await storage.getUserClips(parseInt(req.params.id));
    res.json(clips);
  });

  app.get("/api/radio-stations/:id/clips", async (req, res) => {
    const clips = await storage.getStationClips(parseInt(req.params.id));
    res.json(clips);
  });

  app.post("/api/clips", async (req, res) => {
    const result = insertClipSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid clip data" });
    }
    const clip = await storage.createClip(result.data);
    res.json(clip);
  });

  app.post("/api/clips/generate", async (req, res) => {
    const result = clipRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid clip data" });
    }

    try {
      const { audioUrl, startTime, endTime, showName } = result.data;

      // Generate a simple thumbnail
      const canvas = createCanvas(1200, 630);
      const ctx = canvas.getContext('2d');

      // Set gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#333333');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      // Add waveform visualization (simplified)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 1200; i += 10) {
        const height = Math.random() * 100 + 265;
        ctx.moveTo(i, height);
        ctx.lineTo(i, 630 - height);
      }
      ctx.stroke();

      // Add text
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(showName, 600, 200);

      ctx.font = '40px Arial';
      const duration = Math.round(endTime - startTime);
      ctx.fillText(`${duration} second clip`, 600, 280);

      // Convert to base64
      const thumbnailUrl = canvas.toDataURL();

      // TODO: In a production environment, we would:
      // 1. Actually process the audio clip
      // 2. Store the thumbnail in a CDN
      // 3. Return permanent URLs

      // For demo, we'll return the same audio URL and the generated thumbnail
      res.json({
        clipUrl: audioUrl,
        thumbnailUrl,
        duration,
      });
    } catch (error) {
      console.error('Error generating clip:', error);
      res.status(500).json({ message: "Failed to generate clip" });
    }
  });

  return httpServer;
}