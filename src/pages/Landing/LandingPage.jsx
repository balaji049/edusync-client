import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import PrimaryButton from "../../components/common/PrimaryButton";

const LandingPage = () => {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <h1>
            Learn with your <span className="highlight">Community</span>, 
            powered by <span className="highlight">AI</span>.
          </h1>
          <p className="landing-subtitle">
            EduSync AI connects students, friends, and teachers in shared 
            learning spaces — with an AI mentor that answers doubts, 
            guides discussions, and keeps everyone on track.
          </p>

          <div className="landing-cta-row">
            <Link to="/signup">
              <PrimaryButton>Create your first community</PrimaryButton>
            </Link>
            <Link to="/dashboard" className="ghost-link">
              Explore demo workspace →
            </Link>
          </div>

          <div className="landing-feature-pills">
            <span>🤖 AI doubt solver</span>
            <span>👥 Group learning</span>
            <span>👨‍🏫 Teacher-friendly</span>
            <span>📊 Progress insights</span>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hero-card">
            <p className="hero-label">Community: ML Study Group</p>
            <div className="hero-chat-bubble user">
              “Can someone explain gradient descent?”
            </div>
            <div className="hero-chat-bubble ai">
              “Sure! Imagine you’re walking down a hill step by step…”
            </div>
            <div className="hero-chat-bubble teacher">
              “Nice explanation. Add a simple diagram too.”
            </div>
          </div>
          <p className="hero-caption">
            Real-time collaboration between students, teachers & AI.
          </p>
        </div>
      </section>

      <section className="landing-sections">
        <div className="landing-section">
          <h2>🧑‍🎓 For Students</h2>
          <p>
            Ask doubts anytime, revise faster, and learn with your friends 
            inside focused communities — exam prep, coding clubs, or college classes.
          </p>
        </div>
        <div className="landing-section">
          <h2>👨‍🏫 For Teachers</h2>
          <p>
            Create learning spaces, pin resources, and let AI handle repetitive 
            questions while you focus on high-value mentoring.
          </p>
        </div>
        <div className="landing-section">
          <h2>🤝 For Communities</h2>
          <p>
            Host hackathons, interview prep groups, and subject clubs, all with 
            structured channels and AI-powered discussion support.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
