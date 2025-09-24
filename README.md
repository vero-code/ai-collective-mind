# AI Collective Mind

![Next.js](https://img.shields.io/badge/Framework-Next.js-000000?logo=nextdotjs&logoColor=white)
![Storyblok](https://img.shields.io/badge/Headless%20CMS-Storyblok-09B3AF?logo=storyblok&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Hackathon](https://img.shields.io/badge/Hackathon-Storyblok%20x%20Code%20%26%20Coffee%202025-FF5A5F)

**AI Collective Mind** is a web application featuring an intelligent advisor that learns and adapts from real-user feedback. Instead of providing generic advice, it leverages a dynamic knowledge base powered by Storyblok and a sophisticated AI model (Google Gemini) to offer pragmatic, strategic solutions to complex real-world problems.

## The Core Idea: "Live Learning"

The project's key innovation is its "live learning" mechanism, which simulates Reinforcement Learning from Human Feedback (RLHF) in real-time:

1.  **Initial Context:** The AI is given a "persona" and base rules stored as components in Storyblok.
    
2.  **Advice Generation:** When a user poses a problem, the system constructs a "mega-prompt" using these base rules and sends it to the Google Gemini API to generate tailored advice.
    
3.  **User Feedback:** The user can rate the advice as "good" 👍 or "bad" 👎.
    
4.  **Closing the Loop:** This feedback is instantly saved back into Storyblok as a new content entry.
    
5.  **Real-Time Adaptation:** On subsequent requests, the system not only fetches the base rules but also retrieves the most recent "bad" examples from user feedback. It explicitly instructs the AI to avoid generating similar, unhelpful responses.
    

This creates a self-improving "collective mind" where the AI gets smarter and more aligned with real-world nuances with every user interaction.

## Tech Stack

-   **Framework:** Next.js
    
-   **Headless CMS:** Storyblok (used as a dynamic knowledge base for AI prompts and user feedback)
    
-   **AI Model:** Google Gemini

## How to Run Locally

1.  **Clone the repository:**
    
    ```
    git clone https://github.com/vero-code/ai-collective-mind.git
    cd ai-collective-mind
    ```
    
2.  **Install dependencies:**
    
    ```
    npm install
    ```
    
3.  **Set up environment variables:** Create a `.env.local` file in the root of the project and add the following keys:
    
    ```
    GEMINI_API_KEY=...
    GEMINI_MODEL=...
    STORYBLOK_ACCESS_TOKEN=...
    STORYBLOK_MANAGEMENT_TOKEN=...
    STORYBLOK_SPACE_ID=...
    ```
    
4.  **Run the development server:**
    
    ```
    npm run dev
    ```
    
    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000 "null") in your browser.
    

This project was built for the [**Storyblok x Code and Coffee Hackathon 2025**](https://devpost.com/software/ai-collective-mind).