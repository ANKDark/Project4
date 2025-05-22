const ReplyToCommentList = ({ replyToComments, users, formatTime }) => (
    <>
        {replyToComments.length > 0 && replyToComments.map((replyToComment) => {
            const usercmt = users.find(usr => usr.id === replyToComment.IdUser);
            return (
                <div key={replyToComment.Id} className="mt-3 ms-4">
                    <div className="p-3 border rounded-3 shadow-sm text-color bg-details">
                        {usercmt && (
                            <div className="d-flex align-items-center">
                                <a href={`/profile/${usercmt.id}`} className="text-decoration-none a-custom-hover">
                                    <strong>{usercmt.name}</strong>
                                </a>
                            </div>
                        )}
                        <p>{replyToComment.Text}</p>
                        <small>{formatTime(replyToComment.CreateDate) || "Không rõ ngày"}</small>
                    </div>
                </div>
            );
        })}
    </>
);
export default ReplyToCommentList;
