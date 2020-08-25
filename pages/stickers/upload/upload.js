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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zdGlja2Vycy91cGxvYWQvdXBsb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQWhCLEVBQXBCO0FBQ0EsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLEdBQUosQ0FBUTtBQUNuQixFQUFBLEVBQUUsRUFBRSxNQURlO0FBRW5CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUUsVUFERjtBQUNjO0FBQ2xCLElBQUEsSUFBSSxFQUFFLEVBRkY7QUFHSixJQUFBLFdBQVcsRUFBRSxFQUhUO0FBSUosSUFBQSxLQUFLLEVBQUUsRUFKSDtBQUtKLElBQUEsU0FBUyxFQUFFLEVBTFA7QUFNSixJQUFBLEtBQUssRUFBRSxLQU5IO0FBT0osSUFBQSxRQUFRLEVBQUUsRUFQTjtBQVFKLElBQUEsS0FBSyxFQUFFLEVBUkg7QUFTSixJQUFBLFNBQVMsRUFBRTtBQVRQLEdBRmE7QUFhbkIsRUFBQSxRQUFRLEVBQUU7QUFDUixJQUFBLGFBRFEsMkJBQ1E7QUFDZCxVQUFJLE9BQU8sR0FBRyxJQUFkOztBQURjLGlEQUVDLEtBQUssUUFGTjtBQUFBOztBQUFBO0FBRWQsNERBQThCO0FBQUEsY0FBcEIsQ0FBb0I7QUFDNUIsY0FBRyxDQUFDLENBQUMsTUFBRixLQUFhLFVBQWhCLEVBQTRCLE9BQU8sR0FBRyxLQUFWO0FBQzdCO0FBSmE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLZCxhQUFPLE9BQVA7QUFDRDtBQVBPLEdBYlM7QUFzQm5CLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxPQURkO0FBRVAsSUFBQSxlQUZPLDZCQUVXO0FBQ2hCLE1BQUEsQ0FBQyxDQUFDLGNBQUQsQ0FBRCxDQUFrQixLQUFsQjtBQUNE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TTtBQXFGUCxJQUFBLE1BckZPLG9CQXFGRTtBQUNQLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFETyxVQUVGLFFBRkUsR0FFVSxJQUZWLENBRUYsUUFGRTtBQUdQLE1BQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFULENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLE1BQUYsS0FBYSxVQUFqQjtBQUFBLE9BQWpCLENBQVg7QUFDQSxXQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLENBQXRCO0FBQ0Q7QUExRk07QUF0QlUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgU2VsZWN0SW1hZ2UgPSBuZXcgTktDLm1ldGhvZHMuc2VsZWN0SW1hZ2UoKTtcclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICB0eXBlOiBcIm11bHRpcGxlXCIsIC8vIG11bHRpcGxl44CBc2luZ2xlXHJcbiAgICBuYW1lOiBcIlwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiXCIsXHJcbiAgICBjb3ZlcjogXCJcIixcclxuICAgIGNvdmVyRGF0YTogXCJcIixcclxuICAgIHNoYXJlOiBmYWxzZSxcclxuICAgIHN0aWNrZXJzOiBbXSxcclxuICAgIGVycm9yOiBcIlwiLFxyXG4gICAgdXBsb2FkaW5nOiBmYWxzZVxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIGRpc2FibGVCdXR0b24oKSB7XHJcbiAgICAgIGxldCBkaXNhYmxlID0gdHJ1ZTtcclxuICAgICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zdGlja2Vycykge1xyXG4gICAgICAgIGlmKHMuc3RhdHVzICE9PSBcInVwbG9hZGVkXCIpIGRpc2FibGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZGlzYWJsZTtcclxuICAgIH0sXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRTaXplOiBOS0MubWV0aG9kcy5nZXRTaXplLFxyXG4gICAgc2VsZWN0TG9jYWxGaWxlKCkge1xyXG4gICAgICAkKFwiI3VwbG9hZElucHV0XCIpLmNsaWNrKCk7XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0ZWRMb2NhbEZpbGUoKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gJChcIiN1cGxvYWRJbnB1dFwiKVswXTtcclxuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcclxuICAgICAgZm9yKGxldCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgdGhpcy5hZGRTdGlja2VyKGZpbGUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWRkU3RpY2tlcihmaWxlKXtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuZ2V0U3RpY2tlckJ5RmlsZShmaWxlKVxyXG4gICAgICAgIC50aGVuKHMgPT4ge1xyXG4gICAgICAgICAgc2VsZi5zdGlja2Vycy5wdXNoKHMpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZ2V0U3RpY2tlckJ5RmlsZShmaWxlLCBmaWxlbmFtZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCBzdGlja2VyID0ge1xyXG4gICAgICAgICAgZmlsZSxcclxuICAgICAgICAgIHByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgZXJyb3I6IFwiXCIsXHJcbiAgICAgICAgICBzdGF0dXM6IFwidW5VcGxvYWRlZFwiLFxyXG4gICAgICAgICAgbmFtZTogZmlsZW5hbWUgfHwgZmlsZS5uYW1lIHx8IChEYXRlLm5vdygpICsgXCIucG5nXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKHVybCA9PiB7XHJcbiAgICAgICAgICAgIHN0aWNrZXIudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXNvbHZlKHN0aWNrZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZUZvcm1BcnIoYXJyLCBpbmRleCkge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBjcm9wSW1hZ2Uoc3RpY2tlcikge1xyXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RpY2tlcnMuaW5kZXhPZihzdGlja2VyKTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFNlbGVjdEltYWdlLnNob3coZGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoZGF0YSk7XHJcbiAgICAgICAgc2VsZi5nZXRTdGlja2VyQnlGaWxlKGZpbGUsIHN0aWNrZXIuZmlsZS5uYW1lKVxyXG4gICAgICAgICAgLnRoZW4ocyA9PiB7XHJcbiAgICAgICAgICAgIFZ1ZS5zZXQoc2VsZi5zdGlja2VycywgaW5kZXgsIHMpO1xyXG4gICAgICAgICAgICBTZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSwge1xyXG4gICAgICAgIHVybDogc3RpY2tlci51cmwsXHJcbiAgICAgICAgYXNwZWN0UmF0aW86IDFcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB1cGxvYWQoYXJyLCBpbmRleCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgaWYoIWFyci5sZW5ndGggfHwgaW5kZXggPj0gYXJyLmxlbmd0aCB8fCAhYXJyW2luZGV4XSkge1xyXG4gICAgICAgIHJldHVybiBzZWxmLnVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHN0aWNrZXIgPSBhcnJbaW5kZXhdO1xyXG4gICAgICBzZWxmLnVwbG9hZGluZyA9IHRydWU7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVwbG9hZGluZ1wiO1xyXG4gICAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIHN0aWNrZXIuZmlsZSk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJ0eXBlXCIsIFwic3RpY2tlclwiKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVOYW1lXCIsIHN0aWNrZXIubmFtZSk7XHJcbiAgICAgICAgICBpZihzZWxmLnNoYXJlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInNoYXJlXCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKFwiL3JcIiwgXCJQT1NUXCIsIGZvcm1EYXRhLCBmdW5jdGlvbihlLCBwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBzdGlja2VyLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN0aWNrZXIuc3RhdHVzID0gXCJ1cGxvYWRlZFwiO1xyXG4gICAgICAgICAgc2VsZi51cGxvYWQoYXJyLCBpbmRleCArIDEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBzdGlja2VyLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVuVXBsb2FkZWRcIjtcclxuICAgICAgICAgIHNlbGYudXBsb2FkKGFyciwgaW5kZXggKyAxKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGxldCB7c3RpY2tlcnN9ID0gc2VsZjtcclxuICAgICAgc3RpY2tlcnMgPSBzdGlja2Vycy5maWx0ZXIocyA9PiBzLnN0YXR1cyAhPT0gXCJ1cGxvYWRlZFwiKTtcclxuICAgICAgdGhpcy51cGxvYWQoc3RpY2tlcnMsIDApO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
