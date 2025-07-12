import React, { useEffect, useState } from 'react';
import '../../assets/css/Admin/ListAdminOnline.css';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { Alert, Snackbar } from '@mui/material';

export default function ListAdminOnline() {
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const isEmpty = admins.length === 0;

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/api/admin/listAdminOnline', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
          timeout: 5000,
        });
        setAdmins(Array.isArray(response.data.listAdminAd) ? response.data.listAdminAd : Object.values(response.data.listAdminAd));
        setCurrentAdmin(response.data.currentAdminAd);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
          return;
        }
        setShowAlert(true);
        setAlertType('error');
        setAlertMessage(
          error.response?.data?.message || 'Không thể tải danh sách quản trị viên. Vui lòng thử lại.'
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    const channel = window.Echo.channel('admin-status');

    channel.listen('.admin.online', (e) => {
      setAdmins((prevAdmins) => {
        const exists = prevAdmins.some(admin => admin.email === e.admin.email);
        if (exists) return prevAdmins;

        const newAdmin = {
          ...e.admin,
          last_seen: new Date().toISOString()
        };

        return [...prevAdmins, newAdmin];
      });
    });

    channel.listen('.admin.offline', (e) => {
      setAdmins((prevAdmins) =>
        prevAdmins.filter((admin) => admin.id !== e.adminId)
      );
    })
      .error((error) => {
        console.error('Subscription error:', error);
      });

    return () => {
      window.Echo.leave('admin-status');
    };
  }, []);

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <title>Danh sách quản trị viên</title>
        <div className="admin-list-container">
          <div className="text-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <title>Danh sách quản trị viên</title>
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <div className="admin-list-container">
        <div className="admin-list-grid">
          {isEmpty ? (
            <div className="admin-list-empty">
              <i className="fas fa-user-slash admin-list-empty-icon"></i>
              Không có quản trị viên nào trực tuyến.
            </div>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.email}
                className={`admin-card_lsadonl ${currentAdmin?.email === admin.email ? 'admin-card_lsadonl-current' : ''
                  }`}
              >
                <div className="admin-avatar-container">
                  {admin.avatar ? (
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="admin-avatar-img"
                    />
                  ) : (
                    <div className="admin-avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <span className="admin-online-indicator"></span>
                </div>

                <div className="admin-info">
                  <div className="admin-name">
                    {admin.name}
                    {currentAdmin?.email === admin.email && (
                      <span className="admin-current-badge">Bạn</span>
                    )}
                  </div>
                  <div className="admin-role">
                    {admin.role === 0 ? 'Super Admin' : 'Admin'}
                  </div>
                  <div className="admin-last-seen">
                    Online lúc: {new Date(admin.last_seen).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}