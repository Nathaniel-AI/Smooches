export const mockVideos = [
  {
    id: 1,
    userId: 1,
    title: "Dance Challenge",
    description: "Check out these moves! #dance #viral",
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
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
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 450,
    comments: 32,
    isLive: true,
    createdAt: new Date("2024-03-16")
  },
  {
    id: 3,
    userId: 3,
    title: "Music Performance",
    description: "Live acoustic session! #music #live",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 850,
    comments: 142,
    isLive: false,
    createdAt: new Date("2024-03-17")
  },
  {
    id: 4,
    userId: 4,
    title: "Tech Review",
    description: "Latest gadget unboxing and review #tech",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 624,
    comments: 78,
    isLive: false,
    createdAt: new Date("2024-03-18")
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
    fromUserId: 2,
    createdAt: new Date("2024-03-14")
  },
  {
    id: 3,
    userId: 2,
    amount: 25.00,
    type: "donation",
    status: "completed",
    fromUserId: 1,
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

export const mockClips = [
  {
    id: 1,
    userId: 1,
    stationId: 1,
    showName: "Daily Vibes",
    title: "Top 5 music marketing tips from industry experts",
    description: "Learn the secrets to successfully marketing your music in today's digital landscape.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG11c2ljJTIwc3R1ZGlvfGVufDB8fDB8fHww",
    duration: 28,
    startTime: 0,
    endTime: 28,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    createdAt: new Date("2023-12-25T14:30:00Z")
  },
  {
    id: 2,
    userId: 2,
    stationId: 2,
    showName: "Music Masterclass",
    title: "How to create a catchy hook for your next hit",
    description: "Professional producer breaks down the anatomy of memorable hooks.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-614.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c291bmQlMjBzdHVkaW98ZW58MHx8MHx8fDA%3D",
    duration: 22,
    startTime: 5,
    endTime: 27,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-614.mp3",
    createdAt: new Date("2024-01-15T18:45:00Z")
  },
  {
    id: 3,
    userId: 1, // Changed from 3 to 1 to match existing user
    stationId: 1, // Changed to match user's station
    showName: "Creator Corner",
    title: "Finding your authentic voice as a content creator",
    description: "Why authenticity is crucial for building a loyal audience in today's crowded landscape.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-serene-view-432.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvZGNhc3R8ZW58MHx8MHx8fDA%3D",
    duration: 25,
    startTime: 10,
    endTime: 35,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-serene-view-432.mp3",
    createdAt: new Date("2024-02-10T09:15:00Z")
  },
  {
    id: 4,
    userId: 1,
    stationId: 1,
    showName: "Daily Vibes",
    title: "Interview with rising star DJ Pulse",
    description: "Learn about DJ Pulse's journey and his unique approach to music production.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGRqfGVufDB8fDB8fHww",
    duration: 20,
    startTime: 15,
    endTime: 35,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
    createdAt: new Date("2024-02-28T16:20:00Z")
  },
  {
    id: 5,
    userId: 2,
    stationId: 2,
    showName: "Music Masterclass",
    title: "Mastering vocal techniques for any genre",
    description: "Professional vocal coach shares essential techniques for singers at all levels.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2luZ2luZ3xlbnwwfHwwfHx8MA%3D%3D",
    duration: 18,
    startTime: 8,
    endTime: 26,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3",
    createdAt: new Date("2024-03-05T11:30:00Z")
  },
  {
    id: 6,
    userId: 2, // Changed from 3 to 2 to match existing user
    stationId: 2, // Changed to match user's station
    showName: "Creator Corner",
    title: "Building a sustainable business model for creators",
    description: "Financial strategies for turning your passion into a profitable business.",
    clipUrl: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnVzaW5lc3MlMjBtZWV0aW5nfGVufDB8fDB8fHww",
    duration: 30,
    startTime: 0,
    endTime: 30,
    sourceUrl: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
    createdAt: new Date("2024-03-15T14:00:00Z")
  }
];

export const mockRadioStations = [
  {
    id: 1,
    name: "Dance Vibes",
    description: "Non-stop dance hits by Dance Queen",
    streamUrl: "https://example.com/stream1",
    coverImage: "https://picsum.photos/200",
    isActive: true,
    userId: 1, 
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Chill Lounge",
    description: "Relaxing beats 24/7 by Chef Master",
    streamUrl: "https://example.com/stream2",
    coverImage: "https://picsum.photos/200",
    isActive: true,
    userId: 2, // Changed from 3 to 2 to match existing user
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