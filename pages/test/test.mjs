const url = "http://a.test/r/305797";

var container, pageDiv, pdfDoc;

var page = 0;

$("button.next-page").on("click", function() {
  page ++;
  renderPDF(page);
});


function getPDF(url) {
  pdfjsLib.getDocument({
    url: url,
    rangeChunkSize: 65536,
    disableAutoFetch: true,
    disableStreaming: true
  }).then((pdf) => {
    console.log(pdf);
    pdfDoc = pdf;
    container = document.getElementById('container');
  });
}

function renderPDF(num) {
  pdfDoc.getPage(num).then((page) => {
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
    page.render(renderContext).then(() => {
      return page.getTextContent();
    }).then((textContent) => {
      // 创建文本图层div
      const textLayerDiv = document.createElement('div');
      console.log(`-------------------------`)
      textLayerDiv.setAttribute('class', 'textLayer');
      // 将文本图层div添加至每页pdf的div中
      pageDiv_.appendChild(textLayerDiv);
      console.log(pageDiv_);
      console.log(textLayerDiv);
    
      // 创建新的TextLayerBuilder实例
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
getPDFStream()*//*
=======
      console.log(this.pageNumber);
    }
  }
});
>>>>>>> 1a77b7723c6b50597d7fe4eb7f2f66223524c7c6
*/