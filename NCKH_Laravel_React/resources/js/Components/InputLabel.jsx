import React from "react";

const InputLabel = ({ htmlFor, value, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-medium text-sm ${className}`}
    >
      {value}
    </label>
  );
};

export default InputLabel;
