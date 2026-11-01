/* =========================================================
   ADMIN APPLICATION STATE
   ========================================================= */

const state = {

    adminSession: null,

    clients: [],

    notifications: [],

    reviews: [],

    activeReviewFilter: "all",

    currentConversationId: null,

    currentConversation: null,

    conversationPollingInterval: null,

    lastConversationSignature: "",

    selectedFiles: [],

    activeClientFilter: "all",

    activeNotificationFilter: "all"

};


export function getState() {
    return state;
}


export function getAdminSession() {
    return state.adminSession;
}


export function setAdminSession(value) {
    state.adminSession = value;
}


export function setClients(value) {
    state.clients =
        Array.isArray(value)
            ? value
            : [];
}


export function setNotifications(value) {
    state.notifications =
        Array.isArray(value)
            ? value
            : [];
}


export function setReviews(value) {
    state.reviews =
        Array.isArray(value)
            ? value
            : [];
}


export default state;