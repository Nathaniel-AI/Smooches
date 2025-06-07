export const mockVideos: any[] = [];

export const mockUsers: any[] = [];

export const mockComments: any[] = [];

export const mockTransactions: any[] = [];

export const mockEarnings: any[] = [];

export const mockClips: any[] = [];

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