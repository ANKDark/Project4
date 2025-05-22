import React, { useEffect, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import CommentInput from "./CommentInput";

export default function DetailsPost({
  post,
  user,
  formatTime,
  currentUserId,
  onClose,
  checkLiked,
  handleInteraction,
  interactionCount,
  commentPostsThroughProfilePosts,
  commentCount,
  allUser,
  handleUserDelPost,
  handleEditPost,
  setAlert,
  interactionsCommentPostCount,
  interactionsReplyCommentPostCount,
  commentLiked,
  replyLiked,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);

  const filteredComments = commentPostsThroughProfilePosts.filter(
    (comment) =>
      comment.IdProfilePost === post.Id &&
      (comment.Visibility === "Public" ||
        (comment.Visibility === "Private" && comment.IdUser === currentUserId))
  );

  const { data, setData, post: submitPost, reset, errors } = useForm({
    Text: "",
    IdPost: post.Id,
    Visibility: "Public",
  });

  const { data: dataReplyComment, setData: setDataReplyComment, post: submitReplyComment, reset: resetReplyComment, errors: errorsReplyComment } = useForm({
    Text: "",
    IdCommentPost: null,
    IdUserReply: null,
  });

  const handleSubmitComment = (e) => {
    e.preventDefault();
    submitPost(route("commentPost"), {
      onSuccess: () => {
        reset();
      },
      preserveScroll: true,
      onError: (errors) => {
        setAlert({ message: errors, type: "danger" });
      },
    });
  };

  const handleSubmitReplyComment = (e, userIdReply, commentId) => {
    e.preventDefault();
    setDataReplyComment({ IdCommentPost: commentId, IdUserReply: userIdReply, Text: dataReplyComment.Text });
  };

  useEffect(() => {
    if (dataReplyComment.Text !== null && dataReplyComment.IdUserReply !== null && dataReplyComment.IdCommentPost !== null) {
      submitReplyComment(route("replyCommentPost"), {
        onSuccess: () => {
          resetReplyComment();
          setActiveReplyCommentId(null);
        },
        preserveScroll: true,
        onError: (errorsReplyComment) => {
          setAlert({ message: errorsReplyComment, type: "danger" });
        },
      });
    }
  }, [dataReplyComment]);

  const toggleReplyInput = (commentId) => {
    setActiveReplyCommentId(activeReplyCommentId === commentId ? null : commentId);
    resetReplyComment();
  };


  const { data: dataLike, setData: setDataLike, post: postLike } = useForm({
    IdCommentPost: null,
    IdReplyCommentPost: null,
    Like: null,
  });

  const handleInteractionLikeComment = (like, e, IdCommentPost, IdReplyCommentPost) => {
    e.preventDefault();
    setDataLike({ IdCommentPost: IdCommentPost, Like: like, IdReplyCommentPost: IdReplyCommentPost });
  };

  useEffect(() => {
    if (dataLike.IdCommentPost !== null && dataLike.Like !== null || dataLike.IdReplyCommentPost !== null && dataLike.Like !== null) {
      postLike(route("interactionCommentPost"), { preserveScroll: true });
    }
  }, [dataLike]);

  return (
    <div className="modal fade show d-block create-post-overlay bg-dark bg-opacity-75" tabIndex="-1" role="dialog" style={{ marginTop: 30 }}>
      <div className="modal-dialog modal-dialog-centered w-50 mx-auto" style={{ maxWidth: 650 }}>
        <div className="modal-content bg-crp rounded-3" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
          <div className="modal-header position-relative p-4" style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#222" }}>
            <h1 className="position-absolute start-50 translate-middle-x fs-4">
              <strong>Bài viết của {user.name}</strong>
            </h1>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="p-3 overflow-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Link href={`/profile/${user.id}`} className="text-decoration-none fw-bold me-2">
                  {user.profile_photo_path && user.profile_photo_path !== null ? (
                    <img
                      src={user.profile_photo_path}
                      alt="Profile"
                      className="profile-image-posts"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                      }}
                    />
                  ) : (
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                      alt="Profile"
                      className="profile-image-posts"
                    />
                  )}
                </Link>
                <div>
                  <Link href={`/profile/${user.id}`} className="text-decoration-none fw-bold">
                    {user.name}
                  </Link>
                  <div>
                    <span className="text-white small">{formatTime(post.created_at)}</span>
                    <span className="text-secondary small">
                      {post.Status === 1 ? (
                        <i className="fa-solid fa-user-group ms-2 small" title="Công khai" style={{ cursor: "pointer" }}></i>
                      ) : (
                        <i className="fa-solid fa-lock-keyhole ms-2 small" title="Riêng tư" style={{ cursor: "pointer" }}></i>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {user.id === currentUserId && (
                <button className="btn btn-sm" onClick={() => setShowMenu(!showMenu)}>
                  <i className="bi bi-three-dots fs-5" style={{ color: "#b9afaf" }}></i>
                </button>
              )}
              {showMenu && (
                <div className="position-absolute end-0 mt-2 bg-dark shadow-sm rounded-2 p-1 me-5" style={{ width: "160px" }}>
                  <button className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 mb-1 border-0" onClick={handleEditPost}>
                    <i className="fa-duotone fa-solid fa-pen-to-square"></i>
                    <span className="ms-1">Sửa</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 mb-1 border-0"
                    onClick={(e) => handleUserDelPost(e, post.Id)}
                  >
                    <i className="fa-duotone fa-light fa-trash"></i>
                    <span className="ms-1">Xóa</span>
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2">
              <p>{post.Content}</p>
            </div>
            {post.Image && (
              <div className="mt-3 mb-2 flex justify-center">
                {/\.(mp4|webm|ogg)$/i.test(post.Image) ? (
                  <video
                    key={post.Image}
                    controls
                    className="rounded-2xl shadow-lg border border-gray-600 max-w-full max-h-[700px] object-cover"
                    preload="metadata"
                    autoPlay
                  >
                    <source src={post.Image} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                ) : (
                  <img src={post.Image} className="max-h-[700px] object-contain rounded" alt="Post" />
                )}
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center px-3">
              <div className="d-flex align-items-center cursor-pointer">
                <i className="fa-duotone fa-thumbs-up text-primary me-1"></i>
                <span className="text-secondary">{interactionCount}</span>
              </div>
              <div className="text-secondary cursor-pointer">
                <span>{commentCount} bình luận</span>
              </div>
            </div>
            <div className="d-flex justify-content-between mt-2 border-top border-bottom pt-1 pb-1">
              <button
                className={`btn flex-grow-1 text-center btn-outline-secondary border-0 ${checkLiked ? "text-primary" : "text-light"}`}
                onClick={(e) => handleInteraction(1, e, post.Id)}
              >
                <i className="fa-duotone fa-thin fa-thumbs-up"></i>
                <span className="ms-2">Thích</span>
              </button>
              <button className="btn text-light flex-grow-1 text-center btn-outline-secondary border-0">
                <i className="fa-duotone fa-thin fa-comment"></i>
                <span className="ms-2">Bình luận</span>
              </button>
              <button className="btn text-light border-0 flex-grow-1 text-center" disabled>
                <i className="fa-duotone fa-thin fa-share"></i>
                <span className="ms-2">Chia sẻ</span>
              </button>
            </div>
            <div className="container mt-3">
              <div>
                {filteredComments && filteredComments.length > 0 ? (
                  filteredComments.map((comment, index) => {
                    const commentUser = allUser.find((user) => user.id === comment.IdUser);

                    return (
                      <div className="d-flex mb-3" key={comment.Id || index}>
                        <Link href={`/profile/${commentUser?.id}`} className="text-decoration-none fw-bold me-2">
                          {commentUser?.profile_photo_path ? (
                            <img
                              src={commentUser.profile_photo_path}
                              alt="Profile"
                              className="profile-image-posts"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                              }}
                            />
                          ) : (
                            <img
                              src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                              alt="Profile"
                              className="profile-image-posts"
                            />
                          )}
                        </Link>
                        <div className="flex-grow-1">
                          <div className="p-2 bg-dark rounded">
                            <strong>
                              <Link href={`/profile/${commentUser?.id}`} className="text-decoration-none text-light me-2">
                                {commentUser?.name || "Người dùng ẩn danh"}
                              </Link>
                            </strong>
                            {comment.comment_post_details?.map((detailsComment, index) => (
                              <p className="mb-0" key={index}>
                                {detailsComment.Text}
                              </p>
                            ))}
                          </div>
                          <div className="text-light small d-flex align-items-center">
                            {comment.comment_post_details?.map((detailsComment, index) => (
                              <span key={index} className="ms-2 text-secondary">
                                {formatTime(detailsComment.CreateDate)}
                              </span>
                            ))}
                            <button className={`text-decoration-none ms-2 ${commentLiked[comment.Id] ? 'text-primary fw-bold' : 'text-light'}`} onClick={(e) => handleInteractionLikeComment(1, e, comment.Id)}>Thích</button>
                            <button
                              className="text-decoration-none ms-2 text-light"
                              onClick={() => toggleReplyInput(comment.Id)}
                            >
                              Trả lời
                            </button>
                            <p className="ms-4 small">{interactionsCommentPostCount[comment.Id] || 0}</p><i className="fa-duotone fa-thumbs-up me-1 ms-1"></i>
                          </div>

                          {activeReplyCommentId === comment.Id && (
                            <CommentInput
                              data={dataReplyComment}
                              setData={setDataReplyComment}
                              replyUser={true}
                              handleSubmit={(e) => handleSubmitReplyComment(e, commentUser?.id, comment.Id)}
                            />
                          )}

                          {comment.comment_post_details_reply?.length > 0 && (
                            <div className="mt-2 ms-4">
                              {comment.comment_post_details_reply.map((reply, replyIndex) => {
                                const replyUser = allUser.find((user) => user.id === reply.IdUser);
                                const replyToUser = allUser.find((user) => user.id === reply.IdUserReply);
                                return (
                                  <div className="d-flex align-items-start mb-2" key={reply.id || replyIndex}>
                                    <Link href={`/profile/${replyUser?.id}`} className="text-decoration-none fw-bold me-2">
                                      {replyUser?.profile_photo_path ? (
                                        <img
                                          src={replyUser.profile_photo_path}
                                          alt="Profile"
                                          className="rounded-circle me-2"
                                          width="32"
                                          height="32"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                          alt="Profile"
                                          className="rounded-circle me-2"
                                          width="32"
                                          height="32"
                                        />
                                      )}
                                    </Link>
                                    <div className="flex-grow-1">
                                      <div className="p-2 bg-dark rounded">
                                        <strong>
                                          <Link
                                            href={`/profile/${replyUser?.id}`}
                                            className="text-decoration-none text-light me-2"
                                          >
                                            {replyUser?.name || "Người dùng ẩn danh"}
                                          </Link>
                                        </strong>

                                        <div className="d-flex align-items-center mt-1">
                                          <strong>
                                            <Link
                                              href={`/profile/${replyToUser?.id}`}
                                              className="text-blue-200 text-decoration-none me-2"
                                            >
                                              {replyToUser?.name || "Người dùng ẩn danh"}
                                            </Link>
                                          </strong>
                                          <p className="mb-0 text-light">{reply.Text}</p>
                                        </div>
                                      </div>
                                      <div className="text-light small d-flex align-items-center">
                                        <span className="text-secondary">{formatTime(reply.CreateDate)}</span>
                                        <button className={`text-decoration-none ms-2 ${replyLiked[reply.id] ? 'text-primary fw-bold' : 'text-light'}`} onClick={(e) => handleInteractionLikeComment(1, e, null, reply.id)}>Thích</button>
                                        <button
                                          className="text-decoration-none ms-2 text-light"
                                          onClick={() => toggleReplyInput(`${comment.Id}-${reply.id}`)}
                                        >
                                          Phản hồi
                                        </button>
                                        {activeReplyCommentId === `${comment.Id}-${reply.id}` && (
                                          <CommentInput
                                            data={dataReplyComment}
                                            setData={setDataReplyComment}
                                            replyUser={true}
                                            handleSubmit={(e) => handleSubmitReplyComment(e, replyUser?.id, comment.Id)}
                                          />
                                        )}
                                        <p className="ms-4 small">{interactionsReplyCommentPostCount[reply.id] || 0}</p><i className="fa-duotone fa-thumbs-up me-1 ms-1"></i>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-light">Chưa có bình luận nào.</div>
                )}
              </div>
            </div>
          </div>
          <CommentInput data={data} setData={setData} handleSubmit={handleSubmitComment} />
        </div>
      </div>
    </div>
  );
}