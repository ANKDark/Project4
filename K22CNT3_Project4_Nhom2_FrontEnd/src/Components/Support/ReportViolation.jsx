import React, { useState } from 'react';
import axios from 'axios';

export default function ReportViolation({
    handleDrop,
    handleFileChange,
    handleDragOver,
    image,
    imageName,
    setReportViolation,
    setAlert,
    editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady,
    CKEditor,
    DecoupledEditor,
}) {
    const [formData, setFormData] = useState({
        violation_type: '',
        description: '',
        datetime: new Date().toISOString().slice(0, 16),
        user_id: '',
        image: null,
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('violation_type', formData.violation_type);
        data.append('description', formData.description);
        data.append('datetime', formData.datetime);
        data.append('user_id', formData.user_id);
        if (formData.image) {
            data.append('image_path', formData.image);
        }

        try {
            const response = await axios.post('/api/reportViolation', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setFormData({
                    violation_type: '',
                    description: '',
                    datetime: new Date().toISOString().slice(0, 16),
                    user_id: '',
                    image: null,
                });
                handleFileChange(null);
                setAlert({
                    message: 'Cảm ơn bạn đã báo cáo vi phạm. Chúng tôi sẽ xử lý thông tin của bạn.',
                    type: 'success',
                });
                setReportViolation(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const messages = error.response.data.errors;
                setErrors(messages);
                setAlert({
                    message: ['Gửi thất bại:', ...Object.values(messages).map((msg) => `- ${msg}`)],
                    type: 'danger',
                });
            } else {
                setAlert({
                    message: 'Đã xảy ra lỗi. Vui lòng thử lại!',
                    type: 'danger',
                });
            }
        }
    };

    return (
        <div className="py-12 bg-bottom-sup">
            <h2 className="text-2xl font-semibold text-center mb-8">Báo cáo vi phạm</h2>
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg p-6 bg-items-sup">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="violation_type">
                            Loại vi phạm
                        </label>
                        <select
                            id="violation_type"
                            name="violation_type"
                            className="custom-input-sup"
                            value={formData.violation_type}
                            onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                        >
                            <option value="">Chọn loại vi phạm</option>
                            <option value="Ngôn ngữ phản cảm">Ngôn ngữ phản cảm</option>
                            <option value="Spam">Spam</option>
                            <option value="Giả mạo">Giả mạo</option>
                            <option value="Quấy rối">Quấy rối</option>
                            <option value="Khác">Khác</option>
                        </select>
                        {errors.violation_type && (
                            <p className="text-red-500 text-xs mt-1">{errors.violation_type}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Mô tả vi phạm
                        </label>
                        <div className="main-container">
                            <div
                                className="editor-container editor-container_document-editor editor-container_include-style"
                                ref={editorContainerRef}
                            >
                                <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
                                <div className="editor-container__editor-wrapper">
                                    <div className="editor-container__editor">
                                        <div ref={editorRef}>
                                            {isLayoutReady && editorConfig && (
                                                <CKEditor
                                                    onReady={(editor) => {
                                                        if (editorToolbarRef.current) {
                                                            editorToolbarRef.current.appendChild(
                                                                editor.ui.view.toolbar.element
                                                            );
                                                        }
                                                    }}
                                                    onAfterDestroy={() => {
                                                        if (editorToolbarRef.current) {
                                                            Array.from(editorToolbarRef.current.children).forEach(
                                                                (child) => child.remove()
                                                            );
                                                        }
                                                    }}
                                                    onChange={(event, editor) => {
                                                        const editorData = editor.getData();
                                                        setFormData({ ...formData, description: editorData });
                                                    }}
                                                    editor={DecoupledEditor}
                                                    config={{
                                                        ...editorConfig,
                                                        placeholder: 'Nhập mô tả vi phạm...',
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="datetime">
                            Thời gian vi phạm
                        </label>
                        <input
                            type="datetime-local"
                            id="datetime"
                            name="datetime"
                            className="custom-input-sup"
                            value={formData.datetime}
                            onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                        />
                        {errors.datetime && <p className="text-red-500 text-xs mt-1">{errors.datetime}</p>}
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-sm font-bold mb-2"
                            htmlFor="user_id"
                            title="Lấy ID đối tượng từ trang người dùng, bài viết hoặc bình luận. Ví dụ: ID của người dùng là 12345."
                        >
                            Đối tượng bị báo cáo
                        </label>
                        <input
                            type="number"
                            id="user_id"
                            name="user_id"
                            className="custom-input-sup"
                            placeholder="Nhập ID đối tượng"
                            value={formData.user_id}
                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        />
                        {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Hình ảnh</label>
                        <div
                            className="upload-area upload-box d-flex flex-column align-items-center justify-content-center custom-input-sup cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            style={{ height: '150px' }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt={imageName}
                                    className="w-100 h-100 object-fit-contain rounded-lg"
                                />
                            ) : (
                                <>
                                    <i className="fa-light fa-image" style={{ fontSize: '2rem' }}></i>
                                    <p>Thêm ảnh/video hoặc kéo và thả</p>
                                </>
                            )}
                            <input
                                type="file"
                                id="fileInput"
                                className="d-none"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    handleFileChange(e);
                                    setFormData({ ...formData, image: e.target.files[0] });
                                }}
                            />
                        </div>
                        {errors.image_path && <p className="text-red-500 text-xs mt-1">{errors.image_path}</p>}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Gửi yêu cầu
                    </button>
                </form>
            </div>
        </div>
    );
}