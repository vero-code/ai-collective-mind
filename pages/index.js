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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
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
            {isLoading ? <div className="spinner-in-button"></div> : 'Get advice'}
          </button>
        </form>

        {/* --- Output area for the result --- */}
        <div className="result-area">
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
                {feedbackStatus === 'sending' && <div className="spinner"></div>}
                {feedbackStatus === 'success' && <p className="feedback-success">Thank you for your feedback!</p>}
                {feedbackStatus === 'error' && <p className="error">Error: {feedbackError}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
