const data = NKC.methods.getDataById("data");
window.app = new Vue({
  el: '#app',
  data: {
    friend: data.friend,
    fc: data.friendCategories,
    targetUser: data.targetUser,
  }
})
