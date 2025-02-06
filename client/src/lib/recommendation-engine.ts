import type { Video, RadioStation, User } from "@shared/schema";

interface UserPreferences {
  genres: string[];
  creators: number[];
  audioQuality: string;
}

export interface RecommendationScore {
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  private calculateGenreMatch(itemGenres: string[], userGenres: string[]): number {
    const matchingGenres = itemGenres.filter(genre => 
      userGenres.includes(genre)
    );
    return matchingGenres.length / Math.max(itemGenres.length, 1);
  }

  private calculateCreatorMatch(creatorId: number | null, followedCreators: number[]): number {
    return creatorId && followedCreators.includes(creatorId) ? 1 : 0;
  }

  scoreVideo(video: Video & { genres: string[] }, preferences: UserPreferences): RecommendationScore {
    const reasons: string[] = [];
    let score = 0;

    // Genre match (40% weight)
    const genreScore = this.calculateGenreMatch(video.genres, preferences.genres);
    if (genreScore > 0) {
      score += 0.4 * genreScore;
      reasons.push(`Matches ${Math.round(genreScore * 100)}% of your preferred genres`);
    }

    // Creator match (40% weight)
    const creatorScore = this.calculateCreatorMatch(video.userId, preferences.creators);
    if (creatorScore > 0) {
      score += 0.4;
      reasons.push("From a creator you follow");
    }

    // Engagement score (20% weight)
    const likes = video.likes || 0;
    const comments = video.comments || 0;
    const engagementScore = Math.min(1, (likes + comments) / 1000);
    score += 0.2 * engagementScore;
    if (engagementScore > 0.5) {
      reasons.push("Popular with other listeners");
    }

    return { score, reasons };
  }

  scoreRadioStation(station: RadioStation & { genres: string[] }, preferences: UserPreferences): RecommendationScore {
    const reasons: string[] = [];
    let score = 0;

    // Genre match (60% weight)
    const genreScore = this.calculateGenreMatch(station.genres, preferences.genres);
    if (genreScore > 0) {
      score += 0.6 * genreScore;
      reasons.push(`Matches ${Math.round(genreScore * 100)}% of your preferred genres`);
    }

    // Creator match (40% weight)
    const creatorScore = this.calculateCreatorMatch(station.userId, preferences.creators);
    if (creatorScore > 0) {
      score += 0.4;
      reasons.push("From a creator you follow");
    }

    return { score, reasons };
  }

  sortByRecommendationScore<T extends Video | RadioStation & { genres: string[] }>(
    items: T[],
    preferences: UserPreferences
  ): Array<T & { score: number; reasons: string[] }> {
    return items
      .map(item => {
        const { score, reasons } = 'videoUrl' in item 
          ? this.scoreVideo(item as Video & { genres: string[] }, preferences)
          : this.scoreRadioStation(item as RadioStation & { genres: string[] }, preferences);
        return { ...item, score, reasons };
      })
      .sort((a, b) => b.score - a.score);
  }
}

export const recommendationEngine = new RecommendationEngine();