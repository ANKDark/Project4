import React, { useEffect, useMemo, useState } from "react";
import axios from 'axios';
import DetailsPost from "./DetailsPost";
import EditPostForm from "./EditPostForm";

export default function ListUserPost({ user, post, interactionPosts: allInteractionPosts, currentUserId, handleInteraction,
  formatTime, commentPostsThroughProfilePosts, allUser, handleUserDelPost, setAlert }) {

  const [showMenu, setShowMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailsPost, setShowDetailsPost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [interactionPosts, setInteractionPosts] = useState(allInteractionPosts);
  const [interactionsCommentPost, setInteractionPostsCommentPost] = useState([]);
  const [interactionsReplyCommentPost, setInteractionReplyCommentPost] = useState([]);
  const [data, setData] = useState({
    content: post.Content,
    status: post.Status,
    imgName: post.Image || null,
  });
  const [image, setImage] = useState(post.Image || null);

  const webSocketChannel = `interactionPost.${post.Id}`;
  useEffect(() => {
    window.Echo.channel(webSocketChannel)
      .listen('InteractionPostUpdated', (e) => {
        const updatedInteraction = e.interactionPost ? e.interactionPost : e;
        setInteractionPosts(prevInteractions => {
          const exists = prevInteractions.some(item => item.id === updatedInteraction.id);
          if (exists) {
            return prevInteractions.filter(item => item.id !== updatedInteraction.id);
          }
          const filtered = prevInteractions.filter(item => item.id !== updatedInteraction.id);
          return [...filtered, updatedInteraction];
        });
      });

    return () => {
      window.Echo.leave(webSocketChannel);
    };
  }, [post.Id]);

  const filteredComments = commentPostsThroughProfilePosts.filter(
    (comment) =>
      comment.IdProfilePost === post.Id &&
      (comment.Visibility === "Public" ||
        (comment.Visibility === "Private" && comment.IdUser === currentUserId))
  );

  const commentCount = filteredComments.reduce((total, comment) => {
    const replyCount = comment.comment_post_details_reply?.length || 0;
    return total + 1 + replyCount;
  }, 0);

  useEffect(() => {
    const subscribedChannels = [];

    filteredComments.forEach(comment => {
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
  }, [filteredComments, interactionsCommentPost, interactionsReplyCommentPost]);

  useEffect(() => {
    if (Array.isArray(commentPostsThroughProfilePosts)) {
      const allInteractions = [];
      const allReplyInteractions = [];

      commentPostsThroughProfilePosts.forEach(comment => {
        allInteractions.push(...(comment.interaction_comment_post || []));
        (comment.comment_post_details_reply || []).forEach(reply => {
          allReplyInteractions.push(...(reply.interaction_reply_comment_post || []));
        });
      });

      setInteractionPostsCommentPost(allInteractions);
      setInteractionReplyCommentPost(allReplyInteractions);
    }
  }, [commentPostsThroughProfilePosts]);

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

  const commentLiked = useMemo(() => {
    const liked = {};
    commentPostsThroughProfilePosts.forEach(comment => {
      const interaction = interactionsCommentPost.find(
        (item) =>
          item.IdCommentPost === comment.Id &&
          item.IdUser === currentUserId &&
          item.Like === 1
      );
      liked[comment.Id] = !!interaction;
    });
    return liked;
  }, [interactionsCommentPost, commentPostsThroughProfilePosts, currentUserId]);

  const replyLiked = useMemo(() => {
    const liked = {};
    commentPostsThroughProfilePosts.forEach(comment => {
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
  }, [interactionsReplyCommentPost, commentPostsThroughProfilePosts, currentUserId]);

  const interactionCount = useMemo(() => {
    return interactionPosts.filter(interaction => interaction.IdPost === post.Id).length;
  }, [interactionPosts, post.Id]);

  const checkLiked = interactionPosts.find(
    interaction => interaction.IdPost === post.Id && interaction.IdUser === currentUserId && interaction.Like_or_Dislike === 1
  );

  const handleChangeUserPost = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      setData(prev => ({ ...prev, imgName: file }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setData(prev => ({ ...prev, imgName: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', data.content || '');
    formData.append('status', data.status);
    if (data.imgName) {
      formData.append('imgName', data.imgName);
    }

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/userUpdatePost/${post.Id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAlert({ message: response.data.message, type: 'success' });
      setShowEditPost(false);
      setData({
        content: post.Content,
        status: post.Status,
        imgName: post.Image || null,
      });
      setImage(post.Image || null);
    } catch (err) {
      console.log('Error response:', err.response?.data);
      if (err.response?.status === 422) {
        setAlert({ message: Object.values(err.response.data.errors)[0][0], type: 'danger' });
      } else if (err.response?.status === 403) {
        setAlert({ message: err.response.data.error, type: 'danger' });
      } else if (err.response?.status === 401) {
        setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
      } else {
        setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
      }
    }
  };

  return (
    <div className="card p-3 shadow-sm bg-crp mt-3">
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
              <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Profile" className="profile-image-posts" />
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
              key={post.Image}
              controls
              className="rounded-2xl shadow-lg border border-gray-600 max-w-full max-h-[700px] object-cover"
              preload="metadata"
              autoPlay
            >
              <source src={`http://127.0.0.1:8000${post.Image}`} type="video/mp4" />
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
          commentPostsThroughProfilePosts={commentPostsThroughProfilePosts}
          interactionsCommentPostCount={interactionsCommentPostCount}
          interactionsReplyCommentPostCount={interactionsReplyCommentPostCount}
          interactionCount={interactionCount}
          commentCount={commentCount}
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