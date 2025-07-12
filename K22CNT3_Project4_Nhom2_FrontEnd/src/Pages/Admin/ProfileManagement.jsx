import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '@mui/material';
import AdminLayout from '@/Layouts/AdminLayout';
import '../../assets/css/Admin/Profile.css';

export default function ProfileManagement() {
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        avatar: null,
        address: '',
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [imageName, setImageName] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/admin/profileManagement', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                    timeout: 10000,
                });
                const admin = response.data.currentAdmin;
                setFormData({
                    id: admin.id || '',
                    name: admin.name || '',
                    email: admin.email || '',
                    phone: admin.phone || '',
                    avatar: admin.avatar || null,
                    address: admin.address || '',
                });
                setImagePreview(admin.avatar ? `http://127.0.0.1:8000${admin.avatar}` : '');
            } catch (err) {
                const errorMessages =
                    err.response?.data?.message || 'Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.';
                setShowAlert(true);
                setAlertType('error');
                setAlertMessage(errorMessages);
            } finally {
                setIsFetching(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    useEffect(() => {
        return () => {
            if (imagePreview && typeof imagePreview !== 'string') URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setImagePreview(formData.avatar ? `http://127.0.0.1:8000${formData.avatar}` : '');
            setImageName('');
            setFormData((prev) => ({ ...prev, avatar: formData.avatar || null }));
            return;
        }
        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setErrors({ ...errors, avatar: 'File phải là ảnh (jpeg, png, jpg, gif)' });
            return;
        }
        setImagePreview(URL.createObjectURL(file));
        setImageName(file.name);
        setFormData((prev) => ({ ...prev, avatar: file }));
        setErrors((prev) => ({ ...prev, avatar: null }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (file && validTypes.includes(file.type)) {
            setImagePreview(URL.createObjectURL(file));
            setImageName(file.name);
            setFormData((prev) => ({ ...prev, avatar: file }));
            setErrors((prev) => ({ ...prev, avatar: null }));
        } else {
            setErrors({ ...errors, avatar: 'File phải là ảnh (jpeg, png, jpg, gif)' });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleChangePassword = () => {
        window.location.href = '/admin/changePassword';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {};
        if (!formData.name) newErrors.name = 'Họ và tên là bắt buộc.';
        if (!formData.email) newErrors.email = 'Email là bắt buộc.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }
        if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải có 10-15 chữ số.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === 'avatar') {
                if (formData[key] instanceof File) {
                    data.append('avatar', formData[key]);
                } else if (typeof formData[key] === 'string' && formData[key].startsWith('/storage/')) {
                    data.append('avatar', formData[key]);
                }
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.post('/api/admin/updateProfile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                },
                timeout: 10000,
            });

            setShowAlert(true);
            setAlertType('success');
            setAlertMessage('Cập nhật hồ sơ thành công!');
            const admin = response.data.admin;
            setFormData({
                id: admin.id || '',
                name: admin.name || '',
                email: admin.email || '',
                phone: admin.phone || '',
                avatar: admin.avatar || null,
                address: admin.address || '',
            });
            setImagePreview(admin.avatar ? `http://127.0.0.1:8000${admin.avatar}` : '');
            setImageName('');
            setErrors({});
        } catch (err) {
            const errorMessages =
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .map((msg) => `${msg}`)
                        .join(' ')
                    : err.response?.data?.message || 'Lỗi kết nối mạng hoặc máy chủ. Vui lòng thử lại.';

            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(errorMessages);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="profile-container">
                    <h2 className="profile-title mb-4">Quản lý hồ sơ</h2>
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
            <div className="profile-container">
                <h2 className="profile-title mb-4">Quản lý hồ sơ</h2>

                {showAlert && (
                    <div className="alert">
                        <Alert severity={alertType}>{alertMessage}</Alert>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form p-4 bg-dark">
                    <div className="profile-avatar-wrapper mb-4 text-center">
                        <div
                            className="profile-avatar-preview"
                            onClick={handleImageClick}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} className="profile-avatar-img" alt="Avatar" />
                            ) : (
                                <span className="text-muted">Chưa có ảnh</span>
                            )}
                        </div>

                        <input
                            type="file"
                            id="avatarInput"
                            ref={fileInputRef}
                            className="d-none"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm btn-changepassword"
                                onClick={handleChangePassword}
                            >
                                <i className="fa fa-key me-1"></i> Thay đổi mật khẩu
                            </button>
                        </div>
                        {errors.avatar && <div className="text-danger mt-2">{errors.avatar}</div>}
                    </div>

                    <div className="row g-3 profile-fields">
                        <div className="col-md-6 profile-field">
                            <label className="form-label text-light">Họ và tên</label>
                            <input
                                type="text"
                                name="name"
                                className={`form-control form-custom ${errors.name ? 'is-invalid' : ''}`}
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>

                        <div className="col-md-6 profile-field">
                            <label className="form-label text-light">Email</label>
                            <input
                                type="email"
                                name="email"
                                className={`form-control form-custom ${errors.email ? 'is-invalid' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="col-md-6 profile-field">
                            <label className="form-label text-light">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                className={`form-control form-custom ${errors.phone ? 'is-invalid' : ''}`}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>

                        <div className="col-md-6 profile-field">
                            <label className="form-label text-light">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                className={`form-control form-custom ${errors.address ? 'is-invalid' : ''}`}
                                value={formData.address}
                                onChange={handleChange}
                            />
                            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                        </div>
                    </div>

                    <div className="profile-submit text-end mt-4">
                        <button type="submit" className="btn" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}