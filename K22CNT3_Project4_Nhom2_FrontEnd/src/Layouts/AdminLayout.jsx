import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '@/Components/Admin/Sidebar';
import '../assets/css/Admin/Loading.css';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [listNotification, setListNotification] = useState([]);
    const [listadmin, setListadmin] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dotAnimation, setDotAnimation] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                if (!token) {
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại!');
                }

                const response = await axios.get('/api/admin/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setAdmin(response.data.admin);
                setListNotification(response.data.notifications);
                setListadmin(response.data.listadmin);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                toast.error(error.message || 'Không thể tải dữ liệu admin. Vui lòng đăng nhập lại!');
                navigate('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [navigate]);

    useEffect(() => {
        const channel = window.Echo.channel('channel-admin');

        channel.listen('.admin.notification', (e) => {
                const { notification } = e;

                if (admin?.id === notification.AdminId) return;

                const sender = listadmin?.find((item) => item.id === notification.AdminId);
                toast.success(`${sender?.name || 'Admin'} đã ${notification.Content || 'thực hiện hành động!'}`);

                setListNotification((prev) => {
                    if (!notification || !notification.id) return prev;
                    return [notification, ...prev];
                });
            })
            .error((error) => {
                console.error('Subscription error:', error);
                toast.error('Không thể kết nối thông báo thời gian thực: ' + (error.message || 'Lỗi không xác định'));
            });

        return () => {
            window.Echo.leave('channel-admin');
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setLoadingProgress(0);
        const totalTime = 2000;
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                const newProgress = Math.min(prev + (100 / (totalTime / 100)), 100);
                if (newProgress === 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoading(false), 500);
                }
                return newProgress;
            });
        }, 50);

        const dotInterval = setInterval(() => {
            setDotAnimation((prev) => (prev.length >= 3 ? '.' : prev + '.'));
        }, 200);

        return () => {
            clearInterval(interval);
            clearInterval(dotInterval);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại!');
            }
            await axios.post('/api/admin/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            localStorage.removeItem('admin_token');
            toast.success('Đăng xuất thành công!');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại!');
        }
    };

    return (
        <div className="d-flex flex-row bg-dark">
            {isLoading && (
                <div className="loading-overlay" style={{ '--progress': `${loadingProgress}%` }}>
                    <div className="loading-bar">
                        <span className="loading-text">
                            {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((char, index) => (
                                <span key={index} className="letter" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {char}
                                </span>
                            ))}
                            <span className="dot-animation">{dotAnimation}</span>
                        </span>
                    </div>
                </div>
            )}
            <Sidebar
                adminImg={admin?.avatar}
                notifications={listNotification}
                listadmin={listadmin}
            />
            <div className="w-100">
                <div className="w-100 bg-dark text-white d-flex align-items-center justify-content-between shadow overflow-hidden" style={{ minHeight: '64px' }}>
                    <h1 className="ps-3 m-0 fs-3">
                        <strong>Cộng đồng sinh viên</strong>
                    </h1>
                    <Toaster position="top-right" reverseOrder={false} />
                    <div className="pe-5">
                        <div className="d-flex align-items-center d-block">
                            <span>
                                Xin chào, <strong>{admin?.name || 'Admin'}</strong>
                            </span>
                            <button onClick={handleLogout} className="btn btn-danger ms-2">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-grow-1" style={{ minHeight: '87%' }}>
                    {children}
                </div>
                <div className="alert alert-warning text-center" style={{ position: 'sticky', top: 0, zIndex: 9999 }}>
                    <i className="fa-solid fa-triangle-exclamation text-warning"></i> Hãy <strong>đăng xuất</strong> trước khi tắt tab hoặc đóng trình duyệt để đảm bảo an toàn!
                </div>
            </div>
        </div>
    );
}
