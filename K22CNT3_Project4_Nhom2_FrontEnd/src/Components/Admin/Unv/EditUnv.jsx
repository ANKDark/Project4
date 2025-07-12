import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function EditUnv({
    university,
    onCancel,
    categories,
    editorConfig,
    editorContainerRef,
    editorToolbarRef,
    editorRef,
    isLayoutReady,
    CKEditor,
    DecoupledEditor,
    setShowAlert,
    setAlertType,
    setAlertMessage,
}) {
    const [formData, setFormData] = useState({
        Id: university.Id || '',
        TenTruong: university.TenTruong || '',
        NamThanhLap: university.NamThanhLap || '',
        IdCategory: university.category?.IdCategory || '',
        Is_verified: university.Is_verified ? 1 : 0,
        MoTaTruong: university.MoTaTruong || '',
        Img: university.Img || null,
    });
    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(university.Img ? `http://127.0.0.1:8000${university.Img}` : null);
    const [imageName, setImageName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (image && typeof image !== 'string') URL.revokeObjectURL(image);
        };
    }, [image]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setImage(university.Img ? `http://127.0.0.1:8000${university.Img}` : null);
            setImageName('');
            setFormData((prev) => ({ ...prev, Img: university.Img || null }));
            return;
        }
        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/webm'];
        if (!validTypes.includes(file.type)) {
            setErrors({ ...errors, Img: 'File phải là ảnh (jpeg, png, jpg, gif) hoặc video (mp4, webm)' });
            return;
        }
        setImage(URL.createObjectURL(file));
        setImageName(file.name);
        setFormData((prev) => ({ ...prev, Img: file }));
        setErrors((prev) => ({ ...prev, Img: null }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/webm'];
        if (file && validTypes.includes(file.type)) {
            setImage(URL.createObjectURL(file));
            setImageName(file.name);
            setFormData((prev) => ({ ...prev, Img: file }));
            setErrors((prev) => ({ ...prev, Img: null }));
        } else {
            setErrors({ ...errors, Img: 'File phải là ảnh (jpeg, png, jpg, gif) hoặc video (mp4, webm)' });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {};
        if (!formData.TenTruong) newErrors.TenTruong = 'Tên trường là bắt buộc.';
        if (!formData.NamThanhLap) newErrors.NamThanhLap = 'Năm thành lập là bắt buộc.';
        else if (formData.NamThanhLap < 1800 || formData.NamThanhLap > new Date().getFullYear()) {
            newErrors.NamThanhLap = 'Năm thành lập không hợp lệ.';
        }
        if (!formData.IdCategory) newErrors.IdCategory = 'Danh mục là bắt buộc.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === 'Img') {
                if (formData[key] instanceof File) {
                    data.append('Img', formData[key]);
                } else if (typeof formData[key] === 'string' && formData[key].startsWith('/storage/')) {
                    data.append('Img', formData[key]);
                }
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.post('/api/admin/editUnv', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                },
                timeout: 10000,
            });

            setShowAlert(true);
            setAlertType('success');
            setAlertMessage(`Cập nhật trường ${formData.TenTruong} thành công!`);
            Swal.fire({
                title: 'Thành công!',
                text: `Cập nhật trường ${formData.TenTruong} thành công!`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });

            setFormData({
                Id: university.Id || '',
                TenTruong: university.TenTruong || '',
                NamThanhLap: university.NamThanhLap || '',
                IdCategory: university.category?.IdCategory || '',
                Is_verified: university.Is_verified ? 1 : 0,
                MoTaTruong: university.MoTaTruong || '',
                Img: university.Img || null,
            });
            setImage(university.Img ? `http://127.0.0.1:8000${university.Img}` : null);
            setImageName('');
            setErrors({});
            onCancel();
        } catch (err) {
            const errorMessages =
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors)
                        .flat()
                        .map((msg) => `${msg}`)
                        .join(' ')
                    : err.response?.data?.message || 'Lỗi kết nối mạng hoặc máy chủ. Vui lòng thử lại.';

            setShowAlert(true);
            setAlertType('error');
            setAlertMessage(`Cập nhật trường ${formData.TenTruong} thất bại: ${errorMessages}`);
            setErrors(err.response?.data?.errors || {});
            Swal.fire({
                title: 'Thất bại!',
                text: `Cập nhật trường ${formData.TenTruong} thất bại: ${errorMessages}`,
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
                        <h5 className="modal-title">Chỉnh sửa thông tin trường</h5>
                        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onCancel}></button>
                    </div>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label htmlFor="TenTruong" className="form-label fw-semibold">
                                        Tên trường <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="TenTruong"
                                        name="TenTruong"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={formData.TenTruong}
                                        onChange={handleChange}
                                        placeholder="Nhập tên trường"
                                        required
                                        autoComplete="off"
                                    />
                                    {errors.TenTruong && <small className="text-danger">{errors.TenTruong}</small>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="NamThanhLap" className="form-label fw-semibold">
                                        Năm thành lập <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="NamThanhLap"
                                        name="NamThanhLap"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={formData.NamThanhLap}
                                        onChange={handleChange}
                                        placeholder="VD: 2000"
                                        required
                                        min={1800}
                                        max={new Date().getFullYear()}
                                    />
                                    {errors.NamThanhLap && <small className="text-danger">{errors.NamThanhLap}</small>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="IdCategory" className="form-label fw-semibold">
                                        Danh mục <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        id="IdCategory"
                                        name="IdCategory"
                                        className="form-select bg-dark text-white border-secondary"
                                        value={formData.IdCategory}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.IdCategory} value={cat.IdCategory}>
                                                {cat.CategoryName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.IdCategory && <small className="text-danger">{errors.IdCategory}</small>}
                                </div>

                                <div className="col-12 col-md-6 d-flex align-items-center mt-4 pt-1">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="Is_verified"
                                            name="Is_verified"
                                            checked={formData.Is_verified === 1}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="Is_verified">
                                            Xác thực
                                        </label>
                                    </div>
                                    {errors.Is_verified && <small className="text-danger">{errors.Is_verified}</small>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="MoTaTruong" className="form-label fw-semibold">
                                        Mô tả trường
                                    </label>
                                    <div className="main-container">
                                        <div className="editor-container editor-container_document-editor editor-container_include-style" ref={editorContainerRef}>
                                            <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
                                            <div className="editor-container__editor-wrapper rounded">
                                                <div className="editor-container__editor">
                                                    <div ref={editorRef}>
                                                        {isLayoutReady && editorConfig && (
                                                            <CKEditor
                                                                editor={DecoupledEditor}
                                                                config={{
                                                                    ...editorConfig,
                                                                    placeholder: 'Nhập mô tả về trường...',
                                                                }}
                                                                data={formData.MoTaTruong}
                                                                onReady={(editor) => {
                                                                    if (editorToolbarRef.current) {
                                                                        editorToolbarRef.current.appendChild(editor.ui.view.toolbar.element);
                                                                    }
                                                                }}
                                                                onAfterDestroy={() => {
                                                                    if (editorToolbarRef.current) {
                                                                        Array.from(editorToolbarRef.current.children).forEach((child) => child.remove());
                                                                    }
                                                                }}
                                                                onChange={(event, editor) => {
                                                                    const editorData = editor.getData();
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        MoTaTruong: editorData,
                                                                    }));
                                                                    setErrors((prev) => ({ ...prev, MoTaTruong: null }));
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.MoTaTruong && <small className="text-danger">{errors.MoTaTruong}</small>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="Img" className="form-label fw-semibold">
                                        Ảnh trường
                                    </label>
                                    <div
                                        className="upload-area upload-box d-flex flex-column align-items-center justify-content-center custom-input-sup cursor-pointer"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        style={{ height: '150px' }}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={imageName || 'Ảnh hiện tại'}
                                                style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }}
                                                className="rounded-lg"
                                            />
                                        ) : (
                                            <>
                                                <i className="fa-light fa-image" style={{ fontSize: '2rem' }}></i>
                                                <p>Thêm ảnh/video hoặc kéo và thả</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            id="fileInput"
                                            className="d-none"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                        />
                                        {errors.Img && <small className="text-danger">{errors.Img}</small>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-top border-secondary">
                            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}