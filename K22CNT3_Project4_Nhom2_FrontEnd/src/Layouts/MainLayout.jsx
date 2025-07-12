import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/Main.css';

export default function MainLayout({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const currentUserId = user ? user.id : null;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Lỗi lấy thông tin người dùng:', error);
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1250);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/';
            } catch (error) {
                console.error('Lỗi đăng xuất:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/';
            }
        } else {
            window.location.href = '/';
        }
    };

    if (isLoading) {
        return (
            <video className="loading-video" src="/storage/Video/loading.mp4" autoPlay muted loop></video>
        );
    }

    return (
        <>
            <header className="main-header bg-main">
                <nav className="navbar navbar-expand-lg navbar-light bg-main fixed-top" style={{ height: '56px' }}>
                    <div className="container d-flex align-items-center justify-content-between">
                        <Link className="navbar-brand fw-bold text-white fs-6" to="/">
                            Cộng đồng sinh viên
                        </Link>

                        <div className="d-none d-md-flex justify-content-center flex-grow-1">
                            <Link
                                to="/"
                                className={`btn mx-2 text-white ${location.pathname === '/' ? 'active-link' : ''}`}
                                aria-label="Trang chủ"
                                title="Trang chủ"
                            >
                                <i className="bi bi-house fs-4"></i>
                            </Link>

                            {currentUserId ? (
                                <Link
                                    to={`/profile/${currentUserId}`}
                                    className={`btn mx-2 text-white ${location.pathname.startsWith('/profile') ? 'active-link' : ''}`}
                                    title="Trang cá nhân"
                                >
                                    <i className="bi bi-person fs-4"></i>
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className={`btn mx-2 text-white ${location.pathname === '/login' ? 'active-link' : ''}`}
                                    title="Đăng nhập"
                                >
                                    <i className="bi bi-person fs-4"></i>
                                </Link>
                            )}

                            <Link
                                to="/allposts"
                                className={`btn mx-2 text-white ${location.pathname.startsWith('/allposts') ? 'active-link' : ''}`}
                                aria-label="Bài viết"
                                title="Bài viết"
                            >
                                <i className="bi bi-book fs-4"></i>
                            </Link>
                        </div>

                        <div className="d-flex align-items-center">
                            <button className="btn mx-1 text-white" title="Thông báo">
                                <i className="fa-light fa-bell fs-4"></i>
                            </button>
                            <Link
                                to="/supportUser"
                                className={`btn mx-2 text-white ${location.pathname.startsWith('/supportUser') ? 'active-link' : ''}`}
                                title="Hỗ trợ người dùng"
                            >
                                <i className="fa-light fa-user-headset fs-4"></i>
                            </Link>

                            <div className="dropdown">
                                <button
                                    className="btn mx-1 text-white dropdown-toggle d-flex align-items-center"
                                    id="userDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {user?.profile_photo_path ? (
                                        <img
                                            src={user.profile_photo_path}
                                            alt="Profile"
                                            className="profile-image-main"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    'https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg';
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                            alt="Profile"
                                            className="profile-image-main"
                                        />
                                    )}
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                    {currentUserId ? (
                                        <li>
                                            <button onClick={handleLogout} className="dropdown-item text-danger" style={{ background: 'none', border: 'none' }}>
                                                Đăng xuất
                                            </button>
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                <Link to="/login" className="dropdown-item">
                                                    Đăng nhập
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/register" className="dropdown-item">
                                                    Đăng ký
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/forgotPassword" className="dropdown-item">
                                                    Quên mật khẩu
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="container pt-4">
                <main className="container mt-5" style={{ minHeight: '765px' }}>
                    {children}
                </main>
            </div>

            <footer className="main-footer bg-main mt-5">
                <div className="container text-center py-3">
                    <p>© 2025 Website Trường Đại học - Trần Minh Đức</p>
                </div>
            </footer>
        </>
    );
}