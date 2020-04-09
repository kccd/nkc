(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

window.draft = new (
/*#__PURE__*/
function () {
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

window.user = new (
/*#__PURE__*/
function () {
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

if (NKC.configs.isApp) {
  window.ready().then(function () {
    newEvent("userChanged", function (data) {
      if (!data.user) return;
      window.location.href = window.location.pathname.replace(/\/u\/([0-9]+\/)/ig, "/u/" + data.user.uid + "/");
    });
  });
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3VzZXIvcHJvZmlsZS9wcm9maWxlLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsTUFBTSxDQUFDLEtBQVAsR0FBZTtBQUFBO0FBQUE7QUFDYixvQkFBYztBQUFBO0FBRWI7O0FBSFk7QUFBQTtBQUFBLGdDQUlELEdBSkMsRUFJSTtBQUNmLE1BQUEsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFwQixHQUEwQixVQUExQixHQUF1QyxHQUF4QyxFQUE2QyxRQUE3QyxDQUFOLENBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixRQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0QsT0FISCxXQUlTLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLFFBQUEsVUFBVSxDQUFDLElBQUQsQ0FBVjtBQUNELE9BTkg7QUFPRDtBQVpZO0FBQUE7QUFBQSxzQ0FhSyxHQWJMLEVBYVU7QUFDckIsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsYUFBYSxDQUFDLG9CQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsR0FBakI7QUFDRCxPQUhILFdBSVMsWUFBVyxDQUFFLENBSnRCO0FBS0Q7QUFDRDs7OztBQXJCYTtBQUFBO0FBQUEsZ0NBd0JEO0FBQ1YsVUFBSSxJQUFJLEdBQUcsSUFBWDtBQUNBLE1BQUEsYUFBYSxDQUFDLG9CQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakI7QUFDRCxPQUhILFdBSVMsWUFBVSxDQUFFLENBSnJCO0FBS0Q7QUEvQlk7QUFBQTtBQUFBLGdDQWlDRDtBQUNWLGFBQU8sQ0FBQyxDQUFDLHVCQUFELENBQVI7QUFDRDtBQW5DWTtBQUFBO0FB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LENBQW9CLFlBQVcsQ0FFOUIsQ0FGRCxFQUVHO0FBQ0QsUUFBQSxRQUFRLEVBQUU7QUFEVCxPQUZIO0FBS0Q7QUE3Slc7O0FBQUE7QUFBQSxNQUFkOztBQWdLQSxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBZixFQUFzQjtBQUNwQixFQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixJQUFBLFFBQVEsQ0FBQyxhQUFELEVBQWdCLFVBQVMsSUFBVCxFQUFlO0FBQ3JDLFVBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ2YsTUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQixHQUF1QixNQUFNLENBQUMsUUFBUCxDQUFnQixRQUFoQixDQUF5QixPQUF6QixDQUFpQyxtQkFBakMsRUFBc0QsUUFBUSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQWxCLEdBQXdCLEdBQTlFLENBQXZCO0FBQ0QsS0FITyxDQUFSO0FBSUQsR0FOSDtBQU9EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmRyYWZ0ID0gbmV3IChjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgXHJcbiAgfVxyXG4gIHJlbW92ZURyYWZ0KGRpZCkge1xyXG4gICAgbmtjQVBJKCcvdS8nICsgTktDLmNvbmZpZ3MudWlkICsgXCIvZHJhZnRzL1wiICsgZGlkLCBcIkRFTEVURVwiKVxyXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgfSlcclxuICB9XHJcbiAgcmVtb3ZlRHJhZnRTaW5nbGUoZGlkKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlvZPliY3ojYnnqL/vvJ/liKDpmaTlkI7kuI3lj6/mgaLlpI3jgIJcIilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi5yZW1vdmVEcmFmdChkaWQpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSlcclxuICB9XHJcbiAgLypcclxuICAqIOa4heepuuiNieeov+eusVxyXG4gICogKi9cclxuICByZW1vdmVBbGwoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Yig6Zmk5YWo6YOo6I2J56i/77yf5Yig6Zmk5ZCO5LiN5Y+v5oGi5aSN44CCXCIpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlRHJhZnQoXCJhbGxcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpe30pXHJcbiAgfVxyXG4gIFxyXG4gIGdldElucHV0cygpIHtcclxuICAgIHJldHVybiAkKFwiLmRyYWZ0LWNoZWNrYm94IGlucHV0XCIpO1xyXG4gIH1cclxuICBcclxuICBnZXRTZWxlY3RlZERyYWZ0c0lkKCkge1xyXG4gICAgdmFyIGFyciA9IFtdO1xyXG4gICAgdmFyIGRvbSA9IHRoaXMuZ2V0SW5wdXRzKCk7XHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBkID0gZG9tLmVxKGkpO1xyXG4gICAgICBpZihkLnByb3AoXCJjaGVja2VkXCIpKSB7XHJcbiAgICAgICAgYXJyLnB1c2goZC5hdHRyKFwiZGF0YS1kaWRcIikpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyO1xyXG4gIH1cclxuICBcclxuICBzZWxlY3RBbGwoKSB7XHJcbiAgICB2YXIgc2VsZWN0ZWREcmFmdHNJZCA9IHRoaXMuZ2V0U2VsZWN0ZWREcmFmdHNJZCgpO1xyXG4gICAgdmFyIGRvbSA9IHRoaXMuZ2V0SW5wdXRzKCk7XHJcbiAgICBpZihzZWxlY3RlZERyYWZ0c0lkLmxlbmd0aCAhPT0gZG9tLmxlbmd0aCkge1xyXG4gICAgICBkb20ucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkb20ucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICByZW1vdmVTZWxlY3RlZERyYWZ0cygpIHtcclxuICAgIHZhciBzZWxlY3RlZERyYWZ0c0lkID0gdGhpcy5nZXRTZWxlY3RlZERyYWZ0c0lkKCk7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7ICAgIGlmKCFzZWxlY3RlZERyYWZ0c0lkLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgdmFyIGRpZCA9IHNlbGVjdGVkRHJhZnRzSWQuam9pbihcIi1cIik7XHJcbiAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Yig6Zmk5bey5Yu+6YCJ55qE6I2J56i/77yf5Yig6Zmk5ZCO5LiN5Y+v5oGi5aSN44CCXCIpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlRHJhZnQoZGlkKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pXHJcbiAgfVxyXG59KSgpO1xyXG5jb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJzdWJVc2Vyc0lkXCIpO1xyXG5pZighd2luZG93LlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbn1cclxud2luZG93LnVzZXIgPSBuZXcgKGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuc3ViVXNlcnNJZCA9IGRhdGEuc3ViVXNlcnNJZDtcclxuICAgIHRoaXMuc3ViRm9ydW1zSWQgPSBkYXRhLnN1YkZvcnVtc0lkO1xyXG4gICAgdGhpcy5zdWJDb2x1bW5zSWQgPSBkYXRhLnN1YkNvbHVtbnNJZDtcclxuICAgIHRoaXMuc3ViVGhyZWFkc0lkID0gZGF0YS5zdWJUaHJlYWRzSWQ7XHJcbiAgICB0aGlzLmNvbGxlY3Rpb25UaHJlYWRzSWQgPSBkYXRhLmNvbGxlY3Rpb25UaHJlYWRzSWQ7XHJcbiAgICB0aGlzLnN1YnNjcmliZXMgPSBkYXRhLnN1YnNjcmliZXM7XHJcbiAgfVxyXG4gIG1vdmVTdWIoc3ViSWQpIHtcclxuICAgIHRoaXMubW92ZVN1YnMoW3N1YklkXSk7XHJcbiAgfVxyXG4gIG1vdmVTdWJzKHN1YnNJZCA9IFtdKSB7XHJcbiAgICBjb25zdCBzdWJzY3JpYmVzID0gW107XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHN1YnNJZC5tYXAoaWQgPT4ge1xyXG4gICAgICBjb25zdCBzID0gc2VsZi5zdWJzY3JpYmVzW2lkXTtcclxuICAgICAgaWYocykgc3Vic2NyaWJlcy5wdXNoKHMpO1xyXG4gICAgfSk7XHJcbiAgICBsZXQgc2VsZWN0ZWRUeXBlc0lkID0gW107XHJcbiAgICBpZihzdWJzY3JpYmVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICBzZWxlY3RlZFR5cGVzSWQgPSBzdWJzY3JpYmVzWzBdLmNpZDtcclxuICAgIH0gZWxzZSBpZihzdWJzY3JpYmVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzdWJzSWQgPSBzdWJzY3JpYmVzLm1hcChzID0+IHMuX2lkKTtcclxuICAgIFxyXG4gICAgU3Vic2NyaWJlVHlwZXMub3BlbihmdW5jdGlvbih0eXBlc0lkKSB7XHJcbiAgICAgIG5rY0FQSShcIi9hY2NvdW50L3N1YnNjcmliZXNcIiwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgdHlwZTogXCJtb2RpZnlUeXBlXCIsXHJcbiAgICAgICAgdHlwZXNJZDogdHlwZXNJZCxcclxuICAgICAgICBzdWJzY3JpYmVzSWQ6IHN1YnNJZFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgU3Vic2NyaWJlVHlwZXMuY2xvc2UoKTtcclxuICAgICAgICAgIHN1YnNjcmliZXMubWFwKHMgPT4ge1xyXG4gICAgICAgICAgICBzLmNpZCA9IHR5cGVzSWRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5omn6KGM5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sIHtcclxuICAgICAgc2VsZWN0ZWRUeXBlc0lkOiBzZWxlY3RlZFR5cGVzSWQsXHJcbiAgICAgIGhpZGVJbmZvOiB0cnVlLFxyXG4gICAgICBzZWxlY3RUeXBlc1doZW5TdWJzY3JpYmU6IHRydWVcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBzdWJzY3JpYmUoaWQsIHR5cGUpIHtcclxuICAgIGNvbnN0IGJ1dHRvbnNEb20gPSAkKGAuYWNjb3VudC1mb2xsb3dlci1idXR0b25zW2RhdGEtJHt0eXBlfT0nJHtpZH0nXWApO1xyXG4gICAgbGV0IHN1YklkLCBmdW5jO1xyXG4gICAgaWYodHlwZSA9PT0gXCJ1c2VyXCIpIHtcclxuICAgICAgc3ViSWQgPSB0aGlzLnN1YlVzZXJzSWQ7XHJcbiAgICAgIGZ1bmMgPSBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVVc2VyUHJvbWlzZTtcclxuICAgIH0gZWxzZSBpZih0eXBlID09PSBcImZvcnVtXCIpIHtcclxuICAgICAgc3ViSWQgPSB0aGlzLnN1YkZvcnVtc0lkO1xyXG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlRm9ydW1Qcm9taXNlO1xyXG4gICAgfSBlbHNlIGlmKHR5cGUgPT09IFwiY29sdW1uXCIpIHtcclxuICAgICAgc3ViSWQgPSB0aGlzLnN1YkNvbHVtbnNJZDtcclxuICAgICAgaWQgPSBOdW1iZXIoaWQpO1xyXG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlQ29sdW1uUHJvbWlzZTtcclxuICAgIH0gZWxzZSBpZih0eXBlID09PSBcInRocmVhZFwiKSB7XHJcbiAgICAgIHN1YklkID0gdGhpcy5zdWJUaHJlYWRzSWQ7XHJcbiAgICAgIGZ1bmMgPSBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVUaHJlYWRQcm9taXNlO1xyXG4gICAgfSBlbHNlIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgIHN1YklkID0gdGhpcy5jb2xsZWN0aW9uVGhyZWFkc0lkO1xyXG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuY29sbGVjdGlvblRocmVhZFByb21pc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnN0IHN1YiA9ICFzdWJJZC5pbmNsdWRlcyhpZCk7XHJcbiAgICBcclxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgaWYoIVtcInVzZXJcIiwgXCJjb2xsZWN0aW9uXCIsIFwidGhyZWFkXCJdLmluY2x1ZGVzKHR5cGUpIHx8ICFzdWIpIHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgU3Vic2NyaWJlVHlwZXMub3BlbigoY2lkKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKGNpZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAgIC50aGVuKGNpZCA9PiB7XHJcbiAgICAgICAgaWYoY2lkKSB7XHJcbiAgICAgICAgICByZXR1cm4gZnVuYyhpZCwgc3ViLCBjaWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gZnVuYyhpZCwgc3ViKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBTdWJzY3JpYmVUeXBlcy5jbG9zZSgpO1xyXG4gICAgICAgIGlmKHN1Yikge1xyXG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJjb2xsZWN0aW9uXCIpIHtcclxuICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5pS26JeP5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5YWz5rOo5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnV0dG9uc0RvbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3ViSWQuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICBpZihpbmRleCA9PT0gLTEpIHN1YklkLnB1c2goaWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImNvbGxlY3Rpb25cIikge1xyXG4gICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlLbol4/lt7Llj5bmtohcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLlhbPms6jlt7Llj5bmtohcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBidXR0b25zRG9tLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBzdWJJZC5pbmRleE9mKGlkKTtcclxuICAgICAgICAgIGlmKGluZGV4ICE9PSAtMSkgc3ViSWQuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvKmlmKHN1Yikge1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5vcGVuKGZ1bmN0aW9uKGNpZCkge1xyXG4gICAgICAgIGZ1bmMoaWQsIHN1YiwgY2lkKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFN1YnNjcmliZVR5cGVzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5pS26JeP5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOaIkOWKn1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBidXR0b25zRG9tLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHN1YklkLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICBpZihpbmRleCA9PT0gLTEpIHN1YklkLnB1c2goaWQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBcclxuICAgICAgZnVuYyhpZCwgc3ViKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgYnV0dG9uc0RvbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaUtuiXj+W3suWPlua2iFwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOW3suWPlua2iFwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3ViSWQuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICBpZihpbmRleCAhPT0gLTEpIHN1YklkLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfSovXHJcbiAgfVxyXG4gIGVkaXRUeXBlKCkge1xyXG4gICAgU3Vic2NyaWJlVHlwZXMub3BlbihmdW5jdGlvbigpIHtcclxuICAgIFxyXG4gICAgfSwge1xyXG4gICAgICBlZGl0VHlwZTogdHJ1ZVxyXG4gICAgfSlcclxuICB9XHJcbn0pKCk7XHJcblxyXG5pZihOS0MuY29uZmlncy5pc0FwcCkge1xyXG4gIHdpbmRvdy5yZWFkeSgpXHJcbiAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgbmV3RXZlbnQoXCJ1c2VyQ2hhbmdlZFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgaWYoIWRhdGEudXNlcikgcmV0dXJuO1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL3VcXC8oWzAtOV0rXFwvKS9pZywgXCIvdS9cIiArIGRhdGEudXNlci51aWQgKyBcIi9cIik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxufSJdfQ==
