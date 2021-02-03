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