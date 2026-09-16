import { useState } from "react";
import "./App.css";
const API_URL = "http://localhost:5000";

function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
console.log(url);

    try {
      const contentResponse = await fetch(
        `${API_URL}/api/fetch-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      const contentData = await contentResponse.json();

      if (!contentData.success) {
        throw new Error(contentData.message);
      }

      const summaryResponse = await fetch(
        `${API_URL}/api/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: contentData.text,
          }),
        }
      );

      const summaryData = await summaryResponse.json();

      if (!summaryData.success) {
        throw new Error(summaryData.message);
      }

      setSummary(summaryData.summary);
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
  <div className="header">
    <h1>AI Website Summarizer</h1>

    <p className="subtitle">
      Enter a public webpage URL and get a concise AI-generated summary.
    </p>
  </div>

  <div className="input-card">
    <div className="input-section">

          <input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSummarize();
              }
            }}
          />

          <button onClick={handleSummarize} disabled={loading}>
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="loading">
            Fetching webpage and generating summary...
          </div>
        )}

        {summary && (
          <div className="summary-card">
            <h2>Summary</h2>
            <div className="summary">{summary}</div>
          </div>
        )}
      </div>
</div>
    </div>
  );
}

export default App;