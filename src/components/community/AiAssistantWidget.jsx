// src/components/community/AiAssistantWidget.jsx
import React, { useState } from "react";
import API from "../../services/api";

const AiAssistantWidget = ({ communityId, channelId }) => {
  const [open, setOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ============================
     ASK AI (PRIVATE, NO SOCKET)
  ============================ */
  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await API.post("/ai/ask", {
        question,
        communityId,
        channelId,
      });

      setAnswer(res.data.answer);
      setQuestion("");
    } catch (err) {
      setError("⚠️ Failed to get AI response.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     COLLAPSED STATE
  ============================ */
  if (!open) {
    return (
      <button
        className="ai-widget-toggle"
        onClick={() => setOpen(true)}
        title="Open AI Assistant"
      >
        🤖
      </button>
    );
  }

  /* ============================
     OPEN STATE
  ============================ */
  return (
    <div className="ai-widget">
      <header className="ai-widget-header">
        <h3>EduSync AI</h3>
        <button onClick={() => setOpen(false)}>✕</button>
      </header>

      <div className="ai-widget-body">
        <p className="ai-widget-text">
          Ask questions based on the current discussion.
        </p>

        <input
          className="ai-widget-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask about #${channelId || "general"}`}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
          disabled={loading}
        />

        <button
          className="primary-btn ai-widget-btn"
          onClick={askAI}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>

        {/* AI Answer */}
        {answer && (
          <div className="ai-widget-answer">
            <strong>EduSync AI</strong>
            <p>{answer}</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="ai-widget-error">{error}</p>}
      </div>
    </div>
  );
};

export default AiAssistantWidget;
