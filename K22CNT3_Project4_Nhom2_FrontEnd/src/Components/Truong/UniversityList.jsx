import React from 'react';
import axios from 'axios';

const UniversityList = ({ image, name, year, description, id, sumRatingUnv }) => {
  const plainText = new DOMParser().parseFromString(description || '', 'text/html').body.textContent || '';
  const rating = sumRatingUnv?.find((item) => item.IdTruong === id)?.average_rating || '0';

  const handleLinkClick = async (e, itemId) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/logVisit',
        { IdTruong: itemId },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      console.log('Log visit response:', response.data);
      window.location.href = `/details/${itemId}`;
    } catch (error) {
      console.error('Failed to log visit:', error.response?.data || error.message);
      window.location.href = `/details/${itemId}`;
    }
  };

  return (
    <div className="col-lg-3 col-md-4 col-6 d-flex justify-content-center mb-4">
      <div className="card text-center bg-list-unv" style={{ borderRadius: '10px', overflow: 'hidden' }}>
        <img
          src={image || '/images/default.jpg'}
          className="card-img-top"
          alt={name}
          style={{ maxHeight: '150px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{name}</h5>
          <p className="card-text">
            <strong>Năm: </strong>
            {year}
          </p>
          <p className="card-text text-truncate">{plainText}</p>

          <div className="mt-auto">
            <a href={`/details/${id}`} className="btn btn-secondary" onClick={(e) => handleLinkClick(e, id)}>
              Chi tiết
            </a>
          </div>
        </div>
        <div className="text-end px-3 pb-2">
          <i className="fa-solid fa-star text-warning"></i> {parseFloat(rating).toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default UniversityList;