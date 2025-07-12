import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const [data, setData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const [processing, setProcessing] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({ email: '', password: '' });

        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        } catch (err) {
            if (err.response?.status === 401) {
                setErrors({ ...errors, email: 'Email hoặc mật khẩu không đúng!' });
            } else {
                setErrors({ ...errors, email: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <title>Đăng nhập</title>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <h1>Đăng nhập</h1>
                <div className="input_box">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                    <i className="bx bx-user"></i>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="input_box">
                    <TextInput
                        id="password"
                        type="password"
                        placeholder="Mật khẩu"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                    />
                    <i className="bx bx-lock"></i>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="rmk">
                    <label htmlFor="checkbox">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData({ ...data, remember: e.target.checked })}
                        />
                        <span>Ghi nhớ tôi</span>
                    </label>
                    {canResetPassword && (
                        <Link
                            to="/password/request"
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Bạn quên mật khẩu?
                        </Link>
                    )}
                </div>
                <PrimaryButton className="btn_sub" disabled={processing}>
                    Đăng nhập
                </PrimaryButton>
                <div className="register_link">
                    <p>
                        Bạn không có tài khoản?{' '}
                        <Link to="/register">Đăng ký</Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}