import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Đăng ký" />
            <h1>Đăng ký</h1>
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
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <i className="fa-light fa-signature"></i>
                    <InputError message={errors.name} className="mt-2" />
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
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <i className="fa-light fa-envelope"></i>
                    <InputError message={errors.email} className="mt-2" />
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
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <i className="fa-light fa-lock"></i>
                    <InputError message={errors.password} className="mt-2" />
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
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <i className="fa-light fa-lock"></i>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-end mx-2">
                    <Link
                        href={route('login')}
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
