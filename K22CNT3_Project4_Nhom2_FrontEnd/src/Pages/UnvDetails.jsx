import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import InfoUniversity from '@/Components/Truong/InfoUniversity';
import UniversityDirectory from '@/Components/Truong/UniversityDirectory';
import CommentForm from '@/Components/Truong/CommentForm';
import ListComment from '@/Components/Truong/ListComment';
import RaTing from '@/Components/Truong/RaTing';
import formatTime from '@/Utils/timeFormatter';
import '../assets/css/DetailsUnv.css';
import axios from 'axios';

export default function UnvDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [truong, setTruong] = useState({});
  const [category, setCategory] = useState({});
  const [commentDetails, setCommentDetails] = useState([]);
  const [users, setUsers] = useState([]);
  const [replyToComments, setReplyToComments] = useState([]);
  const [comments, setComments] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [sumUser, setSumUser] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortOrder, setSortOrder] = useState('likeest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataComment, setDataComment] = useState({ text: '', IdTruong: id, Visibility: 'Public' });
  const [dataReplyCmt, setDataReplyCmt] = useState({ text: '', IdComment: null, IdTruong: id });
  const [dataLikeDislike, setDataLikeDislike] = useState({ IdComment: null, Like_or_Dislike: null });
  const [processingComment, setProcessingComment] = useState(false);
  const [processingReplyCmt, setProcessingReplyCmt] = useState(false);
  const [processingRating, setProcessingRating] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/universities/${id}`)
      .then(response => {
        if (!response.ok) throw new Error(`Lỗi khi lấy dữ liệu trường: ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setTruong(data.truong || {});
        setCategory(data.category || {});
        setCommentDetails(data.commentDetails || []);
        setUsers(data.users || []);
        setReplyToComments(data.replyToComments || []);
        setComments(data.comments || []);
        setInteractions(data.interactions || []);
        setRatings(data.ratings || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('Fetch error:', err);
      });
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data.user);
        } catch (error) {
          console.error('Lỗi lấy thông tin người dùng:', error);
          setCurrentUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!window.Echo) return;

    const channelsToLeave = [];

    comments.forEach(comment => {
      const interactionChannelName = `interaction.${comment.Id}`;
      const interactionChannel = window.Echo.channel(interactionChannelName)
        .listen('InteractionUpdated', e => {
          const { interaction } = e;
          if (!interaction) return;

          setInteractions(prev => {
            const exists = prev.find(item => item.Id === interaction.Id);
            if (exists) {
              if (exists.Like_or_Dislike === interaction.Like_or_Dislike) {
                return prev.filter(item => item.Id !== interaction.Id);
              }
              return prev.map(item => (item.Id === interaction.Id ? interaction : item));
            }
            return [...prev, interaction];
          });
        });

      channelsToLeave.push(interactionChannelName);

      const replyChannelName = `replyToComment.${comment.Id}`;
      const replyChannel = window.Echo.channel(replyChannelName)
        .listen('.admin.replyToComment', e => {
          const { replyToComment } = e;
          if (!replyToComment) return;

          setReplyToComments(prev => {
            const exists = prev.find(item => item.Id === replyToComment.Id);
            return exists
              ? prev.map(item => (item.Id === replyToComment.Id ? replyToComment : item))
              : [...prev, replyToComment];
          });
        });

      channelsToLeave.push(replyChannelName);
    });

    return () => {
      channelsToLeave.forEach(channelName => {
        window.Echo.leave(channelName);
      });
    };
  }, [comments]);

  useEffect(() => {
    if (!window.Echo || !truong.Id) return;

    const commentChannelName = `comment.${truong.Id}`;
    const ratingChannelName = `rating.${truong.Id}`;

    const commentChannel = window.Echo.channel(commentChannelName)
      .listen('.admin.comment', e => {
        const { comment, commentDetails } = e;

        if (comment) {
          setComments(prev => {
            const exists = prev.some(item => item.Id === comment.Id);
            return exists
              ? prev.map(item => (item.Id === comment.Id ? comment : item))
              : [...prev, comment];
          });
        }

        if (commentDetails) {
          setCommentDetails(prev => {
            const exists = prev.some(item => item.IdDetails === commentDetails.IdDetails);
            return exists
              ? prev.map(item => (item.IdDetails === commentDetails.IdDetails ? commentDetails : item))
              : [...prev, commentDetails];
          });
        }
      });

    const ratingChannel = window.Echo.channel(ratingChannelName)
      .listen('RatingUpdated', e => {
        const { rating } = e;

        setRatings(prev => {
          const exists = prev.some(item => item.Id === rating.Id);
          return exists
            ? prev.map(item => (item.Id === rating.Id ? rating : item))
            : [...prev, rating];
        });
      });

    return () => {
      window.Echo.leave(commentChannelName);
      window.Echo.leave(ratingChannelName);
    };
  }, [truong.Id]);

  useEffect(() => {
    const totalUsers = ratings.filter(rating => rating.IdTruong === truong.Id).length;
    const totalRate = ratings.reduce((total, rating) => (rating.IdTruong === truong.Id ? total + parseFloat(rating.Rate) : total), 0);
    setSumUser(totalUsers);
    setAvgRate(totalUsers > 0 ? (totalRate / totalUsers).toFixed(2) : 0);
  }, [truong.Id, ratings]);

  useEffect(() => {
    if (!ratings || !truong?.Id || !currentUser?.id) return;

    const checkRating = ratings.find(
      rating =>
        Number(rating.IdTruong) === Number(truong.Id) &&
        Number(rating.IdUser) === Number(currentUser.id) &&
        Number(rating.Rate) > 0
    );

    if (checkRating) {
      setSelectedRating(Number(checkRating.Rate));
    }
  }, [ratings, truong?.Id, currentUser?.id]);

  const handleInteraction = async (value, e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSelectedRating(value);
    setProcessingRating(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/rating',
        { IdTruong: truong.Id, Rate: value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSelectedRating(response.data.rating?.Rate || value);
      setRatings(prev => {
        const exists = prev.some(item => item.Id === response.data.rating?.Id);
        if (exists) {
          return prev.map(item => (item.Id === response.data.rating?.Id ? response.data.rating : item));
        }
        return [...prev, response.data.rating];
      });
      setProcessingRating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi đánh giá thất bại');
      setProcessingRating(false);
    }
  };

  const handleSubmitComment = async e => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setProcessingComment(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/comment',
        dataComment,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.newComment) setComments(prev => [...prev, response.data.newComment]);
      if (response.data.newCommentDetails) setCommentDetails(prev => [...prev, response.data.newCommentDetails]);
      setDataComment({ text: '', IdTruong: truong.Id, Visibility: 'Public' });
      setProcessingComment(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi bình luận thất bại');
      setProcessingComment(false);
    }
  };

  const onReplySubmit = async (e, IdComment) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!dataReplyCmt.text || !IdComment) {
      setError('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setProcessingReplyCmt(true);
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/replyToComment',
        { text: dataReplyCmt.text, IdComment, IdTruong: truong.Id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.newReplyToComment) {
        setReplyToComments(prev => [...prev, response.data.newReplyToComment]);
      }
      setDataReplyCmt({ text: '', IdComment: null, IdTruong: truong.Id });
      setProcessingReplyCmt(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi phản hồi thất bại');
      setProcessingReplyCmt(false);
    }
  };

  const handleLikeDislike = async (commentId, likeOrDislike, e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setDataLikeDislike({ IdComment: commentId, Like_or_Dislike: likeOrDislike });
    if (commentId && likeOrDislike !== null) {
      try {
        await axios.post(
          'http://127.0.0.1:8000/api/interaction',
          { IdComment: commentId, Like_or_Dislike: likeOrDislike },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Gửi tương tác thất bại');
        console.error('Lỗi tương tác:', err);
      }
    }
  };

  const sortedComments = useMemo(() => {
    let result = [...comments];
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.CreateDate) - new Date(a.CreateDate));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.CreateDate) - new Date(b.CreateDate));
    } else if (sortOrder === 'likeest') {
      result.sort((a, b) => {
        const likeCountA = interactions.filter(inter => inter.IdComment === a.Id && inter.Like_or_Dislike === 1).length;
        const likeCountB = interactions.filter(inter => inter.IdComment === b.Id && inter.Like_or_Dislike === 1).length;
        return likeCountB - likeCountA;
      });
    }
    return result;
  }, [sortOrder, comments, interactions]);

  return (
    <MainLayout>
      {loading && <p className="text-center text-white">Đang tải dữ liệu...</p>}
      {error && <p className="text-center text-danger">Lỗi: {error}</p>}
      {!loading && !error && (
        <>
          <InfoUniversity truong={truong} />
          <UniversityDirectory category={category} />

          <div className="card mb-4 text-color bg-details neon-glow">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title fw-bold fs-5">{sumUser} Đánh giá:</h5>
                <p>{sumUser > 0 ? avgRate : "Chưa có đánh giá"}</p>
              </div>
              <RaTing
                selectedRating={selectedRating}
                handleInteraction={handleInteraction}
                processing={processingRating}
              />
            </div>
          </div>

          <div className="card mb-4 text-color bg-details neon-glow">
            <div className="card-body pb-0">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="card-title font-weight-bold fs-4">
                  <strong>Bình luận</strong>
                </h2>
                <select
                  className="form-select w-auto me-3 select-f"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="likeest">Nhiều thích nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
              <div className="mb-4 overflow-auto" style={{ maxHeight: '550px' }}>
                {sortedComments.length > 0 ? (
                  sortedComments.map((comment, index) => {
                    const checkLiked = interactions.some(
                      interaction => interaction.IdComment === comment.Id && interaction.IdUser === currentUser?.id && interaction.Like_or_Dislike === 1
                    );
                    const checkDisLiked = interactions.some(
                      interaction => interaction.IdComment === comment.Id && interaction.IdUser === currentUser?.id && interaction.Like_or_Dislike === 0
                    );
                    const likeCount = interactions.filter(interaction => interaction.IdComment === comment.Id && interaction.Like_or_Dislike === 1).length;
                    const disLikeCount = interactions.filter(interaction => interaction.IdComment === comment.Id && interaction.Like_or_Dislike === 0).length;
                    return (
                      <ListComment
                        key={comment.Id || index}
                        comment={comment}
                        usersList={users}
                        commentDetailsList={commentDetails}
                        replyToCommentsList={replyToComments}
                        onLikeDislike={handleLikeDislike}
                        checkLiked={checkLiked}
                        checkDisLiked={checkDisLiked}
                        likeCount={likeCount}
                        disLikeCount={disLikeCount}
                        onReplySubmit={onReplySubmit}
                        dataReplyCmt={dataReplyCmt}
                        setDataReplyCmt={setDataReplyCmt}
                        processingReplyCmt={processingReplyCmt}
                        formatTime={formatTime}
                      />
                    );
                  })
                ) : (
                  <p>Chưa có bình luận nào.</p>
                )}
              </div>
            </div>
            <CommentForm
              value={dataComment.text}
              onChange={e => setDataComment(prev => ({ ...prev, text: e.target.value }))}
              onSubmit={handleSubmitComment}
              text="bình luận"
              processing={processingComment}
            />
          </div>
        </>
      )}
    </MainLayout>
  );
}