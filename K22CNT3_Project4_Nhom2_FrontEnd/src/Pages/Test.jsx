import AdminLayout from '@/Layouts/AdminLayout';
import React, { useState } from 'react';

export default function Chat({ messages, adminId }) {
    const [listMessage, setListMessage] = useState(messages);
    console.log(listMessage);

    return (
        <AdminLayout>
            <div className="container" style={{ maxHeight: '100vh' }}>
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-body overflow-auto h-100">
                        <div className="d-flex flex-column h-100">
                            <div className="flex-grow-1 overflow-auto d-flex flex-column gap-3">
                                {listMessage.map((message, index) => {
                                    const isMe = message.IdAdmin === adminId;
                                    return (
                                        <div
                                            key={index}
                                            className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                                        >
                                            {!isMe && (
                                                message.admin?.avatar ? (
                                                    <img
                                                        src={message.admin.avatar}
                                                        alt="Avatar"
                                                        className="rounded-circle me-2"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-dark text-white me-2 d-flex justify-content-center align-items-center"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    >
                                                        {message.admin?.name?.charAt(0) || 'A'}
                                                    </div>
                                                )
                                            )}
                                            <div>
                                                {!isMe && (
                                                    <div className="text-muted small mb-1">
                                                        {message.admin?.name || 'Admin'}
                                                    </div>
                                                )}

                                                <div
                                                    className={`${isMe
                                                        ? 'bg-primary text-white rounded-start'
                                                        : 'bg-light text-dark rounded-end'
                                                        } px-3 py-2`}
                                                    style={{ maxWidth: '300px', wordBreak: 'break-word' }}
                                                >
                                                    {message.Message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        {
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type your message..."
                                />
                                <button className="btn btn-primary">Send</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
