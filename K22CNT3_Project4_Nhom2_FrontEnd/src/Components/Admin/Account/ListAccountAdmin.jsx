import React, { useEffect, useState } from 'react';
import AddAccountAdmin from './Admin/AddAccountAdmin';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import EditAccountAdmin from './Admin/EditAccountAdmin';
import Swal from 'sweetalert2';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

export default function ListAccountAdmin({
    listAccountAdmins: lsad,
    currentAdmin,
    isSuperAdmin,
    adminSearch,
    setAdminSearch,
}) {
    const [searchTerm, setSearchTerm] = useState(adminSearch || '');
    const [filterOption, setFilterOption] = useState('all');
    const [showAddAccountAdmin, setShowAddAccountAdmin] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [listAccountAdmins, setListAccountAdmins] = useState(lsad || []);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 8;

    useEffect(() => {
        setListAccountAdmins(lsad || []);
    }, [lsad]);

    useEffect(() => {
        setSearchTerm(adminSearch || '');
    }, [adminSearch]);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const filteredAdmins = listAccountAdmins.filter((admin) => {
        const matchesSearch =
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = {
            all: true,
            active: admin.status === 1,
            inactive: admin.status !== 1,
            super_admin: admin.role === 1,
            admin: admin.role === 0,
        }[filterOption];

        return matchesSearch && matchesFilter;
    });

    const totalItems = filteredAdmins.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterOption]);

    const handleEdit = (adminId) => {
        const adminToEdit = listAccountAdmins.find((admin) => admin.id === adminId);
        if (adminToEdit) {
            setEditingAdmin(adminToEdit);
        }
    };

    const confirmDelete = (id, e) => {
        e.preventDefault();
        const admin = listAccountAdmins.find((u) => u.id === id);

        Swal.fire({
            title: `Bạn có chắc muốn xóa "${admin?.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(admin, e);
            }
        });
    };

    const handleConfirmDelete = async (admin, e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.delete(
                `http://127.0.0.1:8000/api/admin/deleteAdmin/${admin.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            Swal.fire({
                title: "Đã xóa!",
                text: response.data?.message || `Tài khoản "${admin.name}" đã được xóa.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });

            setListAccountAdmins((prev) => prev.filter((item) => item.id !== admin.id));
        } catch (error) {
            let message = `Không thể xóa tài khoản "${admin.name}".`;

            if (error.response?.data) {
                const err = error.response.data.errors || error.response.data;
                const errorMessages = Object.values(err)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join(' ');
                message += ` ${errorMessages}`;
            }

            Swal.fire({
                title: "Thất bại!",
                text: message,
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    const paginationItems = [];
    for (let page = 1; page <= totalPages; page++) {
        paginationItems.push(
            <PaginationItem
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
            >
                {page}
            </PaginationItem>
        );
    }

    useEffect(() => {
            const channel = window.Echo.channel('channel-admin');
    
            channel.listen('.admin.account', (e) => {
                const { adminAccounts, type } = e;
                setListAccountAdmins((prev) => {
                    if (!adminAccounts || !adminAccounts.id) return prev;
    
                    if (type === 'Add') {
                        return [adminAccounts, ...prev];
                    }
    
                    if (type === 'Update') {
                        return prev.map((item) =>
                            item.id === adminAccounts.id ? adminAccounts : item
                        );
                    }
    
                    if (type === 'Delete') {
                        return prev.filter((item) => item.id !== adminAccounts.id);
                    }
    
                    return prev;
                });
            })
                .error((error) => {
                    console.error('Echo subscription error:', error);
                });
    
            return () => {
                window.Echo.leave('channel-admin');
            };
        }, []);

    return (
        <div className="mb-5">
            {showAlert && (
                <div className="alert">
                    <Alert severity={alertType}>{alertMessage}</Alert>
                </div>
            )}
            <div className="d-flex justify-content-center align-items-center mb-3">
                <h4 className="text-white text-uppercase mb-0">Tài khoản Admin</h4>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div style={{ minWidth: '315px' }}>
                    <input
                        type="text"
                        className="form-control bg-dark text-white search-acc"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setAdminSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="input-group w-auto d-flex flex-wrap align-items-center">
                    <button
                        className="btn btn-info bg-success text-white btn-addAcc"
                        type="button"
                        id="inputGroupSelectAcc"
                        onClick={() => setShowAddAccountAdmin(true)}
                    >
                        Thêm mới
                    </button>
                    <select
                        id="inputGroupSelectAcc"
                        className="form-select bg-dark text-white select-acc"
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Ngừng hoạt động</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            <div className="row g-3">
                {currentAdmins.length > 0 ? (
                    currentAdmins.map((admin) => (
                        <div className="col-12 col-sm-6 col-md-3 mb-4" key={admin.id}>
                            <div className="card h-100 border-rounded d-flex flex-column admin-card">
                                <div
                                    className="position-relative bg-dark border-bottom"
                                    style={{ height: '150px', overflow: 'hidden' }}
                                >
                                    {admin.avatar ? (
                                        <img
                                            src={`http://127.0.0.1:8000${admin.avatar}`}
                                            alt="Ảnh đại diện"
                                            className="w-100 h-100 object-fit-contain"
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center h-100">
                                            <i className="fas fa-adminAccounts-circle fa-3x text-white"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body d-flex flex-column p-3 bg-dark">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h5 className="card-title">{admin.name}</h5>
                                        {admin.id === currentAdmin?.id && (
                                            <span className="badge bg-success text-white px-2 py-1">Bạn</span>
                                        )}
                                    </div>
                                    <ul className="list-unstyled admin-info">
                                        <li className="mb-2">
                                            <i className="fas fa-envelope me-2 text-info"></i>
                                            <strong>Email:</strong> {admin.email}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-phone me-2 text-success"></i>
                                            <strong>Phone:</strong> {admin.phone || 'Chưa cung cấp'}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                                            <strong>Address:</strong> {admin.address || 'Chưa cung cấp'}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-adminAccounts-shield me-2 text-warning"></i>
                                            <strong>Phân quyền:</strong>
                                            <span
                                                className={`badge ms-2 ${admin.role === 1 ? 'bg-warning text-dark' : 'bg-secondary text-white'}`}
                                            >
                                                {admin.role === 1 ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </li>
                                        <li>
                                            <i
                                                className={`fas fa-circle-notch me-2 ${admin.status === 1 ? 'text-success' : 'text-danger'}`}
                                            ></i>
                                            <strong>Status:</strong>
                                            <span
                                                className={`badge ms-2 ${admin.status === 1 ? 'bg-success text-white' : 'bg-danger text-white'}`}
                                            >
                                                {admin.status === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </li>
                                    </ul>
                                    {isSuperAdmin && (
                                        <div className="mt-auto d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
                                                onClick={() => handleEdit(admin.id)}
                                            >
                                                <i className="fas fa-edit me-1"></i> Sửa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center"
                                                onClick={(e) => confirmDelete(admin.id, e)}
                                                disabled={admin.id === currentAdmin?.id}
                                            >
                                                <i className="fas fa-trash-alt me-1"></i> Xoá
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="text-center bg-dark text-white border border-secondary rounded p-4">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            Không tìm thấy tài khoản admi n phù hợp với tiêu chí tìm kiếm hoặc lọc.
                        </div>
                    </div>
                )}
            </div>
            {showAddAccountAdmin && (
                <AddAccountAdmin
                    onCancel={() => setShowAddAccountAdmin(false)}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
                />
            )}

            {editingAdmin && (
                <EditAccountAdmin
                    adminData={editingAdmin}
                    onCancel={() => setEditingAdmin(null)}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
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
    );
}