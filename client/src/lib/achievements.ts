export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'followers' | 'videos' | 'streams' | 'reactions' | 'subscriptions';
    count: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-follower',
    name: '🌟 Rising Star',
    description: 'Got your first follower! Your journey begins here.',
    icon: '🌟',
    requirement: {
      type: 'followers',
      count: 1
    }
  },
  {
    id: 'content-creator',
    name: '🎥 Content Creator',
    description: 'Published your first 5 videos. Keep the content flowing!',
    icon: '🎥',
    requirement: {
      type: 'videos',
      count: 5
    }
  },
  {
    id: 'streamer',
    name: '🎙️ Live Entertainer',
    description: 'Completed your first live stream. The audience loves you!',
    icon: '🎙️',
    requirement: {
      type: 'streams',
      count: 1
    }
  },
  {
    id: 'community-star',
    name: '💫 Community Star',
    description: 'Received 100 reactions on your content. You\'re making waves!',
    icon: '💫',
    requirement: {
      type: 'reactions',
      count: 100
    }
  },
  {
    id: 'top-creator',
    name: '👑 Top Creator',
    description: 'Reached 1000 followers! You\'re becoming a SMOOCHES sensation!',
    icon: '👑',
    requirement: {
      type: 'followers',
      count: 1000
    }
  },
  {
    id: 'subscriber-magnet',
    name: '⭐ Subscriber Magnet',
    description: 'Got your first 10 subscribers. Your content is worth paying for!',
    icon: '⭐',
    requirement: {
      type: 'subscriptions',
      count: 10
    }
  }
];
