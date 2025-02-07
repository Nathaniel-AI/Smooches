export const mockVideos = [
  {
    id: 1,
    userId: 1,
    title: "Dance Challenge",
    description: "Check out these moves! #dance #viral",
    videoUrl: "https://example.com/video1.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 1200,
    comments: 85,
    isLive: false,
    createdAt: new Date("2024-03-15")
  },
  {
    id: 2,
    userId: 2,
    title: "Cooking Stream",
    description: "Making pasta from scratch! #cooking",
    videoUrl: "https://example.com/video2.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 450,
    comments: 32,
    isLive: true,
    createdAt: new Date("2024-03-16")
  }
];

export const mockUsers = [
  {
    id: 1,
    username: "dancequeen",
    displayName: "Dance Queen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dancequeen",
    bio: "Professional dancer sharing tips and tricks",
    followers: 10000,
    following: 500
  },
  {
    id: 2,
    username: "chefmaster",
    displayName: "Chef Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chefmaster",
    bio: "Cooking up a storm! Follow for recipes",
    followers: 5000,
    following: 300
  },
  {
    id: 3,
    username: "musicpro",
    displayName: "Music Pro",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=musicpro",
    bio: "Music producer and DJ",
    followers: 8000,
    following: 400
  },
  {
    id: 4,
    username: "fitcoach",
    displayName: "Fitness Coach",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fitcoach",
    bio: "Helping you achieve your fitness goals",
    followers: 15000,
    following: 200
  }
];

export const mockComments = [
  {
    id: 1,
    userId: 2,
    videoId: 1,
    content: "Amazing moves! 🔥",
    createdAt: new Date("2024-03-15")
  },
  {
    id: 2,
    userId: 1,
    videoId: 2,
    content: "This looks delicious! 😋",
    createdAt: new Date("2024-03-16")
  }
];

export const mockTransactions = [
  {
    id: 1,
    userId: 1,
    amount: 50.00,
    type: "tip",
    status: "completed",
    fromUserId: 2,
    createdAt: new Date("2024-03-15")
  },
  {
    id: 2,
    userId: 1,
    amount: 9.99,
    type: "subscription",
    status: "completed",
    fromUserId: 3,
    createdAt: new Date("2024-03-14")
  },
  {
    id: 3,
    userId: 2,
    amount: 25.00,
    type: "donation",
    status: "completed",
    fromUserId: 4,
    createdAt: new Date("2024-03-13")
  }
];

export const mockEarnings = [
  {
    id: 1,
    userId: 1,
    amount: 1250.00,
    type: "subscription",
    month: "2024-03",
    createdAt: new Date("2024-03-01")
  },
  {
    id: 2,
    userId: 1,
    amount: 750.00,
    type: "tip",
    month: "2024-03",
    createdAt: new Date("2024-03-01")
  },
  {
    id: 3,
    userId: 1,
    amount: 500.00,
    type: "donation",
    month: "2024-03",
    createdAt: new Date("2024-03-01")
  },
  {
    id: 4,
    userId: 1,
    amount: 1100.00,
    type: "subscription",
    month: "2024-02",
    createdAt: new Date("2024-02-01")
  }
];

export const mockRadioStations = [
  {
    id: 1,
    name: "Dance Vibes",
    description: "Non-stop dance hits",
    streamUrl: "https://example.com/stream1",
    coverImage: "https://picsum.photos/200",
    isActive: true,
    userId: 1,
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Chill Lounge",
    description: "Relaxing beats 24/7",
    streamUrl: "https://example.com/stream2",
    coverImage: "https://picsum.photos/200",
    isActive: true,
    userId: 3, 
    createdAt: new Date()
  }
];

export const mockSchedules = [
  {
    id: 1,
    stationId: 1,
    showName: "Morning Dance Party",
    description: "Wake up with energetic beats",
    startTime: new Date(new Date().setHours(8, 0, 0, 0)), 
    endTime: new Date(new Date().setHours(10, 0, 0, 0)), 
    isRecurring: true,
    recurringDays: ["Monday", "Wednesday", "Friday"],
    createdAt: new Date()
  },
  {
    id: 2,
    stationId: 2,
    showName: "Evening Chill",
    description: "Wind down with smooth tracks",
    startTime: new Date(new Date().setHours(20, 0, 0, 0)), 
    endTime: new Date(new Date().setHours(22, 0, 0, 0)), 
    isRecurring: true,
    recurringDays: ["Tuesday", "Thursday", "Sunday"],
    createdAt: new Date()
  }
];