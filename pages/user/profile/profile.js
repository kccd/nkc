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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3VzZXIvcHJvZmlsZS9wcm9maWxlLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsTUFBTSxDQUFDLEtBQVAsR0FBZTtBQUFBO0FBQUE7QUFDYixvQkFBYztBQUFBO0FBRWI7O0FBSFk7QUFBQTtBQUFBLGdDQUlELEdBSkMsRUFJSTtBQUNmLE1BQUEsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFwQixHQUEwQixVQUExQixHQUF1QyxHQUF4QyxFQUE2QyxRQUE3QyxDQUFOLENBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixRQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0QsT0FISCxXQUlTLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLFFBQUEsVUFBVSxDQUFDLElBQUQsQ0FBVjtBQUNELE9BTkg7QUFPRDtBQVpZO0FBQUE7QUFBQSxzQ0FhSyxHQWJMLEVBYVU7QUFDckIsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsYUFBYSxDQUFDLG9CQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsR0FBakI7QUFDRCxPQUhILFdBSVMsWUFBVyxDQUFFLENBSnRCO0FBS0Q7QUFDRDs7OztBQXJCYTtBQUFBO0FBQUEsZ0NBd0JEO0FBQ1YsVUFBSSxJQUFJLEdBQUcsSUFBWDtBQUNBLE1BQUEsYUFBYSxDQUFDLG9CQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakI7QUFDRCxPQUhILFdBSVMsWUFBVSxDQUFFLENBSnJCO0FBS0Q7QUEvQlk7QUFBQTtBQUFBLGdDQWlDRDtBQUNWLGFBQU8sQ0FBQyxDQUFDLHVCQUFELENBQVI7QUFDRDtBQW5DWTtBQUFBO0FB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LENBQW9CLFlBQVcsQ0FFOUIsQ0FGRCxFQUVHO0FBQ0QsUUFBQSxRQUFRLEVBQUU7QUFEVCxPQUZIO0FBS0Q7QUE3Slc7O0FBQUE7QUFBQSxNQUFkOztBQWdLQSxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBZixFQUFzQjtBQUNwQixFQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixJQUFBLFFBQVEsQ0FBQyxhQUFELEVBQWdCLFVBQVMsSUFBVCxFQUFlO0FBQ3JDLFVBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxFQUFlO0FBQ2YsTUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUFoQixHQUF1QixNQUFNLENBQUMsUUFBUCxDQUFnQixRQUFoQixDQUF5QixPQUF6QixDQUFpQyxtQkFBakMsRUFBc0QsUUFBUSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQWxCLEdBQXdCLEdBQTlFLENBQXZCO0FBQ0QsS0FITyxDQUFSO0FBSUQsR0FOSDtBQU9EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmRyYWZ0ID0gbmV3IChjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICBcbiAgfVxuICByZW1vdmVEcmFmdChkaWQpIHtcbiAgICBua2NBUEkoJy91LycgKyBOS0MuY29uZmlncy51aWQgKyBcIi9kcmFmdHMvXCIgKyBkaWQsIFwiREVMRVRFXCIpXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XG4gICAgICB9KVxuICB9XG4gIHJlbW92ZURyYWZ0U2luZ2xlKGRpZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlvZPliY3ojYnnqL/vvJ/liKDpmaTlkI7kuI3lj6/mgaLlpI3jgIJcIilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnJlbW92ZURyYWZ0KGRpZCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pXG4gIH1cbiAgLypcbiAgKiDmuIXnqbrojYnnqL/nrrFcbiAgKiAqL1xuICByZW1vdmVBbGwoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHliKDpmaTlhajpg6jojYnnqL/vvJ/liKDpmaTlkI7kuI3lj6/mgaLlpI3jgIJcIilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnJlbW92ZURyYWZ0KFwiYWxsXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpe30pXG4gIH1cbiAgXG4gIGdldElucHV0cygpIHtcbiAgICByZXR1cm4gJChcIi5kcmFmdC1jaGVja2JveCBpbnB1dFwiKTtcbiAgfVxuICBcbiAgZ2V0U2VsZWN0ZWREcmFmdHNJZCgpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgdmFyIGRvbSA9IHRoaXMuZ2V0SW5wdXRzKCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGRvbS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGQgPSBkb20uZXEoaSk7XG4gICAgICBpZihkLnByb3AoXCJjaGVja2VkXCIpKSB7XG4gICAgICAgIGFyci5wdXNoKGQuYXR0cihcImRhdGEtZGlkXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBcbiAgc2VsZWN0QWxsKCkge1xuICAgIHZhciBzZWxlY3RlZERyYWZ0c0lkID0gdGhpcy5nZXRTZWxlY3RlZERyYWZ0c0lkKCk7XG4gICAgdmFyIGRvbSA9IHRoaXMuZ2V0SW5wdXRzKCk7XG4gICAgaWYoc2VsZWN0ZWREcmFmdHNJZC5sZW5ndGggIT09IGRvbS5sZW5ndGgpIHtcbiAgICAgIGRvbS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9tLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKTtcbiAgICB9XG4gIH1cbiAgXG4gIHJlbW92ZVNlbGVjdGVkRHJhZnRzKCkge1xuICAgIHZhciBzZWxlY3RlZERyYWZ0c0lkID0gdGhpcy5nZXRTZWxlY3RlZERyYWZ0c0lkKCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzOyAgICBpZighc2VsZWN0ZWREcmFmdHNJZC5sZW5ndGgpIHJldHVybjtcbiAgICB2YXIgZGlkID0gc2VsZWN0ZWREcmFmdHNJZC5qb2luKFwiLVwiKTtcbiAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Yig6Zmk5bey5Yu+6YCJ55qE6I2J56i/77yf5Yig6Zmk5ZCO5LiN5Y+v5oGi5aSN44CCXCIpXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5yZW1vdmVEcmFmdChkaWQpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpIHt9KVxuICB9XG59KSgpO1xuY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwic3ViVXNlcnNJZFwiKTtcbmlmKCF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcbiAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XG59XG53aW5kb3cudXNlciA9IG5ldyAoY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN1YlVzZXJzSWQgPSBkYXRhLnN1YlVzZXJzSWQ7XG4gICAgdGhpcy5zdWJGb3J1bXNJZCA9IGRhdGEuc3ViRm9ydW1zSWQ7XG4gICAgdGhpcy5zdWJDb2x1bW5zSWQgPSBkYXRhLnN1YkNvbHVtbnNJZDtcbiAgICB0aGlzLnN1YlRocmVhZHNJZCA9IGRhdGEuc3ViVGhyZWFkc0lkO1xuICAgIHRoaXMuY29sbGVjdGlvblRocmVhZHNJZCA9IGRhdGEuY29sbGVjdGlvblRocmVhZHNJZDtcbiAgICB0aGlzLnN1YnNjcmliZXMgPSBkYXRhLnN1YnNjcmliZXM7XG4gIH1cbiAgbW92ZVN1YihzdWJJZCkge1xuICAgIHRoaXMubW92ZVN1YnMoW3N1YklkXSk7XG4gIH1cbiAgbW92ZVN1YnMoc3Vic0lkID0gW10pIHtcbiAgICBjb25zdCBzdWJzY3JpYmVzID0gW107XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc3Vic0lkLm1hcChpZCA9PiB7XG4gICAgICBjb25zdCBzID0gc2VsZi5zdWJzY3JpYmVzW2lkXTtcbiAgICAgIGlmKHMpIHN1YnNjcmliZXMucHVzaChzKTtcbiAgICB9KTtcbiAgICBsZXQgc2VsZWN0ZWRUeXBlc0lkID0gW107XG4gICAgaWYoc3Vic2NyaWJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHNlbGVjdGVkVHlwZXNJZCA9IHN1YnNjcmliZXNbMF0uY2lkO1xuICAgIH0gZWxzZSBpZihzdWJzY3JpYmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdWJzSWQgPSBzdWJzY3JpYmVzLm1hcChzID0+IHMuX2lkKTtcbiAgICBcbiAgICBTdWJzY3JpYmVUeXBlcy5vcGVuKGZ1bmN0aW9uKHR5cGVzSWQpIHtcbiAgICAgIG5rY0FQSShcIi9hY2NvdW50L3N1YnNjcmliZXNcIiwgXCJQQVRDSFwiLCB7XG4gICAgICAgIHR5cGU6IFwibW9kaWZ5VHlwZVwiLFxuICAgICAgICB0eXBlc0lkOiB0eXBlc0lkLFxuICAgICAgICBzdWJzY3JpYmVzSWQ6IHN1YnNJZFxuICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgU3Vic2NyaWJlVHlwZXMuY2xvc2UoKTtcbiAgICAgICAgICBzdWJzY3JpYmVzLm1hcChzID0+IHtcbiAgICAgICAgICAgIHMuY2lkID0gdHlwZXNJZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xuICAgICAgICB9KVxuICAgIH0sIHtcbiAgICAgIHNlbGVjdGVkVHlwZXNJZDogc2VsZWN0ZWRUeXBlc0lkLFxuICAgICAgaGlkZUluZm86IHRydWUsXG4gICAgICBzZWxlY3RUeXBlc1doZW5TdWJzY3JpYmU6IHRydWVcbiAgICB9KTtcbiAgfVxuICBcbiAgc3Vic2NyaWJlKGlkLCB0eXBlKSB7XG4gICAgY29uc3QgYnV0dG9uc0RvbSA9ICQoYC5hY2NvdW50LWZvbGxvd2VyLWJ1dHRvbnNbZGF0YS0ke3R5cGV9PScke2lkfSddYCk7XG4gICAgbGV0IHN1YklkLCBmdW5jO1xuICAgIGlmKHR5cGUgPT09IFwidXNlclwiKSB7XG4gICAgICBzdWJJZCA9IHRoaXMuc3ViVXNlcnNJZDtcbiAgICAgIGZ1bmMgPSBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVVc2VyUHJvbWlzZTtcbiAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJmb3J1bVwiKSB7XG4gICAgICBzdWJJZCA9IHRoaXMuc3ViRm9ydW1zSWQ7XG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlRm9ydW1Qcm9taXNlO1xuICAgIH0gZWxzZSBpZih0eXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgICBzdWJJZCA9IHRoaXMuc3ViQ29sdW1uc0lkO1xuICAgICAgaWQgPSBOdW1iZXIoaWQpO1xuICAgICAgZnVuYyA9IFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUNvbHVtblByb21pc2U7XG4gICAgfSBlbHNlIGlmKHR5cGUgPT09IFwidGhyZWFkXCIpIHtcbiAgICAgIHN1YklkID0gdGhpcy5zdWJUaHJlYWRzSWQ7XG4gICAgICBmdW5jID0gU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlVGhyZWFkUHJvbWlzZTtcbiAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJjb2xsZWN0aW9uXCIpIHtcbiAgICAgIHN1YklkID0gdGhpcy5jb2xsZWN0aW9uVGhyZWFkc0lkO1xuICAgICAgZnVuYyA9IFN1YnNjcmliZVR5cGVzLmNvbGxlY3Rpb25UaHJlYWRQcm9taXNlO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBzdWIgPSAhc3ViSWQuaW5jbHVkZXMoaWQpO1xuICAgIFxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmKCFbXCJ1c2VyXCIsIFwiY29sbGVjdGlvblwiLCBcInRocmVhZFwiXS5pbmNsdWRlcyh0eXBlKSB8fCAhc3ViKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFN1YnNjcmliZVR5cGVzLm9wZW4oKGNpZCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoY2lkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgICAgIC50aGVuKGNpZCA9PiB7XG4gICAgICAgIGlmKGNpZCkge1xuICAgICAgICAgIHJldHVybiBmdW5jKGlkLCBzdWIsIGNpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmMoaWQsIHN1Yik7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIFN1YnNjcmliZVR5cGVzLmNsb3NlKCk7XG4gICAgICAgIGlmKHN1Yikge1xuICAgICAgICAgIGlmKHR5cGUgPT09IFwiY29sbGVjdGlvblwiKSB7XG4gICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlLbol4/miJDlip9cIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWFs+azqOaIkOWKn1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnV0dG9uc0RvbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHN1YklkLmluZGV4T2YoaWQpO1xuICAgICAgICAgIGlmKGluZGV4ID09PSAtMSkgc3ViSWQucHVzaChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJjb2xsZWN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaUtuiXj+W3suWPlua2iFwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5YWz5rOo5bey5Y+W5raIXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBidXR0b25zRG9tLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3ViSWQuaW5kZXhPZihpZCk7XG4gICAgICAgICAgaWYoaW5kZXggIT09IC0xKSBzdWJJZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xuICAgIFxuICAgIFxuICAgIC8qaWYoc3ViKSB7XG4gICAgICBTdWJzY3JpYmVUeXBlcy5vcGVuKGZ1bmN0aW9uKGNpZCkge1xuICAgICAgICBmdW5jKGlkLCBzdWIsIGNpZClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFN1YnNjcmliZVR5cGVzLmNsb3NlKCk7XG4gICAgICAgICAgICBpZih0eXBlID09PSBcImNvbGxlY3Rpb25cIikge1xuICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlLbol4/miJDlip9cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLlhbPms6jmiJDlip9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidXR0b25zRG9tLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzdWJJZC5pbmRleE9mKGlkKTtcbiAgICAgICAgICAgIGlmKGluZGV4ID09PSAtMSkgc3ViSWQucHVzaChpZCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcbiAgICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgXG4gICAgICBmdW5jKGlkLCBzdWIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGJ1dHRvbnNEb20ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJjb2xsZWN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaUtuiXj+W3suWPlua2iFwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5YWz5rOo5bey5Y+W5raIXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBpbmRleCA9IHN1YklkLmluZGV4T2YoaWQpO1xuICAgICAgICAgIGlmKGluZGV4ICE9PSAtMSkgc3ViSWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xuICAgICAgICB9KVxuICAgIH0qL1xuICB9XG4gIGVkaXRUeXBlKCkge1xuICAgIFN1YnNjcmliZVR5cGVzLm9wZW4oZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgfSwge1xuICAgICAgZWRpdFR5cGU6IHRydWVcbiAgICB9KVxuICB9XG59KSgpO1xuXG5pZihOS0MuY29uZmlncy5pc0FwcCkge1xuICB3aW5kb3cucmVhZHkoKVxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgbmV3RXZlbnQoXCJ1c2VyQ2hhbmdlZFwiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmKCFkYXRhLnVzZXIpIHJldHVybjtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvdVxcLyhbMC05XStcXC8pL2lnLCBcIi91L1wiICsgZGF0YS51c2VyLnVpZCArIFwiL1wiKTtcbiAgICAgIH0pO1xuICAgIH0pXG59Il19
