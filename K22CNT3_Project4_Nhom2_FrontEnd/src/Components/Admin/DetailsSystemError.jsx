import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

export default function DetailsSystemError({ error, onClose }) {
    if (!error) return null;

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            <Modal open={!!error} onClose={onClose} sx={{ zIndex: 1050 }}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    bgcolor: '#343a40',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    color: '#fff',
                    borderRadius: '8px',
                }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Chi tiết lỗi: {error.name || 'Không xác định'}
                    </Typography>
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <i className="fa-regular fa-subtitles me-2" style={{ color: '#1976d2' }}></i>
                            <strong>Mô tả:</strong> {error.description || 'Không có mô tả'}
                        </li>
                        <li className="mb-2">
                            <i className="fa-regular fa-clock me-2" style={{ color: '#f57c00' }}></i>
                            <strong>Thời gian lỗi:</strong> {error.error_time ? new Date(error.error_time).toLocaleString() : 'N/A'}
                        </li>
                        <li className="mb-2">
                            <i className="fa-regular fa-microchip me-2" style={{ color: '#4caf50' }}></i>
                            <strong>Hệ điều hành:</strong> {error.os || 'Không xác định'}
                        </li>
                        <li className="mb-2">
                            <i className="fa-regular fa-check-circle me-2" style={{ color: error.is_fixed ? '#388e3c' : '#d32f2f' }}></i>
                            <strong>Trạng thái:</strong> {error.is_fixed ? 'Đã sửa' : 'Chưa sửa'}
                        </li>
                        <li className="mb-2">
                            <i className="fa-regular fa-image me-2" style={{ color: '#ab47bc' }}></i>
                            <strong>File đính kèm:</strong>
                            {error.attachment_path ? (
                                <div className="mt-2">
                                    <img
                                        src={`http://127.0.0.1:8000${error.attachment_path}`}
                                        alt="Attachment"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '4px',
                                            border: '1px solid #555',
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/storage/default-image.png';
                                        }}
                                    />
                                </div>
                            ) : (
                                <span> Không có ảnh</span>
                            )}
                        </li>
                    </ul>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onClose}
                        sx={{ mt: 2, backgroundColor: '#3085d6' }}
                    >
                        Đóng
                    </Button>
                </Box>
            </Modal>
        </>
    );
}