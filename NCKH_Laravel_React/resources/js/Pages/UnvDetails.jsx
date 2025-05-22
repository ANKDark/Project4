import MainLayout from '@/Layouts/MainLayout';
import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import InfoUniversity from '@/Components/Truong/InfoUniversity';
import UniversityDirectory from '@/Components/Truong/UniversityDirectory';
import CommentForm from '@/Components/Truong/CommentForm';
import ListComment from '@/Components/Truong/ListComment';
import RaTing from '@/Components/Truong/RaTing';
import formatTime from '@/Utils/timeFormatter';

import '../../css/DetailsUnv.css';

export default function UnvDetails({
    truong,
    category,
    commentDetails,
    users,
    replyToComments,
    comments,
    interactions,
    currentUserId,
    ratings,
}) {
    const [sumUser, setSumUser] = useState(0);
    const [avgRate, setAvgRate] = useState(0);
    const [selectedRating, setSelectedRating] = useState(null);
    const [commentList, setCommentList] = useState(comments || []);
    const [commentDetailsList, setCommentDetailsList] = useState(commentDetails || []);
    const [usersList, setUsersList] = useState(users || []);
    const [replyToCommentsList, setReplyToCommentsList] = useState(replyToComments || []);

    const { flash } = usePage().props;

    const { data, setData, post, processing, reset } = useForm({
        IdTruong: truong.Id,
        Rate: selectedRating || null,
    });

    useEffect(() => {
        if (flash.newRating) {
            setSelectedRating(parseFloat(flash.newRating.Rate));
        }
    }, [flash]);

    useEffect(() => {
        setReplyToCommentsList(prevList =>
            [...prevList].sort((a, b) => new Date(b.CreateDate) - new Date(a.CreateDate))
        );
    }, [replyToComments]);


    useEffect(() => {
        if (!truong?.ratings) return;

        const totalUsers = ratings.filter(rating => rating.IdTruong === truong.Id).length;
        const totalRate = ratings.reduce((total, rating) => (
            rating.IdTruong === truong.Id ? total + parseFloat(rating.Rate) : total
        ), 0);

        setSumUser(totalUsers);
        setAvgRate(totalUsers > 0 ? (totalRate / totalUsers).toFixed(2) : 0);
    }, [truong]);

    useEffect(() => {
        const checkRating = ratings.find(
            rating => rating.IdTruong === truong.Id && rating.IdUser === currentUserId && rating.Rate > 0
        );
        if (checkRating) {
            setSelectedRating(checkRating.Rate);
        }
    }, [ratings, truong.Id, currentUserId]);

    useEffect(() => {
        if (data.Rate !== null && !processing) {
            post(route('rating'), { preserveScroll: true });
        }
    }, [data.Rate]);

    const handleInteraction = (value, e) => {
        e.preventDefault();
        setSelectedRating(value);
        setData('Rate', value);
    };

    const { data: dataComment, setData: setDataComment, post: postComment, processing: processingComment, reset: resetComment } =
        useForm({ text: '', IdTruong: truong.Id, Visibility: 'Public' });

    const handleSubmitComment = (e) => {
        e.preventDefault();
        postComment(route("comment"), {
            preserveScroll: true,
            onSuccess: ({ props }) => {
                if (props.flash.newComment) {
                    setCommentList(prevList => [...prevList, props.flash.newComment]);
                }
                if (props.flash.newCommentDetails) {
                    setCommentDetailsList(prevList => [...prevList, props.flash.newCommentDetails]);
                }
                resetComment();
            }
        });
    };

    const { data: dataReplyCmt, setData: setDataReplyCmt, post: postReplyCmt, processing: processingReplyCmt, reset: resetReplyCmt } =
        useForm({
            text: '',
            IdComment: null,
            IdTruong: truong.Id
        });

    const onReplyCommentSubmit = (e, IdComment) => {
        e.preventDefault();
        setDataReplyCmt(prevData => ({ ...prevData, IdComment }));
    };

    useEffect(() => {
        if (dataReplyCmt.IdComment !== null && dataReplyCmt.text !== '') {
            postReplyCmt(route("replyToComment"), {
                preserveScroll: true,
                onSuccess: ({ props }) => {
                    console.log(props.flash.newReplyToComment);

                    if (props.flash.newReplyToComment) {
                        setReplyToCommentsList(prevList => [...prevList, props.flash.newReplyToComment]);
                    }
                    resetReplyCmt();
                }
            });
        }
    }, [dataReplyCmt]);

    const { data: dataLikeDislike, setData: setDataLikeDislike, post: postLikeDislike } = useForm({
        IdComment: null,
        Like_or_Dislike: null,
    });

    const handleLikeDislike = (commentId, likeOrDislike, e) => {
        e.preventDefault();
        setDataLikeDislike({ IdComment: commentId, Like_or_Dislike: likeOrDislike });
    };

    useEffect(() => {
        if (dataLikeDislike.IdComment !== null && dataLikeDislike.Like_or_Dislike !== null) {
            postLikeDislike(route("interaction"), { preserveScroll: true });
        }
    }, [dataLikeDislike]);

    const [sortOrder, setSortOrder] = useState("likeest");

    useEffect(() => {
        let sortedComments = [...comments];

        if (sortOrder === "newest") {
            sortedComments.sort((a, b) => new Date(b.CreateDate) - new Date(a.CreateDate));
        } else if (sortOrder === "oldest") {
            sortedComments.sort((a, b) => new Date(a.CreateDate) - new Date(b.CreateDate));
        } else if (sortOrder === "likeest") {
            sortedComments.sort((a, b) => {
                const likeCountA = interactions.filter(inter => inter.IdComment === a.Id && inter.Like_or_Dislike === 1).length;
                const likeCountB = interactions.filter(inter => inter.IdComment === b.Id && inter.Like_or_Dislike === 1).length;
                return likeCountB - likeCountA;
            });
        }

        setCommentList(sortedComments);
    }, [sortOrder, comments, interactions]);
    //Phần UI
    return (
        <MainLayout>
        <Head title={`Chi tiết ${truong?.TenTruong}`} />
            <InfoUniversity truong={truong} />
            <UniversityDirectory category={category} />

            <div className="card mb-4 text-color bg-details">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="card-title fw-bold fs-5">{sumUser} Đánh giá:</h5>
                        <p>{sumUser > 0 ? avgRate : "Chưa có đánh giá"}</p>
                    </div>
                    <RaTing
                        selectedRating={selectedRating}
                        handleInteraction={handleInteraction}
                        processing={processing}
                    />
                </div>
            </div>

            <div className="card mb-4 text-color bg-details">
                <div className="card-body pb-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="card-title font-weight-bold fs-4"><strong>Bình luận</strong></h2>
                        <select
                            className="form-select w-auto me-3 select-f"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="likeest" >Nhiều thích nhất</option>
                            <option value="oldest" >Cũ nhất</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>
                    <div className="mb-4 overflow-auto" style={{ maxHeight: "550px" }}>
                        {commentList.length > 0 ? (
                            commentList.map((comment, index) => {
                                const checkLiked = interactions.some(
                                    interaction => interaction.IdComment === comment.Id &&
                                        interaction.IdUser === currentUserId &&
                                        interaction.Like_or_Dislike === 1
                                );
                                const checkDisLiked = interactions.some(
                                    interaction => interaction.IdComment === comment.Id &&
                                        interaction.IdUser === currentUserId &&
                                        interaction.Like_or_Dislike === 0
                                );
                                const likeCount = interactions.filter(
                                    interaction => interaction.IdComment === comment.Id && interaction.Like_or_Dislike === 1
                                ).length;
                                const disLikeCount = interactions.filter(
                                    interaction => interaction.IdComment === comment.Id && interaction.Like_or_Dislike === 0
                                ).length;

                                return (
                                    <ListComment
                                        key={comment.Id || index}
                                        comment={comment}
                                        usersList={usersList}
                                        commentDetailsList={commentDetailsList}
                                        replyToCommentsList={replyToCommentsList}
                                        onLikeDislike={handleLikeDislike}
                                        checkLiked={checkLiked}
                                        checkDisLiked={checkDisLiked}
                                        likeCount={likeCount}
                                        disLikeCount={disLikeCount}
                                        onReplySubmit={onReplyCommentSubmit}
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
                    onChange={e => setDataComment('text', e.target.value)}
                    onSubmit={handleSubmitComment}
                    text="bình luận"
                    processing={processingComment}
                />
            </div>
        </MainLayout>
    );
}
