// pages/api/generate-advice.js
import StoryblokClient from "storyblok-js-client";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL;
    if (!GEMINI_API_KEY || !GEMINI_MODEL) {
      throw new Error('GEMINI_API_KEY and GEMINI_MODEL environment variables must be set.');
    }

    const { userQuery, situationCategory } = req.body;

    if (!userQuery || !situationCategory) {
      return res.status(400).json({ message: 'User query and situation category are required.' });
    }

    const storyblokClient = new StoryblokClient({
      accessToken: process.env.STORYBLOK_ACCESS_TOKEN
    });

    // STEP A: Fetch the AI settings for the dynamic category from Storyblok
    const categorySlug = situationCategory;
    console.log(`Fetching settings for category slug: "${categorySlug}" from Storyblok...`);

    const { data: coreSettingsData } = await storyblokClient.get(`cdn/stories/${categorySlug}`, { 
      version: 'published',
    });

    if (!coreSettingsData || !coreSettingsData.story) {
      return res.status(404).json({ message: `AI settings for category '${categorySlug}' not found. Make sure it's published.` });
    }
    const storyblokContent = coreSettingsData.story.content;

    // STEP B1: Build the initial 'mega prompt' with base rules
    let megaPrompt = `${storyblokContent.system_prompt}\n\n`;
    megaPrompt += "Here are good examples to follow:\n";
    storyblokContent.good_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });
    megaPrompt += "\nHere are bad examples to avoid:\n";
    storyblokContent.bad_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });

    // STEP B2: Fetch recent bad feedback to learn from it
    const { data: feedbackData } = await storyblokClient.get('cdn/stories', {
      starts_with: 'feedback-',
      'filter_query[rating][in]': 'bad',
      sort_by: 'created_at:desc',
      per_page: 5, // Get the 5 most recent bad examples
      version: 'published',
    });

    if (feedbackData && feedbackData.stories.length > 0) {
      console.log(`Found ${feedbackData.stories.length} recent bad examples to learn from.`);
      megaPrompt += "\n--- USER FEEDBACK SECTION ---\n";
      megaPrompt += "Here are examples of advice that real users found unhelpful. Avoid generating similar responses:\n";
      feedbackData.stories.forEach(story => {
        megaPrompt += `- "${story.content.advice_text}"\n`;
      });
    } else {
        console.log("No recent bad feedback found.");
    }

    // STEP B3: Add the final user query to the prompt
    megaPrompt += `\n--- END OF EXAMPLES ---\n\n`;
    megaPrompt += `Now, based on ALL these rules and examples, provide advice for the following real user query:\n`;
    megaPrompt += `User: "${userQuery}"\nAI:`;
    
    // STEP C: Send the complete prompt to the Gemini API
    console.log("Sending final prompt to Google Gemini AI...", megaPrompt);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(megaPrompt);
    const response = await result.response;
    const aiApiResponse = response.text();

    console.log("Received advice from AI:", aiApiResponse);
  
    res.status(200).json({ advice: aiApiResponse });

  } catch (error) {
    console.error('Error in generate-advice API:', error);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}
