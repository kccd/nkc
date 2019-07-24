var SubscribeTypes;
var data = getDataById("data");
var app = new Vue({
  el: "#subscribe",
  data: {
    type: data.t || "",
    category: data.c || "",
    paging: {},
    subscribes: [],

    selectedSubId: [],

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
    subThreadsId: [],
    collectionThreadsId: [],
    management: false
  },
  mounted: function() {
    $("body").show();
    this.getData();
    this.getTypes();
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  },
  methods: {
    appOpenUrl: function(url) {
      appOpenUrl(url);
    },
    managementSub: function() {
      if(this.management) {
        this.management = false;
        this.selectedSubId = [];
      } else {
        this.management = true;
      }
    },
    selectAll: function() {
      var subscribesId = [];
      for(var i = 0; i < this.subscribes.length; i++) {
        subscribesId.push(this.subscribes[i]._id);
      }
      if(this.selectedSubId.length !== subscribesId.length) {
        this.selectedSubId = subscribesId.concat([]);
      } else {
        this.selectedSubId = [];
      }
    },
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
        func = SubscribeTypes.subscribeForumPromise;
        subArr = this.subForumsId;
      } else if(type === "column") {
        func = SubscribeTypes.subscribeColumnPromise;
        subArr = this.subColumnsId;
      } else if(type === "thread") {
        func = SubscribeTypes.subscribeThreadPromise;
        subArr = this.subThreadsId;
      } else if(type === "collection") {
        func = SubscribeTypes.collectionThreadPromise;
        subArr = this.collectionThreadsId;
      } else {
        func = SubscribeTypes.subscribeUserPromise;
        subArr = this.subUsersId;
      }

      index = subArr.indexOf(id);
      sub = (index === -1);
      var promiseFunc;
      if(sub) {
        promiseFunc = SubscribeTypes.open;
      } else {
        promiseFunc = function(callback) {
          callback([]);
        };
      }
      promiseFunc(function(cid) {
        SubscribeTypes.close();
        func(id, sub, cid)
          .then(function() {
            app.getTypes();
            if(sub) {
              subArr.push(id);
              if(type === "collection") {
                sweetSuccess("收藏成功");
              } else {
                sweetSuccess("关注成功");
              }
            } else {
              subArr.splice(index, 1);
              if(type === "collection") {
                sweetSuccess("收藏已取消");
              } else {
                sweetSuccess("关注已取消");
              }
            }
          })
          .catch(function(data) {
            sweetError(data);
          });
      });

    },
    initManagement: function() {
      $(".small-forum-checkbox label").hide();
      this.management = false;
      this.selectedSubId = [];
    },
    selectType: function(type) {
      this.initManagement();
      this.type = type;
      this.paging = {};
      this.getData();
    },
    selectCategory: function(c) {
      this.initManagement();
      this.category = c;
      this.paging = {};
      this.getData();
    },
    getData: function(page, type, category) {
      this.initManagement();
      if(!type && type !== 0) {
        type = this.type || "all"
      }
      if(!category) {
        category = this.category || "all"
      }
      if(!page && page !== 0) {
        page = this.paging.page || 0;
      }
      nkcAPI("/account/subscribes?page=" + page + "&t=" + type + "&c=" + category, "GET")
        .then(function(data) {
          var subscribes = data.subscribes;
          var subs = [], subsId = [];
          for(var i = 0; i < subscribes.length; i++) {
            var sub = subscribes[i];
            if(["thread", "collection"].indexOf(sub.type) !== -1) {
              if(subsId.indexOf(sub.tid) === -1) {
                subsId.push(sub.tid);
                subs.push(sub);
              }
            }
          }
          // app.subscribes = subs;
          app.subscribes = subscribes;
          app.paging = data.paging;
          app.subUsersId = data.subUsersId;
          app.subThreadsId = data.subThreadsId;
          app.subColumnsId = data.subColumnsId;
          app.subForumsId = data.subForumsId;
          app.collectionThreadsId = data.collectionThreadsId;

          app.loaded = true;
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    moveSubs: function(subId) {
      var subsId = [];
      var selectedTypesId = [];
      if(typeof subId === "number") {
        subsId = [subId];
      } else {
        subsId = this.selectedSubId;
      }
      if(!subsId.length) return sweetError("请至少勾选一个");
      if(subsId.length === 1) {
        var sub = this.getSubById(subsId[0]);
        selectedTypesId = sub.cid;
      }
      SubscribeTypes.open(function(typesId) {
        nkcAPI("/account/subscribes", "PATCH", {
          type: "modifyType",
          typesId: typesId,
          subscribesId: subsId
        })
          .then(function() {
            SubscribeTypes.close();
            app.getTypes();
            app.getData();
          })
          .catch(function(data) {
            sweetError(data);
          })
      }, {
        selectedTypesId: selectedTypesId
      });
    },
    getSubById: function(_id) {
      var subscribes = this.subscribes;
      for(var i = 0; i < subscribes.length; i++) {
        var sub = subscribes[i];
        if(sub._id === _id) return sub;
      }
    },
    moveSub: function(sub) {
      this.moveSubs(sub._id);
    }
  }
});