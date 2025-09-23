import { useState } from 'react';
import Head from "next/head";

export default function Home() {

  // --- State ---
  const [userQuery, setUserQuery] = useState('');
  const [category, setCategory] = useState('Conflict with the boss');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // --- Send request ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);
    setAiAdvice('');

    try {
      const response = await fetch('/api/generate-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: userQuery,
          situationCategory: category,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }

      const data = await response.json();
      setAiAdvice(data.advice);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>AI Collective Mind</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="title">
          AI Collective Mind
        </h1>

        <p className="description">
          Describe your problem, and AI trained on real-world experience will give pragmatic advice.
        </p>

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
            {isLoading ? 'Think...' : 'Get advice'}
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
            </div>
          )}
        </div>
      </main>

      {/* --- Styles --- */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
        }
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }
        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          color: #555;
        }
        .main-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-top: 2rem;
        }
        label {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        input, textarea {
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 1rem;
          font-family: inherit;
        }
        button {
          margin-top: 1.5rem;
          padding: 1rem;
          font-size: 1.2rem;
          font-weight: bold;
          color: white;
          background-color: #0070f3;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:hover {
          background-color: #005bb5;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .result-area {
          margin-top: 2rem;
          width: 100%;
          min-height: 100px;
        }
        .error {
          color: red;
        }
        .advice-card {
          padding: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
      `}</style>
    </div>
  );
}
