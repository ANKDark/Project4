import { useState, useEffect } from "react";

export default function AlertComponent({ message, type = "success", duration = 3000, onClose }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!show) return null;

    const alertIcons = {
        success: <i className="fa-light fa-circle-check"></i>,
        danger: <i className="fa-regular fa-xmark-large"></i>,
        warning: <i className="fa-regular fa-diamond-exclamation"></i>,
        info: <i className="fa-regular fa-circle-info"></i>,
    };

    return (
        <div
            className={`alert alert-${type} d-flex align-items-center shadow-lg fade show position-fixed top-0 start-50 translate-middle-x px-4 py-3`}
            role="alert"
            style={{
                minWidth: "350px",
                maxWidth: "400px",
                borderRadius: "10px",
                zIndex: 1050,
                opacity: show ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
            }}
        >
            <span className="me-2 fs-5">{alertIcons[type] || alertIcons.info}</span>
            <div className="flex-grow-1">
                {Array.isArray(message)
                    ? message.map((line, idx) => (
                        <div
                            key={idx}
                            className={`${idx === 0 ? 'mb-2 fw-bold' : 'mb-1 ms-3'}`}
                        >
                            {line}
                        </div>
                    ))
                    : typeof message === 'object' && message !== null
                        ? <div>{Object.values(message).find(val => typeof val === 'string' && val.trim()) || 'Không có nội dung hiển thị'}</div>
                        : <div>{message}</div>}
            </div>
        </div>
    );
}
