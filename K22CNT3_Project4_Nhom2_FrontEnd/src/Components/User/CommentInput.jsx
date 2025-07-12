import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const CommentInput = ({ data, setData, handleSubmit, replyUser }) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    const currentText = data.Text || "";
    setData({ ...data, Text: currentText + emojiObject.emoji });
  };

  return (
    <div className="p-3 bg-crp position-sticky rounded-3">
      <div className="d-flex flex-start w-100">
        <div className="form-outline w-100 position-relative">
          <form onSubmit={handleSubmit} className="position-relative">
            <textarea
              className="form-control no-resize shadow-sm rounded ps-3 pe-5 pt-3 bg-dark text-light border-0 fs-6"
              rows={3}
              value={data.Text || ""}
              placeholder={replyUser ? "Nhập phản hồi của bạn" : "Nhập bình luận của bạn"}
              onChange={(e) => setData({ ...data, Text: e.target.value })}
            />
            <div className="position-absolute bottom-form d-flex align-items-center gap-2">
              {!replyUser && (
                <select
                  className="form-select form-select-sm bg-dark text-light border-secondary article-mode rounded"
                  value={data.Visibility || "Public"}
                  onChange={(e) => setData({ ...data, Visibility: e.target.value })}
                >
                  <option value="Public">Công khai</option>
                  <option value="Private">Riêng tư</option>
                </select>
              )}
              <button
                type="button"
                className="btn btn-sm text-secondary"
                onClick={() => setShowEmoji(!showEmoji)}
                title="Thêm emoji"
              >
                <i className="fa-solid fa-face-smile fs-5"></i>
              </button>
            </div>
            {showEmoji && (
              <div className="position-absolute emoji">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  locale="vi"
                  searchDisabled={false}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
            <div className="position-absolute post-options">
              <button
                type="submit"
                className="btn btn-sm d-flex align-items-center gap-2 border-0 text-secondary"
                title="Bình luận"
                disabled={!data.Text || typeof data.Text !== "string" || !data.Text.trim()}
              >
                <i className="fa-solid fa-paper-plane-top fs-5"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;