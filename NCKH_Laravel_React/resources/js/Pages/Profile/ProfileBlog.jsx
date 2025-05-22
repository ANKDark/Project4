import MainLayout from '@/Layouts/MainLayout';
import React, { useEffect, useState } from 'react';
import "../../../css/profileblog.css";
import CreatePostForm from '@/Components/User/CreatePostForm';
import { Head, useForm } from '@inertiajs/react';
import ListUserPost from '@/Components/User/ListUserPost';
import UserIntroduction from '@/Components/User/UserIntroduction';
import formatTime from '@/Utils/timeFormatter';
import EditUserInfo from '@/Components/User/EditUserInfo';
import EditProfileForm from '@/Components/User/EditProfileForm';
import AlertComponent from '@/Components/AlertComponent';

export default function ProfileBlog({ user, currentUserId, userinfo, profileposts, interactionPosts,
    commentPostDetails, commentPostsThroughProfilePosts, allUser, follow }) {

    const [countFollowers, setCountFollowers] = useState(0);
    const [countFollowing, setCountFollowing] = useState(0);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditUserInfo, setShowEditUserInfo] = useState(null);
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [alert, setAlert] = useState(null);

    const { data, setData, post, reset } = useForm({
        content: '',
        imgName: '',
        status: 1,
    });

    useEffect(() => {
        const followersCount = user.followers.reduce((count, followRelation) => (
            user.id === followRelation.FollowedUserID ? count + 1 : count
        ), 0);
        setCountFollowers(followersCount);

        const followingCount = user.following.reduce((count, followRelation) => (
            user.id === followRelation.FollowerID ? count + 1 : count
        ), 0);
        setCountFollowing(followingCount);
    }, [user]);

    useEffect(() => {
        setData("imgName", imageName);
    }, [imageName]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setImageName(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setImageName(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmitCreatePost = (e) => {
        e.preventDefault();
        post(route('usercreatepost'), {
            onFinish: () => {
                reset();
                setImage(null);
                setImageName(null);
            },
            onError: (errors) => {
                setAlert({ message: errors, type: 'danger' });
                if (errors.error) {
                    if (errors.email_verified_at) {
                        setAlert({ message: errors.email_verified_at, type: 'danger' });
                    }
                }
            },
        });
        setShowCreatePost(false);
    };

    //List User Post
    const { data: dataLikeDislike, setData: setDataLikeDislike, post: postLikeDislike } = useForm({
        IdPost: null,
        Like_or_Dislike: null,
    });

    const handleInteraction = (likeOrDislike, e, postId) => {
        e.preventDefault();
        setDataLikeDislike({ IdPost: postId, Like_or_Dislike: likeOrDislike });
    };

    useEffect(() => {
        if (dataLikeDislike.IdPost !== null && dataLikeDislike.Like_or_Dislike !== null) {
            postLikeDislike(route("interactionPost"), { preserveScroll: true });
        }
    }, [dataLikeDislike]);

    const { delete: delUserPost } = useForm();

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

    const { data: dataUserInfo, setData: setDataUserInfo, post: postUserInfo, processing: processingUserInfo, reset: resetUserInfo } = useForm(userinfo[0] || {});

    useEffect(() => {
        setDataUserInfo(userinfo[0] || {});
    }, [userinfo]);

    const handleChangeUserInfo = (e) => {
        setDataUserInfo(e.target.name, e.target.value);
    };

    const handleSubmitUserInfo = (e) => {
        e.preventDefault();
        postUserInfo("/userinfo", {
            onSuccess: () => {
                resetUserInfo();
                setShowEditUserInfo(null);
            },
            onError: (errors) => {
                setAlert({ message: errors, type: 'danger' });
            },
        });
    };

    const { data: dataUser, setData: setDataUser, post: putUser, reset: resetUser } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        newPassword: "",
        email_verified_at: user.email_verified_at,
        imgName: user.profile_photo_path,
    });

    const handleChangeUser = (e) => {
        setDataUser(e.target.name, e.target.value);
    };

    const handleSubmitUser = (e) => {
        e.preventDefault();
        if (dataUser.password != null && dataUser.newPassword && dataUser.email_verified_at == null) {
            alert("Phải xác thực email mới có thể đổi mật khẩu!");
            return;
        }
        putUser(route("updateUser"), {
            onSuccess: () => {
                resetUser();
                setShowEditProfile(false);
                setAlert({ message: "Cập nhật hồ sơ thành công!", type: 'success' });
            },
            onError: (errors) => {
                setAlert({ message: errors, type: 'danger' });
                if (errors.name) {
                    setAlert({ message: errors.name, type: 'danger' });
                } else if (errors.email) {
                    if (errors.email === 'Email không đúng định dạng.') {
                        setAlert({ message: errors.email, type: 'warning' });
                    } else {
                        setAlert({ message: errors.email, type: 'danger' });
                    }
                } else if (errors.password) {
                    setAlert({ message: errors.password, type: 'danger' });
                } else if (errors.newPassword) {
                    setAlert({ message: errors.newPassword, type: 'warning' });
                } else if (errors.imgName) {
                    setAlert({ message: errors.imgName, type: 'warning' });
                } else if (errors.email_verified_at) {
                    setAlert({ message: errors.email_verified_at, type: 'danger' });
                } else {
                    setAlert({ message: "Lỗi cập nhật hồ sơ!", type: 'danger' });
                }
            },
        });
    };

    const { data: dataFollowUser, setData: setDataFollowUser, post: postFollowUser, reset: resetFollowUser } = useForm({
        FollowedUserID: null,
    });

    const [shouldSubmit, setShouldSubmit] = useState(false);

    useEffect(() => {
        if (shouldSubmit && dataFollowUser.FollowedUserID) {
            postFollowUser(route("followUser"), {
                onSuccess: () => {
                    resetFollowUser();
                },
                onError: (errors) => {
                    setAlert({ message: errors, type: 'danger' });
                },
            });
            setShouldSubmit(false);
        }
    }, [dataFollowUser.FollowedUserID, shouldSubmit]);

    const handleFollowUser = (e) => {
        e.preventDefault();
        setDataFollowUser("FollowedUserID", user.id);
        setShouldSubmit(true);
    };

    return (
        <MainLayout>
            <Head title={`Trang cá nhân ${user.name}`} />
            {alert && (
                <AlertComponent
                    message={alert.message}
                    type={alert.type}
                    duration={2000}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="container mt-5">
                <div className="row">
                    <div className="col-12">
                        <div className="profile-header d-flex align-items-center flex-column">
                            {user.profile_photo_path && user.profile_photo_path !== null ? (
                                <img
                                    src={user.profile_photo_path}
                                    alt="Profile"
                                    className="profile-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                                    }}
                                />
                            ) : (
                                <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                    alt="Profile" className="profile-image" />
                            )}
                            <div className="profile-info text-center mt-3">
                                <h1 className="profile-name text-color">{user.name}</h1>
                                <p className="profile-email text-mudel">{user.email}</p>
                                <div className="social-stats d-flex justify-content-center">
                                    <div className="stat-item mx-3 text-color">
                                        <strong>{countFollowers}</strong> Followers
                                    </div>
                                    <div className="stat-item mx-3 text-color">
                                        <strong>{countFollowing}</strong> Following
                                    </div>
                                </div>
                                <div className="profile-actions d-flex flex-column mt-4">
                                    {user.id === currentUserId ? (
                                        <>
                                            <button className="btn btn-danger mb-3" onClick={() => setShowEditProfile(true)}>Sửa hồ sơ</button>
                                            <button className="btn btn-secondary mb-3" onClick={() => setShowCreatePost(true)}>Tạo bài viết mới</button>
                                        </>
                                    ) : (
                                        <>
                                            {follow ? (
                                                <button className="btn btn-secondary mb-3" onClick={handleFollowUser}>Đã theo dõi</button>
                                            ) : (
                                                <button className="btn btn-primary mb-3" onClick={handleFollowUser}>Theo dõi</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showCreatePost && (
                        <CreatePostForm
                            onClose={() => {
                                setShowCreatePost(false);
                                reset();
                                setImage(null);
                                setImageName(null);
                            }}
                            content={data.content}
                            onChangeContent={(e) => setData("content", e.target.value)}
                            status={data.status}
                            onChangeStatus={(e) => setData("status", parseInt(e.target.value))}
                            image={image}
                            setImage={setImage}
                            imageName={imageName}
                            setImageName={setImageName}
                            handleFileChange={handleFileChange}
                            handleDrop={handleDrop}
                            handleDragOver={handleDragOver}
                            handleSubmitCreatePost={handleSubmitCreatePost}
                        />
                    )}

                    {showEditUserInfo && (
                        <EditUserInfo
                            data={dataUserInfo}
                            onChange={handleChangeUserInfo}
                            onSubmit={handleSubmitUserInfo}
                            onClose={() => {
                                setShowEditUserInfo(false);
                                resetUserInfo();
                            }}
                            processing={processingUserInfo}
                        />
                    )}

                    {showEditProfile && (
                        <EditProfileForm
                            user={dataUser}
                            onChange={handleChangeUser}
                            handleFileChange={handleFileChange}
                            onClose={() => {
                                setShowEditProfile(false);
                                resetUser();
                            }}
                            handleSubmitUser={handleSubmitUser}
                        />
                    )}

                    <div className="container mt-2">
                        <div className="row">
                            <UserIntroduction
                                userinfo={userinfo}
                                setShowEditUserInfo={setShowEditUserInfo}
                            />
                            <div className="col-md-8">
                                {profileposts.length > 0 ? (
                                    profileposts.map((post, index) => (
                                        <ListUserPost
                                            key={index}
                                            user={user}
                                            post={post}
                                            interactionPosts={interactionPosts}
                                            currentUserId={currentUserId}
                                            handleInteraction={handleInteraction}
                                            formatTime={formatTime}
                                            commentPostsThroughProfilePosts={commentPostsThroughProfilePosts}
                                            commentPostDetails={commentPostDetails}
                                            allUser={allUser}
                                            setAlert={setAlert}
                                            handleUserDelPost={handleUserDelPost}
                                        />
                                    ))
                                ) : (
                                    <div className="d-flex justify-content-center text-center text-white small mt-3 fs-5">
                                        <span><strong>Không có bài viết</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
