const LikeDislikeButton = ({ isLiked, onClick, type, icontype, className }) => (
    <button 
        className={`btn btn-sm ${isLiked ? `btn-outline-${type} ${className}` : `btn-outline-${type}`} ms-2 btn-style-unv`} 
        onClick={onClick}
    >
        <i className={`fa-duotone fa-thin fa-thumbs-${icontype}`}></i> 
        {isLiked ? `Đã ${type === 'primary' ? 'Thích' : 'Không thích'}` : `${type === 'primary' ? 'Thích' : 'Không thích'}`}
    </button>
);

export default LikeDislikeButton;
