// pages/api/generate-advice.js

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
    console.log(`Fetching settings for category: ${situationCategory}`);
    
    const storyblokData = {
      system_prompt: "You are an AI advisor who understands that the world is unfair. Think like a strategist.",
      good_examples: [{ user_query: "My boss stole my idea", ai_response: "Send him a follow-up email..." }],
      bad_examples: [{ user_query: "My boss stole my idea", ai_response: "Talk to him openly..." }],
    };

    // Step B: Build the 'mega prompt' for AI
    let megaPrompt = `${storyblokData.system_prompt}\n\n`;

    megaPrompt += "Here are good examples to follow:\n";
    storyblokData.good_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });

    megaPrompt += "\nHere are bad examples to avoid:\n";
    storyblokData.bad_examples.forEach(example => {
      megaPrompt += `User: "${example.user_query}"\nAI: "${example.ai_response}"\n`;
    });

    megaPrompt += `\n--- END OF EXAMPLES ---\n\n`;
    megaPrompt += `Now, based on these rules and examples, provide advice for the following real user query:\n`;
    megaPrompt += `User: "${userQuery}"\nAI:`;
    
    console.log("--- Generated Mega Prompt ---");
    console.log(megaPrompt);
    console.log("---------------------------------");


    // Step C: Send request to AI api
    const aiApiResponse = "This is a temporary AI response. Real magic is coming soon!";
  
    res.status(200).json({ advice: aiApiResponse });

  } catch (error) {
    console.error('Error in generate-advice API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
