import OpenAI from 'openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const MODEL = "gpt-4o";

interface PerformanceData {
  rating: number;
  onTimePercentage: number;
  completedTrips: number;
  currentStreak: number;
  totalPoints: number;
  recentAchievements: Array<{
    name: string;
    description: string;
  }>;
}

interface CoachingResponse {
  message: string;
  suggestions: string[];
  focusAreas: string[];
}

export class DriverCoachingChatbot {
  private conversationHistory: ChatCompletionMessageParam[] = [];

  constructor() {
    // Initialize with system message defining the chatbot's role
    this.conversationHistory.push({
      role: 'system',
      content: `You are an expert driver coach for a luxury transportation service. 
      Your role is to provide professional, encouraging, and actionable advice to help drivers improve their performance.
      Always be supportive and motivating while maintaining a professional tone.
      Focus on specific, actionable recommendations based on the driver's performance data.
      Structure your responses to include both immediate actionable tips and long-term development goals.`
    });
  }

  async getCoachingAdvice(
    driverName: string,
    performanceData: PerformanceData
  ): Promise<CoachingResponse> {
    try {
      // Prepare the performance analysis prompt
      const performancePrompt = `
        Please analyze the following performance data for ${driverName} and provide coaching advice:
        
        Current Performance Metrics:
        - Rating: ${performanceData.rating}/5.0
        - On-Time Percentage: ${performanceData.onTimePercentage}%
        - Completed Trips: ${performanceData.completedTrips}
        - Current Streak: ${performanceData.currentStreak} days
        - Total Points: ${performanceData.totalPoints}
        
        Recent Achievements:
        ${performanceData.recentAchievements
          .map(achievement => `- ${achievement.name}: ${achievement.description}`)
          .join('\n')}

        Please provide:
        1. A personalized coaching message
        2. Three specific suggestions for improvement
        3. Key areas to focus on for long-term development

        Return the response in JSON format with the following structure:
        {
          "message": "personalized coaching message",
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
          "focusAreas": ["area1", "area2", "area3"]
        }
      `;

      // Add the analysis request to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: performancePrompt
      });

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: this.conversationHistory,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content) as CoachingResponse;

      // Add AI's response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: completion.choices[0].message.content
      });

      // Maintain a reasonable conversation history length
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-4) // Keep last 4 messages
        ];
      }

      return response;
    } catch (error) {
      console.error('Error getting coaching advice:', error);
      throw new Error('Failed to generate coaching advice');
    }
  }

  async getChatResponse(message: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: this.conversationHistory
      });

      const response = completion.choices[0].message.content;

      // Add AI's response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Maintain conversation history length
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-4) // Keep last 4 messages
        ];
      }

      return response;
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}
