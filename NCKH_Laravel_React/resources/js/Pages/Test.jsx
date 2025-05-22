import React from 'react'

export default function Test() {
  const user = { name: "Default User" }; // Define a default user object
  const onClose = () => console.log("Modal closed"); // Define the onClose function
  return (
    <div className="modal fade show d-block create-post-overlay bg-dark bg-opacity-75" tabIndex="-1" role="dialog" style={{ marginTop: 30 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 800 }}>
        <div className="modal-content bg-crp rounded-3" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
          <div className="modal-header position-relative p-4" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#222" }}>
            <h1 className="position-absolute start-50 translate-middle-x fs-4"><strong>Bài viết của {user.name}</strong></h1>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          </div>
          </div>
          </div>

  )
}
