(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var SelectImage = new NKC.methods.selectImage();
window.app = new Vue({
  el: "#app",
  data: {
    type: "multiple",
    // multiple、single
    name: "",
    description: "",
    cover: "",
    coverData: "",
    share: false,
    stickers: [],
    error: "",
    uploading: false
  },
  computed: {
    disableButton: function disableButton() {
      var disable = true;

      var _iterator = _createForOfIteratorHelper(this.stickers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          if (s.status !== "uploaded") disable = false;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return disable;
    }
  },
  methods: {
    getSize: NKC.methods.getSize,
    selectLocalFile: function selectLocalFile() {
      $("#uploadInput").click();
    },
    selectedLocalFile: function selectedLocalFile() {
      var input = $("#uploadInput")[0];
      var files = input.files;

      var _iterator2 = _createForOfIteratorHelper(files),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var file = _step2.value;
          this.addSticker(file);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    addSticker: function addSticker(file) {
      var self = this;
      this.getStickerByFile(file).then(function (s) {
        self.stickers.push(s);
      });
    },
    getStickerByFile: function getStickerByFile(file, filename) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var sticker = {
          file: file,
          progress: 0,
          error: "",
          status: "unUploaded",
          name: filename || file.name || Date.now() + ".png"
        };
        NKC.methods.fileToUrl(file).then(function (url) {
          sticker.url = url;
          resolve(sticker);
        });
      });
    },
    removeFormArr: function removeFormArr(arr, index) {
      arr.splice(index, 1);
    },
    cropImage: function cropImage(sticker) {
      var index = this.stickers.indexOf(sticker);
      var self = this;
      SelectImage.show(function (data) {
        var file = NKC.methods.blobToFile(data);
        self.getStickerByFile(file, sticker.file.name).then(function (s) {
          Vue.set(self.stickers, index, s);
          SelectImage.close();
        });
      }, {
        url: sticker.url,
        aspectRatio: 1
      });
    },
    upload: function upload(arr, index) {
      var self = this;

      if (!arr.length || index >= arr.length || !arr[index]) {
        return self.uploading = false;
      }

      var sticker = arr[index];
      self.uploading = true;
      Promise.resolve().then(function () {
        sticker.status = "uploading";
        var formData = new FormData();
        formData.append("file", sticker.file);
        formData.append("type", "sticker");
        formData.append("fileName", sticker.name);

        if (self.share) {
          formData.append("share", "true");
        }

        return nkcUploadFile("/r", "POST", formData, function (e, progress) {
          sticker.progress = progress;
        });
      }).then(function () {
        sticker.status = "uploaded";
        self.upload(arr, index + 1);
      })["catch"](function (data) {
        sticker.error = data.error || data;
        sticker.status = "unUploaded";
        self.upload(arr, index + 1);
      });
    },
    submit: function submit() {
      var self = this;
      var stickers = self.stickers;
      stickers = stickers.filter(function (s) {
        return s.status !== "uploaded";
      });
      this.upload(stickers, 0);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3VwbG9hZC91cGxvYWQubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBaEIsRUFBcEI7QUFDQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLElBQUksRUFBRSxVQURGO0FBQ2M7QUFDbEIsSUFBQSxJQUFJLEVBQUUsRUFGRjtBQUdKLElBQUEsV0FBVyxFQUFFLEVBSFQ7QUFJSixJQUFBLEtBQUssRUFBRSxFQUpIO0FBS0osSUFBQSxTQUFTLEVBQUUsRUFMUDtBQU1KLElBQUEsS0FBSyxFQUFFLEtBTkg7QUFPSixJQUFBLFFBQVEsRUFBRSxFQVBOO0FBUUosSUFBQSxLQUFLLEVBQUUsRUFSSDtBQVNKLElBQUEsU0FBUyxFQUFFO0FBVFAsR0FGYTtBQWFuQixFQUFBLFFBQVEsRUFBRTtBQUNSLElBQUEsYUFEUSwyQkFDUTtBQUNkLFVBQUksT0FBTyxHQUFHLElBQWQ7O0FBRGMsaURBRUMsS0FBSyxRQUZOO0FBQUE7O0FBQUE7QUFFZCw0REFBOEI7QUFBQSxjQUFwQixDQUFvQjtBQUM1QixjQUFHLENBQUMsQ0FBQyxNQUFGLEtBQWEsVUFBaEIsRUFBNEIsT0FBTyxHQUFHLEtBQVY7QUFDN0I7QUFKYTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtkLGFBQU8sT0FBUDtBQUNEO0FBUE8sR0FiUztBQXNCbkIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLE9BRGQ7QUFFUCxJQUFBLGVBRk8sNkJBRVc7QUFDaEIsTUFBQSxDQUFDLENBQUMsY0FBRCxD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QUNELE9BdEJIO0FBdUJELEtBcEZNO0FBcUZQLElBQUEsTUFyRk8sb0JBcUZFO0FBQ1AsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQURPLFVBRUYsUUFGRSxHQUVVLElBRlYsQ0FFRixRQUZFO0FBR1AsTUFBQSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsVUFBQSxDQUFDO0FBQUEsZUFBSSxDQUFDLENBQUMsTUFBRixLQUFhLFVBQWpCO0FBQUEsT0FBakIsQ0FBWDtBQUNBLFdBQUssTUFBTCxDQUFZLFFBQVosRUFBc0IsQ0FBdEI7QUFDRDtBQTFGTTtBQXRCVSxDQUFSLENBQWIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBTZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHR5cGU6IFwibXVsdGlwbGVcIiwgLy8gbXVsdGlwbGXjgIFzaW5nbGVcclxuICAgIG5hbWU6IFwiXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJcIixcclxuICAgIGNvdmVyOiBcIlwiLFxyXG4gICAgY292ZXJEYXRhOiBcIlwiLFxyXG4gICAgc2hhcmU6IGZhbHNlLFxyXG4gICAgc3RpY2tlcnM6IFtdLFxyXG4gICAgZXJyb3I6IFwiXCIsXHJcbiAgICB1cGxvYWRpbmc6IGZhbHNlXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgZGlzYWJsZUJ1dHRvbigpIHtcclxuICAgICAgbGV0IGRpc2FibGUgPSB0cnVlO1xyXG4gICAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnN0aWNrZXJzKSB7XHJcbiAgICAgICAgaWYocy5zdGF0dXMgIT09IFwidXBsb2FkZWRcIikgZGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBkaXNhYmxlO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFNpemU6IE5LQy5tZXRob2RzLmdldFNpemUsXHJcbiAgICBzZWxlY3RMb2NhbEZpbGUoKSB7XHJcbiAgICAgICQoXCIjdXBsb2FkSW5wdXRcIikuY2xpY2soKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RlZExvY2FsRmlsZSgpIHtcclxuICAgICAgY29uc3QgaW5wdXQgPSAkKFwiI3VwbG9hZElucHV0XCIpWzBdO1xyXG4gICAgICBjb25zdCBmaWxlcyA9IGlucHV0LmZpbGVzO1xyXG4gICAgICBmb3IobGV0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgICAgICB0aGlzLmFkZFN0aWNrZXIoZmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhZGRTdGlja2VyKGZpbGUpe1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgdGhpcy5nZXRTdGlja2VyQnlGaWxlKGZpbGUpXHJcbiAgICAgICAgLnRoZW4ocyA9PiB7XHJcbiAgICAgICAgICBzZWxmLnN0aWNrZXJzLnB1c2gocyk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBnZXRTdGlja2VyQnlGaWxlKGZpbGUsIGZpbGVuYW1lKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0aWNrZXIgPSB7XHJcbiAgICAgICAgICBmaWxlLFxyXG4gICAgICAgICAgcHJvZ3Jlc3M6IDAsXHJcbiAgICAgICAgICBlcnJvcjogXCJcIixcclxuICAgICAgICAgIHN0YXR1czogXCJ1blVwbG9hZGVkXCIsXHJcbiAgICAgICAgICBuYW1lOiBmaWxlbmFtZSB8fCBmaWxlLm5hbWUgfHwgKERhdGUubm93KCkgKyBcIi5wbmdcIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgICAgLnRoZW4odXJsID0+IHtcclxuICAgICAgICAgICAgc3RpY2tlci51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJlc29sdmUoc3RpY2tlcik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRm9ybUFycihhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIGNyb3BJbWFnZShzdGlja2VyKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zdGlja2Vycy5pbmRleE9mKHN0aWNrZXIpO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgU2VsZWN0SW1hZ2Uuc2hvdyhkYXRhID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShkYXRhKTtcclxuICAgICAgICBzZWxmLmdldFN0aWNrZXJCeUZpbGUoZmlsZSwgc3RpY2tlci5maWxlLm5hbWUpXHJcbiAgICAgICAgICAudGhlbihzID0+IHtcclxuICAgICAgICAgICAgVnVlLnNldChzZWxmLnN0aWNrZXJzLCBpbmRleCwgcyk7XHJcbiAgICAgICAgICAgIFNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdXJsOiBzdGlja2VyLnVybCxcclxuICAgICAgICBhc3BlY3RSYXRpbzogMVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHVwbG9hZChhcnIsIGluZGV4KSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBpZighYXJyLmxlbmd0aCB8fCBpbmRleCA+PSBhcnIubGVuZ3RoIHx8ICFhcnJbaW5kZXhdKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbGYudXBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgc3RpY2tlciA9IGFycltpbmRleF07XHJcbiAgICAgIHNlbGYudXBsb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzdGlja2VyLnN0YXR1cyA9IFwidXBsb2FkaW5nXCI7XHJcbiAgICAgICAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVcIiwgc3RpY2tlci5maWxlKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInR5cGVcIiwgXCJzdGlja2VyXCIpO1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZU5hbWVcIiwgc3RpY2tlci5uYW1lKTtcclxuICAgICAgICAgIGlmKHNlbGYuc2hhcmUpIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwic2hhcmVcIiwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoXCIvclwiLCBcIlBPU1RcIiwgZm9ybURhdGEsIGZ1bmN0aW9uKGUsIHByb2dyZXNzKSB7XHJcbiAgICAgICAgICAgIHN0aWNrZXIucHJvZ3Jlc3MgPSBwcm9ncmVzcztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVwbG9hZGVkXCI7XHJcbiAgICAgICAgICBzZWxmLnVwbG9hZChhcnIsIGluZGV4ICsgMSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKGRhdGEpID0+IHtcclxuICAgICAgICAgIHN0aWNrZXIuZXJyb3IgPSBkYXRhLmVycm9yIHx8IGRhdGE7XHJcbiAgICAgICAgICBzdGlja2VyLnN0YXR1cyA9IFwidW5VcGxvYWRlZFwiO1xyXG4gICAgICAgICAgc2VsZi51cGxvYWQoYXJyLCBpbmRleCArIDEpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc3VibWl0KCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgbGV0IHtzdGlja2Vyc30gPSBzZWxmO1xyXG4gICAgICBzdGlja2VycyA9IHN0aWNrZXJzLmZpbHRlcihzID0+IHMuc3RhdHVzICE9PSBcInVwbG9hZGVkXCIpO1xyXG4gICAgICB0aGlzLnVwbG9hZChzdGlja2VycywgMCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
