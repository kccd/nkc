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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zdGlja2Vycy91cGxvYWQvdXBsb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0FBQ0EsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLEdBQUosQ0FBUTtBQUNuQixFQUFBLEVBQUUsRUFBRSxNQURlO0FBRW5CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUUsVUFERjtBQUNjO0FBQ2xCLElBQUEsSUFBSSxFQUFFLEVBRkY7QUFHSixJQUFBLFdBQVcsRUFBRSxFQUhUO0FBSUosSUFBQSxLQUFLLEVBQUUsRUFKSDtBQUtKLElBQUEsU0FBUyxFQUFFLEVBTFA7QUFNSixJQUFBLEtBQUssRUFBRSxLQU5IO0FBT0osSUFBQSxRQUFRLEVBQUUsRUFQTjtBQVFKLElBQUEsS0FBSyxFQUFFLEVBUkg7QUFTSixJQUFBLFNBQVMsRUFBRTtBQVRQLEdBRmE7QUFhbkIsRUFBQSxRQUFRLEVBQUU7QUFDUixJQUFBLGFBRFEsMkJBQ1E7QUFDZCxVQUFJLE9BQU8sR0FBRyxJQUFkOztBQURjLGlEQUVDLEtBQUssUUFGTjtBQUFBOztBQUFBO0FBRWQsNERBQThCO0FBQUEsY0FBcEIsQ0FBb0I7QUFDNUIsY0FBRyxDQUFDLENBQUMsTUFBRixLQUFhLFVBQWhCLEVBQTRCLE9BQU8sR0FBRyxLQUFWO0FBQzdCO0FBSmE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLZCxhQUFPLE9BQVA7QUFDRDtBQVBPLEdBYlM7QUFzQm5CLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxPQURkO0FBRVAsSUFBQSxlQUZPLDZCQUVXO0FBQ2hCLE1BQUEsQ0FBQyxDQUFDLGNBQUQsQ0FBRCxDQUFrQixLQUFsQjtBQUNE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TTtBQXFGUCxJQUFBLE1BckZPLG9CQXFGRTtBQUNQLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFETyxVQUVGLFFBRkUsR0FFVSxJQUZWLENBRUYsUUFGRTtBQUdQLE1BQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFULENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLE1BQUYsS0FBYSxVQUFqQjtBQUFBLE9BQWpCLENBQVg7QUFDQSxXQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLENBQXRCO0FBQ0Q7QUExRk07QUF0QlUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgU2VsZWN0SW1hZ2UgPSBuZXcgTktDLm1ldGhvZHMuc2VsZWN0SW1hZ2UoKTtcbndpbmRvdy5hcHAgPSBuZXcgVnVlKHtcbiAgZWw6IFwiI2FwcFwiLFxuICBkYXRhOiB7XG4gICAgdHlwZTogXCJtdWx0aXBsZVwiLCAvLyBtdWx0aXBsZeOAgXNpbmdsZVxuICAgIG5hbWU6IFwiXCIsXG4gICAgZGVzY3JpcHRpb246IFwiXCIsXG4gICAgY292ZXI6IFwiXCIsXG4gICAgY292ZXJEYXRhOiBcIlwiLFxuICAgIHNoYXJlOiBmYWxzZSxcbiAgICBzdGlja2VyczogW10sXG4gICAgZXJyb3I6IFwiXCIsXG4gICAgdXBsb2FkaW5nOiBmYWxzZVxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIGRpc2FibGVCdXR0b24oKSB7XG4gICAgICBsZXQgZGlzYWJsZSA9IHRydWU7XG4gICAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnN0aWNrZXJzKSB7XG4gICAgICAgIGlmKHMuc3RhdHVzICE9PSBcInVwbG9hZGVkXCIpIGRpc2FibGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXNhYmxlO1xuICAgIH0sXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRTaXplOiBOS0MubWV0aG9kcy5nZXRTaXplLFxuICAgIHNlbGVjdExvY2FsRmlsZSgpIHtcbiAgICAgICQoXCIjdXBsb2FkSW5wdXRcIikuY2xpY2soKTtcbiAgICB9LFxuICAgIHNlbGVjdGVkTG9jYWxGaWxlKCkge1xuICAgICAgY29uc3QgaW5wdXQgPSAkKFwiI3VwbG9hZElucHV0XCIpWzBdO1xuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcbiAgICAgIGZvcihsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICB0aGlzLmFkZFN0aWNrZXIoZmlsZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRTdGlja2VyKGZpbGUpe1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLmdldFN0aWNrZXJCeUZpbGUoZmlsZSlcbiAgICAgICAgLnRoZW4ocyA9PiB7XG4gICAgICAgICAgc2VsZi5zdGlja2Vycy5wdXNoKHMpO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgZ2V0U3RpY2tlckJ5RmlsZShmaWxlLCBmaWxlbmFtZSkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja2VyID0ge1xuICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgZXJyb3I6IFwiXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInVuVXBsb2FkZWRcIixcbiAgICAgICAgICBuYW1lOiBmaWxlbmFtZSB8fCBmaWxlLm5hbWUgfHwgKERhdGUubm93KCkgKyBcIi5wbmdcIilcbiAgICAgICAgfTtcbiAgICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXG4gICAgICAgICAgLnRoZW4odXJsID0+IHtcbiAgICAgICAgICAgIHN0aWNrZXIudXJsID0gdXJsO1xuICAgICAgICAgICAgcmVzb2x2ZShzdGlja2VyKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVtb3ZlRm9ybUFycihhcnIsIGluZGV4KSB7XG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9LFxuICAgIGNyb3BJbWFnZShzdGlja2VyKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RpY2tlcnMuaW5kZXhPZihzdGlja2VyKTtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgU2VsZWN0SW1hZ2Uuc2hvdyhkYXRhID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoZGF0YSk7XG4gICAgICAgIHNlbGYuZ2V0U3RpY2tlckJ5RmlsZShmaWxlLCBzdGlja2VyLmZpbGUubmFtZSlcbiAgICAgICAgICAudGhlbihzID0+IHtcbiAgICAgICAgICAgIFZ1ZS5zZXQoc2VsZi5zdGlja2VycywgaW5kZXgsIHMpO1xuICAgICAgICAgICAgU2VsZWN0SW1hZ2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgfSwge1xuICAgICAgICB1cmw6IHN0aWNrZXIudXJsLFxuICAgICAgICBhc3BlY3RSYXRpbzogMVxuICAgICAgfSlcbiAgICB9LFxuICAgIHVwbG9hZChhcnIsIGluZGV4KSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGlmKCFhcnIubGVuZ3RoIHx8IGluZGV4ID49IGFyci5sZW5ndGggfHwgIWFycltpbmRleF0pIHtcbiAgICAgICAgcmV0dXJuIHNlbGYudXBsb2FkaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBjb25zdCBzdGlja2VyID0gYXJyW2luZGV4XTtcbiAgICAgIHNlbGYudXBsb2FkaW5nID0gdHJ1ZTtcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBzdGlja2VyLnN0YXR1cyA9IFwidXBsb2FkaW5nXCI7XG4gICAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBzdGlja2VyLmZpbGUpO1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInR5cGVcIiwgXCJzdGlja2VyXCIpO1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVOYW1lXCIsIHN0aWNrZXIubmFtZSk7XG4gICAgICAgICAgaWYoc2VsZi5zaGFyZSkge1xuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwic2hhcmVcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZShcIi9yXCIsIFwiUE9TVFwiLCBmb3JtRGF0YSwgZnVuY3Rpb24oZSwgcHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHN0aWNrZXIucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHN0aWNrZXIuc3RhdHVzID0gXCJ1cGxvYWRlZFwiO1xuICAgICAgICAgIHNlbGYudXBsb2FkKGFyciwgaW5kZXggKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChkYXRhKSA9PiB7XG4gICAgICAgICAgc3RpY2tlci5lcnJvciA9IGRhdGEuZXJyb3IgfHwgZGF0YTtcbiAgICAgICAgICBzdGlja2VyLnN0YXR1cyA9IFwidW5VcGxvYWRlZFwiO1xuICAgICAgICAgIHNlbGYudXBsb2FkKGFyciwgaW5kZXggKyAxKTtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHN1Ym1pdCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgbGV0IHtzdGlja2Vyc30gPSBzZWxmO1xuICAgICAgc3RpY2tlcnMgPSBzdGlja2Vycy5maWx0ZXIocyA9PiBzLnN0YXR1cyAhPT0gXCJ1cGxvYWRlZFwiKTtcbiAgICAgIHRoaXMudXBsb2FkKHN0aWNrZXJzLCAwKTtcbiAgICB9XG4gIH1cbn0pOyJdfQ==
