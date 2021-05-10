var data = NKC.methods.getDataById("data");
/*for(var i = 0; i < data.contributes.length; i++) {
  var contribute = data.contributes[i];
  contribute.agree = "";
}*/
var app = new Vue({
  el: "#app",
  data: {
    column: data.column,
    mainCategories: data.mainCategories,
    minorCategories: data.minorCategories,
    contributes: [],
    unresolvedCount: 0,
    resolvedCount: 0,
    nav: 'unresolved', // unresolved, resolved
    paging: {
      page: 0,
      buttonValue: [],
    }
  },
  mounted: function() {
    this.getContributes(0);
  },
  methods: {
    fromNow: NKC.methods.fromNow,
    agree: function(c) {
      this.submit(c, "agree")
    },
    disagree: function(c) {
      this.submit(c, "disagree")
    },
    switchNav: function(n) {
      this.nav = n;
      this.getContributes(0);
    },
    selectPage: function(type, count) {
      if(type === 'null') return;
      this.getContributes(count);
    },
    getContributes: function(page) {
      var nav = this.nav;
      var self = this;
      page = page >= 0? page: this.paging.page;
      nkcAPI('/m/' + this.column._id + '/settings/contribute?page='+page+'&t=' + nav, 'GET')
        .then(function(data) {
          self.unresolvedCount = data.unresolvedCount;
          self.resolvedCount = data.resolvedCount;
          for(var i = 0; i < data.contributes.length; i++) {
            data.contributes[i].agree = '';
          }
          self.contributes = data.contributes;
          self.paging = data.paging;
        })
        .catch(function(err) {
          screenTopWarning(err.error || err);
        })
    },
    submit: function(c) {
      var self = this;
      var agree = c.agree;
      var reason = c.reason;
      var cid = c.cid;
      var mcid = c.mcid;
      var type = "agree";
      if(!agree){
        type = "disagree"
      } else {
        if(cid.length === 0) return screenTopWarning("请选择文章分类");
      }
      nkcAPI("/m/" + this.column._id + "/settings/contribute", "POST", {
        contributesId: [c._id],
        reason: reason,
        mainCategoriesId: cid,
        minorCategoriesId: mcid,
        type: type
      })
        .then(function() {
          screenTopAlert("操作成功");
          self.getContributes();
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }
  }
});