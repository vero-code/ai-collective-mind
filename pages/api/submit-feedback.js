// pages/api/submit-feedback.js

// This function handles requests to the Storyblok Management API
async function postToStoryblok(payload) {
  const spaceId = process.env.STORYBLOK_SPACE_ID; 
  const managementToken = process.env.STORYBLOK_MANAGEMENT_TOKEN;

  if (!spaceId || !managementToken) {
    throw new Error('Storyblok Space ID and Management Token must be set in .env.local');
  }

  const url = `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': managementToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Provide a more specific error from Storyblok's response
    throw new Error(`Storyblok API error: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { adviceText, rating } = req.body;

    if (!adviceText || !rating || !['good', 'bad'].includes(rating)) {
      return res.status(400).json({ message: 'Advice text and a valid rating ("good" or "bad") are required.' });
    }

    console.log(`Received feedback. Rating: ${rating}. Advice: "${adviceText.substring(0, 50)}..."`);
    
    // This is the data structure that matches our 'UserFeedback' component in Storyblok
    const storyPayload = {
      story: {
        name: `Feedback - ${new Date().toISOString()}`, // e.g., "Feedback - 2025-09-23T14:30:00.000Z"
        slug: `feedback-${Date.now()}`, // e.g., "feedback-1695475800000"
        content: {
          component: 'UserFeedback',
          advice_text: adviceText,
          rating: rating,
          user_comment: '', // Сan add this later
        },
      },
      publish: 1, // Automatically publish the new feedback entry
    };

    // Send the data to Storyblok
    const storyblokResponse = await postToStoryblok(storyPayload);

    console.log("Successfully saved feedback to Storyblok:", storyblokResponse.story.name);

    res.status(201).json({ message: 'Feedback submitted successfully!', data: storyblokResponse });

  } catch (error) {
    console.error('Error in submit-feedback API:', error);
    res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}