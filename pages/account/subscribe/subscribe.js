var SubscribeTypes;
var app = new Vue({
  el: "#subscribe",
  data: {
    type: "",
    paging: {},
    subscribes: [],

    counts: {
      total: 0,
      user: 0,
      topic: 0,
      discipline: 0,
      column: 0,
      thread: 0
    },

    loaded: false,
    types: [],

    subUsersId: [],
    subForumsId: [],
    subColumnsId: [],
    subThreadsId: []
  },
  mounted: function() {
    $("body").show();
    this.getData();
    this.getTypes();
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  },
  methods: {
    getTypes: function() {
      nkcAPI("/account/subscribe_types?count=true", "GET")
        .then(function(data) {
          app.types = data.types;
          app.counts = data.counts;
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    removeType: function(type) {
      sweetConfirm("确定要删除分类“"+type.name+"”吗？")
        .then(function() {
          nkcAPI("/account/subscribe_types/" + type._id, "DELETE")
            .then(function() {
              app.getTypes();
            })
            .catch(function(data) {
              sweetError(data);
            })
        })
    },
    moveType: function(t, d) {
      nkcAPI("/account/subscribe_types/" + t._id, "PATCH", {
        type: "order",
        direction: d
      })
        .then(function() {
          app.getTypes();
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    modifyType: function(type) {
      SubscribeTypes.open(function() {
        SubscribeTypes.close();
        app.getTypes();
      }, {
        edit: true,
        typeId: type._id
      })
    },
    addType: function() {
      SubscribeTypes.open(function() {
        SubscribeTypes.close();
        app.getTypes();
      }, {
        edit: true
      })
    },
    removeFromArray: function(arr, value) {
      var index = arr.indexOf(value);
      if(index !== -1) arr.splice(index);
    },
    saveToArray: function(arr, value) {
      var index = arr.indexOf(value);
      if(index === -1) arr.push(value);
    },
    subscribeTarget: function(type, id) {
      var sub, index, func, subArr;
      if(type === "forum") {
        func = NKC.methods.subscribeForumPromise;
        subArr = this.subForumsId;
      } else if(type === "column") {
        func = NKC.methods.subscribeColumnPromise;
        subArr = this.subColumnsId;
      } else if(type === "thread") {
        func = NKC.methods.subscribeThreadPromise;
        subArr = this.subThreadsId;
      } else {
        func = NKC.methods.subscribeUserPromise;
        subArr = this.subUsersId;
      }

      index = subArr.indexOf(id);
      sub = (index === -1);
      func(id, sub)
        .then(function() {
          if(sub) {
            subArr.push(id);
            sweetSuccess("关注成功");
          } else {
            subArr.splice(index, 1);
            sweetSuccess("关注已取消");
          }
        })
        .catch(function(data) {
          sweetError(data);
        });
    },
    selectType: function(type) {
      this.type = type;
      this.paging = {};
      this.getData();
    },
    getData: function(page, type) {
      if(!type && type !== 0) {
        type = this.type || "all"
      }
      if(!page && page !== 0) {
        page = this.paging.page || 0;
      }
      nkcAPI("/account/subscribes?page=" + page + "&t=" + type, "GET")
        .then(function(data) {

          app.paging = data.paging;
          app.subscribes = data.subscribes;
          app.subUsersId = data.subUsersId;
          app.subThreadsId = data.subThreadsId;
          app.subColumnsId = data.subColumnsId;
          app.subForumsId = data.subForumsId;

          app.loaded = true;
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    moveSub: function(sub) {
      SubscribeTypes.open(function(typesId) {
        nkcAPI("/account/subscribes/" + sub._id, "PATCH", {
          typesId: typesId
        })
          .then(function() {
            SubscribeTypes.close();
            app.getTypes();
            app.getData();
          })
          .catch(function(data) {
            sweetError(data);
          });
      }, {
        selectedTypesId: sub.cid || []
      });
    }
  }
});