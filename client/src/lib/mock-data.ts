export const mockVideos = [
  {
    id: 1,
    userId: 1,
    title: "Dance Challenge",
    description: "Check out these moves! #dance #viral",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-energetically-in-a-club-2478-large.mp4",
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
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-female-hands-preparing-pasta-on-a-wooden-table-1108-large.mp4",
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