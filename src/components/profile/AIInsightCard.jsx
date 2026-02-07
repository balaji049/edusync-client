import React from "react";
import "./AIInsightCard.css";

const AIInsightCard = ({ messageCount, aiQuestions, streak }) => {
  return (
    <div className="insight-card">
      <p>
        Based on your activity, you engage consistently with your community. 
      </p>
      <ul>
        <li>You’ve contributed <strong>{messageCount}</strong> messages.</li>
        <li>Asked AI <strong>{aiQuestions}</strong> times.</li>
        <li>Your learning streak is <strong>{streak} days</strong>.</li>
      </ul>
      <p>
        🚀 Keep going! You're building strong learning habits.
      </p>
    </div>
  );
};

export default AIInsightCard;
