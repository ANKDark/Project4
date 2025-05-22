import React, { useEffect, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import EditPostForm from "../User/EditPostForm";
import DetailsPost from "../User/DetailsPost";

export default function PostFilter({
  post,
  currentUserId,
  handleUserDelPost,
  handleInteraction,
  formatTime,
  allUser,
  setAlert
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailsPost, setShowDetailsPost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);

  const user = post.users;

  const interactionCount = post.interaction_post?.filter(interaction => interaction.IdPost === post.Id).length;

  const comment_postt = post?.comment_post || [];
  const ReplyCommentPost = comment_postt.flatMap(comment => comment.comment_post_details_reply || []);

  const interactionsCommentPostCount = comment_postt.reduce((acc, comment) => {
    const id = comment.Id;
    const interactions = comment.interaction_comment_post ?? [];
    acc[id] = interactions.length;
    return acc;
  }, {});

  const commentLiked = {};
  post.comment_post?.forEach(comment => {
    const interaction = comment.interaction_comment_post?.find(
      (item) =>
        item.IdCommentPost === comment.Id &&
        item.IdUser === currentUserId &&
        item.Like === 1
    );
    commentLiked[comment.Id] = !!interaction;
  });

  const interactionsReplyCommentPostCount = ReplyCommentPost.reduce((acc, rc) => {
    const id = rc.id;
    const interactions = rc.interaction_reply_comment_post ?? [];
    acc[id] = interactions.length;
    return acc;
  }, {});

  const replyLiked = {};
  post.comment_post?.forEach(comment => {
    comment.comment_post_details_reply?.forEach(reply => {
      const interaction = reply.interaction_reply_comment_post?.find(
        (item) =>
          item.IdReplyCommentPost === reply.id &&
          item.IdUser === currentUserId &&
          item.Like === 1
      );
      replyLiked[reply.id] = !!interaction;
    });
  });

  const filteredComments = post.comment_post?.filter(
    (comment) =>
      comment.IdProfilePost === post.Id &&
      (comment.Visibility === "Public" ||
        (comment.Visibility === "Private" && comment.IdUser === currentUserId))
  );
  const commentCount = filteredComments.reduce((total, comment) => {
    const replyCount = comment.comment_post_details_reply?.length || 0;
    return total + 1 + replyCount;
  }, 0);

  const checkLiked = post.interaction_post?.find(
    (interaction) =>
      interaction.IdPost === post.Id &&
      interaction.IdUser === currentUserId &&
      interaction.Like_or_Dislike === 1
  );

  const { data, setData, post: putUserPost, reset } = useForm({
    content: post.Content,
    status: post.Status,
    imgName: post.Image || null,
  });

  const [image, setImage] = useState(post.Image || null);

  const handleChangeUserPost = (e) => {
    setData(e.target.name, e.target.value);
  };

  const handleCommentClick = (post) => {
    setSelectedPost(post);
    setShowDetailsPost(true);
  };

  const handleEditPost = () => {
    setData({
      content: post.Content,
      status: post.Status,
      imgName: post.Image || null,
    });

    setImage(post.Image || null);
    setShowEditPost(true);
    setShowMenu(false);
    setShowDetailsPost(false);
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setData("imgName", file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setData("imgName", file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();

    putUserPost(route("userUpdatePost", post.Id), {
      preserveScroll: true,
      onSuccess: () => {
        setShowEditPost(false);
        reset();
      },
      onError: (errors) => {
        setAlert({ message: errors, type: 'danger' });
      },
    });
  };

  return (
    <div className="card p-3 shadow-sm bg-crp mt-3 w-50 mx-auto">
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
                  e.target.src = "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                }}
              />
            ) : (
              <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Profile" className="profile-image-posts" />
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
          <button
            className="btn btn-sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <i className="bi bi-three-dots fs-5" style={{ color: "#b9afaf" }}></i>
          </button>
        )}
        {showMenu && (
          <div className="position-absolute end-0 mt-2 bg-secondary shadow-sm rounded-2 p-1 me-5" style={{ width: "160px" }}>
            <button
              className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 mb-1 border-0"
              onClick={handleEditPost}
            >
              <i className="fa-duotone fa-solid fa-pen-to-square"></i><span className="ms-1">Sửa</span>
            </button>
            <button
              className="btn btn-sm btn-outline-light w-100 d-flex align-items-center gap-2 mb-1 border-0"
              onClick={(e) => handleUserDelPost(e, post.Id)}
            >
              <i className="fa-duotone fa-light fa-trash"></i><span className="ms-1">Xóa</span>
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
            <img
              src={post.Image}
              className="max-h-[700px] object-contain rounded"
              alt="Post"
            />
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
      <div className="d-flex justify-content-between mt-2 border-top pt-2">
        <button
          className={`btn flex-grow-1 text-center btn-outline-secondary border-0 ${checkLiked ? "text-primary" : "text-light"}`}
          onClick={(e) => handleInteraction(1, e, post.Id)}
        >
          <i className="fa-duotone fa-thin fa-thumbs-up"></i>
          <span className="ms-2">Thích</span>
        </button>
        <button
          className="btn text-light flex-grow-1 text-center btn-outline-secondary border-0"
          onClick={() => {
            handleCommentClick(post);
            setShowDetailsPost(true);
          }}
        >
          <i className="fa-duotone fa-thin fa-comment"></i><span className="ms-2">Bình luận</span>
        </button>
        <button className="btn text-light border-0 flex-grow-1 text-center" disabled>
          <i className="fa-duotone fa-thin fa-share"></i><span className="ms-2">Chia sẻ</span>
        </button>
      </div>

      {showEditPost && (
        <EditPostForm
          onClose={() => setShowEditPost(false)}
          content={data.content}
          status={data.status}
          image={image}
          onChange={handleChangeUserPost}
          imageName={data.imgName}
          handleFileChange={handleFileChange}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          setAlert={setAlert}
          handleSubmit={handleSubmitEdit}
        />
      )}

      {showDetailsPost && (
        <DetailsPost
          post={selectedPost}
          user={user}
          formatTime={formatTime}
          currentUserId={currentUserId}
          checkLiked={checkLiked}
          handleInteraction={handleInteraction}
          onClose={() => setShowDetailsPost(false)}
          commentPostsThroughProfilePosts={post.comment_post}
          interactionCount={interactionCount}
          commentCount={commentCount}
          interactionsCommentPostCount={interactionsCommentPostCount}
          interactionsReplyCommentPostCount={interactionsReplyCommentPostCount}
          allUser={allUser}
          setAlert={setAlert}
          handleUserDelPost={handleUserDelPost}
          handleEditPost={handleEditPost}
          replyLiked={replyLiked}
          commentLiked={commentLiked}
        />
      )}
    </div>
  );
}