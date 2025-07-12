import React, { useEffect } from 'react';

export default function DetailsUnv({ university, onClose }) {
    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    if (!university) return null;

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 'Chưa có';
        const sum = ratings.reduce((total, r) => total + parseFloat(r.Rate || 0), 0);
        return `${(sum / ratings.length).toFixed(1)} / 5`;
    };

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-0">
                            <h5 className="modal-title w-100 text-center">{university.TenTruong}</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-4 text-center m-0">
                                    <img
                                        src={`http://127.0.0.1:8000${university.Img}`}
                                        alt={university.TenTruong}
                                        className="img-fluid rounded border"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <p className='border-bottom border-secondary'><strong>Năm thành lập:</strong> {university.NamThanhLap}</p>
                                    <p className='border-bottom border-secondary'><strong>Danh mục:</strong> {university.category?.CategoryName || 'Không có'}</p>
                                    <p className='border-bottom border-secondary'>
                                        <strong>Trạng thái xác thực:</strong>{' '}
                                        <span className={`badge px-3 py-2 ${university.Is_verified ? 'bg-success' : 'bg-danger'}`}>
                                            {university.Is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </span>
                                    </p>
                                    <p className='border-bottom border-secondary'><strong>Số lượng bình luận:</strong> {university.comments?.length || 0}</p>
                                    <p className='border-bottom border-secondary'><strong>Điểm đánh giá trung bình:</strong> {calculateAverageRating(university.ratings)} <i className="fa fa-star ms-1 text-warning"></i></p>
                                </div>
                                <div className="col-12">
                                    <h6 className="mt-3">Mô tả:</h6>
                                    <div
                                        className="bg-dark p-3 rounded"
                                        style={{ maxHeight: '350px', overflowY: 'auto' }}
                                        dangerouslySetInnerHTML={{ __html: university.MoTaTruong }}
                                    />
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
