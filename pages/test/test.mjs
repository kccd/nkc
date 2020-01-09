
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

      console.log(this.pageNumber);
    }
  }
});