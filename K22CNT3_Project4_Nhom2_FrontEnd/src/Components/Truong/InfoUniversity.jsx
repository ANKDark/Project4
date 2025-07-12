const InfoUniversity = ({ truong }) => {
    if (!truong) {
        return <p className="text-center text-muted">Thông tin trường không khả dụng.</p>;
    }
    const { TenTruong, NamThanhLap, MoTaTruong, Img } = truong;

    return (
        <div className="thong-tin-truong">
            <div className="text-center mb-4 text-color">
                <h1 className="fw-bold fs-2 text-uppercase neon-text">{TenTruong}</h1>
                <small className="text-color neon-text">{NamThanhLap || "Chưa cập nhật năm thành lập"}</small>
            </div>
            <div className="mb-4 text-color bg-details rounded shadow-sm">
                {Img ? (
                    <img
                        src={`http://127.0.0.1:8000${Img}`}
                        alt={`Image of ${TenTruong}`}
                        className="img-fluid rounded w-100 neon-glow"
                        style={{ maxHeight: '600px' }}
                    />
                ) : (
                    <p className="text-center">Chưa có hình ảnh trường.</p>
                )}
            </div>
            <div className="card mb-4 text-color bg-details neon-glow">
                <div className="card-body">
                    <h5 className="card-title fw-bold fs-5">Mô tả trường</h5>
                    {MoTaTruong ? (
                        <div dangerouslySetInnerHTML={{ __html: MoTaTruong }} />
                    ) : (
                        <p>Chưa có mô tả cho trường này.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoUniversity;
