import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../assets/css/Profileblog.css";
import PostFilter from '@/Components/Post/PostFilter';
import formatTime from "@/Utils/timeFormatter";
import AlertComponent from '@/Components/AlertComponent';
import MainLayout from '../Layouts/MainLayout';

export default function ListAllUserPost() {
    const [posts, setPosts] = useState([]);
    const [postsByFollow, setPostsByFollow] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [allUser, setAllUser] = useState([]);
    const [showAllPosts, setShowAllPosts] = useState(true);
    const [showPostsByFollow, setShowPostsByFollow] = useState(false);
    const [alert, setAlert] = useState(null);

    const token = localStorage.getItem('token');

    const fetchAllPosts = () => {
        axios.get('http://127.0.0.1:8000/api/allposts', {
            headers: token ? {
                Authorization: `Bearer ${token}`
            } : {}
        })
            .then(response => {
                setPosts(response.data.posts);
                setPostsByFollow(response.data.postsByFollow);
                setCurrentUserId(response.data.currentUserId);
                setAllUser(response.data.allUser);
            })
            .catch(error => {
                setAlert({ message: 'Lỗi khi tải dữ liệu', type: 'danger' });
                console.error('Error fetching posts:', error);
            });
    };

    useEffect(() => {
        fetchAllPosts();
    }, []);

    const handleInteraction = async (likeOrDislike, e, postId) => {
        e.preventDefault();

        if (!token) {
            setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/interactionPost', {
                IdPost: postId,
                Like_or_Dislike: likeOrDislike,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error('Error response:', err.response?.data);
            if (err.response?.status === 422) {
                setAlert({ message: Object.values(err.response.data.errors)[0][0], type: 'danger' });
            } else if (err.response?.status === 401) {
                setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            } else {
                setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
            }
        }
    };

    const handleUserDelPost = (e, postId) => {
        e.preventDefault();

        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            return;
        }

        axios.delete(`http://127.0.0.1:8000/api/userpost/${postId}`, {
            headers: token ? {
                Authorization: `Bearer ${token}`
            } : {}
        })
            .then(response => {
                setAlert({ message: response.data.message || 'Xóa thành công!', type: 'success' });
                fetchAllPosts();
            })
            .catch(error => {
                setAlert({ message: 'Lỗi khi xóa bài viết', type: 'danger' });
                console.error('Error deleting post:', error);
            });
    };

    return (
        <MainLayout>
            {alert && (
                <AlertComponent
                    message={alert.message}
                    type={alert.type}
                    duration={2000}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="card shadow-sm bg-crp mt-3 w-50 mx-auto">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center w-100">
                        <button
                            className={`w-50 text-center p-2 border-0 btn ${showAllPosts ? 'btn-light' : 'btn-outline-light'}`}
                            onClick={() => {
                                setShowAllPosts(true);
                                setShowPostsByFollow(false);
                            }}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`w-50 text-center p-2 border-0 btn ${showPostsByFollow ? 'btn-light' : 'btn-outline-light'}`}
                            onClick={() => {
                                setShowPostsByFollow(true);
                                setShowAllPosts(false);
                            }}
                        >
                            Đang theo dõi
                        </button>
                    </div>
                </div>
            </div>

            {showAllPosts && (
                posts.length > 0 ? (
                    posts.map((post) => (
                        <PostFilter
                            key={post.Id}
                            post={post}
                            currentUserId={currentUserId}
                            postsByFollow={postsByFollow}
                            formatTime={formatTime}
                            handleCommentClick={null}
                            showMenu={false}
                            allUser={allUser}
                            handleInteraction={handleInteraction}
                            setAlert={setAlert}
                            handleUserDelPost={handleUserDelPost}
                        />
                    ))
                ) : (
                    <p className="text-center text-light mt-4">Không có bài viết nào!</p>
                )
            )}

            {showPostsByFollow && (
                postsByFollow.length > 0 ? (
                    postsByFollow.map((post) => (
                        <PostFilter
                            key={post.Id}
                            post={post}
                            currentUserId={currentUserId}
                            postsByFollow={postsByFollow}
                            formatTime={formatTime}
                            handleCommentClick={null}
                            showMenu={false}
                            allUser={allUser}
                            handleInteraction={handleInteraction}
                            setAlert={setAlert}
                            handleUserDelPost={handleUserDelPost}
                        />
                    ))
                ) : (
                    <p className="text-center text-light mt-4">Không có bài viết nào!</p>
                )
            )}
        </MainLayout>
    );
}
