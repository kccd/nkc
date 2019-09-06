NKC.modules.SelectUser = function() {
  var self = this;
  self.dom = $("#moduleSelectUser");
  self.dom.modal({
    show: false,
    backdrop: "static"
  });
  self.app = new Vue({
    el: "#moduleSelectUserApp",
    data: {
      users: [],
      searchUsers: [],
      selectedUsersId: [],
      userCount: 1,
      searchInfo: "",
      type: "username", // username, uid
      keyword: "",
      paging: ""
    },
    mounted: function() {
      // this.search();
    },
    computed: {
      selectedUsers: function() {
        var selectedUsersId = this.selectedUsersId;
        var users = [];
        for(var i = 0; i < selectedUsersId.length; i++) {
          var u = this.getUserById(selectedUsersId[i]);
          if(u) users.push(u);
        }
        return users;
      }
    },
    methods: {
      checkString: NKC.methods.checkData.checkString,
      removeUser: function(index) {
        this.selectedUsersId.splice(index, 1);
      },
      getUserById: function(id) {
        var users = this.users;
        for(var i = 0; i < users.length; i++) {
          var u = users[i];
          if(u.uid === id) return u;
        }
      },
      selectUser: function(u) {
        if(this.selectedUsersId.indexOf(u.uid) === -1) {
          this.selectedUsersId.push(u.uid);
        }
      },
      search: function() {
        var app = this;
        this.searchInfo = "";
        Promise.resolve()
          .then(function() {
            var keyword = app.keyword;
            app.checkString(keyword, {
              name: "输入的关键词",
              minLength: 1
            });
            var url = "/u";
            if(app.type === "username") {
              url += "?username=" + keyword;
            } else {
              url += "?uid=" + keyword;
            }
            return nkcAPI(url, "GET");
          })
          .then(function(data) {
            app.searchUsers = data.targetUsers;
            app.users = app.users.concat(app.searchUsers);
            if(!data.targetUsers.length) app.searchInfo = "未找到相关用户";
          })
          .catch(function(err) {
            sweetError(err);
          })
      },
      getTypeName: function(type) {
        return {
          "uid": "用户ID",
          "username": "用户名"
        }[type];
      },
      selectType: function(type) {
        this.type = type;
      },
      open: function(callback, options) {
        options = options || {};
        self.app.userCount = options.userCount || 99;
        self.callback = callback;
        self.dom.modal("show");
      },
      close: function() {
        self.dom.modal("hide");
        setTimeout(function() {
          self.app.searchUsers = [];
          self.app.type = "username";
          self.app.selectedUsersId = [];
        }, 1000);
      },
      done: function() {
        self.callback({
          usersId: this.selectedUsersId,
          users: this.selectedUsers
        });
        self.close();
      }
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};