import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import axios from 'axios';

export default function ForgotPassword({ status }) {
    const [data, setData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(status || '');

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/password/email', {
                email: data.email,
            });
            setSuccessMessage(response.data.message);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors({ email: err.response.data.errors.email[0] });
            } else {
                setErrors({ email: 'Đã có lỗi xảy ra, vui lòng thử lại sau.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-white">
                Quên mật khẩu? Không sao cả. Bạn chỉ cần cung cấp địa chỉ email của mình và chúng tôi sẽ gửi cho bạn một liên kết đặt lại mật khẩu, cho phép bạn chọn một mật khẩu mới.
            </div>

            {successMessage && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {successMessage}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="input_box">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={handleChange}
                    />
                </div>
                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Liên kết Đặt lại Mật khẩu qua Email
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}