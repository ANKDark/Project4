import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/Main.css';

export default function MainLayout({ children }) {
    const { url, props } = usePage();

    const user = props.auth?.user ?? null;
    const currentUserId = user ? user.id : null;

    return (
        <>
            <header className="main-header bg-main">
                <nav className="navbar navbar-expand-lg navbar-light bg-main fixed-top" style={{ height: "56px" }}>
                    <div className="container d-flex align-items-center justify-content-between">
                        <a className="navbar-brand fw-bold text-white fs-6" href="/">Cộng đồng sinh viên</a>

                        <div className="d-none d-md-flex justify-content-center flex-grow-1">
                            <Link
                                href={`/`}
                                className={`btn mx-2 text-white ${url === '/' ? 'active-link' : ''}`}
                                aria-label="Trang chủ"
                                title="Trang chủ"
                            >
                                <i className="bi bi-house fs-4"></i>
                            </Link>

                            {currentUserId ? (
                                <Link
                                    href={`/profile/${currentUserId}`}
                                    className={`btn mx-2 text-white ${url.startsWith('/profile') ? 'active-link' : ''}`}
                                    title="Trang cá nhân"
                                >
                                    <i className="bi bi-person fs-4"></i>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className={`btn mx-2 text-white ${url === '/login' ? 'active-link' : ''}`}
                                    title="Đăng nhập"
                                >
                                    <i className="bi bi-person fs-4"></i>
                                </Link>
                            )}

                            <Link
                                href={`/allposts`}
                                className={`btn mx-2 text-white ${url.startsWith('/allposts') ? 'active-link' : ''}`}
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
                            href="/supportUser"
                            className={`btn mx-2 text-white ${url.startsWith('/supportUser') ? 'active-link' : ''}`}
                            title="Hỗ trợ người dùng">
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
                                                e.target.src = "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
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
                                        <>
                                            <li>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="dropdown-item text-danger"
                                                    style={{ background: 'none', border: 'none' }}
                                                >
                                                    Đăng xuất
                                                </Link>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                <Link href="/login" className="dropdown-item">
                                                    Đăng nhập
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/register" className="dropdown-item">
                                                    Đăng ký
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

            <div className="container">
                <main className="container mt-20" style={{ minHeight: '765px' }}>
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
