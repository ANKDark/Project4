import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Alert, Pagination, PaginationItem } from '@mui/material';
import '../../assets/css/Admin/CategoryManagement.css';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SuggestionManagement({ initialSuggestions }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [listSuggestions, setListSuggestions] = useState(initialSuggestions || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editSuggestion, setEditSuggestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    suggestion_type: '',
    description: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const itemsPerPage = 8;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchSuggestions();
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/listSuggestionWebsite', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      setListSuggestions(response.data.suggestionWebsite || []);
    } catch (err) {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể tải danh sách đề xuất: ' + (err.response?.data?.message || 'Lỗi server'),
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuggestions = Array.isArray(listSuggestions)
    ? listSuggestions.filter((suggestion) => {
        const matchesSearch =
          suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.suggestion_type.toLowerCase().includes(searchTerm.toLowerCase());
        const suggestionDate = new Date(suggestion.created_at).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
        const matchesDate = (!start || suggestionDate >= start) && (!end || suggestionDate <= end);
        return matchesSearch && matchesDate;
      })
    : [];

  const totalItems = filteredSuggestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuggestions = filteredSuggestions.slice(startIndex, endIndex);

  const handleConfirmDelete = async (suggestion, e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.delete(`/api/admin/deleteSuggestionWebsite/${suggestion.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      setListSuggestions((prev) => prev.filter((item) => item.id !== suggestion.id));
      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Đề xuất "${suggestion.suggestion_type}" đã được xóa.`);
      Swal.fire({
        title: 'Đã xóa!',
        text: `Đề xuất "${suggestion.suggestion_type}" đã được xóa.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      const errorMessages = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Không thể xóa đề xuất';
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage(`Không thể xóa đề xuất "${suggestion.suggestion_type}". ${errorMessages}`);
      Swal.fire({
        title: 'Thất bại!',
        text: `Không thể xóa đề xuất "${suggestion.suggestion_type}". ${errorMessages}`,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, e) => {
    e.preventDefault();
    const suggestion = listSuggestions.find((s) => s.id === id);
    if (!suggestion) {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không tìm thấy đề xuất.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
      return;
    }

    Swal.fire({
      title: `Xác nhận cập nhật trạng thái "${suggestion.suggestion_type}"?`,
      text: `Trạng thái sẽ được đổi thành "${suggestion.resolved === 'Active' ? 'Inactive' : 'Active'}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const response = await axios.post(
            `/api/admin/updatedSuggestionWebsite/${id}`,
            { resolved: suggestion.resolved === 'Active' ? 'Inactive' : 'Active' },
            { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
          );
          setListSuggestions((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, resolved: response.data.suggestionWebsite?.resolved || (suggestion.resolved === 'Active' ? 'Inactive' : 'Active'), updated_at: new Date().toISOString() }
                : item
            )
          );
          setShowAlert(true);
          setAlertType('success');
          setAlertMessage(`Trạng thái đề xuất "${suggestion.suggestion_type}" đã được cập nhật.`);
          Swal.fire({
            title: 'Cập nhật thành công!',
            text: `Trạng thái đề xuất "${suggestion.suggestion_type}" đã được cập nhật.`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
        } catch (err) {
          const errorMessages = err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(' ')
            : err.response?.data?.message || 'Không thể cập nhật trạng thái';
          setShowAlert(true);
          setAlertType('error');
          setAlertMessage(`Không thể cập nhật trạng thái đề xuất "${suggestion.suggestion_type}". ${errorMessages}`);
          Swal.fire({
            title: 'Thất bại!',
            text: `Không thể cập nhật trạng thái đề xuất "${suggestion.suggestion_type}". ${errorMessages}`,
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEditSuggestion = (suggestion) => {
    setEditSuggestion(suggestion);
    setEditFormData({
      suggestion_type: suggestion.suggestion_type,
      description: suggestion.description,
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.suggestion_type.trim()) newErrors.suggestion_type = 'Loại đề xuất là bắt buộc';
    if (!editFormData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `/api/admin/updatedSuggestionWebsite/${editSuggestion.id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
      );
      setListSuggestions((prev) =>
        prev.map((item) =>
          item.id === editSuggestion.id
            ? { ...item, ...editFormData, updated_at: new Date().toISOString() }
            : item
        )
      );
      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Đề xuất "${editFormData.suggestion_type}" đã được cập nhật.`);
      Swal.fire({
        title: 'Cập nhật thành công!',
        text: `Đề xuất "${editFormData.suggestion_type}" đã được cập nhật.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
      setEditSuggestion(null);
      setEditFormData({ suggestion_type: '', description: '' });
    } catch (err) {
      const errorMessages = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Không thể cập nhật đề xuất';
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage(`Không thể cập nhật đề xuất "${editFormData.suggestion_type}". ${errorMessages}`);
      Swal.fire({
        title: 'Thất bại!',
        text: `Không thể cập nhật đề xuất "${editFormData.suggestion_type}". ${errorMessages}`,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
      setEditErrors(err.response?.data?.errors || {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditSuggestion(null);
    setEditFormData({ suggestion_type: '', description: '' });
    setEditErrors({});
  };

  useEffect(() => {
    const channel = window.Echo.channel('channel-admin');
    if (channel) {
      channel.listen('.admin.suggestionWebsite', (e) => {
        const { type, suggestionWebsite } = e;
        if (!suggestionWebsite || !suggestionWebsite.id) {
          console.warn('Dữ liệu không hợp lệ từ WebSocket:', suggestionWebsite);
          return;
        }
        setListSuggestions((prev) => {
          const currentList = Array.isArray(prev) ? prev : [];
          if (type === 'Add') {
            const exists = currentList.some((item) => item.id === suggestionWebsite.id);
            if (exists) return currentList;
            return [suggestionWebsite, ...currentList];
          }
          if (type === 'Update') {
            return currentList.map((item) => {
              if (item.id === suggestionWebsite.id) {
                const currentUpdatedAt = new Date(item.updated_at || 0);
                const newUpdatedAt = new Date(suggestionWebsite.updated_at || 0);
                if (newUpdatedAt >= currentUpdatedAt) {
                  return { ...item, ...suggestionWebsite };
                }
              }
              return item;
            });
          }
          if (type === 'Delete') {
            return currentList.filter((item) => item.id !== suggestionWebsite.id);
          }
          return currentList;
        });
      }).error((err) => console.error('[Echo subscription error]:', err));
      return () => window.Echo?.leave('channel-admin');
    }
  }, []);

  return (
    <AdminLayout>
        <div className="container p-4 rounded-3" style={{ backgroundColor: '#343a40', minWidth: '100%' }}>
      <div className="mb-5">
        {showAlert && (
          <div className="alert">
            <Alert severity={alertType}>{alertMessage}</Alert>
          </div>
        )}
        <div className="d-flex justify-content-center align-items-center mb-3">
          <h4 className="text-white text-uppercase mb-0">Danh sách đề xuất website</h4>
        </div>

        <div className="mb-4 p-3 rounded bg-dark border border-secondary-subtle">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="searchContent" className="form-label text-white">
                Tìm kiếm đề xuất
              </label>
              <input
                type="text"
                id="searchContent"
                className="form-control bg-dark text-white border-secondary btn-srch"
                placeholder="Nhập loại đề xuất hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label text-white">
                Từ ngày
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control bg-dark text-white border-secondary btn-selectedDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label text-white">
                Đến ngày
              </label>
              <input
                type="date"
                id="endDate"
                className="form-control bg-dark text-white border-secondary btn-selectedDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-white mb-4">
            <i className="fas fa-spinner fa-spin me-2"></i>Đang tải...
          </div>
        )}

        <div className="row g-3">
          {currentSuggestions.length > 0 ? (
            currentSuggestions.map((suggestion) => (
              <div className="col-12 col-sm-6 col-md-3 mb-4" key={suggestion.id}>
                <div className="card h-100 border-rounded d-flex flex-column admin-card">
                  <div className="card-body d-flex flex-column p-3 bg-dark">
                    <ul className="list-unstyled admin-info text-white">
                      <li className="mb-2">
                        <i className="fa-regular fa-user me-2" style={{ color: '#4caf50' }}></i>
                        <strong>Người đề xuất:</strong> {suggestion.user_name}
                      </li>
                      <li className="mb-2">
                        <i className="fa-regular fa-lightbulb me-2" style={{ color: '#f57c00' }}></i>
                        <strong>Loại đề xuất:</strong> {suggestion.suggestion_type}
                      </li>
                      <li className="mb-2">
                        <i className="fa-regular fa-comment me-2" style={{ color: '#2196f3' }}></i>
                        <strong>Mô tả:</strong> {suggestion.description}
                      </li>
                      <li className="mb-2">
                        <i className="fa-regular fa-clock me-2" style={{ color: '#9c27b0' }}></i>
                        <strong>Thời gian tạo:</strong> {new Date(suggestion.created_at).toLocaleString()}
                      </li>
                      <li className="mb-2">
                        <i className="fa-regular fa-clock me-2" style={{ color: '#9c27b0' }}></i>
                        <strong>Thời gian cập nhật:</strong> {new Date(suggestion.updated_at).toLocaleString()}
                      </li>
                      <li className="mb-2">
                        <i
                          className="fa-regular fa-check-circle me-2"
                          style={{ color: suggestion.resolved === 'Active' ? '#388e3c' : '#d32f2f' }}
                        ></i>
                        <strong>Trạng thái:</strong>
                        <button
                          className={`btn btn-sm ${suggestion.resolved === 'Active' ? 'btn-success' : 'btn-warning'} ms-2`}
                          onClick={(e) => handleUpdateStatus(suggestion.id, e)}
                          disabled={isLoading}
                        >
                          {suggestion.resolved === 'Active' ? 'Đã xử lý' : 'Chưa xử lý'}
                        </button>
                      </li>
                    </ul>
                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                        onClick={(e) =>
                          Swal.fire({
                            title: `Bạn có chắc muốn xóa đề xuất "${suggestion.suggestion_type}"?`,
                            text: 'Hành động này không thể hoàn tác!',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Xác nhận xóa',
                            cancelButtonText: 'Hủy',
                          }).then((result) => {
                            if (result.isConfirmed) handleConfirmDelete(suggestion, e);
                          })
                        }
                        disabled={isLoading}
                      >
                        <i className="fas fa-trash-alt me-1"></i> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center bg-dark text-white border border-secondary rounded p-4">
                <i className="fas fa-exclamation-circle me-2" style={{ color: '#f57c00' }}></i>
                Không tìm thấy đề xuất phù hợp với tiêu chí tìm kiếm.
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-end mt-4">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  sx={{
                    '&.Mui-selected': { backgroundColor: '#3085d6', color: '#fff' },
                    '&:hover': { backgroundColor: '#555' },
                    color: '#fff',
                    backgroundColor: '#333',
                    margin: '0 2px',
                  }}
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}