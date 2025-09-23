import { useState } from 'react';
import Head from "next/head";

export default function Home() {

  // --- State for Advice Generation ---
  const [userQuery, setUserQuery] = useState('');
  const [category, setCategory] = useState('Conflict with the boss');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- State for Feedback ---
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);
  
  // --- Handler for getting advice ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);
    setAiAdvice('');

    setFeedbackStatus(null);
    setFeedbackError(null);

    try {
      const response = await fetch('/api/generate-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: userQuery, situationCategory: category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setAiAdvice(data.advice);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handler for submitting feedback ---
  const handleFeedbackSubmit = async (rating) => {
    setFeedbackStatus('sending');
    setFeedbackError(null);

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adviceText: aiAdvice, rating: rating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback.');
      }

      setFeedbackStatus('success');
    } catch (err) {
      setFeedbackError(err.message);
      setFeedbackStatus('error');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>AI Collective Mind</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="title">AI Collective Mind</h1>
        <p className="description">Describe your problem, and AI trained on real-world experience will give pragmatic advice.</p>

        <form onSubmit={handleSubmit} className="main-form">
          <label htmlFor="category">Problem category:</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <label htmlFor="userQuery">Describe your situation:</label>
          <textarea
            id="userQuery"
            rows="5"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="For example: My colleague constantly distracts me from work with empty talk..."
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Get advice'}
          </button>
        </form>

        {/* --- Output area for the result --- */}
        <div className="result-area">
          {isLoading && <p>Loading...</p>}
          {error && <p className="error">Error: {error}</p>}
          {aiAdvice && (
            <div className="advice-card">
              <h2>Your advice:</h2>
              <p>{aiAdvice}</p>

              {/* --- Feedback section --- */}
              <div className="feedback-section">
                {!feedbackStatus && (
                  <>
                    <p>Was this advice helpful?</p>
                    <div className="feedback-buttons">
                      <button onClick={() => handleFeedbackSubmit('good')} className="feedback-button good">👍 Good advice</button>
                      <button onClick={() => handleFeedbackSubmit('bad')} className="feedback-button bad">👎 Bad advice</button>
                    </div>
                  </>
                )}
                {feedbackStatus === 'sending' && <p>Sending feedback...</p>}
                {feedbackStatus === 'success' && <p className="feedback-success">Thank you for your feedback!</p>}
                {feedbackStatus === 'error' && <p className="error">Error: {feedbackError}</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Styles --- */}
      <style jsx>{`
        /* Existing styles remain the same */
        .container { min-height: 100vh; padding: 0 0.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        main { padding: 5rem 0; flex: 1; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 600px; }
        .title { margin: 0; line-height: 1.15; font-size: 4rem; text-align: center; }
        .description { text-align: center; line-height: 1.5; font-size: 1.5rem; color: #555; }
        .main-form { width: 100%; display: flex; flex-direction: column; margin-top: 2rem; }
        label { margin-top: 1rem; margin-bottom: 0.5rem; font-weight: bold; }
        input, textarea { padding: 0.75rem; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; font-family: inherit; }
        button { margin-top: 1.5rem; padding: 1rem; font-size: 1.2rem; font-weight: bold; color: white; background-color: #0070f3; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
        button:hover { background-color: #005bb5; }
        button:disabled { background-color: #ccc; cursor: not-allowed; }
        .result-area { margin-top: 2rem; width: 100%; min-height: 100px; }
        .error { color: red; }
        .advice-card { padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }

        /* --- For feedback --- */
        .feedback-section {
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
          text-align: center;
        }
        .feedback-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .feedback-button {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: bold;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .feedback-button:hover {
          opacity: 0.8;
        }
        .good {
          background-color: #28a745;
        }
        .bad {
          background-color: #dc3545;
        }
        .feedback-success {
          color: #28a745;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
