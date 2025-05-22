import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <h1>Đặt lại mật khẩu</h1>
            <form onSubmit={submit}>
                <div className="input_box">
                    <InputLabel htmlFor="email" value="Email" className='text-white mt-3 ms-2 fs-6' />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </div>
                <InputError message={errors.email} className="mt-2" />

                <div className="input_box">
                    <InputLabel htmlFor="password" value="Password" className='text-white mt-3 ms-2 fs-6' />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>
                <InputError message={errors.password} className="mt-2" />

                <div className="input_box">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className='text-white mt-3 ms-2 fs-6'
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                </div>
                <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                />
                <InputError
                    message={errors.token}
                    className="mt-2"
                />
                <div className="flex items-center justify-end">
                    <PrimaryButton className="ms-4 mt-4" disabled={processing}>
                        Đặt lại mật khẩu
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
