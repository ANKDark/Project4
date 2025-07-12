import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '@mui/material';
import Checkbox from '@/Components/Checkbox';
import AuthAdmin from '@/Layouts/AuthAdmin';
import { useNavigate } from 'react-router-dom';
import '../../../assets/css/Admin/Login.css';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleLogin = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post('/api/admin/login', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setAlertType('success');
                setAlertMessage('Mã OTP đã được gửi đến email của bạn.');
                setShowAlert(true);
                toast.success('Mã OTP đã được gửi đến email của bạn!');
                navigate('/admin/verify-otp', { state: { email: formData.email } });
            }
        } catch (error) {
            setProcessing(false);
            if (error.response && error.response.status === 422) {
                const messages = error.response.data.errors;
                setErrors(messages);
                setAlertType('error');
                setAlertMessage(Object.values(messages).flat().join(' '));
                setShowAlert(true);
                toast.error(Object.values(messages).flat().join(' '));
            } else {
                setAlertType('error');
                setAlertMessage(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại!');
                setShowAlert(true);
                toast.error(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại!');
            }
        }
    };

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    return (
        <AuthAdmin>
            {showAlert && (
                <div className="alert">
                    <Alert severity={alertType}>{alertMessage}</Alert>
                </div>
            )}
            <form onSubmit={handleLogin}>
                <h2>Đăng nhập - Quản trị</h2>
                <div className="inputbox">
                    <i className="fa-light fa-envelope"></i>
                    <input
                        type="email"
                        required
                        placeholder=" "
                        value={formData.email}
                        className="input-email"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <label>Email</label>
                    {errors.email && <div className="error-text">{errors.email}</div>}
                </div>

                <div className="inputbox">
                    <i className="fa-light fa-lock"></i>
                    <input
                        type="password"
                        required
                        placeholder=" "
                        value={formData.password}
                        className="input-password"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <label>Password</label>
                    {errors.password && <div className="error-text">{errors.password}</div>}
                </div>

                <div className="forget">
                    <label htmlFor="checkbox">
                        <Checkbox
                            name="remember"
                            checked={formData.remember}
                            onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                        />
                        <span>Ghi nhớ tôi</span>
                    </label>
                </div>
                <button type="submit" className="btn-submit" disabled={processing}>
                    {processing ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>
            <Toaster position="top-right" reverseOrder={false} />
        </AuthAdmin>
    );
}