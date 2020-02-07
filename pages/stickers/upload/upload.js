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
    stickers: [
      /*{
        url: "https://www.kechuang.org/avatar/74185",
        file:{
          name: 'asdfasdf.jpg',
          type: "image/png",
          size: 763948
        }
      },
      {
        url: "https://www.kechuang.org/avatar/10",
        file: {
          name: 'asdfasdfe.png',
          type: "image/png",
          size: 12354
        }
      }*/
    ],
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3VwbG9hZC91cGxvYWQubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBaEIsRUFBcEI7QUFDQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLElBQUksRUFBRSxVQURGO0FBQ2M7QUFDbEIsSUFBQSxJQUFJLEVBQUUsRUFGRjtBQUdKLElBQUEsV0FBVyxFQUFFLEVBSFQ7QUFJSixJQUFBLEtBQUssRUFBRSxFQUpIO0FBS0osSUFBQSxTQUFTLEVBQUUsRUFMUDtBQU1KLElBQUEsUUFBUSxFQUFFO0FBQ1I7Ozs7Ozs7Ozs7Ozs7Ozs7QUFEUSxLQU5OO0FBd0JKLElBQUEsS0FBSyxFQUFFLEVBeEJIO0FBeUJKLElBQUEsU0FBUyxFQUFFO0FBekJQLEdBRmE7QUE2Qm5CLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxhQURRLDJCQUNRO0FBQ2QsVUFBSSxPQUFPLEdBQUcsSUFBZDtBQURjO0FBQUE7QUFBQTs7QUFBQTtBQUVkLDZCQUFlLEtBQUssUUFBcEIsOEhBQThCO0FBQUEsY0FBcEIsQ0FBb0I7QUFDNUIsY0FBRyxDQUFDLENBQUMsTUFBRixLQUFhLFVBQWhCLEVBQTRCLE9BQU8sR0FBRyxLQUFWO0FBQzdCO0FBSmE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLZCxhQUFPLE9BQVA7QUFDRDtBQVBPLEdBN0JTO0FBc0NuQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksT0FE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LEdBQUcsQ0FBekI7QUFDRCxPQW5CSDtBQW9CRCxLQWpGTTtBQWtGUCxJQUFBLE1BbEZPLG9CQWtGRTtBQUNQLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFETyxVQUVGLFFBRkUsR0FFVSxJQUZWLENBRUYsUUFGRTtBQUdQLE1BQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFULENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLE1BQUYsS0FBYSxVQUFqQjtBQUFBLE9BQWpCLENBQVg7QUFDQSxXQUFLLE1BQUwsQ0FBWSxRQUFaLEVBQXNCLENBQXRCO0FBQ0Q7QUF2Rk07QUF0Q1UsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgU2VsZWN0SW1hZ2UgPSBuZXcgTktDLm1ldGhvZHMuc2VsZWN0SW1hZ2UoKTtcclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICB0eXBlOiBcIm11bHRpcGxlXCIsIC8vIG11bHRpcGxl44CBc2luZ2xlXHJcbiAgICBuYW1lOiBcIlwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiXCIsXHJcbiAgICBjb3ZlcjogXCJcIixcclxuICAgIGNvdmVyRGF0YTogXCJcIixcclxuICAgIHN0aWNrZXJzOiBbXHJcbiAgICAgIC8qe1xyXG4gICAgICAgIHVybDogXCJodHRwczovL3d3dy5rZWNodWFuZy5vcmcvYXZhdGFyLzc0MTg1XCIsXHJcbiAgICAgICAgZmlsZTp7XHJcbiAgICAgICAgICBuYW1lOiAnYXNkZmFzZGYuanBnJyxcclxuICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICBzaXplOiA3NjM5NDhcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly93d3cua2VjaHVhbmcub3JnL2F2YXRhci8xMFwiLFxyXG4gICAgICAgIGZpbGU6IHtcclxuICAgICAgICAgIG5hbWU6ICdhc2RmYXNkZmUucG5nJyxcclxuICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICBzaXplOiAxMjM1NFxyXG4gICAgICAgIH1cclxuICAgICAgfSovXHJcbiAgICBdLFxyXG4gICAgZXJyb3I6IFwiXCIsXHJcbiAgICB1cGxvYWRpbmc6IGZhbHNlXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgZGlzYWJsZUJ1dHRvbigpIHtcclxuICAgICAgbGV0IGRpc2FibGUgPSB0cnVlO1xyXG4gICAgICBmb3IoY29uc3QgcyBvZiB0aGlzLnN0aWNrZXJzKSB7XHJcbiAgICAgICAgaWYocy5zdGF0dXMgIT09IFwidXBsb2FkZWRcIikgZGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBkaXNhYmxlO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFNpemU6IE5LQy5tZXRob2RzLmdldFNpemUsXHJcbiAgICBzZWxlY3RMb2NhbEZpbGUoKSB7XHJcbiAgICAgICQoXCIjdXBsb2FkSW5wdXRcIikuY2xpY2soKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RlZExvY2FsRmlsZSgpIHtcclxuICAgICAgY29uc3QgaW5wdXQgPSAkKFwiI3VwbG9hZElucHV0XCIpWzBdO1xyXG4gICAgICBjb25zdCBmaWxlcyA9IGlucHV0LmZpbGVzO1xyXG4gICAgICBmb3IobGV0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgICAgICB0aGlzLmFkZFN0aWNrZXIoZmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhZGRTdGlja2VyKGZpbGUpe1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgdGhpcy5nZXRTdGlja2VyQnlGaWxlKGZpbGUpXHJcbiAgICAgICAgLnRoZW4ocyA9PiB7XHJcbiAgICAgICAgICBzZWxmLnN0aWNrZXJzLnB1c2gocyk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBnZXRTdGlja2VyQnlGaWxlKGZpbGUsIGZpbGVuYW1lKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0aWNrZXIgPSB7XHJcbiAgICAgICAgICBmaWxlLFxyXG4gICAgICAgICAgcHJvZ3Jlc3M6IDAsXHJcbiAgICAgICAgICBlcnJvcjogXCJcIixcclxuICAgICAgICAgIHN0YXR1czogXCJ1blVwbG9hZGVkXCIsXHJcbiAgICAgICAgICBuYW1lOiBmaWxlbmFtZSB8fCBmaWxlLm5hbWUgfHwgKERhdGUubm93KCkgKyBcIi5wbmdcIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgICAgLnRoZW4odXJsID0+IHtcclxuICAgICAgICAgICAgc3RpY2tlci51cmwgPSB1cmw7XHJcbiAgICAgICAgICAgIHJlc29sdmUoc3RpY2tlcik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRm9ybUFycihhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIGNyb3BJbWFnZShzdGlja2VyKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zdGlja2Vycy5pbmRleE9mKHN0aWNrZXIpO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgU2VsZWN0SW1hZ2Uuc2hvdyhkYXRhID0+IHtcclxuICAgICAgICBjb25zdCBmaWxlID0gTktDLm1ldGhvZHMuYmxvYlRvRmlsZShkYXRhKTtcclxuICAgICAgICBzZWxmLmdldFN0aWNrZXJCeUZpbGUoZmlsZSwgc3RpY2tlci5maWxlLm5hbWUpXHJcbiAgICAgICAgICAudGhlbihzID0+IHtcclxuICAgICAgICAgICAgVnVlLnNldChzZWxmLnN0aWNrZXJzLCBpbmRleCwgcyk7XHJcbiAgICAgICAgICAgIFNlbGVjdEltYWdlLmNsb3NlKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdXJsOiBzdGlja2VyLnVybCxcclxuICAgICAgICBhc3BlY3RSYXRpbzogMVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHVwbG9hZChhcnIsIGluZGV4KSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBpZighYXJyLmxlbmd0aCB8fCBpbmRleCA+PSBhcnIubGVuZ3RoIHx8ICFhcnJbaW5kZXhdKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbGYudXBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgc3RpY2tlciA9IGFycltpbmRleF07XHJcbiAgICAgIHNlbGYudXBsb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzdGlja2VyLnN0YXR1cyA9IFwidXBsb2FkaW5nXCI7XHJcbiAgICAgICAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVcIiwgc3RpY2tlci5maWxlKTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInR5cGVcIiwgXCJzdGlja2VyXCIpO1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZU5hbWVcIiwgc3RpY2tlci5uYW1lKTtcclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKFwiL3JcIiwgXCJQT1NUXCIsIGZvcm1EYXRhLCBmdW5jdGlvbihlLCBwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBzdGlja2VyLnByb2dyZXNzID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN0aWNrZXIuc3RhdHVzID0gXCJ1cGxvYWRlZFwiO1xyXG4gICAgICAgICAgc2VsZi51cGxvYWQoYXJyLCBpbmRleCArIDEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBzdGlja2VyLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgc3RpY2tlci5zdGF0dXMgPSBcInVuVXBsb2FkZWRcIjtcclxuICAgICAgICAgIHNlbGYudXBsb2FkKGFyciwgaW5kZXggKyAxKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGxldCB7c3RpY2tlcnN9ID0gc2VsZjtcclxuICAgICAgc3RpY2tlcnMgPSBzdGlja2Vycy5maWx0ZXIocyA9PiBzLnN0YXR1cyAhPT0gXCJ1cGxvYWRlZFwiKTtcclxuICAgICAgdGhpcy51cGxvYWQoc3RpY2tlcnMsIDApO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
