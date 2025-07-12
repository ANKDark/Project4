import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import ListAccountAdmin from '@/Components/Admin/Account/ListAccountAdmin';
import ListAccountUsers from '@/Components/Admin/Account/ListAccountUsers';
import '../../assets/css/Admin/AccountManagement.css';

export default function AccountManagement() {
    const [currentAdmin, setCurrentAdmin] = useState({});
    const isSuperAdmin = currentAdmin?.role === 1;
    const [adminSearch, setAdminSearch] = useState('');
    const [activeTab, setActiveTab] = useState('admin');
    const [listAccountAdmins, setListAccountAdmins] = useState([]);
    const [listAccountUsers, setListAccountUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/admin/listAccount', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        'Accept': 'application/json',
                    },
                });

                setCurrentAdmin(response.data.currentAdmin || {});
                setListAccountAdmins(response.data.listAccountAdmins || []);
                setListAccountUsers(response.data.listAccountUsers || []);

                setLoading(false);
            } catch (error) {
                setError('Không thể tải danh sách tài khoản. Vui lòng thử lại!');
                setLoading(false);
                console.error('Lỗi khi gọi API:', error.response || error);
            }
        };

        fetchAccounts();
    }, []);

    return (
        <AdminLayout>
            <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
                {loading && <div>Đang tải...</div>}
                {error && <div className="text-danger">{error}</div>}

                <div className="admin-toggle-tabs mb-3">
                    <button
                        className={`admin-toggle-tab ${activeTab === 'admin' ? 'active-admin' : ''}`}
                        onClick={() => setActiveTab('admin')}
                    >
                        <i className="fas fa-clipboard-list me-2"></i>Danh sách Admin
                    </button>
                    <button
                        className={`admin-toggle-tab ${activeTab === 'user' ? 'active-user' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        <i className="fas fa-users me-2"></i>Danh sách Người dùng
                    </button>
                </div>

                {activeTab === 'admin' && (
                    <ListAccountAdmin
                        currentAdmin={currentAdmin}
                        isSuperAdmin={isSuperAdmin}
                        adminSearch={adminSearch}
                        setAdminSearch={setAdminSearch}
                        listAccountAdmins={listAccountAdmins}
                    />
                )}

                {activeTab === 'user' && (
                    <ListAccountUsers
                        listAccountUsers={listAccountUsers}
                        isSuperAdmin={isSuperAdmin}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
