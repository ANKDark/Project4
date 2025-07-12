import React, { useEffect, useState } from 'react';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import Swal from 'sweetalert2';
import { useForm } from '@inertiajs/react';
import AddAccountUser from './User/AddAccountUser';
import EditAccountUser from './User/EditAccountUser';
import DetailsUser from './User/DetailsUser';
import axios from 'axios';

export default function ListAccountUsers({
    listAccountUsers: lsUsers,
    isSuperAdmin,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('all');
    const [showAddAccountUser, setShowAddAccountUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [listAccountUsers, setListAccountUsers] = useState(lsUsers);
    const [selectedUser, setSelectedUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { delete: destroy } = useForm();

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const filteredUsers = listAccountUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = {
            all: true,
            active: user.status === 'Active',
            inactive: user.status !== 'Active',
            verified: !!user.email_verified_at,
            unverified: !user.email_verified_at,
        }[filterOption];

        return matchesSearch && matchesFilter;
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterOption]);

    const handleEdit = (userId, e) => {
        e.stopPropagation();
        const userToEdit = listAccountUsers.find((user) => user.id === userId);
        if (userToEdit) {
            setEditingUser(userToEdit);
        }
    };

    const confirmDelete = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        const user = listAccountUsers.find((u) => u.id === id);

        Swal.fire({
            title: `Bạn có chắc muốn xóa "${user?.name}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(user, e);
            }
        });
    };

    const handleConfirmDelete = async (user, e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');

            const response = await axios.delete(`http://127.0.0.1:8000/api/admin/deleteUser/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setListAccountUsers((prev) =>
                prev.filter((item) => item.id !== user.id)
            );

            const successMessage = response.data?.message || `Tài khoản "${user.name}" đã được xóa.`;

            Swal.fire({
                title: "Đã xóa!",
                text: successMessage,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });

            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(successMessage);
        } catch (error) {
            let message = `Không thể xóa tài khoản "${user.name}".`;

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

            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(message);
        }
    };

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.account.user', (e) => {
            const { user, type } = e;
            setListAccountUsers((prev) => {
                if (!user || !user.id) return prev;

                if (type === 'Add') {
                    return [user, ...prev];
                }

                if (type === 'Update') {
                    return prev.map((item) =>
                        item.id === user.id ? user : item
                    );
                }

                if (type === 'Delete') {
                    return prev.filter((item) => item.id !== user.id);
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
                <h4 className="text-white text-uppercase mb-0">Tài khoản Người dùng</h4>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div style={{ minWidth: '315px' }}>
                    <input
                        type="text"
                        className="form-control bg-dark text-white search-acc"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="input-group w-auto d-flex flex-wrap align-items-center">
                    {isSuperAdmin && (
                        <button
                            className="btn btn-info bg-success text-white btn-addAcc"
                            type="button"
                            onClick={() => setShowAddAccountUser(true)}
                        >
                            Thêm mới
                        </button>
                    )}
                    <select
                        className="form-select bg-dark text-white select-acc"
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Ngừng hoạt động</option>
                        <option value="verified">Đã xác thực</option>
                        <option value="unverified">Chưa xác thực</option>
                    </select>
                </div>
            </div>

            <div className="row g-3">
                {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                        <div className="col-12 col-sm-6 col-md-3 mb-4" key={user.id}>
                            <div className="card h-100 border-rounded d-flex flex-column admin-card" onClick={() => setSelectedUser(user)}>
                                <div
                                    className="position-relative bg-dark border-bottom"
                                    style={{ height: '150px', overflow: 'hidden' }}
                                >
                                    {user.profile_photo_path ? (
                                        <img
                                            src={`http://127.0.0.1:8000${user.profile_photo_path}`}
                                            alt="Ảnh đại diện"
                                            className="w-100 h-100 object-fit-contain"
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center h-100">
                                            <i className="fas fa-user-circle fa-3x text-white"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body d-flex flex-column p-3 bg-dark">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h5 className="card-title text-white">{user.name}</h5>
                                    </div>
                                    <ul className="list-unstyled admin-info text-white">
                                        <li className="mb-2">
                                            <i className="fas fa-envelope me-2 text-info"></i>
                                            <strong>Email:</strong> {user.email}
                                        </li>
                                        <li className="mb-2">
                                            <i className={`fas fa-check-circle me-2 ${user.email_verified_at ? 'text-success' : 'text-danger'}`}></i>
                                            <strong>Xác thực:</strong>
                                            <span
                                                className={`badge ms-2 ${user.email_verified_at
                                                    ? 'bg-success text-white'
                                                    : 'bg-danger text-white'
                                                    }`}
                                            >
                                                {user.email_verified_at ? 'Đã xác thực' : 'Chưa xác thực'}
                                            </span>
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-user me-2 text-warning"></i>
                                            <strong>Phân quyền:</strong>
                                            <span
                                                className={`badge ms-2 ${user.role === 'Admin'
                                                    ? 'bg-warning text-dark'
                                                    : 'bg-secondary text-white'
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </li>
                                        <li>
                                            <i className={`fas fa-circle-notch me-2 ${user.status === 'Active' ? 'text-success' : 'text-danger'}`}></i>
                                            <strong>Status:</strong>
                                            <span
                                                className={`badge ms-2 ${user.status === 'Active'
                                                    ? 'bg-success text-white'
                                                    : 'bg-danger text-white'
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </li>
                                    </ul>
                                    {isSuperAdmin && (
                                        <div className="mt-auto d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
                                                onClick={(e) => handleEdit(user.id, e)}
                                            >
                                                <i className="fas fa-edit me-1"></i> Sửa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger w-50 d-flex align-items-center justify-content-center"
                                                onClick={(e) => confirmDelete(user.id, e)}
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
                        <div className="alert alert-warning text-center bg-dark text-white border border-secondary rounded p-4">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            Không tìm thấy tài khoản người dùng phù hợp với tiêu chí tìm kiếm hoặc lọc.
                        </div>
                    </div>
                )}
            </div>

            {showAddAccountUser && (
                <AddAccountUser
                    onCancel={() => setShowAddAccountUser(false)}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
                />
            )}

            {editingUser && (
                <EditAccountUser
                    userData={editingUser}
                    onCancel={() => setEditingUser(null)}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
                />
            )}

            {selectedUser && (
                <DetailsUser
                    user={selectedUser}
                    listUser={listAccountUsers}
                    onClose={() => setSelectedUser(null)}
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