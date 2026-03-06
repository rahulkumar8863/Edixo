'use server';
/**
 * @fileOverview A Genkit flow for generating personalized study plans based on user's weak areas.
 *
 * - generateAIStudyPlan - A function that handles the AI study plan generation process.
 * - AIStudyPlanGenerationInput - The input type for the generateAIStudyPlan function.
 * - AIStudyPlanGenerationOutput - The return type for the generateAIStudyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIStudyPlanGenerationInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom the study plan is being generated.'),
  durationDays: z.number().int().positive().describe('Duration of the study plan in days (e.g., 3, 7, 30).'),
  weakAreasDescription: z.string().describe('A summary of the user\'s weak areas identified from past test performance, e.g., "User is weak in Trigonometry, scoring 45% on average, and also struggling with Quadratic Equations, scoring 55%."'),
  currentOverallScore: z.number().int().min(0).max(100).describe('Current overall score or proficiency level in the weak areas (as a percentage).'),
  targetOverallScore: z.number().int().min(0).max(100).describe('Target overall score or proficiency level for the weak areas (as a percentage).'),
  examType: z.string().optional().describe('The type of exam the user is preparing for (e.g., JEE, NEET, UPSC).')
});
export type AIStudyPlanGenerationInput = z.infer<typeof AIStudyPlanGenerationInputSchema>;

const AIStudyPlanGenerationOutputSchema = z.object({
  topic: z.string().describe('The main topic or subject area this study plan focuses on, derived from the weak areas.'),
  durationDays: z.number().int().positive().describe('The duration of the study plan in days.'),
  currentLevel: z.number().int().min(0).max(100).describe('The starting proficiency level for this plan in percentage.'),
  targetLevel: z.number().int().min(0).max(100).describe('The target proficiency level to achieve with this plan in percentage.'),
  dailyTasks: z.array(z.object({
    day: z.number().int().positive().describe('The day number in the study plan.'),
    tasks: z.array(z.object({
      type: z.enum(['Watch', 'Read', 'Practice', 'Quiz']).describe('The type of study activity.'),
      title: z.string().describe('A short title or description of the task.'),
      duration: z.string().describe('Estimated duration for the task (e.g., "20m", "1h").'),
      status: z.literal('pending').describe('The initial status of the task, always "pending".')
    })).describe('List of tasks for this day.')
  })).describe('An array of daily tasks for the study plan.'),
  planSummary: z.string().describe('A brief summary of the generated study plan and its objectives.')
});
export type AIStudyPlanGenerationOutput = z.infer<typeof AIStudyPlanGenerationOutputSchema>;

export async function generateAIStudyPlan(input: AIStudyPlanGenerationInput): Promise<AIStudyPlanGenerationOutput> {
  return aiStudyPlanGenerationFlow(input);
}

const aiStudyPlanGenerationPrompt = ai.definePrompt({
  name: 'aiStudyPlanGenerationPrompt',
  input: { schema: AIStudyPlanGenerationInputSchema },
  output: { schema: AIStudyPlanGenerationOutputSchema },
  prompt: `You are an expert AI Study Planner. Your goal is to analyze a student's weak areas and generate a personalized, detailed study plan.

The student's performance data indicates the following weak areas:
{{{weakAreasDescription}}}

The student wants a study plan for {{durationDays}} days.
Their current proficiency in these areas is approximately {{currentOverallScore}}% and they aim to reach {{targetOverallScore}}%.
The exam type is {{examType}}.

Based on this, generate a comprehensive study plan focusing on improving these weak areas.
Break down the plan into daily tasks. For each task, specify its type (Watch, Read, Practice, Quiz), a concise title, and an estimated duration.
All tasks should initially have a status of "pending".

Ensure the plan progressively builds understanding and skills. Start with fundamentals and move to more advanced topics and practice.

The main topic of this plan should be derived from the most prominent weak area mentioned.

Your output MUST be a JSON object adhering to the specified schema, including 'topic', 'durationDays', 'currentLevel', 'targetLevel', 'dailyTasks', and 'planSummary'.
`,
});

const aiStudyPlanGenerationFlow = ai.defineFlow(
  {
    name: 'aiStudyPlanGenerationFlow',
    inputSchema: AIStudyPlanGenerationInputSchema,
    outputSchema: AIStudyPlanGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await aiStudyPlanGenerationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate study plan output.');
    }
    return output;
  }
);
