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
    genres: ["Pop", "Dance"],
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
    genres: ["Lifestyle", "Food"],
    createdAt: new Date("2024-03-16")
  },
  {
    id: 3,
    userId: 3,
    title: "Late Night Jazz Session",
    description: "Improvising some smooth jazz tunes",
    videoUrl: "https://example.com/video3.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 890,
    comments: 45,
    isLive: false,
    genres: ["Jazz", "Music"],
    createdAt: new Date("2024-03-16")
  },
  {
    id: 4,
    userId: 4,
    title: "Electronic Music Mix",
    description: "Fresh beats for your weekend! #electronic",
    videoUrl: "https://example.com/video4.mp4",
    thumbnail: "https://picsum.photos/400/600",
    likes: 2100,
    comments: 156,
    isLive: false,
    genres: ["Electronic", "Music"],
    createdAt: new Date("2024-03-17")
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
    following: 500,
    genres: ["Pop", "Dance", "Hip Hop"]
  },
  {
    id: 2,
    username: "chefmaster",
    displayName: "Chef Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chefmaster",
    bio: "Cooking up a storm! Follow for recipes",
    followers: 5000,
    following: 300,
    genres: ["Lifestyle", "Food"]
  },
  {
    id: 3,
    username: "jazzmaster",
    displayName: "Jazz Master",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jazzmaster",
    bio: "Professional jazz musician and teacher",
    followers: 7500,
    following: 200,
    genres: ["Jazz", "Classical", "Blues"]
  },
  {
    id: 4,
    username: "electrobeats",
    displayName: "Electro Beats",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=electrobeats",
    bio: "Electronic music producer and DJ",
    followers: 15000,
    following: 400,
    genres: ["Electronic", "Pop", "Dance"]
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
  },
  {
    id: 3,
    userId: 4,
    videoId: 3,
    content: "Smooth jazz vibes! 🎷",
    createdAt: new Date("2024-03-16")
  },
  {
    id: 4,
    userId: 3,
    videoId: 4,
    content: "Great mix! The drop at 2:30 is fire 🎧",
    createdAt: new Date("2024-03-17")
  }
];

export const mockStations = [
  {
    id: 1,
    userId: 3,
    name: "Late Night Jazz",
    description: "Smooth jazz for your evening",
    isActive: true,
    genres: ["Jazz", "Blues"],
    currentListeners: 120
  },
  {
    id: 2,
    userId: 4,
    name: "Electronic Beats 24/7",
    description: "Non-stop electronic music",
    isActive: true,
    genres: ["Electronic", "Dance"],
    currentListeners: 350
  }
];