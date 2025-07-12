import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditCategory({
  category,
  onCancel,
  setShowAlert,
  setAlertType,
  setAlertMessage,
}) {
  const [data, setData] = useState({
    IdCategory: '',
    CategoryName: '',
    Description: '',
  });

  useEffect(() => {
    if (category) {
      setData({
        IdCategory: category.IdCategory || '',
        CategoryName: category.CategoryName || '',
        Description: category.Description || '',
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.IdCategory) {
      setShowAlert(true);
      setAlertType('error');
      setAlertMessage('ID danh mục không hợp lệ!');
      Swal.fire({
        title: 'Thất bại!',
        text: 'ID danh mục không hợp lệ.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
      return;
    }
    try {
      const response = await axios.post(`/api/admin/updateCategory`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Cập nhật danh mục ${data.CategoryName} thành công!`);
      Swal.fire({
        title: 'Thành công!',
        text: `Đã cập nhật danh mục ${data.CategoryName}.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
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
      setAlertMessage('Cập nhật danh mục thất bại!');
      Swal.fire({
        title: 'Thất bại!',
        text: `Cập nhật danh mục thất bại. ${errorMessages}`,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" aria-modal="true" role="dialog">
    
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title">Chỉnh sửa Danh mục</h5>
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
              <button type="submit" className="btn btn-warning">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}