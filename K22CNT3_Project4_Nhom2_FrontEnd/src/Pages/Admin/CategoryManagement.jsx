import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/css/Admin/CategoryManagement.css';
import AddCategory from '@/Components/Admin/Category/AddCategory';
import Swal from 'sweetalert2';
import EditCategory from '@/Components/Admin/Category/EditCategory';

export default function CategoryManagement() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [listCategory, setListCategory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 8;

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/listCategory', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListCategory(response.data.categories || []);
            setLoading(false);
        } catch (error) {
            setError('Không thể tải danh sách danh mục. Vui lòng thử lại!');
            setLoading(false);
            console.error('Lỗi khi gọi API:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = listCategory.filter((cate) =>
        cate.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredCategories.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const confirmDelete = (id, e) => {
        e.preventDefault();
        const cate = listCategory.find((u) => u.IdCategory === id);

        Swal.fire({
            title: `Bạn có chắc muốn xóa "${cate?.CategoryName}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(cate, e);
            }
        });
    };

    const handleConfirmDelete = async (cate, e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/api/admin/deleteCategory/${cate.IdCategory}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            setListCategory((prev) =>
                prev.filter((item) => item.IdCategory !== cate.IdCategory)
            );
            Swal.fire({
                title: "Đã xóa!",
                text: response.data.message || `Danh mục "${cate.CategoryName}" đã được xóa.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(response.data.message || `Danh mục "${cate.CategoryName}" đã được xóa.`);
        } catch (error) {
            const errorMessages = error.response?.data?.errors
                ? Object.values(error.response.data.errors)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join(' ')
                : error.response?.data?.message || 'Có lỗi xảy ra';

            Swal.fire({
                title: "Thất bại!",
                text: `Không thể xóa danh mục "${cate.CategoryName}". ${errorMessages}`,
                icon: "error",
                confirmButtonColor: "#d33",
            });
            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Không thể xóa danh mục "${cate.CategoryName}". ${errorMessages}`);
        }
    };

     useEffect(() => {
      const channel = window.Echo.channel('channel-admin');

      channel.listen('.admin.category', (e) => {
             const { type, category } = e;
             console.log('[SOCKET EVENT]:', e);

             if (!category || !category.IdCategory) {
                console.warn('Dữ liệu không hợp lệ từ WebSocket:', category);
                 return;
             }

             setListCategory((prev) => {
                 if (type === "Add") {
                     const exists = prev.some(item => item.IdCategory === category.IdCategory);
                     if (exists) return prev;
                     return [category, ...prev];
                 }

                 if (type === "Update") {
                     return prev.map(item =>
                         item.IdCategory === category.IdCategory ? category : item
                     );
                 }

                 if (type === "Delete") {
                     return prev.filter(item =>
                         item.IdCategory !== category.IdCategory
                     );
                }

                return prev;
            });
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
                        <h4 className="text-white text-uppercase mb-0">Danh sách danh mục</h4>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <div style={{ minWidth: '315px' }}>
                            <input
                                type="text"
                                className="form-control bg-dark text-white search-acc"
                                placeholder="Tìm kiếm theo tên danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="input-group w-auto d-flex flex-wrap align-items-center">
                            <button
                                className="btn btn-info bg-success text-white btn-addAcc"
                                type="button"
                                onClick={() => setShowAddCategory(true)}
                            >
                                Thêm mới
                            </button>
                        </div>
                    </div>

                    <div className="row g-3">
                        {currentCategories.length > 0 ? (
                            currentCategories.map((cate) => (
                                <div className="col-12 col-sm-6 col-md-3 mb-4" key={cate.IdCategory}>
                                    <div className="card h-100 border-rounded d-flex flex-column admin-card">
                                        <div className="card-body d-flex flex-column p-3 bg-dark">
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <h5 className="card-title text-white">{cate.CategoryName}</h5>
                                            </div>
                                            <ul className="list-unstyled admin-info text-white">
                                                <li className="mb-2">
                                                    <i className="fa-regular fa-subtitles me-2 text-primary"></i>
                                                    <strong>Mô tả:</strong> {cate.Description || 'Không có mô tả'}
                                                </li>
                                            </ul>
                                            <div className="mt-auto d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
                                                    onClick={() => setShowEditCategory(cate)}
                                                >
                                                    <i className="fas fa-edit me-1"></i> Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center"
                                                    onClick={(e) => confirmDelete(cate.IdCategory, e)}
                                                >
                                                    <i className="fas fa-trash-alt me-1"></i> Xoá
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
                                    Không tìm thấy danh mục phù hợp với tiêu chí tìm kiếm.
                                </div>
                            </div>
                        )}
                    </div>

                    {showAddCategory && (
                        <AddCategory
                            onCancel={() => setShowAddCategory(false)}
                            setShowAlert={setShowAlert}
                            setAlertType={setAlertType}
                            setAlertMessage={setAlertMessage}
                        />
                    )}

                    {showEditCategory && (
                        <EditCategory
                            category={showEditCategory}
                            onCancel={() => setShowEditCategory(null)}
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