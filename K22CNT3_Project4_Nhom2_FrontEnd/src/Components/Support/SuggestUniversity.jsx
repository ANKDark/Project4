import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function SuggestUniversity({
    handleDrop,
    handleFileChange,
    handleDragOver,
    image,
    imageName,
    setAlert,
    setShowCreateUnv,
    editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady,
    CKEditor,
    DecoupledEditor
}) {
    const [startDate, setStartDate] = useState(new Date());
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        established: new Date().getFullYear(),
        image: null,
    });
    const [errors, setErrors] = useState({});

    const handleSubmitCreateUnv = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('established', formData.established);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const response = await axios.post('/api/suggestUniversities', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setFormData({
                    name: '',
                    description: '',
                    established: new Date().getFullYear(),
                    image: null,
                });
                setStartDate(new Date());
                handleFileChange(null);
                setAlert({
                    message: 'Đề xuất trường thành công. Cảm ơn bạn đã đóng góp!',
                    type: 'success',
                });
                setShowCreateUnv(false);
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
            <h2 className="text-2xl font-semibold text-center mb-8">Đề xuất thêm trường mới</h2>
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg p-6 bg-items-sup">
                <form onSubmit={handleSubmitCreateUnv}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="name">
                            Tên trường
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="custom-input-sup"
                            placeholder="Nhập tên trường"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Mô tả
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
                                                        placeholder: 'Nhập mô tả về trường...',
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
                        <label className="block text-sm font-bold mb-2" htmlFor="established">
                            Năm thành lập
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                setFormData({ ...formData, established: date.getFullYear() });
                            }}
                            dateFormat="yyyy"
                            showYearPicker
                            placeholderText="Chọn năm"
                            className="custom-input-sup"
                            wrapperClassName="w-full"
                        />
                        {errors.established && (
                            <p className="text-red-500 text-xs mt-1">{errors.established}</p>
                        )}
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
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
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