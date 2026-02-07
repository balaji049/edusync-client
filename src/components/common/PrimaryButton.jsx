import React from "react";

const PrimaryButton = ({ children, onClick, type = "button" }) => {
  return (
    <button className="primary-btn" type={type} onClick={onClick}>
      {children}
    </button>
  );
};

export default PrimaryButton;
