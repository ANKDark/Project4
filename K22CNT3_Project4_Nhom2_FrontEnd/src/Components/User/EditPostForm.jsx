import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EditPostForm({
    onClose,
    content,
    onChange,
    status,
    image,
    imageName,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleSubmit
}) {
    const [showEmoji, setShowEmoji] = useState(false);

    const handleEmojiClick = (emojiObject) => {
        onChange({ target: { name: "content", value: content + emojiObject.emoji } });
    };

    const isVideo = imageName && /\.(mp4|avi|mov|mkv)$/i.test(imageName.name || imageName);

    return (
        <div className="modal fade show d-block create-post-overlay bg-dark bg-opacity-75" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-crp">
                    <div className="modal-header d-flex justify-content-between">
                        <span className="modal-title text-center w-100 fs-4 fw-bold">Chỉnh sửa bài viết</span>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body border-0 position-relative">
                        <div className="position-relative">
                            <textarea
                                className="form-control border-0 txtPost no-resize"
                                rows="5"
                                placeholder="Chỉnh sửa bài viết của bạn..."
                                value={content}
                                onChange={onChange}
                                name="content"
                            ></textarea>
                            <div className="position-absolute" style={{ bottom: "10px", right: "10px" }}>
                                <button
                                    type="button"
                                    className="btn btn-sm text-secondary"
                                    onClick={() => setShowEmoji(!showEmoji)}
                                    title="Thêm emoji"
                                >
                                    <i className="fa-solid fa-face-smile fs-5"></i>
                                </button>
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
                            </div>
                        </div>

                        <div
                            className="upload-area upload-box d-flex flex-column align-items-center justify-content-center border rounded mt-3"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => document.getElementById("fileInput").click()}
                        >
                            {image ? (
                                isVideo ? (
                                    <video key={image} controls className="w-100 h-100 object-fit-contain" preload="metadata" autoPlay>
                                        <source src={`http://127.0.0.1:8000${image}`} type="video/mp4" />
                                        Trình duyệt không hỗ trợ video.
                                    </video>
                                ) : (
                                    <img src={`http://127.0.0.1:8000${image}`} alt={imageName} className="w-100 h-100 object-fit-contain" />
                                )
                            ) : (
                                <>
                                    <i className="bi bi-image" style={{ fontSize: "2rem" }}></i>
                                    <p>Thêm ảnh/video hoặc kéo và thả</p>
                                </>
                            )}
                            <input
                                type="file"
                                id="fileInput"
                                className="d-none"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="mb-3 mt-3">
                            <select
                                className="form-select bg-crp border rounded"
                                value={status}
                                name="status"
                                onChange={onChange}
                            >
                                <option value="1">Công khai</option>
                                <option value="0">Một mình tôi</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer border-0">
                        <button className="btn btn-primary w-100" onClick={handleSubmit}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
