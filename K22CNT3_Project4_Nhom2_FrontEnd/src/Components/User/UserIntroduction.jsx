import React from "react";

export default function UserIntroduction({ userinfo, setShowEditUserInfo, currentUserId, user }) {
    return (
        <div className="col-md-4 mt-3">
            <div className="card p-3 shadow-sm bg-crp">
                <div className="d-flex align-items-center border-bottom pb-2">
                    <h2 className="fs-5 fw-bold m-0">Giới thiệu</h2>
                </div>

                {userinfo && userinfo.length > 0 ? (
                    userinfo.map((info, index) => (
                        <div key={index} className="mt-3">
                            <p className="mb-2">
                                <i className="bi bi-house-door me-2 text-secondary"></i>
                                <strong>Sống tại:</strong> {info.Residence || "Chưa cập nhật"}
                            </p>
                            <p className="mb-2">
                                <i className="bi bi-geo-alt me-2 text-secondary"></i>
                                <strong>Đến từ:</strong> {info.Birthplace || "Chưa cập nhật"}
                            </p>
                            <p className="mb-2">
                                <i className="bi bi-mortarboard me-2 text-secondary"></i>
                                <strong>Học tại:</strong> {info.Education || "Chưa cập nhật"}
                            </p>
                            <p className="mb-2">
                                <i className="bi bi-calendar3 me-2 text-secondary"></i>
                                <strong>Sinh vào:</strong>{" "}
                                {info.DateOfBirth
                                    ? new Date(info.DateOfBirth).toLocaleDateString("vi-VN")
                                    : "Chưa cập nhật"}
                            </p>

                        </div>
                    ))
                ) : (
                    <p className="text-white mt-3">Chưa có thông tin.</p>
                )}

                {currentUserId === user?.id && (
                    <button
                        type="button"
                        className="btn btn-light mt-2"
                        onClick={() => setShowEditUserInfo(true)}
                    >
                        Chỉnh sửa thông tin
                    </button>
                )}
            </div>
        </div>
    );
}
