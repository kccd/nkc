var query = !location.search
  ? {}
  : (function(search){
    var query = search.substring(1);
    var suits = query.split("&");
    var result = {};
    suits.map(function(suit) {
      var suitKY = suit.split("=");
      result[suitKY[0]] = decodeURI(suitKY[1]);
    });
    return result;
  } (location.search));

new Vue({
  el: "#app",
  data: {
    page: query.page || 0,
    type: query.type || "username",
    content: query.content || ""
  },
  methods: {
    search: function() {
      var type = encodeURI(this.type);
      var content = encodeURI(this.content);
      if(!type || !content) return;
      return NKC.methods.visitUrl("?type=" + type + "&content=" + content);
    }
  }
})

window.viewText = (text) => {
  sweetAlert(text)
}

window.bannedAllUser = () => {
  return sweetQuestion(`确定要封禁所有弱密码用户`)
    .then(() => {
      return nkcAPI('/e/settings/safe/weakPasswordCheck/result', 'POST')
    })
    .then(() => {
      sweetSuccess('执行成功');
    })
    .catch(sweetError);
}
