import React from 'react';
import { Link } from '@inertiajs/react';

const UniversityList = ({ image, name, year, description, id }) => {
  const plainText = new DOMParser().parseFromString(description || '', 'text/html').body.textContent || '';

  return (
    <div className="col-lg-3 col-md-4 col-6 d-flex justify-content-center mb-4">
      <div className="card text-center bg-list-unv" style={{ borderRadius: '10px', overflow: 'hidden' }}>
        <img
          src={image || '/images/default.jpg'}
          className="card-img-top"
          alt={name}
          style={{ maxHeight: '150px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h5 className="card-title">{name}</h5>
          <p className="card-text"><strong>Năm: </strong>{year}</p>
          <p className="card-text text-truncate">{plainText}</p>
          <Link href={`details/${id}`} className="btn btn-secondary">Chi tiết</Link>
        </div>
      </div>
    </div>
  );
};

export default UniversityList;
