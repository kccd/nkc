window.SubscribeTypes = undefined;
var app = new Vue({
  el: "#app",
  data: {
    users: [],
    columns: [],
    forums: [],
    subUsersId: [],
    subColumnsId: [],
    subForumsId: [],
    loading: true
  },
  mounted: function() {
    this.getUsers();
    if(NKC.modules.SubscribeTypes) {
      window.SubscribeTypes = new NKC.modules.SubscribeTypes();
    }
    // this.getColumns();
    // this.getForums();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: function(url) {
      NKC.methods.visitUrl(url, true);
    },
    subscribeUser: function(uid, type) {
      SubscribeTypes.subscribeUserPromise(uid, type)
        .then(function() {
          if(type) {
            app.subUsersId.push(uid);
            screenTopAlert("关注成功");
          } else {
            var index = app.subUsersId.indexOf(uid);
            if(index !== -1) app.subUsersId.splice(index, 1);
          }

        })
        .catch(function(data) {
          sweetSuccess(data);
        })
    },
    getUsers: function() {
      this.loading = true;
      nkcAPI("/register/subscribe?t=user", "GET")
        .then(function(data) {
          app.users = data.users;
          app.subUsersId = data.subUsersId;
          app.loading = false;
        })
        .catch(function(data) {
          sweetError(data);
          app.loading = false;
        })
    },
    getColumns: function() {
      nkcAPI("/register/subscribe?t=column", "GET")
        .then(function(data) {
          app.columns = data.columns;
          app.subColumnsId = data.subColumnsId;
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    getForums: function() {
      nkcAPI("/register/subscribe?t=forums", "GET")
        .then(function(data) {
          app.forums = data.forums;
          app.subForumsId = data.subForumsId;
        })
        .catch(function(data) {
          sweetError(data);
        })
    }
  }
});

window.app = app;
