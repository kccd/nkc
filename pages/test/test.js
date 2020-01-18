(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var url = "http://a.test/r/305797";
var container, pageDiv, pdfDoc;
var page = 0;
$("button.next-page").on("click", function () {
  page++;
  renderPDF(page);
});

function getPDF(url) {
  pdfjsLib.getDocument({
    url: url,
    rangeChunkSize: 65536,
    disableAutoFetch: true,
    disableStreaming: true
  }).then(function (pdf) {
    console.log(pdf);
    pdfDoc = pdf;
    container = document.getElementById('container');
  });
}

function renderPDF(num) {
  pdfDoc.getPage(num).then(function (page) {
    var scale = 1.5;
    var viewport = page.getViewport(scale);
    pageDiv = document.createElement('div');
    pageDiv.setAttribute('id', 'page-' + (page.pageIndex + 1));
    pageDiv.setAttribute('style', 'position: relative');
    container.appendChild(pageDiv);
    var canvas = document.createElement('canvas');
    pageDiv.appendChild(canvas);
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var pageDiv_ = pageDiv;
    page.render(renderContext).then(function () {
      return page.getTextContent();
    }).then(function (textContent) {
      // 创建文本图层div
      var textLayerDiv = document.createElement('div');
      console.log("-------------------------");
      textLayerDiv.setAttribute('class', 'textLayer'); // 将文本图层div添加至每页pdf的div中

      pageDiv_.appendChild(textLayerDiv);
      console.log(pageDiv_);
      console.log(textLayerDiv); // 创建新的TextLayerBuilder实例

      var textLayer = new TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        pageIndex: page.pageIndex,
        viewport: viewport
      });
      textLayer.setTextContent(textContent);
      textLayer.render();
    });
  });
}

getPDF(url);
/*
pdfjsLib.getDocument(url)
  .then(pdf => {
    return pdf.getPage(39);
  })
  .then(page => {
    // 设置展示比例
    var scale = 2;
    // 获取pdf尺寸
    var viewport = page.getViewport(scale);
    // 获取需要渲染的元素
    var canvas = document.getElementById('pdf-canvas');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
  
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
  
    page.render(renderContext);
  });*/

/*

// import PDFJS from 'pdfjs-dist';
// PDFJS.GlobalWorkerOptions.workerSrc = '../external_pkgs/pdf/build/pdf.worker.js';
// import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer'
// // import 'pdfjs-dist/web/pdf_viewer.css'

// function getPDFStream() {
//   PDFJS.getDocument({ url: 'http://192.168.11.114:9000/test/output/prefix-1.pdf', rangeChunkSize: 65536 }).then(function (pdf) {
//     // document.getElementById('page_count').textContent = pdfDoc.numPages;
//     pdf.getPage(1).then(function (page) {
//       var scale = 1.25;
//       var viewport = page.getViewport({ scale: scale, });
//       var canvas = document.getElementById('page_count');
//       var context = canvas.getContext('2d');
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

<<<<<<< HEAD
function getPDFStream() {
  
  PDFJS.getDocument({ url: 'http://a.test/r/305797?t=' + Date.now(), rangeChunkSize: 50 * 16 }).then(function (pdf) {
    // document.getElementById('page_count').textContent = pdfDoc.numPages;
    pdf.getPage(34).then(function (page) {
      var scale = 1.25;
      var viewport = page.getViewport({ scale: scale, });
      var canvas = document.getElementById('page_count');
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
=======
//       var renderContext = {
//         canvasContext: context,
//         viewport: viewport
//       };
//       page.render(renderContext).then(function () {
//         return page.getTextContent()
//       }).then(function (textContent) {
//         var textLayerDiv = document.createElement('div')
//         textLayerDiv.setAttribute('class', 'textLayer')
//         // 将文本图层div添加至每页pdf的div中
//         document.getElementById('pdf_page').appendChild(textLayerDiv)
//         // 创建新的TextLayerBuilder实例
//         let textLayer = new TextLayerBuilder({
//           textLayerDiv: textLayerDiv,
//           pageIndex: page.pageIndex,
//           viewport: viewport
//         })
//         textLayer.setTextContent(textContent)
//         textLayer.render()
//       })
//     });
//   })
// }
>>>>>>> 1a77b7723c6b50597d7fe4eb7f2f66223524c7c6


var app = new Vue({
  el: '#app',
  data: {
    pageNumber: 1
  },
  mounted: function () {
    $('.media').media({ width: 800, height: 600, src: `/test/output/prefix-1.pdf` });
  },
  methods: {
    pre: function () {
      this.pageNumber -= 1;
      this.$nextTick(function () {
        $('.media').media({ width: 800, height: 600, src: `/test/output/prefix-${this.pageNumber}.pdf` });
      })
    },
    next: function () {
      this.pageNumber += 1;
      this.$nextTick(function () {
        $('.media').media({ width: 800, height: 600, src: `/test/output/prefix-${this.pageNumber}.pdf` });
      })

<<<<<<< HEAD
getPDFStream()*/

/*
=======
console.log(this.pageNumber);
}
}
});
>>>>>>> 1a77b7723c6b50597d7fe4eb7f2f66223524c7c6
*/

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Rlc3QvdGVzdC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sR0FBRyxHQUFHLHdCQUFaO0FBRUEsSUFBSSxTQUFKLEVBQWUsT0FBZixFQUF3QixNQUF4QjtBQUVBLElBQUksSUFBSSxHQUFHLENBQVg7QUFFQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixFQUF0QixDQUF5QixPQUF6QixFQUFrQyxZQUFXO0FBQzNDLEVBQUEsSUFBSTtBQUNKLEVBQUEsU0FBUyxDQUFDLElBQUQsQ0FBVDtBQUNELENBSEQ7O0FBTUEsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCO0FBQ25CLEVBQUEsUUFBUSxDQUFDLFdBQVQsQ0FBcUI7QUFDbkIsSUFBQSxHQUFHLEVBQUUsR0FEYztBQUVuQixJQUFBLGNBQWMsRUFBRSxLQUZHO0FBR25CLElBQUEsZ0JBQWdCLEVBQUUsSUFIQztBQUluQixJQUFBLGdCQUFnQixFQUFFO0FBSkMsR0FBckIsRUFLRyxJQUxILENBS1EsVUFBQyxHQUFELEVBQVM7QUFDZixJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWjtBQUNBLElBQUEsTUFBTSxHQUFHLEdBQVQ7QUFDQSxJQUFBLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUF4QixDQUFaO0FBQ0QsR0FURDtBQVVEOztBQUVELFNBQVMsU0FBVCxDQUFtQixHQUFuQixFQUF3QjtBQUN0QixFQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsR0FBZixFQUFvQixJQUFwQixDQUF5QixVQUFDLElBQUQsRUFBVTtBQUNqQyxRQUFJLEtBQUssR0FBRyxHQUFaO0FBQ0EsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsQ0FBZjtBQUNBLElBQUEsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQVY7QUFDQSxJQUFBLE9BQU8sQ0FBQyxZQUFSLENBQXFCLElBQXJCLEVBQTJCLFdBQVcsSUFBSSxDQUFDLFNBQUwsR0FBaUIsQ0FBNUIsQ0FBM0I7QUFDQSxJQUFBLE9BQU8sQ0FBQyxZQUFSLENBQXFCLE9BQXJCLEVBQThCLG9CQUE5QjtBQUNBLElBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsT0FBdEI7QUFDQSxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QixDQUFiO0FBQ0EsSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixNQUFwQjtBQUNBLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLENBQWQ7QUFDQSxJQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFFBQVEsQ0FBQyxNQUF6QjtBQUNBLElBQUEsTUFBTSxDQUFDLEtBQVAsR0FBZSxRQUFRLENBQUMsS0FBeEI7QUFFQSxRQUFJLGFBQWEsR0FBRztBQUNsQixNQUFBLGFBQWEsRUFBRSxPQURHO0FBRWxCLE1BQUEsUUFBUSxFQUFFO0FBRlEsS0FBcEI7QUFJQSxRQUFJLFFBQVEsR0FBRyxPQUFmO0FBQ0EsSUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLGFBQVosRUFBMkIsSUFBM0IsQ0FBZ0MsWUFBTTtBQUNwQyxhQUFPLElBQUksQ0FBQyxjQUFMLEVBQVA7QUFDRCxLQUZELEVBRUcsSUFGSCxDQUVRLFVBQUMsV0FBRCxFQUFpQjtBQUN2QjtBQUNBLFVBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQXJCO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUjtBQUNBLE1BQUEsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsT0FBMUIsRUFBbUMsV0FBbkMsRUFKdUIsQ0FLdkI7O0FBQ0EsTUFBQSxRQUFRLENBQUMsV0FBVCxDQUFxQixZQUFyQjtBQUNBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFSdUIsQ0FVdkI7O0FBQ0EsVUFBSSxTQUFTLEdBQUcsSUFBSSxnQkFBSixDQUFxQjtBQUNuQyxRQUFBLFlBQVksRUFBRSxZQURxQjtBQUVuQyxRQUFBLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FGbUI7QUFHbkMsUUFBQSxRQUFRLEVBQUU7QUFIeUIsT0FBckIsQ0FBaEI7QUFNQSxNQUFBLFNBQVMsQ0FBQyxjQUFWLENBQXlCLFdBQXpCO0FBRUEsTUFBQSxTQUFTLENBQUMsTUFBVjtBQUNELEtBdEJEO0FBdUJELEdBekNEO0FBMENEOztBQUlELE1BQU0sQ0FBQyxHQUFELENBQU47QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErRWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgdXJsID0gXCJodHRwOi8vYS50ZXN0L3IvMzA1Nzk3XCI7XHJcblxyXG52YXIgY29udGFpbmVyLCBwYWdlRGl2LCBwZGZEb2M7XHJcblxyXG52YXIgcGFnZSA9IDA7XHJcblxyXG4kKFwiYnV0dG9uLm5leHQtcGFnZVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG4gIHBhZ2UgKys7XHJcbiAgcmVuZGVyUERGKHBhZ2UpO1xyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRQREYodXJsKSB7XHJcbiAgcGRmanNMaWIuZ2V0RG9jdW1lbnQoe1xyXG4gICAgdXJsOiB1cmwsXHJcbiAgICByYW5nZUNodW5rU2l6ZTogNjU1MzYsXHJcbiAgICBkaXNhYmxlQXV0b0ZldGNoOiB0cnVlLFxyXG4gICAgZGlzYWJsZVN0cmVhbWluZzogdHJ1ZVxyXG4gIH0pLnRoZW4oKHBkZikgPT4ge1xyXG4gICAgY29uc29sZS5sb2cocGRmKTtcclxuICAgIHBkZkRvYyA9IHBkZjtcclxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyUERGKG51bSkge1xyXG4gIHBkZkRvYy5nZXRQYWdlKG51bSkudGhlbigocGFnZSkgPT4ge1xyXG4gICAgdmFyIHNjYWxlID0gMS41O1xyXG4gICAgdmFyIHZpZXdwb3J0ID0gcGFnZS5nZXRWaWV3cG9ydChzY2FsZSk7XHJcbiAgICBwYWdlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBwYWdlRGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAncGFnZS0nICsgKHBhZ2UucGFnZUluZGV4ICsgMSkpO1xyXG4gICAgcGFnZURpdi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3Bvc2l0aW9uOiByZWxhdGl2ZScpO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBhZ2VEaXYpO1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgcGFnZURpdi5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHQ7XHJcbiAgICBjYW52YXMud2lkdGggPSB2aWV3cG9ydC53aWR0aDtcclxuICAgIFxyXG4gICAgdmFyIHJlbmRlckNvbnRleHQgPSB7XHJcbiAgICAgIGNhbnZhc0NvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgIHZpZXdwb3J0OiB2aWV3cG9ydFxyXG4gICAgfTtcclxuICAgIHZhciBwYWdlRGl2XyA9IHBhZ2VEaXY7XHJcbiAgICBwYWdlLnJlbmRlcihyZW5kZXJDb250ZXh0KS50aGVuKCgpID0+IHtcclxuICAgICAgcmV0dXJuIHBhZ2UuZ2V0VGV4dENvbnRlbnQoKTtcclxuICAgIH0pLnRoZW4oKHRleHRDb250ZW50KSA9PiB7XHJcbiAgICAgIC8vIOWIm+W7uuaWh+acrOWbvuWxgmRpdlxyXG4gICAgICBjb25zdCB0ZXh0TGF5ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgY29uc29sZS5sb2coYC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1gKVxyXG4gICAgICB0ZXh0TGF5ZXJEaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICd0ZXh0TGF5ZXInKTtcclxuICAgICAgLy8g5bCG5paH5pys5Zu+5bGCZGl25re75Yqg6Iez5q+P6aG1cGRm55qEZGl25LitXHJcbiAgICAgIHBhZ2VEaXZfLmFwcGVuZENoaWxkKHRleHRMYXllckRpdik7XHJcbiAgICAgIGNvbnNvbGUubG9nKHBhZ2VEaXZfKTtcclxuICAgICAgY29uc29sZS5sb2codGV4dExheWVyRGl2KTtcclxuICAgIFxyXG4gICAgICAvLyDliJvlu7rmlrDnmoRUZXh0TGF5ZXJCdWlsZGVy5a6e5L6LXHJcbiAgICAgIHZhciB0ZXh0TGF5ZXIgPSBuZXcgVGV4dExheWVyQnVpbGRlcih7XHJcbiAgICAgICAgdGV4dExheWVyRGl2OiB0ZXh0TGF5ZXJEaXYsXHJcbiAgICAgICAgcGFnZUluZGV4OiBwYWdlLnBhZ2VJbmRleCxcclxuICAgICAgICB2aWV3cG9ydDogdmlld3BvcnRcclxuICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgdGV4dExheWVyLnNldFRleHRDb250ZW50KHRleHRDb250ZW50KTtcclxuICAgIFxyXG4gICAgICB0ZXh0TGF5ZXIucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuXHJcblxyXG5nZXRQREYodXJsKTtcclxuXHJcbi8qXHJcbnBkZmpzTGliLmdldERvY3VtZW50KHVybClcclxuICAudGhlbihwZGYgPT4ge1xyXG4gICAgcmV0dXJuIHBkZi5nZXRQYWdlKDM5KTtcclxuICB9KVxyXG4gIC50aGVuKHBhZ2UgPT4ge1xyXG4gICAgLy8g6K6+572u5bGV56S65q+U5L6LXHJcbiAgICB2YXIgc2NhbGUgPSAyO1xyXG4gICAgLy8g6I635Y+WcGRm5bC65a+4XHJcbiAgICB2YXIgdmlld3BvcnQgPSBwYWdlLmdldFZpZXdwb3J0KHNjYWxlKTtcclxuICAgIC8vIOiOt+WPlumcgOimgea4suafk+eahOWFg+e0oFxyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZGYtY2FudmFzJyk7XHJcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IHZpZXdwb3J0LmhlaWdodDtcclxuICAgIGNhbnZhcy53aWR0aCA9IHZpZXdwb3J0LndpZHRoO1xyXG4gIFxyXG4gICAgdmFyIHJlbmRlckNvbnRleHQgPSB7XHJcbiAgICAgIGNhbnZhc0NvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgIHZpZXdwb3J0OiB2aWV3cG9ydFxyXG4gICAgfTtcclxuICBcclxuICAgIHBhZ2UucmVuZGVyKHJlbmRlckNvbnRleHQpO1xyXG4gIH0pOyovXHJcblxyXG4vKlxyXG5cclxuLy8gaW1wb3J0IFBERkpTIGZyb20gJ3BkZmpzLWRpc3QnO1xyXG4vLyBQREZKUy5HbG9iYWxXb3JrZXJPcHRpb25zLndvcmtlclNyYyA9ICcuLi9leHRlcm5hbF9wa2dzL3BkZi9idWlsZC9wZGYud29ya2VyLmpzJztcclxuLy8gaW1wb3J0IHsgVGV4dExheWVyQnVpbGRlciB9IGZyb20gJ3BkZmpzLWRpc3Qvd2ViL3BkZl92aWV3ZXInXHJcbi8vIC8vIGltcG9ydCAncGRmanMtZGlzdC93ZWIvcGRmX3ZpZXdlci5jc3MnXHJcblxyXG4vLyBmdW5jdGlvbiBnZXRQREZTdHJlYW0oKSB7XHJcbi8vICAgUERGSlMuZ2V0RG9jdW1lbnQoeyB1cmw6ICdodHRwOi8vMTkyLjE2OC4xMS4xMTQ6OTAwMC90ZXN0L291dHB1dC9wcmVmaXgtMS5wZGYnLCByYW5nZUNodW5rU2l6ZTogNjU1MzYgfSkudGhlbihmdW5jdGlvbiAocGRmKSB7XHJcbi8vICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZV9jb3VudCcpLnRleHRDb250ZW50ID0gcGRmRG9jLm51bVBhZ2VzO1xyXG4vLyAgICAgcGRmLmdldFBhZ2UoMSkudGhlbihmdW5jdGlvbiAocGFnZSkge1xyXG4vLyAgICAgICB2YXIgc2NhbGUgPSAxLjI1O1xyXG4vLyAgICAgICB2YXIgdmlld3BvcnQgPSBwYWdlLmdldFZpZXdwb3J0KHsgc2NhbGU6IHNjYWxlLCB9KTtcclxuLy8gICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlX2NvdW50Jyk7XHJcbi8vICAgICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbi8vICAgICAgIGNhbnZhcy5oZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHQ7XHJcbi8vICAgICAgIGNhbnZhcy53aWR0aCA9IHZpZXdwb3J0LndpZHRoO1xyXG5cclxuPDw8PDw8PCBIRUFEXHJcbmZ1bmN0aW9uIGdldFBERlN0cmVhbSgpIHtcclxuICBcclxuICBQREZKUy5nZXREb2N1bWVudCh7IHVybDogJ2h0dHA6Ly9hLnRlc3Qvci8zMDU3OTc/dD0nICsgRGF0ZS5ub3coKSwgcmFuZ2VDaHVua1NpemU6IDUwICogMTYgfSkudGhlbihmdW5jdGlvbiAocGRmKSB7XHJcbiAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZV9jb3VudCcpLnRleHRDb250ZW50ID0gcGRmRG9jLm51bVBhZ2VzO1xyXG4gICAgcGRmLmdldFBhZ2UoMzQpLnRoZW4oZnVuY3Rpb24gKHBhZ2UpIHtcclxuICAgICAgdmFyIHNjYWxlID0gMS4yNTtcclxuICAgICAgdmFyIHZpZXdwb3J0ID0gcGFnZS5nZXRWaWV3cG9ydCh7IHNjYWxlOiBzY2FsZSwgfSk7XHJcbiAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZV9jb3VudCcpO1xyXG4gICAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0O1xyXG4gICAgICBjYW52YXMud2lkdGggPSB2aWV3cG9ydC53aWR0aDtcclxuPT09PT09PVxyXG4vLyAgICAgICB2YXIgcmVuZGVyQ29udGV4dCA9IHtcclxuLy8gICAgICAgICBjYW52YXNDb250ZXh0OiBjb250ZXh0LFxyXG4vLyAgICAgICAgIHZpZXdwb3J0OiB2aWV3cG9ydFxyXG4vLyAgICAgICB9O1xyXG4vLyAgICAgICBwYWdlLnJlbmRlcihyZW5kZXJDb250ZXh0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICByZXR1cm4gcGFnZS5nZXRUZXh0Q29udGVudCgpXHJcbi8vICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHRleHRDb250ZW50KSB7XHJcbi8vICAgICAgICAgdmFyIHRleHRMYXllckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbi8vICAgICAgICAgdGV4dExheWVyRGl2LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAndGV4dExheWVyJylcclxuLy8gICAgICAgICAvLyDlsIbmlofmnKzlm77lsYJkaXbmt7vliqDoh7Pmr4/pobVwZGbnmoRkaXbkuK1cclxuLy8gICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGRmX3BhZ2UnKS5hcHBlbmRDaGlsZCh0ZXh0TGF5ZXJEaXYpXHJcbi8vICAgICAgICAgLy8g5Yib5bu65paw55qEVGV4dExheWVyQnVpbGRlcuWunuS+i1xyXG4vLyAgICAgICAgIGxldCB0ZXh0TGF5ZXIgPSBuZXcgVGV4dExheWVyQnVpbGRlcih7XHJcbi8vICAgICAgICAgICB0ZXh0TGF5ZXJEaXY6IHRleHRMYXllckRpdixcclxuLy8gICAgICAgICAgIHBhZ2VJbmRleDogcGFnZS5wYWdlSW5kZXgsXHJcbi8vICAgICAgICAgICB2aWV3cG9ydDogdmlld3BvcnRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgICAgIHRleHRMYXllci5zZXRUZXh0Q29udGVudCh0ZXh0Q29udGVudClcclxuLy8gICAgICAgICB0ZXh0TGF5ZXIucmVuZGVyKClcclxuLy8gICAgICAgfSlcclxuLy8gICAgIH0pO1xyXG4vLyAgIH0pXHJcbi8vIH1cclxuPj4+Pj4+PiAxYTc3Yjc3MjNjNmI1MDU5N2Q3ZmU0ZWI3ZjJmNjYyMjM1MjRjN2M2XHJcblxyXG5cclxudmFyIGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgcGFnZU51bWJlcjogMVxyXG4gIH0sXHJcbiAgbW91bnRlZDogZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnLm1lZGlhJykubWVkaWEoeyB3aWR0aDogODAwLCBoZWlnaHQ6IDYwMCwgc3JjOiBgL3Rlc3Qvb3V0cHV0L3ByZWZpeC0xLnBkZmAgfSk7XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBwcmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5wYWdlTnVtYmVyIC09IDE7XHJcbiAgICAgIHRoaXMuJG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcubWVkaWEnKS5tZWRpYSh7IHdpZHRoOiA4MDAsIGhlaWdodDogNjAwLCBzcmM6IGAvdGVzdC9vdXRwdXQvcHJlZml4LSR7dGhpcy5wYWdlTnVtYmVyfS5wZGZgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5wYWdlTnVtYmVyICs9IDE7XHJcbiAgICAgIHRoaXMuJG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcubWVkaWEnKS5tZWRpYSh7IHdpZHRoOiA4MDAsIGhlaWdodDogNjAwLCBzcmM6IGAvdGVzdC9vdXRwdXQvcHJlZml4LSR7dGhpcy5wYWdlTnVtYmVyfS5wZGZgIH0pO1xyXG4gICAgICB9KVxyXG5cclxuPDw8PDw8PCBIRUFEXHJcbmdldFBERlN0cmVhbSgpKi8vKlxyXG49PT09PT09XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFnZU51bWJlcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuPj4+Pj4+PiAxYTc3Yjc3MjNjNmI1MDU5N2Q3ZmU0ZWI3ZjJmNjYyMjM1MjRjN2M2XHJcbiovIl19
