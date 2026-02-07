import React from "react";
import "./ContributionHeatmap.css";

const ContributionHeatmap = ({ data }) => {
  return (
    <div className="heatmap-grid">
      {data.map((val, i) => (
        <div
          key={i}
          className="heatmap-cell"
          style={{
            background: val > 0 
              ? `rgba(79, 70, 229, ${0.2 + val * 0.15})`
              : "#E5E7EB"
          }}
        ></div>
      ))}
    </div>
  );
};

export default ContributionHeatmap;
