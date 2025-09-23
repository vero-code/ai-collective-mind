// pages/api/generate-advice.js
import { getStoryblokApi } from "@storyblok/react";

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
    
    console.log("--- Generated Mega Prompt ---");
    console.log(megaPrompt);
    console.log("---------------------------------");


    // Step C: Send request to AI api
    const aiApiResponse = "This is a temporary AI response, but the data for it has now been taken from Storyblok!";
  
    res.status(200).json({ advice: aiApiResponse });

  } catch (error) {
    console.error('Error in generate-advice API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
