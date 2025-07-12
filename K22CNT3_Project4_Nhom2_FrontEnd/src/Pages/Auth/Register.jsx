import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [processing, setProcessing] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        });

        try {
            const response = await axios.post('http://localhost:8000/api/register', {
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        } catch (err) {
            if (err.response?.status === 422) {
                const backendErrors = err.response.data.errors || {};
                setErrors({
                    name: backendErrors.name?.join(', ') || '',
                    email: backendErrors.email?.join(', ') || '',
                    password: backendErrors.password?.join(', ') || '',
                    password_confirmation: backendErrors.password_confirmation?.join(', ') || '',
                });
            } else {
                setErrors({ ...errors, email: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <title>Đăng ký</title>
            <h1 className="text-xl font-semibold mb-4">Đăng ký</h1>

            {Object.values(errors).some(error => error) && (
                <div className="bg-red-100 border border-red-400 px-4 py-3 rounded mb-4 text-sm">
                    {Object.values(errors).map((error, index) => (
                        error && <div key={index} className='text-danger'>{error}</div>
                    ))}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="input_box">
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        placeholder="Họ và tên"
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        required
                    />
                    <i className="fa-light fa-signature"></i>
                    <InputError message={errors.name} className="mt-2 text-danger" />
                </div>

                <div className="input_box">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        required
                    />
                    <i className="fa-light fa-envelope"></i>
                    <InputError message={errors.email} className="mt-2 text-danger" />
                </div>

                <div className="input_box">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        required
                    />
                    <i className="fa-light fa-lock"></i>
                    <InputError message={errors.password} className="mt-2 text-danger" />
                </div>

                <div className="input_box mb-2">
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        placeholder="Nhập lại mật khẩu"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                        required
                    />
                    <i className="fa-light fa-lock"></i>
                    <InputError message={errors.password_confirmation} className="mt-2 text-danger" />
                </div>

                <div className="flex items-center justify-end mx-2">
                    <Link
                        to="/login"
                        className="rounded-md text-sm text-gray-200 underline hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Đã đăng ký?
                    </Link>
                </div>

                <PrimaryButton className="btn_sub mt-3" disabled={processing}>
                    Đăng ký
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
