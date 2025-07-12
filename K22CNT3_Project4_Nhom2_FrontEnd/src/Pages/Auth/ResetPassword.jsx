import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import axios from 'axios';

export default function ResetPassword({ token, email }) {
    const [data, setData] = useState({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/password/reset', {
                token: data.token,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            setSuccessMessage(response.data.message);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ email: 'Đã có lỗi xảy ra, vui lòng thử lại sau.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <h1>Đặt lại mật khẩu</h1>

            {successMessage && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {successMessage}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="input_box">
                    <InputLabel htmlFor="email" value="Email" className="text-white mt-3 ms-2 fs-6" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={handleChange}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="input_box">
                    <InputLabel htmlFor="password" value="Password" className="text-white mt-3 ms-2 fs-6" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={handleChange}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="input_box">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-white mt-3 ms-2 fs-6"
                    />
                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={handleChange}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <InputError message={errors.token} className="mt-2" />

                <div className="flex items-center justify-end">
                    <PrimaryButton className="ms-4 mt-4" disabled={processing}>
                        Đặt lại mật khẩu
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}