import axios from 'axios';
import { useState } from 'react';

export default function VerifyEmail() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const resendVerificationEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/email/verification-notification');
            if (response.data.status === 'success') {
                setStatus('verification-link-sent');
            }
        } catch (error) {
            console.error('Lỗi gửi lại email xác minh:', error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-gray-800 text-white p-6 rounded-md shadow-md">
            <h1 className="text-xl font-bold mb-4">Xác minh email</h1>

            <div className="mb-4 text-sm">
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

            <form onSubmit={resendVerificationEmail}>
                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi lại email xác minh'}
                    </button>

                    <button
                        type="button"
                        onClick={logout}
                        className="text-sm text-blue-400 underline hover:text-gray-300"
                    >
                        Đăng xuất
                    </button>
                </div>
            </form>
        </div>
    );
}
