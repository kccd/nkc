const draft = new (class {
  constructor() {
  
  }
  removeDraft(did) {
    nkcAPI('/u/' + NKC.configs.uid + "/drafts/" + did, "DELETE")
      .then(function() {
        window.location.reload();
      })
      .catch(function(data) {
        sweetError(data);
      })
  }
  removeDraftSingle(did) {
    sweetQuestion("确定要删除当前草稿？删除后不可恢复。")
      .then(function() {
        removeDraft(did);
      })
      .catch(function() {})
  }
  /*
  * 清空草稿箱
  * */
  removeAll() {
    var self = this;
    sweetQuestion("确定要删除全部草稿？删除后不可恢复。")
      .then(function() {
        self.removeDraft("all");
      })
      .catch(function(){})
  }
  
  getInputs() {
    return $(".draft-checkbox input");
  }
  
  getSelectedDraftsId() {
    var arr = [];
    var dom = this.getInputs();
    for(var i = 0; i < dom.length; i++) {
      var d = dom.eq(i);
      if(d.prop("checked")) {
        arr.push(d.attr("data-did"));
      }
    }
    return arr;
  }
  
  selectAll() {
    var selectedDraftsId = this.getSelectedDraftsId();
    var dom = this.getInputs();
    if(selectedDraftsId.length !== dom.length) {
      dom.prop("checked", true);
    } else {
      dom.prop("checked", false);
    }
  }
  
  removeSelectedDrafts() {
    var selectedDraftsId = this.getSelectedDraftsId();
    var self = this;
    if(!selectedDraftsId.length) return;
    var did = selectedDraftsId.join("-");
    sweetQuestion("确定要删除已勾选的草稿？删除后不可恢复。")
      .then(function() {
        self.removeDraft(did);
      })
      .catch(function() {})
  }
})();
const data = NKC.methods.getDataById("subUsersId");
const SubscribeTypes = new NKC.modules.SubscribeTypes();
const user = new (class {
  constructor() {
    this.subUsersId = data.subUsersId;
    this.subForumsId = data.subForumsId;
    this.subColumnsId = data.subColumnsId;
    this.subThreadsId = data.subThreadsId;
    this.collectionThreadsId = data.collectionThreadsId;
    this.subscribes = data.subscribes;
  }
  moveSub(subId) {
    this.moveSubs([subId]);
  }
  moveSubs(subsId = []) {
    const subscribes = [];
    const self = this;
    subsId.map(id => {
      const s = self.subscribes[id];
      if(s) subscribes.push(s);
    });
    let selectedTypesId = [];
    if(subscribes.length === 1) {
      selectedTypesId = subscribes[0].cid;
    } else if(subscribes.length === 0) {
      return;
    }
    subsId = subscribes.map(s => s._id);
    
    SubscribeTypes.open(function(typesId) {
      nkcAPI("/account/subscribes", "PATCH", {
        type: "modifyType",
        typesId: typesId,
        subscribesId: subsId
      })
        .then(function() {
          SubscribeTypes.close();
          subscribes.map(s => {
            s.cid = typesId
          });
          sweetSuccess("执行成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    }, {
      selectedTypesId: selectedTypesId,
      hideInfo: true,
      selectTypesWhenSubscribe: true
    });
  }
  
  subscribe(id, type) {
    const buttonsDom = $(`.account-follower-buttons[data-${type}='${id}']`);
    let subId, func;
    if(type === "user") {
      subId = this.subUsersId;
      func = SubscribeTypes.subscribeUserPromise;
    } else if(type === "forum") {
      subId = this.subForumsId;
      func = SubscribeTypes.subscribeForumPromise;
    } else if(type === "column") {
      subId = this.subColumnsId;
      id = Number(id);
      func = SubscribeTypes.subscribeColumnPromise;
    } else if(type === "thread") {
      subId = this.subThreadsId;
      func = SubscribeTypes.subscribeThreadPromise;
    } else if(type === "collection") {
      subId = this.collectionThreadsId;
      func = SubscribeTypes.collectionThreadPromise;
    }
    
    const sub = !subId.includes(id);
    
    new Promise((resolve, reject) => {
      if(!["user", "collection", "thread"].includes(type) || !sub) {
        resolve();
      } else {
        SubscribeTypes.open((cid) => {
          resolve(cid);
        });
      }
    })
      .then(cid => {
        if(cid) {
          return func(id, sub, cid);
        } else {
          return func(id, sub);
        }
      })
      .then(() => {
        SubscribeTypes.close();
        if(sub) {
          if(type === "collection") {
            sweetSuccess("收藏成功");
          } else {
            sweetSuccess("关注成功");
          }
          buttonsDom.addClass("active");
          const index = subId.indexOf(id);
          if(index === -1) subId.push(id);
        } else {
          if(type === "collection") {
            sweetSuccess("收藏已取消");
          } else {
            sweetSuccess("关注已取消");
          }
          buttonsDom.removeClass("active");
          const index = subId.indexOf(id);
          if(index !== -1) subId.splice(index, 1);
        }
      })
      .catch(sweetError);
    
    
    /*if(sub) {
      SubscribeTypes.open(function(cid) {
        func(id, sub, cid)
          .then(function() {
            SubscribeTypes.close();
            if(type === "collection") {
              sweetSuccess("收藏成功");
            } else {
              sweetSuccess("关注成功");
            }
            buttonsDom.addClass("active");
            const index = subId.indexOf(id);
            if(index === -1) subId.push(id);
          })
          .catch(function(data) {
            sweetError(data);
          })
      });
      
    } else {
      
      func(id, sub)
        .then(function() {
          buttonsDom.removeClass("active");
          if(type === "collection") {
            sweetSuccess("收藏已取消");
          } else {
            sweetSuccess("关注已取消");
          }
          const index = subId.indexOf(id);
          if(index !== -1) subId.splice(index, 1);
        })
        .catch(function(data) {
          sweetError(data);
        })
    }*/
  }
  editType() {
    SubscribeTypes.open(function() {
    
    }, {
      editType: true
    })
  }
})();

/*
var SummaryCalendar = new NKC.modules.SummaryCalender($(".summary-calendar")[0]);
var SummaryPie = new NKC.modules.SummaryPie($(".summary-pie")[0]);
*/
