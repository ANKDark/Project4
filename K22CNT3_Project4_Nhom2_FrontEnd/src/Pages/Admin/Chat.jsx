import AdminLayout from '@/Layouts/AdminLayout';
import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import '../../assets/css/Admin/Chat.css';
import axios from 'axios';
import { Alert } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';

export default function Chat() {
    const [listMessage, setListMessage] = useState([]);
    const [adminId, setAdminId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [file, setFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const fileRef = useRef();
    const messagesEndRef = useRef(null);

    const [formData, setFormData] = useState({
        message: '',
        file: null,
    });

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/api/admin/chat', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
                    timeout: 10000,
                });
                setListMessage(response.data.messages || []);
                setAdminId(response.data.adminId);
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể tải danh sách tin nhắn. Vui lòng thử lại.';
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(errorMessages);
            } finally {
                setIsFetching(false);
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        const markMessagesAsRead = async () => {
            try {
                await axios.post(
                    '/api/admin/chat/mark-as-read',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                        },
                        timeout: 5000,
                    }
                );
            } catch (err) {
                console.error('Error marking messages as read:', err);
            }
        };

        if (listMessage.length > 0) {
            markMessagesAsRead();
        }
    }, [listMessage]);

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.chat', (e) => {
            console.log('New message received:', e);
            setListMessage((prevMessages) => {
                if (!prevMessages.some((msg) => msg.id === e.adminChat.id)) {
                    return [...prevMessages, e.adminChat];
                }
                return prevMessages;
            });
        });

        channel.listen('.admin.chat.read', (e) => {
            console.log('Message read event:', e);
            if (!e.adminChatRead.admin) {
                console.warn('Admin data missing in adminChatRead:', e.adminChatRead);
            }
            setListMessage((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === e.adminChatRead.IdAdminChat
                        ? {
                              ...msg,
                              reads: msg.reads
                                  ? [...msg.reads, e.adminChatRead]
                                  : [e.adminChatRead],
                          }
                        : msg
                )
            );
        });

        return () => {
            channel.stopListening('.admin.chat');
            channel.stopListening('.admin.chat.read');
        };
    }, []);

    // Cuộn xuống cuối khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [listMessage]);

    // Xử lý chọn file
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage('File không được lớn hơn 10MB.');
                return;
            }
            setFile(selectedFile);
            const type = selectedFile.type;
            const url = URL.createObjectURL(selectedFile);

            if (type.startsWith('image/')) {
                setPreviewType('image');
            } else if (type.startsWith('video/')) {
                setPreviewType('video');
            } else {
                setPreviewType('file');
            }

            setPreview(url);
            setFormData((prev) => ({ ...prev, file: selectedFile }));
        }
    };

    // Xóa file preview
    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        setPreviewType(null);
        fileRef.current.value = null;
        setFormData((prev) => ({ ...prev, file: null }));
    };

    // Xử lý gửi tin nhắn
    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.message.trim() && !formData.file) {
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage('Vui lòng nhập tin nhắn hoặc chọn file.');
            return;
        }

        setIsLoading(true);
        const data = new FormData();
        data.append('message', formData.message);
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            const response = await axios.post('/api/admin/chat/send-message', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                },
                timeout: 10000,
            });

            setListMessage((prev) => [...prev, response.data.adminChat]);
            setFormData({ message: '', file: null });
            setFile(null);
            setPreview(null);
            setPreviewType(null);
            fileRef.current.value = null;
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage('Tin nhắn đã được gửi.');
        } catch (err) {
            const errorMessages =
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                          .flat()
                          .join(' ')
                    : err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý chọn emoji
    const handleEmojiClick = (emojiData) => {
        setFormData((prev) => ({ ...prev, message: prev.message + emojiData.emoji }));
    };

    // Xử lý alert timeout
    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    if (isFetching) {
        return (
            <AdminLayout>
                <title>Chat</title>
                <div className="container p-4 rounded-3 admin-chat-container bg-dark">
                    <div className="text-center">
                        <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <title>Chat</title>
            <div className="container p-4 rounded-3 admin-chat-container bg-dark">
                {showAlert && (
                    <div className="alert position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1050 }}>
                        <Alert severity={alertType}>{alertMessage}</Alert>
                    </div>
                )}
                <div className="card chat-card shadow-sm border-0 h-100">
                    <div className="card-body overflow-auto h-100">
                        <div className="d-flex flex-column h-100">
                            <div className="flex-grow-1 overflow-auto d-flex flex-column gap-3">
                                {listMessage.map((message) => {
                                    const isMe = message.IdAdmin === adminId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                                        >
                                            <div
                                                className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                                            >
                                                {!isMe && (
                                                    <div className="d-flex align-items-center me-2">
                                                        {message.admin?.avatar ? (
                                                            <img
                                                                src={message.admin.avatar}
                                                                alt="Avatar"
                                                                className="rounded-circle avatar-ad"
                                                            />
                                                        ) : (
                                                            <div className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center avatar-ad-null">
                                                                {message.admin?.name?.charAt(0).toUpperCase() || 'A'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div
                                                    className="d-flex flex-column justify-content-start"
                                                    title={format(parseISO(message.created_at), 'HH:mm:ss dd/MM/yyyy')}
                                                >
                                                    {!isMe && (
                                                        <div className="text-white small mb-1">
                                                            {message.admin?.name || `Admin ${message.IdAdmin}`}
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`${
                                                            isMe ? 'bg-primary text-white' : 'bg-secondary text-white'
                                                        } rounded-4 px-3 py-2 message-content`}
                                                    >
                                                        {message.Message}
                                                        {message.FilePath && (
                                                            <div className="mt-2">
                                                                {message.FilePath.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i) ? (
                                                                    <img
                                                                        src={message.FilePath}
                                                                        alt="attachment"
                                                                        className="img-fluid rounded"
                                                                        style={{ maxHeight: '200px' }}
                                                                    />
                                                                ) : message.FilePath.match(/\.(mp4|mov|avi|mkv|wmv)$/i) ? (
                                                                    <video
                                                                        src={message.FilePath}
                                                                        controls
                                                                        className="w-100 rounded"
                                                                        style={{ maxHeight: '200px' }}
                                                                    />
                                                                ) : (
                                                                    <a
                                                                        href={message.FilePath}
                                                                        target="_blank"
                                                                        className="text-decoration-none"
                                                                    >
                                                                        <i className="bi bi-file-earmark-text fs-4 me-2"></i>
                                                                        {message.FilePath.split('/').pop()}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-300 small">
                                                        {message.reads?.length > 0 && (
                                                            <>
                                                                Đã xem bởi:{' '}
                                                                {message.reads.map((read, i) => (
                                                                    <span key={i} className="fw-bold">
                                                                        {read.admin?.name || `Admin ${read.IdAdmin}`}
                                                                        {i < message.reads.length - 1 ? ', ' : ''}
                                                                    </span>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    <div className="card-footer border-top-0 position-relative chat-card">
                        <form className="d-flex flex-column gap-2" encType="multipart/form-data" onSubmit={handleSend}>
                            {preview && (
                                <div className="w-100 border rounded p-2 bg-light position-relative">
                                    {previewType === 'image' && (
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    {previewType === 'video' && (
                                        <video
                                            src={preview}
                                            controls
                                            className="w-100 rounded"
                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    {previewType === 'file' && (
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-file-earmark-text fs-4 text-primary"></i>
                                            <span>{file?.name}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-close position-absolute top-0 end-0 m-2 text-white"
                                        onClick={handleRemoveFile}
                                    >
                                        XS
                                    </button>
                                </div>
                            )}

                            <div className="d-flex flex-column flex-lg-row align-items-stretch gap-2 w-100">
                                <div className="d-flex gap-2 align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-light border rounded-circle"
                                        title="Emoji"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <i className="bi bi-emoji-smile fs-5 text-warning"></i>
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileRef}
                                        className="d-none"
                                        onChange={handleFileChange}
                                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-light border rounded-circle"
                                        title="File"
                                        onClick={() => fileRef.current.click()}
                                    >
                                        <i className="bi bi-paperclip fs-5 text-secondary"></i>
                                    </button>
                                </div>

                                <div className="flex-fill">
                                    <input
                                        type="text"
                                        className="form-control rounded-pill shadow-sm w-100"
                                        placeholder="Nhập tin nhắn..."
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, message: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-pill d-flex align-items-center px-4 w-100"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send-fill me-2"></i> Gửi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {showEmojiPicker && (
                                <div className="position-absolute bottom-100 start-0 mb-2 z-3">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}