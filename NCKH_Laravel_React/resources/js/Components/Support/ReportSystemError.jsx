import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ReportSystemError({ handleDrop, handleFileChange, handleDragOver, image,
    imageName, setReportSystemError, setAlert, editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady, CKEditor,
    DecoupledEditor }) {
    const { data, setData, post, reset, errors } = useForm({
        name: '',
        description: '',
        datetime: new Date().toISOString().slice(0, 16),
        os: '',
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('reportSystemError', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                handleFileChange(null);
                setAlert({
                    message: 'Cảm ơn ban đã gửi thông tin về cho chúng tôi!',
                    type: 'success',
                });
                setReportSystemError(false);
            },
            onError: (errors) => {
                const messages = [];
                for (const [field, value] of Object.entries(errors)) {
                    if (Array.isArray(value)) {
                        messages.push(...value);
                    } else {
                        messages.push(value);
                    }
                }

                setAlert({
                    message: ['Gửi thất bại:', ...messages.map(msg => `- ${msg}`)],
                    type: 'danger',
                });
            }
        });
    }
    return (
        <div className="py-12 bg-bottom-sup">
            <h2 className="text-2xl font-semibold text-center mb-8">Báo lỗi hệ thống</h2>
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg p-6 bg-items-sup">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="name">
                            Tên lỗi (Mã lỗi)
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="custom-input-sup"
                            placeholder="Nhập tên lỗi"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Mô tả lỗi
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
                                                            editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                                                        }
                                                    }}
                                                    onAfterDestroy={() => {
                                                        if (editorToolbarRef.current) {
                                                            Array.from(editorToolbarRef.current.children).forEach((child) =>
                                                                child.remove()
                                                            );
                                                        }
                                                    }}
                                                    onChange={(event, editor) => {
                                                        const editorData = editor.getData();
                                                        setData('description', editorData);
                                                    }}
                                                    editor={DecoupledEditor}
                                                    config={{
                                                        ...editorConfig,
                                                        placeholder: 'Nhập mô tả về trường...'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="datetime">
                            Ngày giờ gặp lỗi
                        </label>
                        <input
                            type="datetime-local"
                            id="datetime"
                            name="datetime"
                            className="custom-input-sup"
                            value={data.datetime}
                            onChange={(e) => setData('datetime', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="os">
                            Hệ điều hành
                        </label>
                        <select
                            id="os"
                            name="os"
                            className="custom-input-sup"
                            value={data.os} onChange={(e) => setData('os', e.target.value)}
                        >
                            <option value="">Chọn hệ điều hành</option>
                            <option value="windows">Windows</option>
                            <option value="macos">macOS</option>
                            <option value="linux">Linux</option>
                            <option value="android">Android</option>
                            <option value="ios">iOS</option>
                        </select>
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
                                    setData('image', e.target.files[0]);
                                }}
                            />
                        </div>
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
