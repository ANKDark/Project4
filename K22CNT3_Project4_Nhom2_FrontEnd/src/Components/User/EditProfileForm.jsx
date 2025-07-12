import { useState } from "react";

export default function EditProfileForm({
    user,
    onChange,
    onClose,
    handleSubmitUser
}) {
    const [previewImage, setPreviewImage] = useState(`http://127.0.0.1:8000${user?.imgName}` || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            onChange({ target: { name: "imgName", value: file } });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            onChange({ target: { name: "imgName", value: file } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className="modal fade show d-block create-post-overlay bg-dark bg-opacity-75" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-crp">
                    <div className="modal-header d-flex justify-content-between">
                        <span className="modal-title text-center w-100 fs-4 fw-bold">Chỉnh sửa hồ sơ</span>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="p-4 pb-0">
                        <form onSubmit={handleSubmitUser}>
                            <div className="text-center mb-3">
                                <label
                                    className="position-relative d-inline-block"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => document.getElementById("editFileInput").click()}
                                >
                                    <input
                                        type="file"
                                        id="editFileInput"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <img
                                        src={previewImage || `http://127.0.0.1:8000${user.imgName}` || "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                                        alt="Avatar"
                                        className="rounded-circle image-profile-preview"
                                    />
                                    <button type="button" className="btn btn-sm btn-dark position-absolute bottom-0 end-0">
                                        Đổi ảnh
                                    </button>
                                </label>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        placeholder="Nhập họ và tên..."
                                        value={user.name}
                                        name="name"
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control rounded-3"
                                        placeholder="Nhập email..."
                                        value={user.email}
                                        name="email"
                                        autoComplete="off"
                                        onChange={onChange}
                                        required
                                    />
                                    {!user.email_verified_at &&
                                        <a href="/verify-email" className="text-light text-opacity-75 link-underline ms-2">
                                            Xác minh email
                                        </a>
                                    }
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3"
                                        autoComplete="current-password"
                                        placeholder="Nhập mật khẩu hiện tại..."
                                        value={user.password}
                                        name="password"
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-control rounded-3"
                                        placeholder="Nhập lại mật khẩu mới..."
                                        value={user.newPassword}
                                        name="newPassword"
                                        autoComplete="off"
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end border-top p-2 gap-2">
                                <button type="reset" className="btn btn-dark" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-dark">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
