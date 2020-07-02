(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

window.draft = new ( /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);
  }

  _createClass(_class, [{
    key: "removeDraft",
    value: function removeDraft(did) {
      nkcAPI('/u/' + NKC.configs.uid + "/drafts/" + did, "DELETE").then(function () {
        window.location.reload();
      })["catch"](function (data) {
        sweetError(data);
      });
    }
  }, {
    key: "removeDraftSingle",
    value: function removeDraftSingle(did) {
      var self = this;
      sweetQuestion("确定要删除当前草稿？删除后不可恢复。").then(function () {
        self.removeDraft(did);
      })["catch"](function () {});
    }
    /*
    * 清空草稿箱
    * */

  }, {
    key: "removeAll",
    value: function removeAll() {
      var self = this;
      sweetQuestion("确定要删除全部草稿？删除后不可恢复。").then(function () {
        self.removeDraft("all");
      })["catch"](function () {});
    }
  }, {
    key: "getInputs",
    value: function getInputs() {
      return $(".draft-checkbox input");
    }
  }, {
    key: "getSelectedDraftsId",
    value: function getSelectedDraftsId() {
      var arr = [];
      var dom = this.getInputs();

      for (var i = 0; i < dom.length; i++) {
        var d = dom.eq(i);

        if (d.prop("checked")) {
          arr.push(d.attr("data-did"));
        }
      }

      return arr;
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      var selectedDraftsId = this.getSelectedDraftsId();
      var dom = this.getInputs();

      if (selectedDraftsId.length !== dom.length) {
        dom.prop("checked", true);
      } else {
        dom.prop("checked", false);
      }
    }
  }, {
    key: "removeSelectedDrafts",
    value: function removeSelectedDrafts() {
      var selectedDraftsId = this.getSelectedDraftsId();
      var self = this;
      if (!selectedDraftsId.length) return;
      var did = selectedDraftsId.join("-");
      sweetQuestion("确定要删除已勾选的草稿？删除后不可恢复。").then(function () {
        self.removeDraft(did);
      })["catch"](function () {});
    }
  }]);

  return _class;
}())();
var data = NKC.methods.getDataById("subUsersId");

if (!window.SubscribeTypes) {
  window.SubscribeTypes = new NKC.modules.SubscribeTypes();
}

window.user = new ( /*#__PURE__*/function () {
  function _class2() {
    _classCallCheck(this, _class2);

    this.subUsersId = data.subUsersId;
    this.subForumsId = data.subForumsId;
    this.subColumnsId = data.subColumnsId;
    this.subThreadsId = data.subThreadsId;
    this.collectionThreadsId = data.collectionThreadsId;
    this.subscribes = data.subscribes;
  }

  _createClass(_class2, [{
    key: "moveSub",
    value: function moveSub(subId) {
      this.moveSubs([subId]);
    }
  }, {
    key: "moveSubs",
    value: function moveSubs() {
      var subsId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var subscribes = [];
      var self = this;
      subsId.map(function (id) {
        var s = self.subscribes[id];
        if (s) subscribes.push(s);
      });
      var selectedTypesId = [];

      if (subscribes.length === 1) {
        selectedTypesId = subscribes[0].cid;
      } else if (subscribes.length === 0) {
        return;
      }

      subsId = subscribes.map(function (s) {
        return s._id;
      });
      SubscribeTypes.open(function (typesId) {
        nkcAPI("/account/subscribes", "PATCH", {
          type: "modifyType",
          typesId: typesId,
          subscribesId: subsId
        }).then(function () {
          SubscribeTypes.close();
          subscribes.map(function (s) {
            s.cid = typesId;
          });
          sweetSuccess("执行成功");
        })["catch"](function (data) {
          sweetError(data);
        });
      }, {
        selectedTypesId: selectedTypesId,
        hideInfo: true,
        selectTypesWhenSubscribe: true
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(id, type) {
      var buttonsDom = $(".account-follower-buttons[data-".concat(type, "='").concat(id, "']"));
      var subId, func;

      if (type === "user") {
        subId = this.subUsersId;
        func = SubscribeTypes.subscribeUserPromise;
      } else if (type === "forum") {
        subId = this.subForumsId;
        func = SubscribeTypes.subscribeForumPromise;
      } else if (type === "column") {
        subId = this.subColumnsId;
        id = Number(id);
        func = SubscribeTypes.subscribeColumnPromise;
      } else if (type === "thread") {
        subId = this.subThreadsId;
        func = SubscribeTypes.subscribeThreadPromise;
      } else if (type === "collection") {
        subId = this.collectionThreadsId;
        func = SubscribeTypes.collectionThreadPromise;
      }

      var sub = !subId.includes(id);
      new Promise(function (resolve, reject) {
        if (!["user", "collection", "thread"].includes(type) || !sub) {
          resolve();
        } else {
          SubscribeTypes.open(function (cid) {
            resolve(cid);
          });
        }
      }).then(function (cid) {
        if (cid) {
          return func(id, sub, cid);
        } else {
          return func(id, sub);
        }
      }).then(function () {
        SubscribeTypes.close();

        if (sub) {
          if (type === "collection") {
            sweetSuccess("收藏成功");
          } else {
            sweetSuccess("关注成功");
          }

          buttonsDom.addClass("active");
          var index = subId.indexOf(id);
          if (index === -1) subId.push(id);
        } else {
          if (type === "collection") {
            sweetSuccess("收藏已取消");
          } else {
            sweetSuccess("关注已取消");
          }

          buttonsDom.removeClass("active");

          var _index = subId.indexOf(id);

          if (_index !== -1) subId.splice(_index, 1);
        }
      })["catch"](sweetError);
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
  }, {
    key: "editType",
    value: function editType() {
      SubscribeTypes.open(function () {}, {
        editType: true
      });
    }
  }]);

  return _class2;
}())();

window.removeBlacklist = function (uid, _id) {
  NKC.methods.removeUserFromBlacklist(uid).then(function (data) {
    if (!data) return;
    var dom = $("[data-type=\"blacklist\"][data-id=\"".concat(_id, "\"]"));
    if (dom && dom.length) dom.remove();
  });
};

if (NKC.configs.isApp) {
  window.ready().then(function () {
    newEvent("userChanged", function (data) {
      if (!data.user) return;
      window.location.href = window.location.pathname.replace(/\/u\/([0-9]+\/)/ig, "/u/" + data.user.uid + "/");
    });
  });
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3VzZXIvcHJvZmlsZS9wcm9maWxlLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsTUFBTSxDQUFDLEtBQVAsR0FBZTtBQUNiLG9CQUFjO0FBQUE7QUFFYjs7QUFIWTtBQUFBO0FBQUEsZ0NBSUQsR0FKQyxFQUlJO0FBQ2YsTUFBQSxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsT0FBSixDQUFZLEdBQXBCLEdBQTBCLFVBQTFCLEdBQXVDLEdBQXhDLEVBQTZDLFFBQTdDLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxPQUhILFdBSVMsVUFBUyxJQUFULEVBQWU7QUFDcEIsUUFBQSxVQUFVLENBQUMsSUFBRCxDQUFWO0FBQ0QsT0FOSDtBQU9EO0FBWlk7QUFBQTtBQUFBLHNDQWFLLEdBYkwsRUFhVTtBQUNyQixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxhQUFhLENBQUMsb0JBQUQsQ0FBYixDQUNHLElBREgsQ0FDUSxZQUFXO0FBQ2YsUUFBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixHQUFqQjtBQUNELE9BSEgsV0FJUyxZQUFXLENBQUUsQ0FKdEI7QUFLRDtBQUNEOzs7O0FBckJhO0FBQUE7QUFBQSxnQ0F3QkQ7QUFDVixVQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsTUFBQSxhQUFhLENBQUMsb0JBQUQsQ0FBYixDQUNHLElBREgsQ0FDUSxZQUFXO0FBQ2YsUUFBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixLQUFqQjtBQUNELE9BSEgsV0FJUyxZQUFVLENBQUUsQ0FKckI7QUFLRDtBQS9CWTtBQUFBO0FBQUEsZ0NBaUNEO0FBQ1YsYUFBTyxDQUFDLENBQUMsdUJBQUQsQ0FBUjtBQUNEO0FBbkNZO0FBQUE7QUFBQSwwQ0FxQ1M7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LEVBRUc7QUFDRCxRQUFBLFFBQVEsRUFBRTtBQURULE9BRkg7QUFLRDtBQTdKVzs7QUFBQTtBQUFBLE1BQWQ7O0FBaUtBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNyQyxFQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksdUJBQVosQ0FBb0MsR0FBcEMsRUFDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixRQUFHLENBQUMsSUFBSixFQUFVO0FBQ1YsUUFBTSxHQUFHLEdBQUcsQ0FBQywrQ0FBcUMsR0FBckMsU0FBYjtBQUNBLFFBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFkLEVBQXNCLEdBQUcsQ0FBQyxNQUFKO0FBQ3ZCLEdBTEg7QUFNRCxDQVBEOztBQVNBLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFmLEVBQXNCO0FBQ3BCLEVBQUEsTUFBTSxDQUFDLEtBQVAsR0FDRyxJQURILENBQ1EsWUFBVztBQUNmLElBQUEsUUFBUSxDQUFDLGFBQUQsRUFBZ0IsVUFBUyxJQUFULEVBQWU7QUFDckMsVUFBRyxDQUFDLElBQUksQ0FBQyxJQUFULEVBQWU7QUFDZixNQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLElBQWhCLEdBQXVCLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFFBQWhCLENBQXlCLE9BQXpCLENBQWlDLG1CQUFqQyxFQUFzRCxRQUFRLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBbEIsR0FBd0IsR0FBOUUsQ0FBdkI7QUFDRCxLQUhPLENBQVI7QUFJRCxHQU5IO0FBT0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuZHJhZnQgPSBuZXcgKGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgfVxyXG4gIHJlbW92ZURyYWZ0KGRpZCkge1xyXG4gICAgbmtjQVBJKCcvdS8nICsgTktDLmNvbmZpZ3MudWlkICsgXCIvZHJhZnRzL1wiICsgZGlkLCBcIkRFTEVURVwiKVxyXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgfSlcclxuICB9XHJcbiAgcmVtb3ZlRHJhZnRTaW5nbGUoZGlkKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlvZPliY3ojYnnqL/vvJ/liKDpmaTlkI7kuI3lj6/mgaLlpI3jgIJcIilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi5yZW1vdmVEcmFmdChkaWQpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSlcclxuICB9XHJcbiAgLypcclxuICAqIOa4heepuuiNieeov+eusVxyXG4gICogKi9cclxuICByZW1vdmVBbGwoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Yig6Zmk5YWo6YOo6I2J56i/77yf5Yig6Zmk5ZCO5LiN5Y+v5oGi5aSN44CCXCIpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlRHJhZnQoXCJhbGxcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpe30pXHJcbiAgfVxyXG5cclxuICBnZXRJbnB1dHMoKSB7XHJcbiAgICByZXR1cm4gJChcIi5kcmFmdC1jaGVja2JveCBpbnB1dFwiKTtcclxuICB9XHJcblxyXG4gIGdldFNlbGVjdGVkRHJhZnRzSWQoKSB7XHJcbiAgICB2YXIgYXJyID0gW107XHJcbiAgICB2YXIgZG9tID0gdGhpcy5nZXRJbnB1dHMoKTtcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkb20ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGQgPSBkb20uZXEoaSk7XHJcbiAgICAgIGlmKGQucHJvcChcImNoZWNrZWRcIikpIHtcclxuICAgICAgICBhcnIucHVzaChkLmF0dHIoXCJkYXRhLWRpZFwiKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnI7XHJcbiAgfVxyXG5cclxuICBzZWxlY3RBbGwoKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWREcmFmdHNJZCA9IHRoaXMuZ2V0U2VsZWN0ZWREcmFmdHNJZCgpO1xyXG4gICAgdmFyIGRvbSA9IHRoaXMuZ2V0SW5wdXRzKCk7XHJcbiAgICBpZihzZWxlY3RlZERyYWZ0c0lkLmxlbmd0aCAhPT0gZG9tLmxlbmd0aCkge1xyXG4gICAgICBkb20ucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb20ucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVtb3ZlU2VsZWN0ZWREcmFmdHMoKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWREcmFmdHNJZCA9IHRoaXMuZ2V0U2VsZWN0ZWREcmFmdHNJZCgpO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzOyAgICBpZighc2VsZWN0ZWREcmFmdHNJZC5sZW5ndGgpIHJldHVybjtcclxuICAgIHZhciBkaWQgPSBzZWxlY3RlZERyYWZ0c0lkLmpvaW4oXCItXCIpO1xyXG4gICAgc3dlZXRRdWVzdGlvbihcIuehruWumuimgeWIoOmZpOW3suWLvumAieeahOiNieeov++8n+WIoOmZpOWQjuS4jeWPr+aBouWkjeOAglwiKVxyXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICBzZWxmLnJlbW92ZURyYWZ0KGRpZCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpIHt9KVxyXG4gIH1cclxufSkoKTtcclxuY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwic3ViVXNlcnNJZFwiKTtcclxuaWYoIXdpbmRvdy5TdWJzY3JpYmVUeXBlcykge1xyXG4gIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xyXG59XHJcbndpbmRvdy51c2VyID0gbmV3IChjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnN1YlVzZXJzSWQgPSBkYXRhLnN1YlVzZXJzSWQ7XHJcbiAgICB0aGlzLnN1YkZvcnVtc0lkID0gZGF0YS5zdWJGb3J1bXNJZDtcclxuICAgIHRoaXMuc3ViQ29sdW1uc0lkID0gZGF0YS5zdWJDb2x1bW5zSWQ7XHJcbiAgICB0aGlzLnN1YlRocmVhZHNJZCA9IGRhdGEuc3ViVGhyZWFkc0lkO1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uVGhyZWFkc0lkID0gZGF0YS5jb2xsZWN0aW9uVGhyZWFkc0lkO1xyXG4gICAgdGhpcy5zdWJzY3JpYmVzID0gZGF0YS5zdWJzY3JpYmVzO1xyXG4gIH1cclxuICBtb3ZlU3ViKHN1YklkKSB7XHJcbiAgICB0aGlzLm1vdmVTdWJzKFtzdWJJZF0pO1xyXG4gIH1cclxuICBtb3ZlU3VicyhzdWJzSWQgPSBbXSkge1xyXG4gICAgY29uc3Qgc3Vic2NyaWJlcyA9IFtdO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzdWJzSWQubWFwKGlkID0+IHtcclxuICAgICAgY29uc3QgcyA9IHNlbGYuc3Vic2NyaWJlc1tpZF07XHJcbiAgICAgIGlmKHMpIHN1YnNjcmliZXMucHVzaChzKTtcclxuICAgIH0pO1xyXG4gICAgbGV0IHNlbGVjdGVkVHlwZXNJZCA9IFtdO1xyXG4gICAgaWYoc3Vic2NyaWJlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgc2VsZWN0ZWRUeXBlc0lkID0gc3Vic2NyaWJlc1swXS5jaWQ7XHJcbiAgICB9IGVsc2UgaWYoc3Vic2NyaWJlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc3Vic0lkID0gc3Vic2NyaWJlcy5tYXAocyA9PiBzLl9pZCk7XHJcblxyXG4gICAgU3Vic2NyaWJlVHlwZXMub3BlbihmdW5jdGlvbih0eXBlc0lkKSB7XHJcbiAgICAgIG5rY0FQSShcIi9hY2NvdW50L3N1YnNjcmliZXNcIiwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgdHlwZTogXCJtb2RpZnlUeXBlXCIsXHJcbiAgICAgICAgdHlwZXNJZDogdHlwZXNJZCxcclxuICAgICAgICBzdWJzY3JpYmVzSWQ6IHN1YnNJZFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgU3Vic2NyaWJlVHlwZXMuY2xvc2UoKTtcclxuICAgICAgICAgIHN1YnNjcmliZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgICBzLmNpZCA9IHR5cGVzSWRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5omn6KGM5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sIHtcclxuICAgICAgc2VsZWN0ZWRUeXBlc0lkOiBzZWxlY3RlZFR5cGVzSWQsXHJcbiAgICAgIGhpZGVJbmZvOiB0cnVlLFxyXG4gICAgICBzZWxlY3RUeXBlc1doZW5TdWJzY3JpYmU6IHRydWVcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc3Vic2NyaWJlKGlkLCB0eXBlKSB7XHJcbiAgICBjb25zdCBidXR0b25zRG9tID0gJChgLmFjY291bnQtZm9sbG93ZXItYnV0dG9uc1tkYXRhLSR7dHlwZX09JyR7aWR9J11gKTtcclxuICAgIGxldCBzdWJJZCwgZnVuYztcclxuICAgIGlmKHR5cGUgPT09IFwidXNlclwiKSB7XHJcbiAgICAgIHN1YklkID0gdGhpcy5zdWJVc2Vyc0lkO1xyXG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlVXNlclByb21pc2U7XHJcbiAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJmb3J1bVwiKSB7XHJcbiAgICAgIHN1YklkID0gdGhpcy5zdWJGb3J1bXNJZDtcclxuICAgICAgZnVuYyA9IFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUZvcnVtUHJvbWlzZTtcclxuICAgIH0gZWxzZSBpZih0eXBlID09PSBcImNvbHVtblwiKSB7XHJcbiAgICAgIHN1YklkID0gdGhpcy5zdWJDb2x1bW5zSWQ7XHJcbiAgICAgIGlkID0gTnVtYmVyKGlkKTtcclxuICAgICAgZnVuYyA9IFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUNvbHVtblByb21pc2U7XHJcbiAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJ0aHJlYWRcIikge1xyXG4gICAgICBzdWJJZCA9IHRoaXMuc3ViVGhyZWFkc0lkO1xyXG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlVGhyZWFkUHJvbWlzZTtcclxuICAgIH0gZWxzZSBpZih0eXBlID09PSBcImNvbGxlY3Rpb25cIikge1xyXG4gICAgICBzdWJJZCA9IHRoaXMuY29sbGVjdGlvblRocmVhZHNJZDtcclxuICAgICAgZnVuYyA9IFN1YnNjcmliZVR5cGVzLmNvbGxlY3Rpb25UaHJlYWRQcm9taXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YiA9ICFzdWJJZC5pbmNsdWRlcyhpZCk7XHJcblxyXG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBpZighW1widXNlclwiLCBcImNvbGxlY3Rpb25cIiwgXCJ0aHJlYWRcIl0uaW5jbHVkZXModHlwZSkgfHwgIXN1Yikge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBTdWJzY3JpYmVUeXBlcy5vcGVuKChjaWQpID0+IHtcclxuICAgICAgICAgIHJlc29sdmUoY2lkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgICAgLnRoZW4oY2lkID0+IHtcclxuICAgICAgICBpZihjaWQpIHtcclxuICAgICAgICAgIHJldHVybiBmdW5jKGlkLCBzdWIsIGNpZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBmdW5jKGlkLCBzdWIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIFN1YnNjcmliZVR5cGVzLmNsb3NlKCk7XHJcbiAgICAgICAgaWYoc3ViKSB7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImNvbGxlY3Rpb25cIikge1xyXG4gICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlLbol4/miJDlip9cIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLlhbPms6jmiJDlip9cIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBidXR0b25zRG9tLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBzdWJJZC5pbmRleE9mKGlkKTtcclxuICAgICAgICAgIGlmKGluZGV4ID09PSAtMSkgc3ViSWQucHVzaChpZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaUtuiXj+W3suWPlua2iFwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOW3suWPlua2iFwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJ1dHRvbnNEb20ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHN1YklkLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgaWYoaW5kZXggIT09IC0xKSBzdWJJZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG5cclxuXHJcbiAgICAvKmlmKHN1Yikge1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5vcGVuKGZ1bmN0aW9uKGNpZCkge1xyXG4gICAgICAgIGZ1bmMoaWQsIHN1YiwgY2lkKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFN1YnNjcmliZVR5cGVzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5pS26JeP5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOaIkOWKn1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBidXR0b25zRG9tLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHN1YklkLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICBpZihpbmRleCA9PT0gLTEpIHN1YklkLnB1c2goaWQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgZnVuYyhpZCwgc3ViKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgYnV0dG9uc0RvbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaUtuiXj+W3suWPlua2iFwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOW3suWPlua2iFwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3ViSWQuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICBpZihpbmRleCAhPT0gLTEpIHN1YklkLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfSovXHJcbiAgfVxyXG4gIGVkaXRUeXBlKCkge1xyXG4gICAgU3Vic2NyaWJlVHlwZXMub3BlbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICB9LCB7XHJcbiAgICAgIGVkaXRUeXBlOiB0cnVlXHJcbiAgICB9KVxyXG4gIH1cclxufSkoKTtcclxuXHJcblxyXG53aW5kb3cucmVtb3ZlQmxhY2tsaXN0ID0gKHVpZCwgX2lkKSA9PiB7XHJcbiAgTktDLm1ldGhvZHMucmVtb3ZlVXNlckZyb21CbGFja2xpc3QodWlkKVxyXG4gICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgIGlmKCFkYXRhKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGRvbSA9ICQoYFtkYXRhLXR5cGU9XCJibGFja2xpc3RcIl1bZGF0YS1pZD1cIiR7X2lkfVwiXWApO1xyXG4gICAgICBpZihkb20gJiYgZG9tLmxlbmd0aCkgZG9tLnJlbW92ZSgpO1xyXG4gICAgfSlcclxufVxyXG5cclxuaWYoTktDLmNvbmZpZ3MuaXNBcHApIHtcclxuICB3aW5kb3cucmVhZHkoKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIG5ld0V2ZW50KFwidXNlckNoYW5nZWRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGlmKCFkYXRhLnVzZXIpIHJldHVybjtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC91XFwvKFswLTldK1xcLykvaWcsIFwiL3UvXCIgKyBkYXRhLnVzZXIudWlkICsgXCIvXCIpO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbn1cclxuIl19
