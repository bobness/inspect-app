import { instance } from "./api";

const getUnreadNews = () => {
  return instance.get(`/unread_summaries`);
};

const markAsRead = (id) => {
  return instance.put(`/unread_summaries/${id}`).then((res) => res.data);
};

const getAllNews = () => {
  return instance.get("/summaries").then((res) => res.data);
};

const searchSummaries = (keyword) => {
  return instance
    .get("/search/summaries?keyword=" + keyword)
    .then((res) => res.data);
};

const searchUsers = (keyword) => {
  return instance
    .get("/search/users?keyword=" + keyword)
    .then((res) => res.data);
};

const getNewsById = (newsId) => {
  return instance.get("/summaries/id/" + newsId).then((res) => res.data);
};

const getNewsByUid = (newsUid) => {
  return instance.get("/summaries/uid/" + newsUid).then((res) => res.data);
};

const createSummary = (summary) => {
  return instance.post("/summaries", summary).then((res) => res.data);
};

const updateSummary = (id, updateBlock) => {
  return instance.put(`/summaries/${id}`, updateBlock).then((res) => res.data);
};

const postComment = (commentData) => {
  return instance.post("/comments", commentData);
};

const deleteComment = (commentId) => {
  return instance.delete(`/comments/${commentId}`);
};

const postReaction = (reactionData) => {
  return instance.post("/reactions", reactionData);
};

const deleteSummary = (summaryId) => {
  return instance.delete(`/summaries/${summaryId}`);
};

const getSuggestAuthors = () => {
  return instance.get("/summaries/suggest-authors").then((res) => res.data);
};

const followAuthor = (followerData) => {
  return instance.post("/followers", followerData);
};

const unfollowAuthor = (authorId) => {
  return instance.delete(`/followers/${authorId}`);
};

const blockUser = (userId) => {
  return instance.post("/blocks", { user_id: userId });
};

const unblockUser = (userId) => {
  return instance.delete("/blocks/" + userId);
};

const sendNotification = (data) => {
  return instance.post("/notification", data).then((res) => res.data);
};

const addToDigests = (data) => {
  return instance.post("/digests", data).then((res) => res.data);
}

const getSource = (baseUrl) => {
  return instance.get(`/sources/${baseUrl}`).then((res) => res.data);
};

const createSource = (baseUrl) => {
  return instance.post(`/sources/${baseUrl}`).then((res) => res.data);
};

const postShare = (summaryId, service, message) => {
  return instance
    .post("/shares", { summaryId, service, message })
    .then((res) => res.data);
};

export {
  getUnreadNews,
  markAsRead,
  getAllNews,
  searchSummaries,
  searchUsers,
  getNewsById,
  createSummary,
  postComment,
  deleteComment,
  postReaction,
  deleteSummary,
  getSuggestAuthors,
  followAuthor,
  unfollowAuthor,
  sendNotification,
  addToDigests,
  updateSummary,
  getSource,
  createSource,
  getNewsByUid,
  postShare,
  blockUser,
  unblockUser,
};
