import MainLayout from '@/Layouts/MainLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import "../../css/profileblog.css";
import PostFilter from '@/Components/Post/PostFilter';
import formatTime from "@/Utils/timeFormatter";
import AlertComponent from '@/Components/AlertComponent';

export default function ListAllUserPost({ posts, currentUserId, allUser, postsByFollow }) {
    const [showAllPosts, setShowAllPosts] = useState(true);
    const [showPostsByFollow, setShowPostsByFollow] = useState(false);
    const [alert, setAlert] = useState(null);
    const { data: dataLikeDislike, setData: setDataLikeDislike, post: postLikeDislike } = useForm({
        IdPost: null,
        Like_or_Dislike: null,
    });
    const { delete: delUserPost } = useForm();

    const handleInteraction = (likeOrDislike, e, postId) => {
        e.preventDefault();
        setDataLikeDislike({ IdPost: postId, Like_or_Dislike: likeOrDislike });
    };

    useEffect(() => {
        if (dataLikeDislike.IdPost !== null && dataLikeDislike.Like_or_Dislike !== null) {
            postLikeDislike(route("interactionPost"), { preserveScroll: true });
        }
    }, [dataLikeDislike]);

    const handleUserDelPost = (e, postId) => {
        e.preventDefault();

        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            return;
        }

        delUserPost(route("userDelPost", postId), {
            preserveScroll: true,
            onSuccess: () => {
                setAlert({ message: "Bài viết đã được xóa thành công!", type: 'success' });
            },
            onError: (errors) => {
                setAlert({ message: errors, type: 'danger' });
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Danh sách bài đăng" />
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
    )
}
