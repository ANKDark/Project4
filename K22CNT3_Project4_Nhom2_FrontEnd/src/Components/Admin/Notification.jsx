import React from 'react';
import { format, parseISO } from 'date-fns';
import '../../assets/css/Admin/Notification.css';

export default function Notification({ notifications = [], listadmin }) {
    const grouped = notifications.reduce((acc, noti) => {
        const dateKey = format(parseISO(noti.ActionTime), 'dd/MM/yyyy');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(noti);
        return acc;
    }, {});

    return (
        <div className="notification-popup shadow-lg">
            <div className="notification-popup__header">
                <i className="fa-light fa-rectangle-history-circle-user"></i> Lịch sử thao tác
            </div>
            <div className="notification-popup__body bg-dark">
                {notifications.length === 0 ? (
                    <div className=" text-center p-3">Không có thông báo nào</div>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <div key={date} className="mb-3">
                            <div className="notification-popup__date-separator">
                                — Ngày {date} —
                            </div>
                            <ul className="list-group">
                                {items.map((noti) => {
                                    const admin = listadmin.find(a => a.id === noti.AdminId);

                                    return (
                                        <li key={noti.id} className="list-group-item notification-popup__item">
                                            <div className="d-flex align-items-center mb-2">
                                                {admin?.avatar ? (
                                                    <img
                                                        src={`http://127.0.0.1:8000${admin.avatar}`}
                                                        alt={admin.name}
                                                        className="rounded-circle me-2 avt-admin" />
                                                ) : (
                                                    <div
                                                        className="notification-popup__avatar-placeholder me-2"
                                                    >
                                                        {admin?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-semibold d-flex align-items-baseline flex-wrap">
                                                        {admin?.name || 'Admin không xác định'}
                                                        {admin?.role !== undefined && (
                                                            <span className="ms-2 admin-role text-muted-custom">
                                                                ({admin.role === 1 ? 'Super Admin' : 'Admin'})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="small text-muted-custom">{admin?.email || 'Email không rõ'}</div>
                                                </div>
                                            </div>
                                            <div
                                                className={`d-flex align-items-center d-type justify-content-center rounded px-2 py-1 fw-semibold ${noti.Type === 'Add' || noti.Type === 'Login' ? 'bg-type-success' :
                                                    noti.Type === 'Update' ? 'bg-type-primary' :
                                                        noti.Type === 'Delete' || noti.Type === 'Logout' ? 'bg-type-danger' :
                                                            noti.Type === 'Change' ? 'bg-type-warning text-dark' :
                                                                'bg-type-secondary'}`}>
                                                <span>{noti.Type}</span>
                                            </div>
                                            <div className='d-flex align-items-center mt-2 ms-1'>
                                                <div className="fw-semibold me-2 notification-details">
                                                    {noti.Content}
                                                </div>
                                                <div className="small text-muted-custom d-flex align-items-center">
                                                    <i className="fa fa-clock me-1"></i>
                                                    {format(parseISO(noti.ActionTime), 'HH:mm:ss')}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
