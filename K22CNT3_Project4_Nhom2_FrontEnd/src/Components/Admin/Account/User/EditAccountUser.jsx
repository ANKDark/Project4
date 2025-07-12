import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditAccountUser({
  userData,
  onCancel,
  setShowAlert,
  setAlertType,
  setAlertMessage,
}) {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    password: '',
    status: userData.status === 'Active' ? 'Active' : 'Inactive', // Khởi tạo từ userData.status
    profile_photo_path: null,
  });
  const [image, setImage] = useState(userData.profile_photo_path ? `http://127.0.0.1:8000/${userData.profile_photo_path}` : null);
  const [imageName, setImageName] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (image && typeof image === 'string' && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Active' : 'Inactive') : value,
    }));
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // Giới hạn 2MB
      setErrors((prev) => ({ ...prev, profile_photo_path: 'Ảnh vượt quá kích thước 2MB' }));
      return;
    }
    setImage(URL.createObjectURL(file));
    setImageName(file.name);
    setFormData((prev) => ({ ...prev, profile_photo_path: file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Giới hạn 2MB
        setErrors((prev) => ({ ...prev, profile_photo_path: 'Ảnh vượt quá kích thước 2MB' }));
        return;
      }
      setImage(URL.createObjectURL(file));
      setImageName(file.name);
      setFormData((prev) => ({ ...prev, profile_photo_path: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Họ và tên là bắt buộc';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Định dạng email không hợp lệ';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'profile_photo_path' && formData[key]) {
        data.append('profile_photo_path', formData[key]);
      } else if (key !== 'password' || formData[key]) { // Chỉ gửi password nếu không rỗng
        data.append(key, formData[key]);
      }
    });
    data.append('_method', 'POST'); // Laravel yêu cầu _method cho POST trong FormData

    try {
      const response = await axios.post(`/api/admin/updateUser?id=${userData.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      setShowAlert(true);
      setAlertType('success');
      setAlertMessage(`Cập nhật người dùng ${formData.name} thành công!`);
      Swal.fire({
        title: 'Thành công!',
        text: `Đã cập nhật thông tin người dùng ${formData.name}.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        status: 'Active',
        profile_photo_path: null,
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
            .join(' ')
        : err.response?.data?.message || 'Cập nhật tài khoản thất bại!';

      setShowAlert(true);
      setAlertType('error');
      setAlertMessage('Cập nhật tài khoản thất bại!');
      setErrors(err.response?.data?.errors || {});
      Swal.fire({
        title: 'Thất bại!',
        text: `Cập nhật tài khoản người dùng thất bại. ${errorMessages}`,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" aria-modal="true" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title">Chỉnh sửa Người dùng</h5>
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
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên..."
                  />
                  {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
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
                    placeholder="Nhập email..."
                  />
                  {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Để trống nếu không đổi"
                  />
                  {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="status"
                      checked={formData.status === 'Active'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold">Kích hoạt tài khoản</label>
                  </div>
                  {errors.status && <div className="text-danger small mt-1">{errors.status}</div>}
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Ảnh đại diện</label>
                  <div
                    className="upload-area upload-box d-flex flex-column align-items-center justify-content-center custom-input-sup cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{ height: '150px' }}
                    onClick={() => document.getElementById('fileInputAvatarEdit').click()}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt="Ảnh đại diện"
                        style={{ maxHeight: '150px' }}
                      />
                    ) : (
                      <>
                        <i className="fa-light fa-image" style={{ fontSize: '2rem' }}></i>
                        <p>Thêm ảnh hoặc kéo & thả</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="fileInputAvatarEdit"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  {errors.profile_photo_path && (
                    <div className="text-danger small mt-1">{errors.profile_photo_path}</div>
                  )}
                  {imageName && <div className="text-muted small mt-1">{imageName}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer border-top border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Hủy
              </button>
              <button type="submit" className="btn btn-warning" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}