import MainLayout from '@/Layouts/MainLayout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../../assets/css/profileBlog.css";
import CreatePostForm from '@/Components/User/CreatePostForm';
import ListUserPost from '@/Components/User/ListUserPost';
import UserIntroduction from '@/Components/User/UserIntroduction';
import EditUserInfo from '@/Components/User/EditUserInfo';
import EditProfileForm from '@/Components/User/EditProfileForm';
import formatTime from '@/Utils/timeFormatter';

export default function ProfileBlog() {
    const { id } = useParams();
    const [data, setData] = useState({
        user: null,
        currentUserId: null,
        userinfo: [],
        profileposts: [],
        interactionPosts: [],
        allUser: [],
        commentPostsThroughProfilePosts: [],
        follow: null,
    });
    const [countFollowers, setCountFollowers] = useState(0);
    const [countFollowing, setCountFollowing] = useState(0);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditUserInfo, setShowEditUserInfo] = useState(null);
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [postData, setPostData] = useState({
        content: '',
        imgName: '',
        status: 1,
    });
    const [dataLikeDislike, setDataLikeDislike] = useState({
        IdPost: null,
        Like_or_Dislike: null,
    });
    const [dataUserInfo, setDataUserInfo] = useState({});
    const [dataUser, setDataUser] = useState({
        name: '',
        email: '',
        password: '',
        newPassword: '',
        email_verified_at: null,
        imgName: null,
    });
    const [dataFollowUser, setDataFollowUser] = useState({
        FollowedUserID: null,
    });

    const setAlert = ({ message, type }) => {
        Swal.fire({
            title: type === 'success' ? 'Thành công!' : type === 'warning' ? 'Cảnh báo!' : 'Lỗi!',
            text: message,
            icon: type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error',
            timer: 3000,
            showConfirmButton: false,
        });
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/profile/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setData(response.data);
                setFollowers(response.data.user?.followers || []);
                setDataUserInfo(response.data.userinfo[0] || {});
                setDataUser({
                    name: response.data.user?.name || '',
                    email: response.data.user?.email || '',
                    password: '',
                    newPassword: '',
                    email_verified_at: response.data.user?.email_verified_at || null,
                    imgName: response.data.user?.profile_photo_path || null,
                });
            } catch (err) {
                console.log('Error response:', err.response?.data);
                if (err.response?.status === 404) {
                    setAlert({ message: 'Người dùng không tồn tại!', type: 'danger' });
                } else if (err.response?.status === 401) {
                    setAlert({ message: 'Bạn cần đăng nhập để xem trang này!', type: 'danger' });
                } else {
                    setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
                }
            }
        };
        fetchProfileData();
    }, [id]);

    useEffect(() => {
        const subscribedProfilePostChannels = [];

        data.allUser.forEach(users => {
            if (users.id) {
                const postChannel = `post.${users.id}`;
                subscribedProfilePostChannels.push(postChannel);

                window.Echo.channel(postChannel)
                    .listen('.admin.profilepost', (e) => {
                        const { post, followerIds, message } = e;
                        if (message === "Create") {
                            if (followerIds.includes(data.currentUserId)) {
                                setAlert({
                                    type: 'info',
                                    message: `Người dùng ${post.users.name} bạn theo dõi vừa đăng một bài viết mới!`
                                });
                            }
                        }
                        if (data.user?.id === post.IdUser) {
                            setData(prev => ({
                                ...prev,
                                profileposts: message === "Delete"
                                    ? prev.profileposts.filter(item => item.Id !== post.Id)
                                    : prev.profileposts.some(item => item.Id === post.Id)
                                        ? prev.profileposts.map(item => item.Id === post.Id ? post : item)
                                        : [post, ...prev.profileposts]
                            }));
                        }
                    });
            }
        });

        return () => {
            subscribedProfilePostChannels.forEach(channel => {
                window.Echo.leave(channel);
            });
        };
    }, [data.allUser, data.currentUserId]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = data.allUser.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [searchTerm, data.allUser]);

    useEffect(() => {
        const followersCount = followers.reduce((count, followRelation) => (
            data.user?.id === followRelation.FollowedUserID ? count + 1 : count
        ), 0);
        setCountFollowers(followersCount);

        const followingCount = data.user?.following.reduce((count, followRelation) => (
            data.user?.id === followRelation.FollowerID ? count + 1 : count
        ), 0);
        setCountFollowing(followingCount);

        window.Echo.channel(`followers.${data.user?.id}`)
            .listen('FollowUserUpdated', (e) => {
                setFollowers(prevFollowers => {
                    const updatedFollow = e.followRelation ? e.followRelation : e;
                    const exists = prevFollowers.some(item => item.Id === updatedFollow.Id);

                    if (updatedFollow.deleted || exists) {
                        return prevFollowers.filter(item => item.Id !== updatedFollow.Id);
                    }
                    const filtered = prevFollowers.filter(item => item.Id !== updatedFollow.Id);
                    return [...filtered, updatedFollow];
                });

                setCountFollowers(followers.reduce((count, followRelation) => (
                    data.user?.id === followRelation.FollowedUserID ? count + 1 : count
                ), 0));
            });

        return () => {
            window.Echo.leave(`followers.${data.user?.id}`);
        };
    }, [data.user, followers]);

    useEffect(() => {
        setPostData(prev => ({ ...prev, imgName: imageName }));
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

    const handleSubmitCreatePost = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', postData.content);
        formData.append('status', postData.status);

        if (imageName) {
            formData.append('imgName', imageName);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/usercreatepost', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAlert({ message: response.data.message, type: 'success' });
            setPostData({ content: '', imgName: '', status: 1 });
            setImage(null);
            setImageName(null);
            setShowCreatePost(false);

        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 422 && data.errors) {
                    const firstKey = Object.keys(data.errors)[0];
                    const errorMsg = data.errors[firstKey];
                    const firstErrorMessage = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;

                    setAlert({
                        message: firstErrorMessage || 'Dữ liệu không hợp lệ.',
                        type: 'danger',
                    });

                } else if (status === 403 && data.errors?.email_verified_at) {
                    const errorMsg = data.errors.email_verified_at;
                    const message = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;

                    setAlert({
                        message: message || 'Bạn cần xác minh email trước khi thực hiện.',
                        type: 'danger',
                    });

                } else if (status === 401) {
                    setAlert({
                        message: 'Bạn cần đăng nhập để thực hiện hành động này!',
                        type: 'danger',
                    });

                } else if (data.message) {
                    setAlert({
                        message: data.message,
                        type: 'danger',
                    });

                } else {
                    setAlert({
                        message: 'Đã có lỗi server, vui lòng thử lại sau!',
                        type: 'danger',
                    });
                }

            } else {
                setAlert({
                    message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng!',
                    type: 'danger',
                });
            }
        }
    };

    const handleInteraction = async (likeOrDislike, e, postId) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/interactionPost', {
                IdPost: postId,
                Like_or_Dislike: likeOrDislike,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (err) {
            console.log('Error response:', err.response?.data);
            if (err.response?.status === 422) {
                setAlert({ message: Object.values(err.response.data.errors)[0][0], type: 'danger' });
            } else if (err.response?.status === 401) {
                setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            } else {
                setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
            }
        }
    };

    const handleUserDelPost = async (e, postId) => {
        e.preventDefault();
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn có muốn xóa bài viết này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/userpost/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAlert({ message: response.data.message, type: 'success' });
            } catch (err) {
                console.log('Error response:', err.response?.data);
                if (err.response?.status === 403) {
                    setAlert({ message: err.response.data.error, type: 'danger' });
                } else if (err.response?.status === 401) {
                    setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
                } else {
                    setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
                }
            }
        }
    };

    const handleChangeUserInfo = (e) => {
        setDataUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmitUserInfo = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/userinfo', dataUserInfo, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({ message: response.data.message, type: 'success' });
            setShowEditUserInfo(null);
            setDataUserInfo(response.data.userinfo);
        } catch (err) {
            console.log('Error response:', err.response?.data);
            if (err.response?.status === 422) {
                setAlert({ message: Object.values(err.response.data.errors)[0][0], type: 'danger' });
            } else if (err.response?.status === 401) {
                setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            } else {
                setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
            }
        }
    };

    const handleChangeUser = (e) => {
        setDataUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        if (dataUser.password && !dataUser.email_verified_at) {
            setAlert({ message: 'Phải xác thực email mới có thể đổi mật khẩu!', type: 'danger' });
            return;
        }

        const formData = new FormData();
        formData.append('name', dataUser.name);
        formData.append('email', dataUser.email);

        if (dataUser.password) {
            formData.append('password', dataUser.password);
        }

        if (dataUser.newPassword) {
            formData.append('newPassword', dataUser.newPassword);
        }

        if (dataUser.imgName instanceof File) {
            formData.append('imgName', dataUser.imgName);
        } else if (typeof dataUser.imgName === 'string') {
            formData.append('imgName', dataUser.imgName);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/updateUser', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAlert({ message: response.data.message, type: 'success' });
            setShowEditProfile(false);
            setDataUser(prev => ({ ...prev, imgName: response.data.user.profile_photo_path }));
        } catch (err) {
            console.log('Error response:', err.response?.data);
            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                if (errors.name) {
                    setAlert({ message: errors.name[0], type: 'danger' });
                } else if (errors.email) {
                    setAlert({ message: errors.email[0], type: errors.email[0] === 'Email không đúng định dạng.' ? 'warning' : 'danger' });
                } else if (errors.password) {
                    setAlert({ message: errors.password[0], type: 'danger' });
                } else if (errors.newPassword) {
                    setAlert({ message: errors.newPassword[0], type: 'warning' });
                } else if (errors.imgName) {
                    setAlert({ message: errors.imgName[0], type: 'warning' });
                } else if (errors.email_verified_at) {
                    setAlert({ message: errors.email_verified_at[0], type: 'danger' });
                } else {
                    setAlert({ message: 'Lỗi cập nhật hồ sơ!', type: 'danger' });
                }
            } else if (err.response?.status === 401) {
                setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            } else {
                setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
            }
        }
    };

    const handleFollowUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/follow', {
                FollowedUserID: data.user?.id,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setAlert({ message: response.data.message, type: 'success' });
            setData(prev => ({ ...prev, follow: response.data.follow || null }));
        } catch (err) {
            console.log('Error response:', err.response?.data);
            if (err.response?.status === 422) {
                setAlert({ message: Object.values(err.response.data.errors)[0][0], type: 'danger' });
            } else if (err.response?.status === 401) {
                setAlert({ message: 'Bạn cần đăng nhập để thực hiện hành động này!', type: 'danger' });
            } else {
                setAlert({ message: 'Đã có lỗi server, vui lòng thử lại sau!', type: 'danger' });
            }
        }
    };

    return (
        <MainLayout>
            <div className="container mt-5">
                {data.user ? (
                    <>
                        <div className="row">
                            <div className="col-12">
                                <div className="profile-header d-flex align-items-center flex-column">
                                    {data.user.profile_photo_path && data.user.profile_photo_path !== null ? (
                                        <img
                                            src={`http://127.0.0.1:8000${data.user.profile_photo_path}`}
                                            alt="Profile"
                                            className="profile-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg";
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                            alt="Profile"
                                            className="profile-image"
                                        />
                                    )}
                                    <div className="profile-info text-center mt-3">
                                        <h1 className="profile-name text-color">{data.user.name}</h1>
                                        <p className="profile-email text-mudel">{data.user.email}</p>
                                        <div className="social-stats d-flex justify-content-center">
                                            <div className="stat-item mx-3 text-color">
                                                <strong>{countFollowers}</strong> Followers
                                            </div>
                                            <div className="stat-item mx-3 text-color">
                                                <strong>{countFollowing}</strong> Following
                                            </div>
                                        </div>
                                        <div className="profile-actions d-flex flex-column mt-4">
                                            {data.user.id === data.currentUserId ? (
                                                <>
                                                    <button className="btn btn-danger mb-3" onClick={() => setShowEditProfile(true)}>Sửa hồ sơ</button>
                                                    <button className="btn btn-secondary mb-3" onClick={() => setShowCreatePost(true)}>Tạo bài viết mới</button>
                                                </>
                                            ) : (
                                                <>
                                                    {data.follow ? (
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

                            <div className="container mt-4">
                                <div className="row justify-content-end position-relative">
                                    <div className="col-8 w-25">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control search-user"
                                                placeholder="Tìm kiếm người dùng..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {filteredUsers.length > 0 && (
                                            <ul className="search-user-list">
                                                {filteredUsers.map((u, index) => (
                                                    <li key={index} className="search-user-item">
                                                        <a className="text-color text-decoration-none" href={`/profile/${u.id}`}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="user-avatar-placeholder me-2">
                                                                    {u.profile_photo_path && u.profile_photo_path !== null ? (
                                                                        <img
                                                                            src={`http://127.0.0.1:8000${u.profile_photo_path}`}
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
                                                                </div>
                                                                <div>
                                                                    <strong>{u.name}</strong>
                                                                    <p className="mb-0">{u.email}</p>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {showCreatePost && (
                                <CreatePostForm
                                    onClose={() => {
                                        setShowCreatePost(false);
                                        setPostData({ content: '', imgName: '', status: 1 });
                                        setImage(null);
                                        setImageName(null);
                                    }}
                                    content={postData.content}
                                    onChangeContent={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                                    status={postData.status}
                                    onChangeStatus={(e) => setPostData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                                    image={image}
                                    setImage={setImage}
                                    imageName={imageName}
                                    setImageName={setImageName}
                                    handleFileChange={handleFileChange}
                                    handleDrop={handleDrop}
                                    handleDragOver={handleDragOver}
                                    handleSubmitCreatePost={handleSubmitCreatePost}
                                    setAlert={setAlert}
                                />
                            )}

                            {showEditUserInfo && (
                                <EditUserInfo
                                    data={dataUserInfo}
                                    onChange={handleChangeUserInfo}
                                    onSubmit={handleSubmitUserInfo}
                                    onClose={() => {
                                        setShowEditUserInfo(null);
                                        setDataUserInfo(data.userinfo[0] || {});
                                    }}
                                    processing={false}
                                    setAlert={setAlert}
                                />
                            )}

                            {showEditProfile && (
                                <EditProfileForm
                                    user={dataUser}
                                    onChange={handleChangeUser}
                                    handleFileChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setDataUser(prev => ({ ...prev, imgName: file }));
                                            setImage(URL.createObjectURL(file));
                                        }
                                    }}
                                    onClose={() => {
                                        setShowEditProfile(false);
                                        setDataUser({
                                            name: data.user?.name || '',
                                            email: data.user?.email || '',
                                            password: '',
                                            newPassword: '',
                                            email_verified_at: data.user?.email_verified_at || null,
                                            imgName: data.user?.profile_photo_path || null,
                                        });
                                    }}
                                    handleSubmitUser={handleSubmitUser}
                                    setAlert={setAlert}
                                />
                            )}

                            <div className="container mt-2">
                                <div className="row">
                                    <UserIntroduction
                                        userinfo={data.userinfo}
                                        user={data.user}
                                        currentUserId={data.currentUserId}
                                        setShowEditUserInfo={setShowEditUserInfo}
                                    />
                                    <div className="col-md-8">
                                        {data.profileposts.length > 0 ? (
                                            data.profileposts.map((post, index) => (
                                                <ListUserPost
                                                    key={index}
                                                    user={data.user}
                                                    post={post}
                                                    interactionPosts={data.interactionPosts}
                                                    currentUserId={data.currentUserId}
                                                    handleInteraction={handleInteraction}
                                                    formatTime={formatTime}
                                                    commentPostsThroughProfilePosts={data.commentPostsThroughProfilePosts}
                                                    commentPostDetails={post.commentPostDetails}
                                                    allUser={data.allUser}
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
                    </>
                ) : (
                    <div className="d-flex justify-content-center text-center text-white mt-5">
                        <span><strong>Đang tải dữ liệu...</strong></span>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}