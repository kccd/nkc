(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
    share: true,
    stickers: [],
    error: "",
    uploading: false
  },
  computed: {
    disableButton: function disableButton() {
      var disable = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.stickers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var s = _step.value;
          if (s.status !== "uploaded") disable = false;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var file = _step2.value;
          this.addSticker(file);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3VwbG9hZC91cGxvYWQubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBaEIsRUFBcEI7QUFDQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLElBQUksRUFBRSxVQURGO0FBQ2M7QUFDbEIsSUFBQSxJQUFJLEVBQUUsRUFGRjtBQUdKLElBQUEsV0FBVyxFQUFFLEVBSFQ7QUFJSixJQUFBLEtBQUssRUFBRSxFQUpIO0FBS0osSUFBQSxTQUFTLEVBQUUsRUFMUDtBQU1KLElBQUEsS0FBSyxFQUFFLElBTkg7QUFPSixJQUFBLFFBQVEsRUFBRSxFQVBOO0FBUUosSUFBQSxLQUFLLEVBQUUsRUFSSDtBQVNKLElBQUEsU0FBUyxFQUFFO0FBVFAsR0FGYTtBQWFuQixFQUFBLFFBQVEsRUFBRTtBQUNSLElBQUEsYUFEUSwyQkFDUTtBQUNkLFVBQUksT0FBTyxHQUFHLElBQWQ7QUFEYztBQUFBO0FBQUE7O0FBQUE7QUFFZCw2QkFBZSxLQUFLLFFBQXBCLDhIQUE4QjtBQUFBLGNBQXBCLENBQW9CO0FBQzVCLGNBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBYSxVQUFoQixFQUE0QixPQUFPLEdBQUcsS0FBVjtBQUM3QjtBQUphO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS2QsYUFBTyxPQUFQO0FBQ0Q7QUFQTyxHQWJTO0FBc0JuQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksT0FEZDtBQUVQ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QUFDQSxRQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLFlBQWpCO0FBQ0EsUUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQVosRUFBaUIsS0FBSyxHQUFHLENBQXpCO0FBQ0QsT0F0Qkg7QUF1QkQsS0FwRk07QUFxRlAsSUFBQSxNQXJGTyxvQkFxRkU7QUFDUCxVQUFNLElBQUksR0FBRyxJQUFiO0FBRE8sVUFFRixRQUZFLEdBRVUsSUFGVixDQUVGLFFBRkU7QUFHUCxNQUFBLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBVCxDQUFnQixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxNQUFGLEtBQWEsVUFBakI7QUFBQSxPQUFqQixDQUFYO0FBQ0EsV0FBSyxNQUFMLENBQVksUUFBWixFQUFzQixDQUF0QjtBQUNEO0FBMUZNO0FBdEJVLENBQVIsQ0FBYiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IFNlbGVjdEltYWdlID0gbmV3IE5LQy5tZXRob2RzLnNlbGVjdEltYWdlKCk7XHJcbndpbmRvdy5hcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgdHlwZTogXCJtdWx0aXBsZVwiLCAvLyBtdWx0aXBsZeOAgXNpbmdsZVxyXG4gICAgbmFtZTogXCJcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxyXG4gICAgY292ZXI6IFwiXCIsXHJcbiAgICBjb3ZlckRhdGE6IFwiXCIsXHJcbiAgICBzaGFyZTogdHJ1ZSxcclxuICAgIHN0aWNrZXJzOiBbXSxcclxuICAgIGVycm9yOiBcIlwiLFxyXG4gICAgdXBsb2FkaW5nOiBmYWxzZVxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIGRpc2FibGVCdXR0b24oKSB7XHJcbiAgICAgIGxldCBkaXNhYmxlID0gdHJ1ZTtcclxuICAgICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5zdGlja2Vycykge1xyXG4gICAgICAgIGlmKHMuc3RhdHVzICE9PSBcInVwbG9hZGVkXCIpIGRpc2FibGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZGlzYWJsZTtcclxuICAgIH0sXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRTaXplOiBOS0MubWV0aG9kcy5nZXRTaXplLFxyXG4gICAgc2VsZWN0TG9jYWxGaWxlKCkge1xyXG4gICAgICAkKFwiI3VwbG9hZElucHV0XCIpLmNsaWNrKCk7XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0ZWRMb2NhbEZpbGUoKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gJChcIiN1cGxvYWRJbnB1dFwiKVswXTtcclxuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcclxuICAgICAgZm9yKGxldCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgdGhpcy5hZGRTdGlja2VyKGZpbGUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWRkU3RpY2tlcihmaWxlKXtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHRoaXMuZ2V0U3RpY2tlckJ5RmlsZShmaWxlKVxyXG4gICAgICAgIC50aGVuKHMgPT4ge1xyXG4gICAgICAgICAgc2VsZi5zdGlja2Vycy5wdXNoKHMpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgZ2V0U3RpY2tlckJ5RmlsZShmaWxlLCBmaWxlbmFtZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCBzdGlja2VyID0ge1xyXG4gICAgICAgICAgZmlsZSxcclxuICAgICAgICAgIHByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgZXJyb3I6IFwiXCIsXHJcbiAgICAgICAgICBzdGF0dXM6IFwidW5VcGxvYWRlZFwiLFxyXG4gICAgICAgICAgbmFtZTogZmlsZW5hbWUgfHwgZmlsZS5uYW1lIHx8IChEYXRlLm5vdygpICsgXCIucG5nXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAgIC50aGVuKHVybCA9PiB7XHJcbiAgICAgICAgICAgIHN0aWNrZXIudXJsID0gdXJsO1xyXG4gICAgICAgICAgICByZXNvbHZlKHN0aWNrZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZUZvcm1BcnIoYXJyLCBpbmRleCkge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBjcm9wSW1hZ2Uoc3RpY2tlcikge1xyXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RpY2tlcnMuaW5kZXhPZihzdGlja2VyKTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFNlbGVjdEltYWdlLnNob3coZGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IE5LQy5tZXRob2RzLmJsb2JUb0ZpbGUoZGF0YSk7XHJcbiAgICAgICAgc2VsZi5nZXRTdGlja2VyQnlGaWxlKGZpbGUsIHN0aWNrZXIuZmlsZS5uYW1lKVxyXG4gICAgICAgICAgLnRoZW4ocyA9PiB7XHJcbiAgICAgICAgICAgIFZ1ZS5zZXQoc2VsZi5zdGlja2VycywgaW5kZXgsIHMpO1xyXG4gICAgICAgICAgICBTZWxlY3RJbWFnZS5jbG9zZSgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSwge1xyXG4gICAgICAgIHVybDogc3RpY2tlci51cmwsXHJcbiAgICAgICAgYXNwZWN0UmF0aW86IDFcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICB1cGxvYWQoYXJyLCBpbmRleCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgaWYoIWFyci5sZW5ndGggfHwgaW5kZXggPj0gYXJyLmxlbmd0aCB8fCAhYXJyW2luZGV4XSkge1xyXG4gICAgICAgIHJldHVybiBzZWxmLnVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHN0aWNrZXIgPSBhcnJbaW5kZXhdO1xyXG4gICAgICBzZWxmLnVwbG9hZGluZyA9IHRydWU7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVwbG9hZGluZ1wiO1xyXG4gICAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIHN0aWNrZXIuZmlsZSk7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJ0eXBlXCIsIFwic3RpY2tlclwiKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVOYW1lXCIsIHN0aWNrZXIubmFtZSk7XHJcbiAgICAgICAgICBpZihzZWxmLnNoYXJlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInNoYXJlXCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKFwiL3JcIiwgXCJQT1NUXCIsIGZvcm1EYXRhLCBmdW5jdGlvbihlLCBwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBzdGlja2VyLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN0aWNrZXIuc3RhdHVzID0gXCJ1cGxvYWRlZFwiO1xyXG4gICAgICAgICAgc2VsZi51cGxvYWQoYXJyLCBpbmRleCArIDEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBzdGlja2VyLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVuVXBsb2FkZWRcIjtcclxuICAgICAgICAgIHNlbGYudXBsb2FkKGFyciwgaW5kZXggKyAxKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGxldCB7c3RpY2tlcnN9ID0gc2VsZjtcclxuICAgICAgc3RpY2tlcnMgPSBzdGlja2Vycy5maWx0ZXIocyA9PiBzLnN0YXR1cyAhPT0gXCJ1cGxvYWRlZFwiKTtcclxuICAgICAgdGhpcy51cGxvYWQoc3RpY2tlcnMsIDApO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
