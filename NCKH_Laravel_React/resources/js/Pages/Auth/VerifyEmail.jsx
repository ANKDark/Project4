import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-sm text-white">
                Trước khi bắt đầu, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào liên kết chúng tôi vừa gửi qua email.
                Nếu bạn chưa nhận được email, chúng tôi rất sẵn lòng gửi lại cho bạn.
                Việc xác minh email giúp đảm bảo tính xác thực của các đánh giá và bình luận, từ đó xây dựng một cộng đồng sinh viên minh bạch và đáng tin cậy.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-300">
                    Đã gửi lại liên kết xác minh đến email bạn dùng khi đăng ký.
                    Kiểm tra hộp thư đến nha, hoặc coi thử trong mục spam nữa.
                    Xác minh để bắt đầu khám phá cộng đồng sinh viên nè!
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-blue-400 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
