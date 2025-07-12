import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AddCategory({
  onCancel,
  setShowAlert,
  setAlertType,
  setAlertMessage,
}) {
  const [data, setData] = useState({
    CategoryName: '',
    Description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/addCategory', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Thêm danh mục ${data.CategoryName} thành công!`);
      Swal.fire({
        title: 'Thành công!',
        text: `Đã thêm danh mục ${data.CategoryName}.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
      setData({ CategoryName: '', Description: '' }); // Reset form
      onCancel();
    } catch (error) {
      const errorMessages = error.response?.data?.errors
        ? Object.values(error.response.data.errors)
          .flat()
          .map((msg) => `${msg}`)
          .join(' ')
        : error.response?.data?.message || 'Có lỗi xảy ra';

      setShowAlert(true);
      setAlertType('error');
      setAlertMessage('Thêm danh mục thất bại!');
      Swal.fire({
        title: 'Thất bại!',
        text: `Thêm danh mục thất bại. ${errorMessages}`,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" aria-modal="true" role="dialog">
      {/* Loại bỏ Head từ Inertia, giữ tiêu đề tĩnh */}
     
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title">Thêm mới Danh mục</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-semibold">
                    Tên danh mục <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="CategoryName"
                    className="form-control bg-dark text-white border-secondary"
                    value={data.CategoryName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Mô tả</label>
                  <textarea
                    name="Description"
                    rows="3"
                    className="form-control bg-dark text-white border-secondary"
                    value={data.Description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer border-top border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Thêm mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}