import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ListBox({ table, keyword, valueName }) {
  const navigate = useNavigate();

  const filtered = table.filter((t) =>
    t[valueName].toLowerCase().includes(keyword.toLowerCase())
  );

  const handleLinkClick = async (e, itemId) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/logSearch',
        { IdTruong: itemId },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      navigate(`/details/${itemId}`);
    } catch (error) {
      console.error('Lỗi khi log tìm kiếm:', error.response?.data || error.message);
      navigate(`/details/${itemId}`);
    }
  };

  return (
    <div className="list-group list-unv-search">
      {filtered.map((t, index) => (
        <a
          key={index}
          href={`details/${t.Id}`}
          onClick={(e) => handleLinkClick(e, t.Id)}
          className="list-group-item list-unv-item"
        >
          {t[valueName]}
        </a>
      ))}
    </div>
  );
}