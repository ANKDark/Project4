import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import React, { useState, useEffect } from 'react';
import Notification from './Notification';
import '../../assets/css/Admin/Sidebar.css';

export default function Sidebar({ adminImg, notifications, listadmin }) {
    const [showNoti, setShowNoti] = useState(false);
    const [tmdIsOpen, setIsOpen] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 675) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayNotifications = notifications?.filter((notification) => {
            const notificationDate = new Date(notification.ActionTime).toISOString().split('T')[0];
            return notificationDate === today;
        });
        setNotificationCount(todayNotifications?.length || 0);
    }, [notifications]);

    const renderTopIcons = () => (
        <>
            <Tooltip title="Tìm kiếm" arrow placement="top" enterDelay={250} leaveDelay={200}>
                <button className="btn btn-dark rounded-circle border-0 p-2 d-flex justify-content-center align-items-center">
                    <i className="fa fa-search" aria-hidden="true"></i>
                </button>
            </Tooltip>
            <div>
                <Tooltip title="Thông báo" arrow placement="top" enterDelay={250} leaveDelay={200}>
                    <button
                        className="btn btn-dark rounded-circle border-0 p-2 d-flex justify-content-center align-items-center"
                        onClick={() => setShowNoti(!showNoti)}
                    >
                        <i className="fa fa-bell" aria-hidden="true"></i>
                        {notificationCount > 0 && (
                            <span
                                className="badge bg-danger rounded-circle"
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    fontSize: '0.7rem',
                                    padding: '0.3em 0.5em',
                                }}
                            >
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </Tooltip>
                {showNoti && (
                    <Notification
                        notifications={notifications || []}
                        listadmin={listadmin || []}
                    />
                )}
            </div>
            <Tooltip title="Thay đổi thông tin cá nhân" arrow placement="top" enterDelay={250} leaveDelay={200}>
                <NavLink
                    to="/admin/profile"
                    className={({ isActive }) =>
                        `btn btn-dark rounded-circle border-0 p-2 d-flex justify-content-center align-items-center ${isActive ? 'active' : ''}`
                    }
                >
                    <i className="fa fa-user" aria-hidden="true"></i>
                </NavLink>
            </Tooltip>
        </>
    );

    return (
        <div className="row">
            <div className="col-12 col-md-4 col-lg-3">
                <div
                    className="d-flex flex-column bg-dark text-white vh-100 overflow-hidden"
                    style={{
                        transition: 'width 0.3s ease-in-out, opacity 0.5s ease-in-out',
                        width: tmdIsOpen ? '300px' : '60px',
                    }}
                >
                    <div className="d-flex align-items-center justify-content-between p-3">
                        {tmdIsOpen && (
                            <>
                                <NavLink to="/admin/profile" className="text-white text-decoration-none me-4">
                                    {adminImg ? (
                                        <img
                                            src={`http://127.0.0.1:8000${adminImg}`}
                                            alt="Admin Avatar"
                                            className="rounded-circle"
                                            width="40"
                                            height="40"
                                        />
                                    ) : (
                                        <i className="fa fa-user-circle fa-2x"></i>
                                    )}
                                </NavLink>
                            </>
                        )}

                        <div className="d-flex align-items-center gap-2 ms-auto">
                            {tmdIsOpen && renderTopIcons()}

                            <Tooltip title={tmdIsOpen ? 'Thu gọn' : 'Mở rộng'} arrow placement="top" enterDelay={250} leaveDelay={200}>
                                <button
                                    className="btn btn-dark rounded-circle border-0 p-2 d-flex justify-content-center align-items-center"
                                    onClick={() => setIsOpen(!tmdIsOpen)}
                                    aria-label="Toggle Sidebar"
                                >
                                    <i className="fa fa-list" aria-hidden="true"></i>
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="nav flex-column h-100">
                        {!tmdIsOpen && (
                            <div className="d-flex flex-column align-items-center gap-3 py-3">
                                {renderTopIcons()}
                            </div>
                        )}
                        <NavLink
                            to="/admin/index"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fas fa-home" style={{ color: '#007bff' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Trang chủ</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/indexUnv"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-school" style={{ color: '#00CAFF' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Quản lý trường đại học</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listAdminOnline"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-square-list" style={{ color: '#A3D8FF' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Danh sách quản trị trực tuyến</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listAccount"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa fa-user" style={{ color: '#fd7e14' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Tài khoản</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listCategory"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa fa-bar-chart fa-rotate-270" style={{ color: '#28a745' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Danh mục</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listComment"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-comment" style={{ color: '#ffc107' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Bình luận(Trường học)</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listProfilePost"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-blog" style={{ color: '#17a2b8' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Bài đăng</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listSystemError"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-bug" style={{ color: '#dc3545' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Hỗ trợ về lỗi hệ thống</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listViolationReport"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-file-exclamation" style={{ color: '#fd7e14' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Tố cáo người dùng</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/listSuggestionWebsite"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-lightbulb me-2" style={{ color: '#fbc02d' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Góp ý phát triển website</span>}
                        </NavLink>
                        <NavLink
                            to="/admin/chat"
                            className={({ isActive }) =>
                                `btn btn-none it-btn-us-tmd p-3 text-white ${!tmdIsOpen ? 'd-flex justify-content-center' : 'text-start'} ${isActive ? 'active' : ''}`
                            }
                        >
                            <i className="fa-regular fa-message-sms" style={{ color: '#FF2DF1' }}></i>
                            {tmdIsOpen && <span className="ms-2 sidebar-text">Nhóm chat</span>}
                        </NavLink>

                        <div className="mt-auto p-2 d-flex align-items-center gap-2">
                            {adminImg ? (
                                <img
                                    src={`http://127.0.0.1:8000${adminImg}`}
                                    alt="Admin Avatar"
                                    className="rounded-circle"
                                    width="40"
                                    height="40"
                                />
                            ) : (
                                <i className="fa fa-user-circle fa-2x"></i>
                            )}
                            {tmdIsOpen && <span><strong>Quản trị cộng đồng sinh viên</strong></span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}