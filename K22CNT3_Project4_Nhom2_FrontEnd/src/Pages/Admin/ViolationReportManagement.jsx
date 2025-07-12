import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import DetailsViolationReport from '@/Components/Admin/DetailsViolationReport';
import '../../assets/css/Admin/CategoryManagement.css';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ViolationReportManagement({ initialViolations }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [listViolations, setListViolations] = useState(initialViolations || []);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetails, setShowDetails] = useState(null);
    const [editViolation, setEditViolation] = useState(null);
    const [editFormData, setEditFormData] = useState({
        violation_type: '',
        description: '',
    });
    const [editErrors, setEditErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 8;
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            fetchViolations();
            isInitialMount.current = false;
        }
    }, []);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate]);

    const fetchViolations = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/admin/listViolationReport', {
                headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
            });
            setListViolations(
                response.data.violationReport.map((v) => ({
                    ...v,
                    resolved: v.resolved ? 'Active' : 'Inactive',
                })) || []
            );
        } catch (err) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải danh sách báo cáo vi phạm: ' + (err.response?.data?.message || 'Lỗi server'),
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredViolations = Array.isArray(listViolations)
        ? listViolations.filter((violation) => {
            const matchesSearch =
                violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                violation.violation_type.toLowerCase().includes(searchTerm.toLowerCase());
            const violationDate = new Date(violation.datetime).setHours(0, 0, 0, 0);
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
            const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
            const matchesDate = (!start || violationDate >= start) && (!end || violationDate <= end);
            return matchesSearch && matchesDate;
        })
        : [];

    const totalItems = filteredViolations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentViolations = filteredViolations.slice(startIndex, endIndex);

    const handleConfirmDelete = async (violation, e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.delete(`/api/admin/deleteViolationReport/${violation.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
            });
            setListViolations((prev) => prev.filter((item) => item.id !== violation.id));
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(`Báo cáo vi phạm "${violation.violation_type}" đã được xóa.`);
            Swal.fire({
                title: 'Đã xóa!',
                text: `Báo cáo vi phạm "${violation.violation_type}" đã được xóa.`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });
        } catch (err) {
            const errorMessages = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message || 'Không thể xóa báo cáo';
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể xóa báo cáo "${violation.violation_type}". ${errorMessages}`);
            Swal.fire({
                title: 'Thất bại!',
                text: `Không thể xóa báo cáo "${violation.violation_type}". ${errorMessages}`,
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, e) => {
        e.preventDefault();
        const violation = listViolations.find((v) => v.id === id);
        if (!violation) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không tìm thấy báo cáo vi phạm.',
                icon: 'error',
                confirmButtonColor: '#d33',
            });
            return;
        }

        Swal.fire({
            title: `Xác nhận cập nhật trạng thái "${violation.violation_type}"?`,
            text: `Trạng thái sẽ được đổi thành "${violation.resolved === 'Active' ? 'Inactive' : 'Active'}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    const response = await axios.post(
                        `/api/admin/updateResolved/${id}`,
                        { resolved: violation.resolved === 'Active' ? 'Inactive' : 'Active' },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
                    );
                    setListViolations((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, resolved: response.data.violationReport?.resolved || (violation.resolved === 'Active' ? 'Inactive' : 'Active'), updated_at: new Date().toISOString() }
                                : item
                        )
                    );
                    setShowAlert(true);
                    setAlertType('success');
                    setAlertMessage(`Trạng thái báo cáo "${violation.violation_type}" đã được cập nhật.`);
                    Swal.fire({
                        title: 'Cập nhật thành công!',
                        text: `Trạng thái báo cáo "${violation.violation_type}" đã được cập nhật.`,
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                    });
                } catch (err) {
                    const errorMessages = err.response?.data?.errors
                        ? Object.values(err.response.data.errors).flat().join(' ')
                        : err.response?.data?.message || 'Không thể cập nhật trạng thái';
                    setShowAlert(true);
                    setAlertType('error');
                    setAlertMessage(`Không thể cập nhật trạng thái báo cáo "${violation.violation_type}". ${errorMessages}`);
                    Swal.fire({
                        title: 'Thất bại!',
                        text: `Không thể cập nhật trạng thái báo cáo "${violation.violation_type}". ${errorMessages}`,
                        icon: 'error',
                        confirmButtonColor: '#d33',
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleEditViolation = (violation) => {
        setEditViolation(violation);
        setEditFormData({
            violation_type: violation.violation_type,
            description: violation.description,
        });
        setEditErrors({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateEditForm = () => {
        const newErrors = {};
        if (!editFormData.violation_type.trim()) newErrors.violation_type = 'Loại vi phạm là bắt buộc';
        if (!editFormData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateEditForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post(
                `/api/admin/updateResolved/${editViolation.id}`,
                editFormData,
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            setListViolations((prev) =>
                prev.map((item) =>
                    item.id === editViolation.id
                        ? { ...item, ...editFormData, updated_at: new Date().toISOString() }
                        : item
                )
            );
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(`Báo cáo vi phạm "${editFormData.violation_type}" đã được cập nhật.`);
            Swal.fire({
                title: 'Cập nhật thành công!',
                text: `Báo cáo vi phạm "${editFormData.violation_type}" đã được cập nhật.`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });
            setEditViolation(null);
            setEditFormData({ violation_type: '', description: '' });
        } catch (err) {
            const errorMessages = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : err.response?.data?.message || 'Không thể cập nhật báo cáo';
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể cập nhật báo cáo "${editFormData.violation_type}". ${errorMessages}`);
            Swal.fire({
                title: 'Thất bại!',
                text: `Không thể cập nhật báo cáo "${editFormData.violation_type}". ${errorMessages}`,
                icon: 'error',
                confirmButtonColor: '#d33',
            });
            setEditErrors(err.response?.data?.errors || {});
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseEditModal = () => {
        setEditViolation(null);
        setEditFormData({ violation_type: '', description: '' });
        setEditErrors({});
    };

    useEffect(() => {
        const channel = window.Echo?.channel('channel-admin');
        if (channel) {
            channel.listen('.admin.violationReport', (e) => {
                const { type, violationReport } = e;
                if (!violationReport || !violationReport.id) {
                    console.warn('Dữ liệu không hợp lệ từ WebSocket:', violationReport);
                    return;
                }
                setListViolations((prev) => {
                    const currentList = Array.isArray(prev) ? prev : [];
                    if (type === 'Add') {
                        const exists = currentList.some((item) => item.id === violationReport.id);
                        if (exists) return currentList;
                        return [{ ...violationReport, resolved: violationReport.resolved ? 'Active' : 'Inactive' }, ...currentList];
                    }
                    if (type === 'Update') {
                        return currentList.map((item) => {
                            if (item.id === violationReport.id) {
                                const currentUpdatedAt = new Date(item.updated_at || 0);
                                const newUpdatedAt = new Date(violationReport.updated_at || 0);
                                if (newUpdatedAt >= currentUpdatedAt) {
                                    return { ...item, ...violationReport, resolved: violationReport.resolved ? 'Active' : 'Inactive' };
                                }
                            }
                            return item;
                        });
                    }
                    if (type === 'Delete') {
                        return currentList.filter((item) => item.id !== violationReport.id);
                    }
                    return currentList;
                });
            }).error((err) => console.error('[Echo subscription error]:', err));
            return () => window.Echo?.leave('channel-admin');
        }
    }, []);

    return (
        <AdminLayout>
            <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
                <div className="mb-5">
                    {showAlert && (
                        <div className="alert">
                            <Alert severity={alertType}>{alertMessage}</Alert>
                        </div>
                    )}
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <h4 className="text-white text-uppercase mb-0">Danh sách báo cáo vi phạm</h4>
                    </div>

                    <div className="mb-4 p-3 rounded bg-dark border border-secondary-subtle">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="searchContent" className="form-label text-white">
                                    Tìm kiếm báo cáo
                                </label>
                                <input
                                    type="text"
                                    id="searchContent"
                                    className="form-control bg-dark text-white border-secondary btn-srch"
                                    placeholder="Nhập loại vi phạm hoặc mô tả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center text-white mb-4">
                            <i className="fas fa-spinner fa-spin me-2"></i>Đang tải...
                        </div>
                    )}

                    <div className="row g-3">
                        {currentViolations.length > 0 ? (
                            currentViolations.map((violation) => (
                                <div className="col-12 col-sm-6 col-md-3 mb-4" key={violation.id}>
                                    <div className="card h-100 border-rounded d-flex flex-column admin-card">
                                        <div className="card-body d-flex flex-column p-3 bg-dark">
                                            <ul className="list-unstyled admin-info text-white">
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-clock me-2" style={{ color: '#f57c00' }}></i>
                                                    <strong>Thời gian:</strong> {new Date(violation.datetime).toLocaleString()}
                                                </li>
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-user me-2" style={{ color: '#4caf50' }}></i>
                                                    <strong>Người vi phạm:</strong> ID {violation.user_id}
                                                </li>
                                                <li className="mb-2">
                                                    <i
                                                        className="fa-regular fa-exclamation-circle me-2"
                                                        style={{ color: violation.resolved === 'Active' ? '#388e3c' : '#d32f2f' }}
                                                    ></i>
                                                    <strong>Trạng thái:</strong>
                                                    <button
                                                        className={`btn btn-sm ${violation.resolved === 'Active' ? 'btn-success' : 'btn-warning'} ms-2`}
                                                        onClick={(e) => handleUpdateStatus(violation.id, e)}
                                                        disabled={isLoading}
                                                    >
                                                        {violation.resolved === 'Active' ? 'Đã xử lý' : 'Chưa xử lý'}
                                                    </button>
                                                </li>
                                            </ul>
                                            <div className="mt-auto d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary w-33 d-flex align-items-center justify-content-center"
                                                    onClick={() => setShowDetails(violation)}
                                                    disabled={isLoading}
                                                >
                                                    <i className="fas fa-eye me-1"></i> Chi tiết
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-33 d-flex align-items-center justify-content-center"
                                                    onClick={(e) =>
                                                        Swal.fire({
                                                            title: `Bạn có chắc muốn xóa báo cáo "${violation.violation_type}"?`,
                                                            text: 'Hành động này không thể hoàn tác!',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#6c757d',
                                                            confirmButtonText: 'Xác nhận xóa',
                                                            cancelButtonText: 'Hủy',
                                                        }).then((result) => {
                                                            if (result.isConfirmed) handleConfirmDelete(violation, e);
                                                        })
                                                    }
                                                    disabled={isLoading}
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
                                    Không tìm thấy báo cáo vi phạm phù hợp với tiêu chí tìm kiếm.
                                </div>
                            </div>
                        )}
                    </div>

                    {showDetails && (
                        <DetailsViolationReport violation={showDetails} onClose={() => setShowDetails(null)} />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}