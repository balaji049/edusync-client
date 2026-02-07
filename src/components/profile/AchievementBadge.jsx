import React from "react";
import "./AchievementBadge.css";

const AchievementBadge = ({ label }) => (
  <span className="achievement-badge">
    {label}
  </span>
);

export default AchievementBadge;
