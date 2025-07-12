import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

export default function DetailsViolationReport({ violation, onClose }) {
    return (
        <Modal open={!!violation} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 500,
                bgcolor: '#343a40',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                color: '#fff',
                borderRadius: '8px',
            }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Chi tiết báo cáo vi phạm
                </Typography>
                <ul className="list-unstyled">
                    <li className="mb-2">
                        <i className="fa-regular fa-flag me-2" style={{ color: '#1976d2' }}></i>
                        <strong>Loại vi phạm:</strong> {violation?.violation_type || 'Không xác định'}
                    </li>
                    <li className="mb-2">
                        <i className="fa-regular fa-message me-2" style={{ color: '#f57c00' }}></i>
                        <strong>Mô tả:</strong> {violation?.description || 'Không có mô tả'}
                    </li>
                    <li className="mb-2">
                        <i className="fa-regular fa-clock me-2" style={{ color: '#4caf50' }}></i>
                        <strong>Thời gian:</strong> {violation ? new Date(violation.datetime).toLocaleString() : 'N/A'}
                    </li>
                    <li className="mb-2">
                        <i className="fa-regular fa-user me-2" style={{ color: '#90caf9' }}></i>
                        <strong>ID người dùng:</strong> {violation?.user_id ?? 'Không rõ'}
                    </li>
                    <li className="mb-2">
                        <i className="fa-regular fa-circle-check me-2" style={{ color: violation?.resolved ? '#388e3c' : '#d32f2f' }}></i>
                        <strong>Trạng thái:</strong> {violation?.resolved ? 'Đã xử lý' : 'Chưa xử lý'}
                    </li>
                    <li className="mb-2">
                        <i className="fa-regular fa-image me-2" style={{ color: '#ab47bc' }}></i>
                        <strong>Ảnh minh chứng:</strong>
                        {violation?.image_path ? (
                            <div className="mt-2">
                                <img
                                    src={`http://127.0.0.1:8000${violation.image_path}`}
                                    alt="Violation evidence"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                        border: '1px solid #555',
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
    );
}
