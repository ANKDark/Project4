import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
    const { data, setData, post, reset, errors } = useForm({
        name: '',
        description: '',
        established: new Date().getFullYear(),
        image: null,
    });

    const handleSubmitCreateUnv = (e) => {
        e.preventDefault();
        post('suggestUniversities', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setStartDate(new Date());
                handleFileChange(null);
                setAlert({
                    message: 'Đề xuất trường thành công. Cảm ơn bạn đã đóng góp!',
                    type: 'success',
                });
                setShowCreateUnv(false);
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
                    message: ['Gửi thất bại:', ...messages.map((msg) => `- ${msg}`)],
                    type: 'danger',
                });
            },
        });
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
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
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
                        <label className="block text-sm font-bold mb-2" htmlFor="established">
                            Năm thành lập
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                setData('established', date.getFullYear());
                            }}
                            dateFormat="yyyy"
                            showYearPicker
                            placeholderText="Chọn năm"
                            className="custom-input-sup"
                            wrapperClassName="w-full"
                        />
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