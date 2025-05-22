import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function SuggestionWebsite({ setAlert, setSuggestiontWebsite,
    editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady,
    CKEditor,
    DecoupledEditor }) {
    const { data, setData, post, reset, errors } = useForm({
        user_name: '',
        suggestion_type: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('suggestionWebsite', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setAlert({
                    message: 'Cảm ơn bạn đã gửi góp ý. Chúng tôi sẽ xem xét và phản hồi sớm.',
                    type: 'success',
                });
                setSuggestiontWebsite(false);
            },
            onError: (errors) => {
                console.log(errors);
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
            <h2 className="text-2xl font-semibold text-center mb-8">Góp ý</h2>
            <div className="max-w-6xl mx-auto rounded-lg shadow-lg p-6 bg-items-sup">
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className="block text-sm font-bold mb-2" htmlFor="user_name">
                            Tên của bạn
                        </label>
                        <input
                            type="text"
                            id="user_name"
                            name="user_name"
                            className="custom-input-sup"
                            placeholder="Nhập tên của bạn"
                            value={data.user_name}
                            onChange={(e) => setData('user_name', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="suggestion_type">
                            Dạng góp ý
                        </label>
                        <select
                            id="suggestion_type"
                            name="suggestion_type"
                            className="custom-input-sup"
                            value={data.suggestion_type}
                            onChange={(e) => setData('suggestion_type', e.target.value)}
                        >
                            <option value="">Lựa chọn góp ý</option>
                            <option value="Nâng cấp giao diện người dùng">Nâng cấp giao diện người dùng (UI)</option>
                            <option value="Tối ưu trải nghiệm người dùng">Tối ưu trải nghiệm người dùng (UX)</option>
                            <option value="Tối ưu kỹ thuật / hiệu suất">Tối ưu kỹ thuật / hiệu suất</option>
                            <option value="Cải thiện khả năng truy cập">Cải thiện khả năng truy cập (Accessibility)</option>
                            <option value="Thêm tính năng">Thêm tính năng</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Chi tiết về mong muốn của bạn
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
