import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function DetailsComment({ comment, onClose, setListComments, setShowAlert, setAlertType, setAlertMessage, user }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [replies, setReplies] = useState(comment.reply_to_comments || []);

    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const handleDeleteReply = async (reply, e) => {
        e.preventDefault();
        const replyUserName = user.find(u => u.id === reply.IdUser)?.name || `Người dùng ${reply.IdUser}`;
        
        Swal.fire({
            title: `Bạn có chắc muốn xóa phản hồi của "${replyUserName}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`/api/admin/deleteReplyComment/${reply.Id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        },
                    });
                    setReplies((prev) => prev.filter((r) => r.Id !== reply.Id));
                    if (setListComments) {
                        setListComments((prev) =>
                            prev.map((item) =>
                                item.Id === comment.Id
                                    ? { ...item, reply_to_comments: item.reply_to_comments.filter((r) => r.Id !== reply.Id) }
                                    : item
                            )
                        );
                    }
                    Swal.fire({
                        title: "Đã xóa!",
                        text: response.data.message || `Phản hồi của "${replyUserName}" đã được xóa.`,
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                    });
                    setShowAlert(true);
                    setAlertType('success');
                    setAlertMessage(response.data.message || `Phản hồi của "${replyUserName}" đã được xóa.`);
                } catch (error) {
                    const errorMessages = error.response?.data?.errors
                        ? Object.values(error.response.data.errors)
                            .flat()
                            .map((msg) => `${msg}`)
                            .join(' ')
                        : error.response?.data?.message || 'Có lỗi xảy ra';

                    Swal.fire({
                        title: "Thất bại!",
                        text: `Không thể xóa phản hồi của "${replyUserName}". ${errorMessages}`,
                        icon: "error",
                        confirmButtonColor: "#d33",
                    });
                    setShowAlert(true);
                    setAlertType('error');
                    setAlertMessage(`Không thể xóa phản hồi của "${replyUserName}". ${errorMessages}`);
                }
            }
        });
    };

    const filteredReplies = replies.filter((reply) => {
        const replyUser = user.find(u => u.id === reply.IdUser);
        const searchLower = searchTerm.toLowerCase();
        return (
            reply.Text.toLowerCase().includes(searchLower) ||
            (replyUser?.name || `Người dùng ${reply.IdUser}`).toLowerCase().includes(searchLower) ||
            (replyUser?.email || '').toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.replyToComment', (e) => {
            const { isDeleted, replyToComment } = e;

            if (!replyToComment?.Id || replyToComment.IdComment !== comment.Id) return;

            setReplies((prevReplies) => {
                let updatedReplies = [...prevReplies];

                if (isDeleted) {
                    updatedReplies = updatedReplies.filter((r) => r.Id !== replyToComment.Id);
                } else {
                    const index = updatedReplies.findIndex((r) => r.Id === replyToComment.Id);
                    if (index !== -1) {
                        updatedReplies[index] = { ...updatedReplies[index], ...replyToComment };
                    } else {
                        updatedReplies = [replyToComment, ...updatedReplies];
                    }
                }

                return updatedReplies;
            });

            if (setListComments) {
                setListComments((prev) =>
                    prev.map((item) => {
                        if (item.Id !== comment.Id) return item;

                        let updatedReplies = [...item.reply_to_comments];

                        if (isDeleted) {
                            updatedReplies = updatedReplies.filter((r) => r.Id !== replyToComment.Id);
                        } else {
                            const index = updatedReplies.findIndex((r) => r.Id === replyToComment.Id);
                            if (index !== -1) {
                                updatedReplies[index] = { ...updatedReplies[index], ...replyToComment };
                            } else {
                                updatedReplies = [replyToComment, ...updatedReplies];
                            }
                        }

                        return { ...item, reply_to_comments: updatedReplies };
                    })
                );
            }
        }).error((err) => console.error('[Lỗi kết nối Echo]:', err));

        return () => {
            window.Echo.leave('channel-admin');
        };
    }, [comment.Id, setListComments]);

    if (!comment) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-0">
                            <h5 className="modal-title w-100 text-center border-bottom">Bình luận của {comment.users.name}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-4 text-center m-0">
                                    <img
                                        src={`http://127.0.0.1:8000${comment.users.profile_photo_path || comment.truong.Img || '/storage/default-user.png'}`}
                                        alt={comment.users.name}
                                        className="img-fluid rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8 space-y-3">
                                    <p className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Trường: </span>
                                        <strong className="text-white">{comment.truong.TenTruong}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Người bình luận: </span>
                                        <strong className="text-blue-400 font-semibold">{comment.users.name} ( {comment.users.email} )</strong>
                                    </p>
                                    <div className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Nội dung: </span>
                                        <span className="text-white">
                                            {comment.comment_details.map((detail, index) => (
                                                <span key={index} className="inline-block mr-2">
                                                    {detail.Text}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                    <p className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Ngày tạo: </span>
                                        <strong className="text-white">{new Date(comment.CreateDate).toLocaleString()}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Số lượng tương tác: </span>
                                        <strong className="text-white">{comment.interactions.length}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <span className="text-gray-400">Số lượng phản hồi: </span>
                                        <strong className="text-white">{replies.length}</strong>
                                    </p>
                                </div>

                                {replies.length > 0 && (
                                    <div className="col-12">
                                        <h6 className="mt-3">Danh sách phản hồi:</h6>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white search-acc"
                                                placeholder="Tìm kiếm phản hồi theo tên, email hoặc nội dung..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-dark p-3 rounded" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {filteredReplies.length > 0 ? (
                                                filteredReplies.map((reply) => {
                                                    const replyUser = user.find(u => u.id === reply.IdUser);
                                                    return (
                                                        <div key={reply.Id} className="reply-main border border-secondary mb-3 d-flex align-items-center p-4 bg-dark rounded-4">
                                                            <div className="relative">
                                                                {replyUser?.profile_photo_path ? (
                                                                    <img
                                                                        src={`http://127.0.0.1:8000${replyUser.profile_photo_path}`}
                                                                        alt={replyUser.name}
                                                                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-md"
                                                                    />
                                                                ) : (
                                                                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-2xl shadow-md">
                                                                        <i className="fas fa-user"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-bold text-light text-base tracking-tight">
                                                                    {replyUser?.name || `Người dùng ${reply.IdUser}`}
                                                                </div>
                                                                <div className="text-xs text-gray-300 italic">
                                                                    {replyUser?.email || 'Không có email'}
                                                                </div>
                                                                <div className="text-sm text-gray-300 mt-1">{reply.Text}</div>
                                                                <div className="text-xs text-gray-400 mt-1">{new Date(reply.CreateDate).toLocaleString()}</div>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger mt-2"
                                                                    onClick={(e) => handleDeleteReply(reply, e)}
                                                                >
                                                                    <i className="fas fa-trash-alt me-1"></i> Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center text-gray-400">Không tìm thấy phản hồi phù hợp.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}