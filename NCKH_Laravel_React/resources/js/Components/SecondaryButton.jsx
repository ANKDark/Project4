// resources/js/Components/SecondaryButton.jsx
import React from "react";

const SecondaryButton = ({ type = "button", className = "", children, ...props }) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
