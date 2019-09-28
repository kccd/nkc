var app = new Vue({
  el: "#app",
  data: {
    messages: [],
    usersPaging: {},
    messagesPaging: {},
    skip: 1,
    listType: "messages", // messages, users
    c: "",
    filter: {
      uid: "",
      uidType: "username",
      tUidType: "username",
      tUid: "",
      ip: "",
      st: "",
      et: "",
      keyword: ""
    }
  },
  computed: {
    paging: function() {
      if(this.listType === "messages") {
        return this.messagesPaging;
      } else {
        return this.usersPaging;
      }
    }
  },
  methods: {
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    visitUrl: NKC.methods.visitUrl,
    reset: function() {
      this.filter = {
        uid: "",
        tUid: "",
        ip: "",
        st: "",
        et: "",
        keyword: ""
      };
      this.setC();
      this.getData();
    },
    filterContent: function() {
      this.setC();
      this.getData();
    },
    lastPage: function() {
      var paging = this.paging;
      if(paging.page <= 0) {
        this.getData(0);
      } else {
        this.getData(paging.page - 1);
      }
    },
    nextPage: function() {
      var paging = this.paging;
      if((paging.page + 1)>= paging.pageCount) {
        this.getData(paging.pageCount - 1);
      } else {
        this.getData(paging.page + 1);
      }
    },
    selectListType: function(type) {
      this.listType = type;
    },
    setPaging: function(paging) {
      if(this.listType === "messages") {
        this.messagesPaging = paging;
      } else {
        this.usersPaging = paging;
      }
    },
    setC: function() {
      this.c = NKC.methods.strToBase64(JSON.stringify(this.filter));
    },
    skipPage: function() {
      this.skip = parseInt(this.skip);
      this.getData(this.skip - 1);
    },
    getData: function(page) {
      var self = this;
      if(page === undefined) page = 0;
      Promise.resolve()
        .then(function() {
          var c = self.c;
          var t = self.listType;
          return nkcAPI("/e/log/message?page="+page+"&t="+t+"&c=" + c, "GET")
        })
        .then(function(data) {
          self.setPaging(data.paging);
          if(self.listType === "messages") {
            self.messages = data.messages;
          } else {
            self.users = data.users;
          }
        })
        .catch(function(data) {
          sweetError(data);
        });
    }
  },
  mounted: function() {
    this.setC();
    this.getData();
  }
});