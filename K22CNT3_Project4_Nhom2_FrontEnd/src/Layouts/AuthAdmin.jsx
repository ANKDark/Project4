import React from 'react'

export default function AuthAdmin({ children }) {
    return (
        <section>
            <div className="form-box">
                <div className="form-value">
                    {children}
                </div>
            </div>
        </section>
    )
}
