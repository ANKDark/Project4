import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, Tooltip } from '@mui/material';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../assets/css/Admin/Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalViolations: 0,
        totalErrors: 0,
        totalSuggestions: 0,
        totalUniversities: 0,
        totalCategories: 0,
    });
    const [chartData, setChartData] = useState({
        violationsByMonth: Array(12).fill(0),
        errorsByMonth: Array(12).fill(0),
        violationStatus: { resolved: 0, unresolved: 0 },
        suggestionStatus: { resolved: 0, unresolved: 0 },
    });
    const [topUniversities, setTopUniversities] = useState([]);
    const [universityLimit, setUniversityLimit] = useState(5);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/admin/dashboard', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    },
                });
                const { stats, chartData, topUniversities } = response.data.dashboardData;
                setStats(stats);
                setChartData(chartData);
                setTopUniversities(topUniversities);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) {
                    toast.error('Vui lòng đăng nhập lại!');
                    navigate('/admin/login');
                } else {
                    toast.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại!');
                }
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        const barChart = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
                datasets: [
                    {
                        label: 'Báo cáo vi phạm',
                        data: chartData.violationsByMonth,
                        backgroundColor: '#fd7e14',
                        borderColor: '#e86c12',
                        borderWidth: 1,
                    },
                    {
                        label: 'Lỗi hệ thống',
                        data: chartData.errorsByMonth,
                        backgroundColor: '#dc3545',
                        borderColor: '#c82333',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });

        const violationPieChart = new Chart(document.getElementById('violationPieChart'), {
            type: 'pie',
            data: {
                labels: ['Đã xử lý', 'Chưa xử lý'],
                datasets: [
                    {
                        data: [chartData.violationStatus.resolved, chartData.violationStatus.unresolved],
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderColor: ['#218838', '#c82333'],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
            },
        });

        const suggestionPieChart = new Chart(document.getElementById('suggestionPieChart'), {
            type: 'pie',
            data: {
                labels: ['Đã xử lý', 'Chưa xử lý'],
                datasets: [
                    {
                        data: [chartData.suggestionStatus.resolved, chartData.suggestionStatus.unresolved],
                        backgroundColor: ['#28a745', '#fbc02d'],
                        borderColor: ['#218838', '#e4a11b'],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
            },
        });

        return () => {
            barChart.destroy();
            violationPieChart.destroy();
            suggestionPieChart.destroy();
        };
    }, [chartData]);

    return (
        <AdminLayout>
            <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
                <div className="mb-5">
                    {showAlert && (
                        <div className="alert">
                            <Alert severity={alertType}>{alertMessage}</Alert>
                        </div>
                    )}
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <h4 className="text-white text-uppercase mb-0">Tổng quan quản trị</h4>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-user fa-2x me-3" style={{ color: '#fd7e14' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalUsers}</h5>
                                        <small>Tài khoản</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-blog fa-2x me-3" style={{ color: '#17a2b8' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalPosts}</h5>
                                        <small>Bài đăng</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-file-exclamation fa-2x me-3" style={{ color: '#fd7e14' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalViolations}</h5>
                                        <small>Báo cáo vi phạm</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-bug fa-2x me-3" style={{ color: '#dc3545' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalErrors}</h5>
                                        <small>Lỗi hệ thống</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-lightbulb fa-2x me-3" style={{ color: '#fbc02d' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalSuggestions}</h5>
                                        <small>Góp ý website</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-school fa-2x me-3" style={{ color: '#00CAFF' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalUniversities}</h5>
                                        <small>Trường đại học</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-2-5">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-bar-chart fa-rotate-270 fa-2x me-3" style={{ color: '#28a745' }}></i>
                                    <div>
                                        <h5 className="mb-0">{stats.totalCategories}</h5>
                                        <small>Danh mục</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <h5 className="mb-3">Trường đại học có lượt truy cập cao nhất trong tháng</h5>
                                <div className="input-group input-group-sm mb-3 w-auto align-items-center">
                                    <span className="input-group-text bg-dark text-white border-secondary">
                                        Hiển thị
                                    </span>
                                    <select
                                        id="universityLimit"
                                        className="form-select form-select-sm bg-dark text-white border-secondary"
                                        value={universityLimit}
                                        onChange={(e) => setUniversityLimit(Number(e.target.value))}
                                        style={{ minWidth: '120px' }}
                                    >
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <option key={num} value={num}>{num} top trường</option>
                                        ))}
                                    </select>
                                </div>
                                <ul className="list-group">
                                    {topUniversities.slice(0, universityLimit).map((uni, index) => (
                                        <li
                                            key={uni.IdTruong}
                                            className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center"
                                        >
                                            <a
                                                href={`/details/${uni.IdTruong}`}
                                                className="text-white text-decoration-none"
                                            >
                                                {index + 1}. {uni.TenTruong}
                                            </a>
                                            <span className="badge bg-primary rounded-pill">{uni.visit_count} lượt</span>
                                        </li>
                                    ))}
                                    {topUniversities.length === 0 && (
                                        <li className="list-group-item bg-dark text-white">
                                            Không có dữ liệu lượt truy cập trong tháng này.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <h5 className="mb-3">Báo cáo vi phạm và lỗi hệ thống theo tháng</h5>
                                <canvas id="barChart" height="200"></canvas>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-6">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <h5 className="mb-3">Trạng thái báo cáo vi phạm</h5>
                                <canvas id="violationPieChart" height="200"></canvas>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <h5 className="mb-3">Trạng thái góp ý website</h5>
                                <canvas id="suggestionPieChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card bg-dark text-white border border-secondary p-3">
                                <h5 className="mb-3">Liên kết nhanh</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <a href="/admin/listAccount" className="btn btn-outline-primary">
                                        <i className="fa fa-user me-2"></i>Quản lý tài khoản
                                    </a>
                                    <a href="/admin/listProfilePost" className="btn btn-outline-info">
                                        <i className="fa-regular fa-blog me-2"></i>Quản lý bài đăng
                                    </a>
                                    <a href="/admin/listViolationReport" className="btn btn-outline-warning">
                                        <i className="fa-regular fa-file-exclamation me-2"></i>Quản lý báo cáo vi phạm
                                    </a>
                                    <a href="/admin/listSystemError" className="btn btn-outline-danger">
                                        <i className="fa-regular fa-bug me-2"></i>Quản lý lỗi hệ thống
                                    </a>
                                    <a href="/admin/listSuggestionWebsite" className="btn btn-outline-success">
                                        <i className="fa-regular fa-lightbulb me-2"></i>Quản lý góp ý
                                    </a>
                                    <a href="/admin/indexUnv" className="btn btn-outline-primary">
                                        <i className="fa-regular fa-school me-2"></i>Quản lý trường
                                    </a>
                                    <a href="/admin/listCategory" className="btn btn-outline-success">
                                        <i className="fa fa-bar-chart fa-rotate-270 me-2"></i>Quản lý danh mục
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}