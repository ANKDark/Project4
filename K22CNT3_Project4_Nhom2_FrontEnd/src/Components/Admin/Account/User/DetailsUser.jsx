import React from 'react';
import { Head } from '@inertiajs/react';

export default function DetailsUser({ user, onClose, listUser }) {
    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-0">
                            <h5 className="modal-title w-100 text-center border-bottom">
                                Chi tiết tài khoản {user.name}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-4 text-center m-0">
                                    <img
                                        src={user.profile_photo_path || '/path/to/default-image.jpg'}
                                        alt={user.name}
                                        className="img-fluid rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8 space-y-3">
                                    <p className="border-b border-gray-600 pb-2">
                                        <i className="fa-solid fa-user me-2 text-success"></i>
                                        <span className="text-gray-400">Họ tên: </span>
                                        <strong className="text-white">{user.name}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <i className="fas fa-envelope me-2 text-info"></i>
                                        <span className="text-gray-400">Email: </span>
                                        <strong className="text-blue-400 font-semibold">{user.email}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <i className="fas fa-user me-2 text-warning"></i>
                                        <span className="text-gray-400">Phân quyền: </span>
                                        <strong className="text-blue-400 font-semibold">{user.role}</strong>
                                    </p>
                                    <p className="border-b border-gray-600 pb-2">
                                        <i className={`fas fa-circle-notch me-2 ${user.status === 'Active' ? 'text-success' : 'text-danger'}`}></i>
                                        <span className="text-gray-400">Status: </span>
                                        <strong className={`badge ms-2 ${user.status === 'Active' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                            {user.status}
                                        </strong>
                                    </p>
                                </div>

                                <div className="col-12 mt-2">
                                    <h6 className="mt-2 text-light">Thông tin cá nhân:</h6>
                                    <div className="bg-dark p-3 rounded" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {Array.isArray(user.userinfo) && user.userinfo.length > 0 ? (
                                            user.userinfo.map((info) => (
                                                <div key={info.Id} className="reply-main border border-secondary mb-3 d-flex align-items-center p-4 bg-dark rounded-4">
                                                    <div className="ml-4 space-y-2">
                                                        <div className="flex text-base font-bold text-light tracking-tight">
                                                            <span className="min-w-[90px]">Ngày sinh:</span>
                                                            <p className="text-xs text-gray-300 italic mb-0">{info.DateOfBirth || 'Không có thông tin'}</p>
                                                        </div>
                                                        <div className="flex text-base font-bold text-light tracking-tight">
                                                            <span className="min-w-[90px]">Nơi sinh:</span>
                                                            <p className="text-xs text-gray-300 italic mb-0">{info.Birthplace || 'Không có thông tin'}</p>
                                                        </div>
                                                        <div className="flex text-base font-bold text-light tracking-tight">
                                                            <span className="min-w-[90px]">Học vấn:</span>
                                                            <p className="text-xs text-gray-300 italic mb-0">{info.Education || 'Không có thông tin'}</p>
                                                        </div>
                                                        <div className="flex text-base font-bold text-light tracking-tight">
                                                            <span className="min-w-[90px]">Nơi ở:</span>
                                                            <p className="text-xs text-gray-300 italic mb-0">{info.Residence || 'Không có thông tin'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-400">Không có thông tin cá nhân.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-12 mt-1">
                                    <h6 className="mt-3 text-light">
                                        Danh sách đã follow:
                                        <span className="ml-2 text-gray-400">
                                            ({Array.isArray(user.following) ? user.following.length : 0})
                                        </span>
                                    </h6>
                                    <div className="bg-dark p-3 rounded" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {Array.isArray(user.following) && user.following.length > 0 ? (
                                            user.following.map((follow) => {
                                                const followedUser = listUser.find(u => u.id === follow.FollowedUserID);
                                                return (
                                                    <div key={follow.Id} className="border border-secondary mb-2 p-2 rounded">
                                                        <span className="text-gray-400 ml-2">Đang theo dõi: </span>
                                                        <strong className="text-white">
                                                            {followedUser ? followedUser.name : `ID ${follow.FollowedUserID}`}
                                                        </strong>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-gray-400">Không có người dùng nào được follow.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-12 mt-1">
                                    <h6 className="mt-3 text-light">
                                        Danh sách được follow:
                                        <span className="ml-2 text-gray-400">
                                            ({Array.isArray(user.followers) ? user.followers.length : 0})
                                        </span>
                                    </h6>
                                    <div className="bg-dark p-3 rounded" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {Array.isArray(user.followers) && user.followers.length > 0 ? (
                                            user.followers.map((follower) => {
                                                const followerUser = listUser.find(u => u.id === follower.FollowerID);
                                                return (
                                                    <div key={follower.Id} className="border border-secondary mb-2 p-2 rounded">
                                                        <span className="text-gray-400 ml-2">Người theo dõi: </span>
                                                        <strong className="text-white">
                                                            {followerUser ? followerUser.name : `ID ${follower.FollowerID}`}
                                                        </strong>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-gray-400">Không có người dùng nào follow.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
