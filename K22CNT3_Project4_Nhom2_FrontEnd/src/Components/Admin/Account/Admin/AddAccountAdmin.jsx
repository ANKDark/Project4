// src/components/Admin/Account/AddAccountAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AddAccountAdmin({
  onCancel,
  setShowAlert,
  setAlertType,
  setAlertMessage,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 0,
    status: 1,
    avatar: null,
  });
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    setImageName(file.name);
    setFormData((prev) => ({ ...prev, avatar: file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageName(file.name);
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'avatar' && formData[key]) {
        data.append('avatar', formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post('/api/admin/addAdmin', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Thêm admin ${formData.name} thành công!`);
      Swal.fire({
        title: 'Thành công!',
        text: `Đã thêm admin ${formData.name}.`,
        icon: 'success',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: 0,
        status: 1,
        avatar: null,
      });
      setImage(null);
      setImageName('');
      setErrors({});
      onCancel();
    } catch (err) {
      const errorMessages = err.response?.data?.errors
        ? Object.values(err.response.data.errors)
            .flat()
            .map((msg) => `${msg}`)
            .join('')
        : 'Thêm tài khoản thất bại!';

      setShowAlert(true);
      setAlertType('error');
      setAlertMessage('Thêm tài khoản thất bại!');
      setErrors(err.response?.data?.errors || {});
      Swal.fire({
        title: 'Thất bại!',
        text: `Thêm tài khoản admin thất bại, vui lòng kiểm tra lại. ${errorMessages}`,
        icon: 'error',
      });
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" aria-modal="true" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title">Thêm mới Admin</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && <small className="text-danger">{errors.password}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <small className="text-danger">{errors.phone}</small>}
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {errors.address && <small className="text-danger">{errors.address}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Vai trò</label>
                  <select
                    name="role"
                    className="form-select bg-dark text-white border-secondary"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value={0}>Admin</option>
                    <option value={1}>Super Admin</option>
                  </select>
                  {errors.role && <small className="text-danger">{errors.role}</small>}
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="status"
                      checked={formData.status === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold">Kích hoạt tài khoản</label>
                  </div>
                  {errors.status && <small className="text-danger">{errors.status}</small>}
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Ảnh đại diện</label>
                  <div
                    className="upload-area upload-box d-flex flex-column align-items-center justify-content-center custom-input-sup cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{ height: '150px' }}
                    onClick={() => document.getElementById('fileInputAvatar').click()}
                  >
                    {image ? (
                      <img src={image} alt="avatar" style={{ maxHeight: '150px' }} />
                    ) : (
                      <>
                        <i className="fa-light fa-image" style={{ fontSize: '2rem' }}></i>
                        <p>Thêm ảnh hoặc kéo & thả</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="fileInputAvatar"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {errors.avatar && <small className="text-danger">{errors.avatar}</small>}
                  </div>
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