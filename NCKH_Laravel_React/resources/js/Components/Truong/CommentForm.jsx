import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const CommentForm = ({ value, onChange, onSubmit, processing }) => {
    const [showEmoji, setShowEmoji] = useState(false);

    const handleEmojiClick = (emojiObject) => {
        onChange({ target: { value: value + emojiObject.emoji } });
    };

    return (
        <div className="d-flex justify-content-center">
            <form className="position-relative d-flex align-items-center w-75" onSubmit={onSubmit}>
                <textarea
                    className="form-control no-resize shadow-sm rounded-pill ps-5 pe-5 pt-3 ms-2 bg-dark text-light border-0"
                    rows="3"
                    placeholder="Viết bình luận..."
                    value={value}
                    onChange={onChange}
                    disabled={processing}
                ></textarea>

                <button
                    type="button"
                    className="position-absolute start-0 top-50 translate-middle-y ms-3 btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "35px", height: "35px" }}
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    <i className="fa-solid fa-face-smile fs-5"></i>
                </button>

                {showEmoji && (
                    <div className="position-absolute bottom-100 start-0 mb-2">
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme="dark"
                            locale="vi"
                            searchDisabled={false}
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px" }}
                    disabled={processing}
                >
                    {processing ? (
                        <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                        <i className="bi bi-send-fill fs-5"></i>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CommentForm;
