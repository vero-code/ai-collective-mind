// pages/api/generate-advice.js
import { getStoryblokApi } from "@storyblok/react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
if (!GEMINI_API_KEY || !GEMINI_MODEL) {
  throw new Error('GEMINI_API_KEY and GEMINI_MODEL environment variables must be set.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userQuery, situationCategory } = req.body;

    if (!userQuery || !situationCategory) {
      return res.status(400).json({ message: 'User query and situation category are required.' });
    }

    // Step A: Get data from Storyblok
    const storyblokApi = getStoryblokApi();
    console.log("Attempting to fetch 'ai-core-settings' from Storyblok...");
    const { data } = await storyblokApi.get('cdn/stories/ai-core-settings', {
      version: 'published',
    });

    if (!data || !data.story) {
        console.error("Failed to fetch story from Storyblok.");
        return res.status(404).json({ message: 'AI settings not found in Storyblok.' });
    }

    console.log("Successfully fetched data from Storyblok!");
    const storyblokContent = data.story.content;

    // Step B: Build the 'mega prompt' for AI
    let megaPrompt = `${storyblokContent.system_prompt}\n\n`;

    megaPrompt += "Here are good examples to follow:\n";
    storyblokContent.good_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });

    megaPrompt += "\nHere are bad examples to avoid:\n";
    storyblokContent.bad_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });

    megaPrompt += `\n--- END OF EXAMPLES ---\n\n`;
    megaPrompt += `Now, based on these rules and examples, provide advice for the following real user query:\n`;
    megaPrompt += `User: "${userQuery}"\nAI:`;
    
    // Step C: Send request to AI api
    console.log("Sending prompt to Google Gemini AI...");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(megaPrompt);
    const response = await result.response;
    const aiApiResponse = response.text();

    console.log("Received advice from AI:", aiApiResponse);
  
    res.status(200).json({ advice: aiApiResponse });

  } catch (error) {
    console.error('Error in generate-advice API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
