import React from "react";
import "./ProfileStatCard.css";

const ProfileStatCard = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <div className="stat-icon-wrapper" style={{ color }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  );
};

export default ProfileStatCard;
