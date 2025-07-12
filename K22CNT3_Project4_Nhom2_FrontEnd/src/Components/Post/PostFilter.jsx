import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  const [interactionPosts, setInteractionPosts] = useState(post.interaction_post || []);
  const user = post.users;
  const [interactionsCommentPost, setInteractionPostsCommentPost] = useState([]);
  const [interactionsReplyCommentPost, setInteractionReplyCommentPost] = useState([]);
  const [formData, setFormData] = useState({
    content: post.Content,
    status: post.Status,
    imgName: post.Image || null,
  });
  const [image, setImage] = useState(post.Image || null);

  const interactionCount = interactionPosts.filter(interaction => interaction.IdPost === post.Id).length;

  const comment_postt = post?.comment_post || [];
  const ReplyCommentPost = comment_postt.flatMap(comment => comment.comment_post_details_reply || []);

  const commentLiked = useMemo(() => {
    const liked = {};
    post.comment_post.forEach(comment => {
      const interaction = interactionsCommentPost.find(
        (item) =>
          item.IdCommentPost === comment.Id &&
          item.IdUser === currentUserId &&
          item.Like === 1
      );
      liked[comment.Id] = !!interaction;
    });
    return liked;
  }, [interactionsCommentPost, post.comment_post, currentUserId]);

  const replyLiked = useMemo(() => {
    const liked = {};
    post.comment_post.forEach(comment => {
      comment.comment_post_details_reply?.forEach(reply => {
        const interaction = interactionsReplyCommentPost.find(
          (item) =>
            item.IdReplyCommentPost === reply.id &&
            item.IdUser === currentUserId &&
            item.Like === 1
        );
        liked[reply.id] = !!interaction;
      });
    });
    return liked;
  }, [interactionsReplyCommentPost, post.comment_post, currentUserId]);

  useEffect(() => {
    const subscribedChannels = [];

    post.comment_post.forEach(comment => {
      if (comment.Id) {
        const commentChannel = `interactionCommentPost.${comment.Id}`;
        subscribedChannels.push(commentChannel);

        window.Echo.channel(commentChannel)
          .listen('InteractionCommentPostUpdated', (e) => {
            const updatedInteraction = e.interactionsCommentPost;
            if (updatedInteraction.IdCommentPost && !updatedInteraction.IdReplyCommentPost) {
              setInteractionPostsCommentPost(prev => {
                const exists = prev.some(i => i.id === updatedInteraction.id);
                if (exists) {
                  return prev.filter(item => item.id !== updatedInteraction.id);
                }
                const filtered = prev.filter(item => item.id !== updatedInteraction.id);
                return [...filtered, updatedInteraction];
              });
            }
          });
      }

      if (Array.isArray(comment.comment_post_details_reply)) {
        comment.comment_post_details_reply.forEach(reply => {
          if (reply.id) {
            const replyChannel = `interactionCommentPost.${reply.id}`;
            subscribedChannels.push(replyChannel);

            window.Echo.channel(replyChannel)
              .listen('InteractionCommentPostUpdated', (e) => {
                const updatedInteraction = e.interactionsCommentPost;
                if (!updatedInteraction.IdCommentPost && updatedInteraction.IdReplyCommentPost) {
                  setInteractionReplyCommentPost(prev => {
                    const exists = prev.some(i => i.id === updatedInteraction.id);
                    if (exists) {
                      return prev.filter(item => item.id !== updatedInteraction.id);
                    }
                    const filtered = prev.filter(item => item.id !== updatedInteraction.id);
                    return [...filtered, updatedInteraction];
                  });
                }
              });
          }
        });
      }
    });

    return () => {
      subscribedChannels.forEach(channel => {
        window.Echo.leave(channel);
      });
    };
  }, [post.comment_post, interactionsCommentPost, interactionsReplyCommentPost]);

  const webSocketChannel = `interactionPost.${post.Id}`;
  useEffect(() => {
    setInteractionPosts(post.interaction_post || []);

    window.Echo.channel(webSocketChannel)
      .listen('InteractionPostUpdated', (e) => {
        const updatedInteraction = e.interactionPost || e;
        if (updatedInteraction && updatedInteraction.id && updatedInteraction.IdPost === post.Id) {
          setInteractionPosts(prevInteractions => {
            const exists = prevInteractions.some(item => item.id === updatedInteraction.id);
            if (exists) {
              return prevInteractions.filter(item => item.id !== updatedInteraction.id);
            } else {
              return [...prevInteractions, {
                id: updatedInteraction.id,
                IdPost: updatedInteraction.IdPost,
                IdUser: updatedInteraction.IdUser,
                Like_or_Dislike: updatedInteraction.Like_or_Dislike
              }];
            }
          });
        }
      });

    return () => {
      window.Echo.leave(webSocketChannel);
    };
  }, [post.Id, post.interaction_post]);

  useEffect(() => {
    if (!post || !Array.isArray(post.comment_post)) {
      return;
    }

    const allInteractions = [];
    const allReplyInteractions = [];

    post.comment_post.forEach(comment => {
      allInteractions.push(...(comment.interaction_comment_post || []));
      (comment.comment_post_details_reply || []).forEach(reply => {
        allReplyInteractions.push(...(reply.interaction_reply_comment_post || []));
      });
    });

    setInteractionPostsCommentPost(allInteractions);
    setInteractionReplyCommentPost(allReplyInteractions);
  }, [post.comment_post]);

  const interactionsCommentPostCount = useMemo(() => {
    return interactionsCommentPost.reduce((acc, interaction) => {
      const commentId = interaction.IdCommentPost;
      if (!acc[commentId]) {
        acc[commentId] = 0;
      }
      acc[commentId]++;
      return acc;
    }, {});
  }, [interactionsCommentPost]);

  const interactionsReplyCommentPostCount = useMemo(() => {
    return interactionsReplyCommentPost.reduce((acc, interaction) => {
      const replyId = interaction.IdReplyCommentPost;
      if (!replyId) return acc;
      if (!acc[replyId]) {
        acc[replyId] = 0;
      }
      acc[replyId]++;
      return acc;
    }, {});
  }, [interactionsReplyCommentPost]);

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

  const checkLiked = interactionPosts.find(
    (interaction) =>
      interaction.IdPost === post.Id &&
      interaction.IdUser === currentUserId &&
      interaction.Like_or_Dislike === 1
  );

  const handleChangeUserPost = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCommentClick = (post) => {
    setSelectedPost(post);
    setShowDetailsPost(true);
  };

  const handleEditPost = () => {
    setFormData({
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
      setFormData({ ...formData, imgName: file });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setFormData({ ...formData, imgName: file });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('content', formData.content);
    data.append('status', formData.status);
    if (formData.imgName instanceof File) {
      data.append('imgName', formData.imgName);
    }

    try {
      await axios.put(`/api/posts/${post.Id}`, data, {
        headers: {
 intellectual: 'multipart/form-data',
        },
      });
      setShowEditPost(false);
      setFormData({
        content: post.Content,
        status: post.Status,
        imgName: post.Image || null,
      });
      setAlert({ message: 'Cập nhật bài viết thành công!', type: 'success' });
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Có lỗi xảy ra!', type: 'danger' });
    }
  };

  return (
    <div className="card p-3 shadow-sm bg-crp mt-3 w-50 mx-auto">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <a href={`/profile/${user.id}`} className="text-decoration-none fw-bold me-2">
            {user.profile_photo_path && user.profile_photo_path !== null ? (
              <img
                src={`http://127.0.0.1:8000${user.profile_photo_path}`}
                alt="Profile"
                className="profile-image-posts"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                }}
              />
            ) : (
              <img
                src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Profile"
                className="profile-image-posts"
              />
            )}
          </a>
          <div>
            <a href={`/profile/${user.id}`} className="text-decoration-none fw-bold text-color">
              {user.name}
            </a>
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
              key={`http://127.0.0.1:8000${post.Image}`}
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
              src={`http://127.0.0.1:8000${post.Image}`}
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
          content={formData.content}
          status={formData.status}
          image={image}
          onChange={handleChangeUserPost}
          imageName={formData.imgName}
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