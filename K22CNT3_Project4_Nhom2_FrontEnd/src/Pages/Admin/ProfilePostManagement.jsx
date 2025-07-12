import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import '../../assets/css/Admin/ProfilePostManagement.css';
import Swal from 'sweetalert2';
import { Alert } from '@mui/material';

export default function ProfilePostManagement() {
    const [searchContent, setSearchContent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [posts, setPosts] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/admin/listProfilePost', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                    timeout: 10000,
                });
                setPosts(response.data.profilePost || []);
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể tải danh sách bài đăng. Vui lòng thử lại.';
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(errorMessages);
            } finally {
                setIsFetching(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.profilepost', (e) => {
            const { isDeleted, post } = e;

            if (isDeleted && post?.Id) {
                setPosts((prev) => prev.filter((item) => item.Id !== post.Id));
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(`Bài đăng ID ${post.Id} đã được xóa bởi admin khác.`);
            } else if (post?.Id) {
                setPosts((prev) => {
                    const index = prev.findIndex((item) => item.Id === post.Id);
                    if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = { ...post };
                        return updated;
                    } else {
                        return [post, ...prev];
                    }
                });
                setShowAlert(true);
                setAlertType('info');
                setAlertMessage(`Bài đăng ID ${post.Id} đã được ${index !== -1 ? 'cập nhật' : 'thêm mới'}.`);
            }
        });

        channel.listen('.admin.commentpost', (e) => {
            const { isDeleted, comment, postId } = e;

            if (isDeleted && comment?.Id) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: post.comment_post.filter((c) => c.Id !== comment.Id),
                              }
                            : post
                    )
                );
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(`Bình luận ID ${comment.Id} đã được xóa bởi admin khác.`);
            } else if (comment?.Id && postId) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: [
                                      ...post.comment_post.filter((c) => c.Id !== comment.Id),
                                      comment,
                                  ],
                              }
                            : post
                    )
                );
                setShowAlert(true);
                setAlertType('info');
                setAlertMessage(`Bình luận ID ${comment.Id} đã được thêm mới.`);
            }
        });

        channel.listen('.admin.replycommentpost', (e) => {
            const { isDeleted, reply, postId, commentId } = e;

            if (isDeleted && reply?.id) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: post.comment_post.map((comment) =>
                                      comment.Id === commentId
                                          ? {
                                                ...comment,
                                                comment_post_details_reply: comment.comment_post_details_reply.filter(
                                                    (r) => r.id !== reply.id
                                                ),
                                            }
                                          : comment
                                  ),
                              }
                            : post
                    )
                );
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(`Trả lời ID ${reply.id} đã được xóa bởi admin khác.`);
            } else if (reply?.id && postId && commentId) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: post.comment_post.map((comment) =>
                                      comment.Id === commentId
                                          ? {
                                                ...comment,
                                                comment_post_details_reply: [
                                                    ...comment.comment_post_details_reply.filter((r) => r.id !== reply.id),
                                                    reply,
                                                ],
                                            }
                                          : comment
                                  ),
                              }
                            : post
                    )
                );
                setShowAlert(true);
                setAlertType('info');
                setAlertMessage(`Trả lời ID ${reply.id} đã được thêm mới.`);
            }
        }).error((err) => console.error('[Echo subscription error]:', err));

        return () => {
            window.Echo.leave('channel-admin');
        };
    }, []);

    const handleDeletePost = async (Id, e) => {
        e.preventDefault();
        const prrfPost = posts.find((c) => c.Id === Id);

        const result = await Swal.fire({
            title: `Bạn có chắc muốn xóa bài đăng của "${prrfPost?.users.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axios.delete(`/api/admin/deletePrfPost/${prrfPost.Id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                    timeout: 10000,
                });

                setPosts((prev) => prev.filter((item) => item.Id !== prrfPost.Id));
                Swal.fire({
                    title: "Đã xóa!",
                    text: response.data.message || `Bài đăng của "${prrfPost.users.name}" đã được xóa.`,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                });
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(response.data.message || `Bài đăng của "${prrfPost.users.name}" đã được xóa.`);
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể xóa bài đăng. Vui lòng thử lại.';
                Swal.fire({
                    title: "Thất bại!",
                    text: `Không thể xóa bài đăng của "${prrfPost.users.name}". ${errorMessages}`,
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(`Không thể xóa bài đăng của "${prrfPost.users.name}". ${errorMessages}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteComment = async (postId, commentId, e) => {
        e.preventDefault();
        const post = posts.find((p) => p.Id === postId);
        const comment = post?.comment_post.find((c) => c.Id === commentId);

        const result = await Swal.fire({
            title: `Bạn có chắc muốn xóa bình luận của "${comment?.users.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axios.delete(`/api/admin/deleteCommentPost/${comment.Id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                    timeout: 10000,
                });

                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: post.comment_post.filter((c) => c.Id !== comment.Id),
                              }
                            : post
                    )
                );
                Swal.fire({
                    title: "Đã xóa!",
                    text: response.data.message || `Bình luận của "${comment.users.name}" đã được xóa.`,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                });
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(response.data.message || `Bình luận của "${comment.users.name}" đã được xóa.`);
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể xóa bình luận. Vui lòng thử lại.';
                Swal.fire({
                    title: "Thất bại!",
                    text: `Không thể xóa bình luận của "${comment.users.name}". ${errorMessages}`,
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(`Không thể xóa bình luận của "${comment.users.name}". ${errorMessages}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteReply = async (postId, commentId, replyId, e) => {
        e.preventDefault();
        const post = posts.find((p) => p.Id === postId);
        const comment = post?.comment_post.find((c) => c.Id === commentId);
        const reply = comment?.comment_post_details_reply.find((r) => r.id === replyId);

        const result = await Swal.fire({
            title: `Bạn có chắc muốn xóa trả lời của "${reply?.user?.name || 'Ẩn danh'}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axios.delete(`/api/admin/deleteReplyCommentPost/${reply.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                    timeout: 10000,
                });

                setPosts((prev) =>
                    prev.map((post) =>
                        post.Id === postId
                            ? {
                                  ...post,
                                  comment_post: post.comment_post.map((comment) =>
                                      comment.Id === commentId
                                          ? {
                                                ...comment,
                                                comment_post_details_reply: comment.comment_post_details_reply.filter(
                                                    (r) => r.id !== reply.id
                                                ),
                                            }
                                          : comment
                                  ),
                              }
                            : post
                    )
                );
                Swal.fire({
                    title: "Đã xóa!",
                    text: response.data.message || `Trả lời của "${reply.user?.name || 'Ẩn danh'}" đã được xóa.`,
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                });
                setShowAlert(true);
                setAlertType('success');
                setAlertMessage(response.data.message || `Trả lời của "${reply.user?.name || 'Ẩn danh'}" đã được xóa.`);
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể xóa trả lời bình luận. Vui lòng thử lại.';
                Swal.fire({
                    title: "Thất bại!",
                    text: `Không thể xóa trả lời của "${reply.user?.name || 'Ẩn danh'}". ${errorMessages}`,
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(`Không thể xóa trả lời của "${reply.user?.name || 'Ẩn danh'}". ${errorMessages}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredPosts = posts?.filter((post) => {
        const postDate = new Date(post.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const matchesContent = post.Content.toLowerCase().includes(searchContent.toLowerCase());
        const matchesDate =
            (!start || postDate >= start) &&
            (!end || postDate <= new Date(end.setHours(23, 59, 59, 999)));

        return matchesContent && matchesDate;
    });

    if (isFetching) {
        return (
            <AdminLayout>
                <title>Quản lý bài đăng</title>
                <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
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
            <title>Quản lý bài đăng</title>
            <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
                {showAlert && (
                    <div className="alert">
                        <Alert severity={alertType}>{alertMessage}</Alert>
                    </div>
                )}
                <div className="mb-5">
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <h4 className="text-white text-uppercase mb-0">Quản lý bài đăng</h4>
                    </div>

                    <div className="mb-4 p-3 rounded bg-dark border border-secondary-subtle">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="searchContent" className="form-label text-white">
                                    Tìm kiếm bài đăng
                                </label>
                                <input
                                    type="text"
                                    id="searchContent"
                                    className="form-control bg-dark text-white border-secondary btn-srch"
                                    placeholder="Nhập nội dung bài đăng..."
                                    value={searchContent}
                                    onChange={(e) => setSearchContent(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="startDate" className="form-label text-white">
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="form-control bg-dark text-white border-secondary btn-selectedDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="endDate" className="form-label text-white">
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="form-control bg-dark text-white border-secondary btn-selectedDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {filteredPosts && filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <div key={index} className="card card-post mb-3">
                                <div className="card-head d-flex align-items-center">
                                    <img
                                        src={`http://127.0.0.1:8000${post.users.profile_photo_path}` || '/default-avatar.png'}
                                        alt={post.users.name}
                                        className="rounded-circle me-2"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h5 className="mb-0">{post.users.name}</h5>
                                        <small className="text-gray-500 dark:text-gray-400">
                                            {new Date(post.created_at).toLocaleString('vi-VN')}
                                        </small>
                                    </div>
                                </div>
                                <div className="card-body-post">
                                    <p className="card-text">{post.Content}</p>
                                    {post.Image && (
                                        <img
                                            src={`http://127.0.0.1:8000${post.Image}`}
                                            alt="Post image"
                                            className="img-fluid rounded mb-3 d-block mx-auto"
                                            style={{ maxHeight: '300px', objectFit: 'contain' }}
                                        />
                                    )}
                                    <div className="d-flex justify-content-between text-gray-400 dark:text-gray-300">
                                        <small>
                                            <strong>Trạng thái:</strong> {post.Status === 1 ? 'Công khai' : 'Ẩn'}
                                        </small>
                                        <small>
                                            <strong>Cập nhật:</strong>{' '}
                                            {new Date(post.updated_at).toLocaleString('vi-VN')}
                                        </small>
                                    </div>
                                </div>
                                <div className="card-comment">
                                    <h6>Bình luận ({post.comment_post.length})</h6>
                                    {post.comment_post.length > 0 ? (
                                        <div className="comment-list group-comment">
                                            {post.comment_post.map((comment, commentIndex) => (
                                                <div key={commentIndex} className="comment-item mb-3">
                                                    <div className="d-flex align-items-start">
                                                        <div className="me-2">
                                                            <img
                                                                src={`http://127.0.0.1:8000${comment.users.profile_photo_path}` || '/default-avatar.png'}
                                                                alt="avatar"
                                                                className="rounded-circle"
                                                                width="40"
                                                                height="40"
                                                            />
                                                        </div>
                                                        <div className="comment-content p-2 rounded w-100">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <strong>{comment.users.name}</strong>
                                                                    <p className="mb-1">{comment.comment_post_details[0]?.Text || 'Không có nội dung'}</p>
                                                                    <small className="text-gray-200">
                                                                        {new Date(comment.CreateDate).toLocaleString('vi-VN')} | {comment.Visibility}
                                                                    </small>
                                                                </div>
                                                                <button
                                                                    className="btn btn-outline-danger btn-xs"
                                                                    onClick={(e) => handleDeleteComment(post.Id, comment.Id, e)}
                                                                    disabled={isLoading}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>

                                                            {comment.comment_post_details.length > 1 && (
                                                                <div className="mt-2">
                                                                    {comment.comment_post_details.slice(1).map((detail, detailIndex) => (
                                                                        <div key={detailIndex} className="p-2 rounded mb-1 border">
                                                                            <p className="mb-1">{detail.Text}</p>
                                                                            <small className="text-gray-200">
                                                                                {new Date(detail.CreateDate).toLocaleString('vi-VN')}
                                                                            </small>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {comment.comment_post_details_reply.length > 0 ? (
                                                                <div className="reply-list mt-2">
                                                                    {comment.comment_post_details_reply.map((reply, replyIndex) => (
                                                                        <div key={replyIndex} className="d-flex align-items-start mb-2 ms-3">
                                                                            <div className="me-2">
                                                                                <img
                                                                                    src={`http://127.0.0.1:8000${reply.user?.profile_photo_path}` || '/default-avatar.png'}
                                                                                    alt="avatar"
                                                                                    className="rounded-circle"
                                                                                    width="32"
                                                                                    height="32"
                                                                                />
                                                                            </div>
                                                                            <div className="reply-content p-2 rounded w-100 border">
                                                                                <div className="d-flex justify-content-between">
                                                                                    <div>
                                                                                        <strong>{reply.user?.name || 'Ẩn danh'}</strong>
                                                                                        <p className="mb-1">{reply.Text}</p>
                                                                                        <small className="text-gray-200">
                                                                                            {new Date(reply.CreateDate).toLocaleString('vi-VN')}
                                                                                        </small>
                                                                                    </div>
                                                                                    <button
                                                                                        className="btn btn-outline-danger btn-xs"
                                                                                        onClick={(e) => handleDeleteReply(post.Id, comment.Id, reply.id, e)}
                                                                                        disabled={isLoading}
                                                                                    >
                                                                                        Xóa
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-gray-100 mt-2 ms-3">Chưa có trả lời bình luận</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Chưa có bình luận</p>
                                    )}
                                    <h6 className="mt-3">Tương tác ({post.interaction_post.length})</h6>
                                    {post.interaction_post.length > 0 ? (
                                        <ul className="list-group list-group-flush">
                                            {post.interaction_post.map((interaction, interactionIndex) => (
                                                <div
                                                    key={interactionIndex}
                                                    className="interaction-item py-2 px-3 mb-2 rounded bg-dark text-light border border-secondary-subtle"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong className="me-1">Người dùng:</strong>
                                                            <span>{post.users.name}</span>
                                                        </div>
                                                        <div>
                                                            <strong className="me-1">Loại:</strong>
                                                            <span>{interaction.Like_or_Dislike === 1 ? 'Thích' : 'Không thích'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Chưa có tương tác</p>
                                    )}
                                </div>
                                <div className="card-footer d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={(e) => handleDeletePost(post.Id, e)}
                                        disabled={isLoading}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="alert alert-info">Không có bài đăng nào để hiển thị.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}