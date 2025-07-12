import React from "react";

export default function PrimaryButton({ className = "", disabled = false, children, ...props }) {
    return (
        <button
            {...props}
            className={`${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
