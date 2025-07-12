import React, { useEffect, useState } from 'react';
import ReplyToCommentList from "@/Components/Truong/ReplyToCommentList";
import LikeDislikeButton from "./LikeDislikeButton";
import CommentForm from "./CommentForm";

export default function ListComment({
    comment,
    usersList,
    commentDetailsList,
    replyToCommentsList,
    onLikeDislike,
    onReplySubmit,
    checkLiked,
    checkDisLiked,
    likeCount,
    disLikeCount,
    dataReplyCmt,
    setDataReplyCmt,
    processingReplyCmt,
    formatTime
}) {
    const user = usersList.find(u => u.id === comment.IdUser);
    const commentDetails = commentDetailsList.filter(detail => detail.IdComment === comment.Id);
    const replies = replyToCommentsList.filter(reply => reply.IdComment === comment.Id);
    const [showCommentForm, setShowCommentForm] = useState(false);

    return (
        <div className="mb-3">
            <div className="p-3 border rounded-3 shadow-sm text-color bg-details">
                {user && (
                    <div className="d-flex align-items-center mb-1">
                        <a href={`/profile/${user.id}`} className="text-decoration-none a-custom-hover">
                            <strong>{user.name}</strong>
                        </a>
                    </div>
                )}
                {commentDetails.length > 0 ? (
                    commentDetails.map((detail, i) => (
                        <React.Fragment key={detail.Id || `detail-${i}`}>
                            <p>{detail.Text || "Nội dung bình luận không khả dụng"}</p>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <p><small>{formatTime(detail.CreateDate) || "Không rõ ngày"}</small></p>
                                <div>
                                    <LikeDislikeButton
                                        isLiked={checkLiked}
                                        onClick={(e) => onLikeDislike(comment.Id, 1, e)}
                                        type="primary"
                                        icontype="up"
                                        className="btn-liked btn-style-unv"
                                    />
                                    <LikeDislikeButton
                                        isLiked={checkDisLiked}
                                        onClick={(e) => onLikeDislike(comment.Id, 0, e)}
                                        type="danger"
                                        icontype="down"
                                        className="btn-disLiked btn-style-unv"
                                    />
                                    <button className="btn btn-sm btn-outline-info ms-2 btn-style-unv" onClick={() => setShowCommentForm(!showCommentForm)}>
                                        <i className="fa-duotone fa-thin fa-comment"></i> Phản hồi
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    ))
                ) : (
                    <p>Nội dung bình luận không khả dụng</p>
                )}
                <div className="d-flex justify-content-start align-items-center mt-2">
                    <div className="d-flex align-items-center me-3">
                        <i className="fa-duotone fa-light fa-thumbs-up text-primary me-1"></i>
                        <span>{likeCount}</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <i className="fa-duotone fa-thin fa-thumbs-down text-danger me-1"></i>
                        <span>{disLikeCount}</span>
                    </div>
                </div>
                <div className="overflow-auto custom-scrollbar" style={{ maxHeight: "265px" }}>
                    {replies.length > 0 && (
                        <ReplyToCommentList
                            replyToComments={replies}
                            users={usersList}
                            formatTime={formatTime}
                        />
                    )}
                </div>
                {showCommentForm && (
                    <div className="mt-3">
                        <CommentForm
                            value={dataReplyCmt.text}
                            onChange={(e) => setDataReplyCmt(prev => ({ ...prev, text: e.target.value }))}
                            onSubmit={(e) => onReplySubmit(e, comment.Id)}
                            text="phản hồi"
                            processing={processingReplyCmt}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
