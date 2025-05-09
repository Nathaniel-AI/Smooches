import OpenAI from "openai";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate an optimized title for an audio clip based on context
 */
export async function generateClipTitle(
  clipContent: string,
  showName: string,
  duration: number
): Promise<string> {
  try {
    const prompt = `Generate a catchy, SEO-friendly title for a podcast clip from "${showName}" 
    that is ${Math.round(duration)} seconds long. The clip content is about: "${clipContent}".
    The title should be concise (max 60 chars) and compelling to drive clicks.
    Respond with the title only, no quotes or explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 60,
    });

    return response.choices[0].message.content?.trim() || `${showName} - Highlight Clip`;
  } catch (error) {
    console.error("Error generating clip title:", error);
    return `${showName} - Highlight Clip`;
  }
}

/**
 * Generate an engaging description for an audio clip
 */
export async function generateClipDescription(
  clipContent: string,
  showName: string
): Promise<string> {
  try {
    const prompt = `Write an engaging, SEO-optimized description for a podcast clip from "${showName}".
    The clip is about: "${clipContent}".
    Keep the description under 200 characters, include relevant keywords, and make it enticing.
    Respond with the description only, no quotes or explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating clip description:", error);
    return "";
  }
}

/**
 * Generate clip recommendations for a user based on their preferences
 */
export async function getClipRecommendations(
  userInterests: string[],
  recentActivity: string,
  availableClipTopics: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on a user with interests in ${userInterests.join(", ")} 
    who recently ${recentActivity}, recommend 5 podcast clip topics they might enjoy from this list:
    ${availableClipTopics.join(", ")}
    
    Return your recommendations as a JSON array of strings with only the topic names.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    } catch (e) {
      console.error("Error parsing JSON from OpenAI response:", e);
      return [];
    }
  } catch (error) {
    console.error("Error getting clip recommendations:", error);
    return [];
  }
}

/**
 * Moderate user-generated content to ensure community guidelines
 */
export async function moderateContent(content: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
}> {
  try {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];
    const isAppropriate = !result.flagged;
    
    // If content is flagged, determine which categories triggered the flag
    let reason = "";
    if (!isAppropriate) {
      const categories = result.categories;
      const flaggedCategories = Object.entries(categories)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      reason = `Content flagged for: ${flaggedCategories.join(", ")}`;
    }

    return { isAppropriate, reason };
  } catch (error) {
    console.error("Error moderating content:", error);
    return { isAppropriate: true }; // Default to allowing content if moderation fails
  }
}

/**
 * Generate clip suggestions from a full podcast episode
 */
export async function suggestClipHighlights(
  transcriptSegments: { text: string; timestamp: number }[],
  showName: string
): Promise<{ text: string; timestamp: number; confidence: number }[]> {
  try {
    // Combine transcript segments into a single text with timestamps
    const fullTranscript = transcriptSegments
      .map(s => `[${s.timestamp}s] ${s.text}`)
      .join(" ");
    
    const prompt = `Analyze this podcast transcript from "${showName}" and identify 3-5 segments that would make excellent short clips.
    Look for segments that are insightful, entertaining, controversial, or emotionally impactful.
    Ideal clips should be 15-60 seconds in context.
    
    Transcript with timestamps:
    ${fullTranscript}
    
    Return your suggestions as a JSON array with the following structure:
    [
      {
        "timestamp": number (in seconds),
        "text": "the transcript segment text",
        "confidence": number (between 0-1, how good this clip would be)
      }
    ]`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } catch (e) {
      console.error("Error parsing JSON from OpenAI response:", e);
      return [];
    }
  } catch (error) {
    console.error("Error suggesting clip highlights:", error);
    return [];
  }
}

/**
 * Generate thumbnail prompt for clip visualization
 */
export async function generateThumbnailPrompt(
  clipContent: string,
  showName: string
): Promise<string> {
  try {
    const prompt = `Create a DALL-E image prompt to generate a thumbnail for a podcast clip.
    The podcast is called "${showName}" and the clip is about: "${clipContent}".
    The thumbnail should be visually appealing, relevant to the content, and suitable for social media.
    Make the prompt detailed, specific, and creative. Focus on creating an image that would make someone click.
    Respond with the image prompt only, no explanations.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating thumbnail prompt:", error);
    return "";
  }
}

/**
 * Generate an image thumbnail for a clip using DALL-E
 */
export async function generateThumbnailImage(prompt: string): Promise<string | null> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a visually striking podcast thumbnail: ${prompt}. Use vibrant colors, minimalist design, and ensure any text is readable at small sizes.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || null;
  } catch (error) {
    console.error("Error generating thumbnail image:", error);
    return null;
  }
}