import React from 'react';
import '../../assets/css/RaTing.css';

export default function RaTing({ selectedRating, handleInteraction, processing }) {
    return (
        <div className="rating-container d-flex flex-column align-items-center">
            <fieldset className="rating">
                {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((value) => (
                    <React.Fragment key={value}>
                        <input
                            type="radio"
                            id={`star${value}`}
                            name="rating"
                            value={value}
                            onChange={(e) => handleInteraction(value, e)}
                            checked={selectedRating === value}
                            disabled={processing}
                        />
                        <label
                            className={value % 1 === 0 ? 'full' : 'half'}
                            htmlFor={`star${value}`}
                            title={`${value} sao`}
                        ></label>
                    </React.Fragment>
                ))}
            </fieldset>
            <div className="rating-feedback">
                {selectedRating ? (
                    <>
                        <strong>Nhận xét của bạn về trường:</strong> {selectedRating} <i className="bi bi-star-fill text-warning"></i>
                    </>
                ) : (
                    <strong>Bạn chưa nhận xét về trường.</strong>
                )}
            </div>
        </div>
    );
}