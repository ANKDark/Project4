import React, { useEffect, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import DetailsUnv from './DetailsUnv';
import EditUnv from './EditUnv';
import { Alert } from '@mui/material';
import { useForm } from '@inertiajs/react';
import AddUnv from './AddUnv';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function ListUnv({ universities, categories, editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady, CKEditor,
    DecoupledEditor }) {
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [editUniversity, setEditUniversity] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAddUnv, setShowAddUnv] = useState(false);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((total, r) => total + parseFloat(r.Rate || 0), 0);
        return (sum / ratings.length).toFixed(1);
    };

    let filteredUniversities = [...universities].filter((unv) => {
        const matchName = unv.TenTruong.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'verified') return unv.Is_verified && matchName;
        if (filterType === 'unverified') return !unv.Is_verified && matchName;
        return matchName;
    });

    if (filterType === 'highest_rating') {
        filteredUniversities.sort((a, b) => {
            const aAvg = calculateAverageRating(a.ratings);
            const bAvg = calculateAverageRating(b.ratings);
            return bAvg - aAvg;
        });
    }
    if (filterType === 'oldest') {
        filteredUniversities.sort((a, b) => a.NamThanhLap - b.NamThanhLap);
    }

    const totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUniversities = filteredUniversities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const paginationItems = [];
    for (let page = 1; page <= totalPages; page++) {
        paginationItems.push(
            <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
            >
                {page}
            </Pagination.Item>
        );
    }

    const onFilterChange = (e) => {
        setFilterType(e.target.value);
        setCurrentPage(1);
    };

    const handleEdit = (university) => {
        setEditUniversity(university);
        setSelectedUniversity(null);
    };

    const confirmDelete = (id, e) => {
        e.stopPropagation();
        const university = universities.find(u => u.Id === id);

        Swal.fire({
            title: `Bạn có chắc muốn xóa "${university?.TenTruong}"?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Xác nhận xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete(university);
            }
        });
    };

    const handleConfirmDelete = async (university) => {
        try {
            const token = localStorage.getItem('admin_token');

            await axios.delete(`http://127.0.0.1:8000/api/admin/university/${university.Id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            Swal.fire({
                title: "Đã xóa!",
                text: `Trường "${university.TenTruong}" đã được xóa.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
        } catch (error) {
            let message = "Đã xảy ra lỗi khi xóa.";

            if (error.response && error.response.data) {
                const err = error.response.data.errors || error.response.data;
                const errorMessages = Object.values(err)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join('');
                message = `Không thể xóa trường "${university.TenTruong}". ${errorMessages}`;
            }

            Swal.fire({
                title: "Thất bại!",
                text: message,
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    const handleToggleVerify = async (e, unvId) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem('admin_token');

            await axios.post(`http://127.0.0.1:8000/api/admin/changeVerifiedStatus/${unvId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            Swal.fire({
                title: "Thành công!",
                text: "Trạng thái xác thực đã được cập nhật thành công!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
        } catch (error) {
            let message = "Không thể cập nhật trạng thái xác thực.";

            if (error.response && error.response.data) {
                const err = error.response.data.errors || error.response.data;
                const errorMessages = Object.values(err)
                    .flat()
                    .map((msg) => `${msg}`)
                    .join('');
                message += ` ${errorMessages}`;
            }

            Swal.fire({
                title: "Thất bại!",
                text: message,
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    };

    return (
        <>
            {showAlert && (
                <div className="alert">
                    <Alert severity={alertType}>{alertMessage}</Alert>
                </div>
            )}

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div style={{ minWidth: '315px' }}>
                    <input
                        type="text"
                        className="form-control bg-dark text-white search-unv"
                        placeholder="Tìm kiếm theo tên trường..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="input-group w-auto d-flex flex-wrap align-items-center">
                    <button className="btn btn-info bg-info text-white btn-addUnv" type="button"
                        id="inputGroupSelectUnv" onClick={() => setShowAddUnv(true)}>
                        Thêm mới
                    </button>
                    <select
                        id="inputGroupSelectUnv"
                        className="form-select bg-dark text-white select-unv"
                        value={filterType}
                        onChange={onFilterChange}
                    >
                        <option value="all">Tất cả</option>
                        <option value="verified">Đã xác thực</option>
                        <option value="unverified">Chưa xác thực</option>
                        <option value="highest_rating">Điểm đánh giá cao nhất</option>
                        <option value="oldest">Lâu đời nhất</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-dark table-hover text-center rounded-3 overflow-hidden w-100 table-unv">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ảnh</th>
                            <th>Tên trường</th>
                            <th>Năm thành lập</th>
                            <th className="d-none d-md-table-cell">Danh mục</th>
                            <th>Trạng thái xác thực</th>
                            <th className="d-none d-sm-table-cell">Điểm đánh giá</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUniversities.length > 0 ? (
                            paginatedUniversities.map((university, index) => (
                                <tr key={university.Id} onClick={() => setSelectedUniversity(university)}>
                                    <td className="text-light">{startIndex + index + 1}</td>
                                    <td className="text-light text-center align-middle">
                                        <img src={`http://127.0.0.1:8000${university.Img}`} className="d-block mx-auto" alt="Chưa có ảnh" width="80" height="40" />
                                    </td>
                                    <td className="text-light">{university.TenTruong}</td>
                                    <td className="text-light">{university.NamThanhLap}</td>
                                    <td className="text-light d-none d-md-table-cell">
                                        {university.category?.CategoryName || 'Không có'}
                                    </td>
                                    <td>
                                        <button
                                            className={`badge border-0 text-white px-3 py-2 rounded cursor-pointer ${university.Is_verified ? 'bg-success' : 'bg-danger'}`}
                                            onClick={(e) => handleToggleVerify(e, university.Id)}
                                        >
                                            {university.Is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </button>
                                    </td>
                                    <td className="text-warning d-none d-sm-table-cell">
                                        {university.ratings?.length > 0 ? (
                                            <>
                                                {calculateAverageRating(university.ratings)} / 5
                                                <i className="fa fa-star ms-1"></i>
                                            </>
                                        ) : (
                                            'Chưa có'
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline-info me-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(university);
                                            }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={(e) => confirmDelete(university.Id, e)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center text-light">
                                    Không có trường đại học nào!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedUniversity && (
                <DetailsUnv
                    university={selectedUniversity}
                    onClose={() => setSelectedUniversity(null)}
                />
            )}

            {editUniversity && (
                <EditUnv
                    university={editUniversity}
                    categories={categories}
                    editorConfig={editorConfig}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
                    onCancel={() => setEditUniversity(null)}
                />
            )}

            {showAddUnv && (
                <AddUnv
                    editorConfig={editorConfig}
                    categories={categories}
                    editorContainerRef={editorContainerRef}
                    editorToolbarRef={editorToolbarRef}
                    editorRef={editorRef}
                    isLayoutReady={isLayoutReady}
                    CKEditor={CKEditor}
                    DecoupledEditor={DecoupledEditor}
                    setAlertMessage={setAlertMessage}
                    setAlertType={setAlertType}
                    setShowAlert={setShowAlert}
                    onCancel={() => setShowAddUnv(false)}
                />
            )}

            {totalPages > 1 && (
                <Pagination className="justify-content-end flex-wrap gap-2">
                    <Pagination.Prev
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {paginationItems}
                    <Pagination.Next
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    />
                </Pagination>
            )}
        </>
    );
}