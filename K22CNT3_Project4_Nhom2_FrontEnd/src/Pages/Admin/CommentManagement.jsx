import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/css/Admin/CommentManagement.css';
import DetailsComment from '@/Components/Admin/Comment/DetailsComment';
import Swal from 'sweetalert2';

export default function CommentManagement() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [listComments, setListComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedComment, setSelectedComment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState([]);
    const itemsPerPage = 8;

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/listComment', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            console.log('Danh sách bình luận:', response.data);
            
            setListComments(response.data.comment || []);
            setUser(response.data.user || []);
            setLoading(false);
        } catch (error) {
            setError('Không thể tải danh sách bình luận. Vui lòng thử lại!');
            setLoading(false);
            console.error('Lỗi khi gọi API:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const filteredComments = listComments.filter((cmt) =>
        cmt?.truong?.TenTruong?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmt?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmt?.comment_details?.some((detail) =>
            detail?.Text?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalItems = filteredComments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentComments = filteredComments.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const confirmDelete = (id, e) => {
        e.preventDefault();
        const cmt = listComments.find((c) => c?.Id === id);

        if (!cmt) {
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage('Bình luận không tồn tại!');
            Swal.fire({
                title: 'Thất bại!',
                text: 'Bình luận không tồn tại.',
                icon: 'error',
                confirmButtonColor: '#d33',
            });
            return;
        }

        Swal.fire({
            title: `Bạn có chắc muốn xóa bình luận của "${cmt.users.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(cmt, e);
            }
        });
    };

    const handleConfirmDelete = async (cmt, e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/api/admin/deleteComment/${cmt.Id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListComments((prev) =>
                prev.filter((item) => item.Id !== cmt.Id)
            );
            Swal.fire({
                title: "Đã xóa!",
                text: response.data.message || `Bình luận của "${cmt.users.name}" đã được xóa.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(response.data.message || `Bình luận của "${cmt.users.name}" đã được xóa.`);
        } catch (error) {
            const errorMessages = error.response?.data?.errors
                ? Object.values(error.response.data.errors)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join(' ')
                : error.response?.data?.message || 'Có lỗi xảy ra';

            Swal.fire({
                title: "Thất bại!",
                text: `Không thể xóa bình luận của "${cmt.users.name}". ${errorMessages}`,
                icon: "error",
                confirmButtonColor: "#d33",
            });
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể xóa bình luận của "${cmt.users.name}". ${errorMessages}`);
        }
    };

    const handleToggleVisibility = async (cmt, e) => {
        e.stopPropagation();
        try {
            const newVisibility = cmt.Visibility === 'Public' ? 'Private' : 'Public';
            const response = await axios.post(`/api/admin/updateVisibilityComment/${cmt.Id}`, { Visibility: newVisibility }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListComments((prev) =>
                prev.map((item) =>
                    item.Id === cmt.Id ? { ...item, Visibility: newVisibility } : item
                )
            );
            Swal.fire({
                title: "Đã cập nhật!",
                text: `Bình luận của "${cmt.users.name}" đã được cập nhật.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(`Bình luận của "${cmt.users.name}" đã được cập nhật.`);
        } catch (error) {
            const errorMessages = error.response?.data?.errors
                ? Object.values(error.response.data.errors)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join(' ')
                : error.response?.data?.message || 'Có lỗi xảy ra';

            Swal.fire({
                title: "Thất bại!",
                text: `Không thể cập nhật bình luận của "${cmt.users.name}". ${errorMessages}`,
                icon: "error",
                confirmButtonColor: "#d33",
            });
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể cập nhật bình luận của "${cmt.users.name}". ${errorMessages}`);
        }
    };

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.comment', (e) => {
            const { isDeleted, comment, reply } = e;

            if (isDeleted === true && comment?.Id) {
                setListComments((prev) => prev.filter(item => item.Id !== comment.Id));
            } else if (comment?.Id) {
                setListComments((prev) => {
                    const index = prev.findIndex(item => item.Id === comment.Id);

                    if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = {
                            ...updated[index],
                            ...comment,
                            reply_to_comments: reply ?? updated[index].reply_to_comments,
                        };
                        return updated;
                    } else {
                        return [...prev, { ...comment, reply_to_comments: reply ?? [] }];
                    }
                });
            }
        }).error((err) =>
            console.error('[Echo subscription error]:', err)
        );

        return () => {
            window.Echo.leave('channel-admin');
        };
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <AdminLayout>
            <div className="container p-4 rounded-3" style={{ backgroundColor: "#343a40", minWidth: "100%" }}>
                <div className="mb-5">
                    {showAlert && (
                        <div className="alert">
                            <Alert severity={alertType}>{alertMessage}</Alert>
                        </div>
                    )}
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <h4 className="text-white text-uppercase mb-0">Danh sách bình luận</h4>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <div style={{ minWidth: '315px' }}>
                            <input
                                type="text"
                                className="form-control bg-dark text-white search-acc"
                                placeholder="Tìm kiếm theo tên trường, người dùng hoặc nội dung..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row g-3">
                        {currentComments.length > 0 ? (
                            currentComments.map((cmt) => (
                                <div className="col-12 col-sm-6 col-md-3 mb-4" key={cmt.Id}>
                                    <div className="card h-100 border-rounded d-flex flex-column admin-card">
                                        <div className="card-body d-flex flex-column p-3 bg-dark">
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h5 className="card-title text-white">{cmt.users.name}</h5>
                                            </div>
                                            <ul className="list-unstyled admin-info text-white">
                                                <li className="mb-2">
                                                    <i className="fas fa-university me-2 text-info"></i>
                                                    <strong>Trường:</strong> {cmt.truong.TenTruong}
                                                </li>
                                                <li className="mb-2">
                                                    <i className="fas fa-comment me-2 text-primary"></i>
                                                    <strong>Nội dung:</strong>
                                                    {cmt.comment_details.map((detail, index) => (
                                                        <span key={index}> {detail.Text}</span>
                                                    ))}
                                                </li>
                                                <li className="mb-2">
                                                    <i className="fas fa-clock me-2 text-warning"></i>
                                                    <strong>Ngày tạo:</strong> {new Date(cmt.CreateDate).toLocaleString()}
                                                </li>
                                                <li>
                                                    <i className="fas fa-eye me-2 text-success"></i>
                                                    <strong>Trạng thái:</strong>
                                                    <button
                                                        className={`badge rounded-pill border-0 px-3 py-1 text-white cursor-pointer ${cmt.Visibility === 'Public'
                                                                ? 'bg-success'
                                                                : cmt.Visibility === 'Private'
                                                                    ? 'bg-warning text-dark'
                                                                    : 'bg-secondary'
                                                            }`}
                                                        onClick={(e) => handleToggleVisibility(cmt, e)}
                                                    >
                                                        {cmt.Visibility}
                                                    </button>
                                                </li>
                                            </ul>
                                            <div className="mt-auto d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
                                                    onClick={() => setSelectedComment(cmt)}
                                                >
                                                    <i className="fas fa-eye me-1"></i> Chi tiết
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center"
                                                    onClick={(e) => confirmDelete(cmt.Id, e)}
                                                >
                                                    <i className="fas fa-trash-alt me-1"></i> Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-warning text-center bg-dark text-white border border-secondary rounded p-4">
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    Không tìm thấy bình luận phù hợp với tiêu chí tìm kiếm.
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedComment && (
                        <DetailsComment
                            comment={selectedComment}
                            user={user}
                            onClose={() => setSelectedComment(null)}
                            setListComments={setListComments}
                            setShowAlert={setShowAlert}
                            setAlertType={setAlertType}
                            setAlertMessage={setAlertMessage}
                        />
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-4">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(event, page) => setCurrentPage(page)}
                                color="primary"
                                renderItem={(item) => (
                                    <PaginationItem
                                        {...item}
                                        sx={{
                                            '&.Mui-selected': {
                                                backgroundColor: '#3085d6',
                                                color: '#fff',
                                            },
                                            '&:hover': {
                                                backgroundColor: '#555',
                                            },
                                            color: '#fff',
                                            backgroundColor: '#333',
                                            margin: '0 2px',
                                        }}
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}