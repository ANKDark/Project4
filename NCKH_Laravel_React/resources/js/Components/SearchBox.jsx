import React from 'react';

const SearchBox = ({ placeholder, value, onChange, className}) => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-8">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  </div>
);

export default SearchBox;
