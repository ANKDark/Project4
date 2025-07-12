import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '@mui/material';
import AuthAdmin from '@/Layouts/AuthAdmin';
import '../../../assets/css/Admin/Login.css';

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [errors, setErrors] = useState({});
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {};
        if (!formData.current_password) {
            newErrors.current_password = 'Mật khẩu hiện tại là bắt buộc.';
        }
        if (!formData.new_password) {
            newErrors.new_password = 'Mật khẩu mới là bắt buộc.';
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        }
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Xác nhận mật khẩu là bắt buộc.';
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Mật khẩu xác nhận không khớp.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        data.append('current_password', formData.current_password);
        data.append('new_password', formData.new_password);
        data.append('confirm_password', formData.confirm_password);

        try {
            const response = await axios.post('/api/admin/updatePassword', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                },
                timeout: 10000,
            });

            setShowAlert(true);
            setAlertType('success');
            setAlertMessage('Đổi mật khẩu thành công!');
            setFormData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            setErrors({});
            window.history.back();
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

    return (
        <AuthAdmin>
            <title>Thay đổi mật khẩu</title>
            {showAlert && (
                <div className="alert">
                    <Alert severity={alertType}>{alertMessage}</Alert>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <h2>Thay đổi mật khẩu</h2>

                <div className="inputbox">
                    <i className="fa-light fa-lock"></i>
                    <input
                        type="password"
                        name="current_password"
                        required
                        placeholder=" "
                        value={formData.current_password}
                        className="input-password"
                        onChange={handleChange}
                    />
                    <label>Mật khẩu hiện tại</label>
                    {errors.current_password && <div className="error-text">{errors.current_password}</div>}
                </div>

                <div className="inputbox">
                    <i className="fa-light fa-key-skeleton"></i>
                    <input
                        type="password"
                        name="new_password"
                        required
                        placeholder=" "
                        value={formData.new_password}
                        className="input-password"
                        onChange={handleChange}
                    />
                    <label>Mật khẩu mới</label>
                    {errors.new_password && <div className="error-text">{errors.new_password}</div>}
                </div>

                <div className="inputbox">
                    <i className="fa-light fa-key"></i>
                    <input
                        type="password"
                        name="confirm_password"
                        required
                        placeholder=" "
                        value={formData.confirm_password}
                        className="input-password"
                        onChange={handleChange}
                    />
                    <label>Xác nhận mật khẩu mới</label>
                    {errors.confirm_password && <div className="error-text">{errors.confirm_password}</div>}
                </div>

                <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </button>
            </form>
        </AuthAdmin>
    );
}