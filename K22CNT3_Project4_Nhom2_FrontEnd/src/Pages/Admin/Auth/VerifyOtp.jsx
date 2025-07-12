import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '@mui/material';
import AuthAdmin from '@/Layouts/AuthAdmin';
import '../../../assets/css/Admin/Login.css';
import { useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const email = query.get('email') || location.state?.email || '';

    const [formData, setFormData] = useState({
        email: email,
        otp_code: '',
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const message =
            errors.otp_code ||
            errors.otp_code_expired ||
            errors.email_login ||
            errors.email_account;

        if (message) {
            setAlertType('error');
            setAlertMessage(message);
            setShowAlert(true);
        }
    }, [errors]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await axios.post('/api/admin/verify-otp', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                localStorage.setItem('admin_token', response.data.token);
                setAlertType('success');
                setAlertMessage('Xác minh OTP thành công!');
                setShowAlert(true);
                toast.success('Xác thực OTP thành công!');
                setFormData({ email: '', otp_code: '' });
                setTimeout(() => {
                    navigate('/admin/index');
                }, 1000);
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
                setAlertMessage('Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại!');
                setShowAlert(true);
                toast.error('Đã xảy ra lỗi khi xác thực OTP!');
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
            <form onSubmit={handleVerify}>
                <h2>Xác minh OTP</h2>
                <div className="inputbox">
                    <i className="fa-light fa-key"></i>
                    <input
                        type="text"
                        required
                        placeholder=" "
                        value={formData.otp_code}
                        className="input-otp"
                        onChange={(e) => setFormData({ ...formData, otp_code: e.target.value })}
                    />
                    <label>Mã OTP</label>
                    {errors.otp_code && <div className="error-text">{errors.otp_code}</div>}
                    {errors.otp_code_expired && <div className="error-text">{errors.otp_code_expired}</div>}
                    {errors.email_account && <div className="error-text">{errors.email_account}</div>}
                </div>
                <button type="submit" className="btn-submit" disabled={processing}>
                    {processing ? 'Đang xác minh...' : 'Xác minh OTP'}
                </button>
            </form>
            <Toaster position="top-right" reverseOrder={false} />
        </AuthAdmin>
    );
}