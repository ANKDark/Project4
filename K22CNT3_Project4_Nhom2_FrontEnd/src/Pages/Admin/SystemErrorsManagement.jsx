import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../../assets/css/Admin/CategoryManagement.css';
import Swal from 'sweetalert2';
import DetailsSystemError from '@/Components/Admin/DetailsSystemError';

export default function SystemErrorsManagement() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [listErrors, setListErrors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetails, setShowDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 8;
    const isInitialMount = useRef(true);

    const fetchSystemErrors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/listSystemError', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListErrors(response.data.systemError || []);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải danh sách lỗi hệ thống. Vui lòng thử lại!');
            setLoading(false);
            console.error('Lỗi khi gọi API:', err);
        }
    };

    useEffect(() => {
        fetchSystemErrors();
    }, []);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const filteredErrors = Array.isArray(listErrors)
        ? listErrors.filter((error) => {
              const matchesSearch = error.name.toLowerCase().includes(searchTerm.toLowerCase());
              
              const errorDate = new Date(error.error_time).setHours(0, 0, 0, 0);
              const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
              const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

              const matchesDate =
                  (!start || errorDate >= start) &&
                  (!end || errorDate <= end);

              return matchesSearch && matchesDate;
          })
        : [];

    const totalItems = filteredErrors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentErrors = filteredErrors.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate]);

    const confirmDelete = (id, e) => {
        e.preventDefault();
        const error = listErrors.find((err) => err.id === id);

        if (!error) {
            Swal.fire({
                title: "Lỗi!",
                text: "Không tìm thấy lỗi hệ thống.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
            return;
        }

        Swal.fire({
            title: `Bạn có chắc muốn xóa lỗi "${error?.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(error, e);
            }
        });
    };

    const handleConfirmDelete = async (error, e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/api/admin/deleteSystemError/${error.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListErrors((prev) => prev.filter((item) => item.id !== error.id));
            Swal.fire({
                title: "Đã xóa!",
                text: response.data.message || `Lỗi hệ thống "${error.name}" đã được xóa.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(response.data.message || `Lỗi hệ thống "${error.name}" đã được xóa.`);
        } catch (err) {
            const errorMessages = err.response?.data?.errors
                ? Object.values(err.response.data.errors)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join(' ')
                : err.response?.data?.message || 'Có lỗi xảy ra';

            Swal.fire({
                title: "Thất bại!",
                text: `Không thể xóa lỗi "${error.name}". ${errorMessages}`,
                icon: "error",
                confirmButtonColor: "#d33",
            });
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể xóa lỗi "${error.name}". ${errorMessages}`);
        }
    };

    const handleUpdateStatus = async (id, e) => {
        e.preventDefault();
        const error = listErrors.find((err) => err.id === id);

        if (!error) {
            Swal.fire({
                title: "Lỗi!",
                text: "Không tìm thấy lỗi hệ thống.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
            return;
        }

        Swal.fire({
            title: `Xác nhận cập nhật trạng thái "${error.name}"?`,
            text: `Trạng thái sẽ được đổi thành "${error.is_fixed ? 'Chưa sửa' : 'Đã sửa'}"`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.post(`/api/admin/updateFixed/${id}`, {
                        is_fixed: !error.is_fixed,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        },
                    });
                    setListErrors((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, is_fixed: response.data.systemError?.is_fixed ?? !item.is_fixed, updated_at: response.data.systemError?.updated_at ?? new Date().toISOString() }
                                : item
                        )
                    );
                    Swal.fire({
                        title: "Cập nhật thành công!",
                        text: response.data.message || `Trạng thái lỗi "${error.name}" đã được cập nhật.`,
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                    });
                    setShowAlert(true);
                    setAlertType('success');
                    setAlertMessage(response.data.message || `Trạng thái lỗi "${error.name}" đã được cập nhật.`);
                } catch (err) {
                    const errorMessages = err.response?.data?.errors
                        ? Object.values(err.response.data.errors)
                            .flat()
                            .map((msg) => `${msg}`)
                            .join(' ')
                        : err.response?.data?.message || 'Có lỗi xảy ra';

                    Swal.fire({
                        title: "Thất bại!",
                        text: `Không thể cập nhật trạng thái lỗi "${error.name}". ${errorMessages}`,
                        icon: "error",
                        confirmButtonColor: "#d33",
                    });
                    setShowAlert(true);
                    setAlertType('error');
                    setAlertMessage(`Không thể cập nhật trạng thái lỗi "${error.name}". ${errorMessages}`);
                }
            }
        });
    };

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.systemError', (e) => {
            const { type, systemError } = e;
            console.log('[SỰ KIỆN SOCKET]:', e);

            if (!systemError || !systemError.id) {
                console.warn('Dữ liệu không hợp lệ từ WebSocket:', systemError);
                return;
            }

            setListErrors((prev) => {
                const currentList = Array.isArray(prev) ? prev : [];
                if (type === "Add") {
                    const exists = currentList.some(item => item.id === systemError.id);
                    if (exists) return currentList;
                    return [systemError, ...currentList];
                }

                if (type === "Update") {
                    return currentList.map(item => {
                        if (item.id === systemError.id) {
                            const currentUpdatedAt = new Date(item.updated_at || 0);
                            const newUpdatedAt = new Date(systemError.updated_at || 0);
                            if (newUpdatedAt >= currentUpdatedAt) {
                                return { ...item, ...systemError };
                            }
                        }
                        return item;
                    });
                }

                if (type === "Delete") {
                    return currentList.filter(item => item.id !== systemError.id);
                }

                return currentList;
            });
        }).error((err) =>
            console.error('[Lỗi kết nối Echo]:', err)
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
                        <h4 className="text-white text-uppercase mb-0">Danh sách lỗi hệ thống</h4>
                    </div>

                    <div className="mb-4 p-3 rounded bg-dark border border-secondary-subtle">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="searchContent" className="form-label text-white">
                                    Tìm kiếm lỗi
                                </label>
                                <input
                                    type="text"
                                    id="searchContent"
                                    className="form-control bg-dark text-white border-secondary btn-srch"
                                    placeholder="Nhập tên lỗi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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

                    <div className="row g-3">
                        {currentErrors.length > 0 ? (
                            currentErrors.map((error) => (
                                <div className="col-12 col-sm-6 col-md-3 mb-4" key={error.id}>
                                    <div className="card h-100 border-rounded d-flex flex-column admin-card">
                                        <div className="card-body d-flex flex-column p-3 bg-dark">
                                            <ul className="list-unstyled admin-info text-white">
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-clock me-2" style={{ color: '#f57c00' }}></i>
                                                    <strong>Thời gian lỗi:</strong> {new Date(error.error_time).toLocaleString()}
                                                </li>
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-microchip me-2" style={{ color: '#4caf50' }}></i>
                                                    <strong>Hệ điều hành:</strong> {error.os || 'Không xác định'}
                                                </li>
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-check-circle me-2" style={{ color: error.is_fixed ? '#388e3c' : '#d32f2f' }}></i>
                                                    <strong>Trạng thái:</strong>
                                                    <button
                                                        className={`btn btn-sm ${error.is_fixed ? 'btn-success' : 'btn-warning'} ms-2`}
                                                        onClick={(e) => handleUpdateStatus(error.id, e)}
                                                    >
                                                        {error.is_fixed ? 'Đã sửa' : 'Chưa sửa'}
                                                    </button>
                                                </li>
                                            </ul>
                                            <div className="mt-auto d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
                                                    onClick={() => setShowDetails(error)}
                                                >
                                                    <i className="fas fa-eye me-1"></i> Chi tiết
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center"
                                                    onClick={(e) => confirmDelete(error.id, e)}
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
                                <div className="text-center bg-dark text-white border border-secondary rounded p-4">
                                    <i className="fas fa-exclamation-circle me-2" style={{ color: '#f57c00' }}></i>
                                    Không tìm thấy lỗi hệ thống phù hợp với tiêu chí tìm kiếm.
                                </div>
                            </div>
                        )}
                    </div>

                    {showDetails && (
                        <DetailsSystemError
                            error={showDetails}
                            onClose={() => setShowDetails(null)}
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