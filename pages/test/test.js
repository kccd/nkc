
// import PDFJS from 'pdfjs-dist';
// PDFJS.GlobalWorkerOptions.workerSrc = '../external_pkgs/pdf/build/pdf.worker.js';
// import {TextLayerBuilder} from 'pdfjs-dist/web/pdf_viewer'
// import 'pdfjs-dist/web/pdf_viewer.css'
PDFJS.getDocument({ url: 'http://192.168.11.114:9000/external_pkgs/pdf/web/compressed.tracemonkey-pldi-09.pdf', rangeChunkSize: 50 * 16 }).then(function (pdf) {
  // document.getElementById('page_count').textContent = pdfDoc.numPages;
  pdf.getPage(2).then(function (page) {
    var scale = 1;
    var viewport = page.getViewport({ scale: scale, });

    var canvas = document.getElementById('page_count');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext).then(function () {
      return page.getTextContent()
    }).then(function (textContent) {
      var textLayerDiv = document.createElement('div')
      textLayerDiv.setAttribute('class', 'textLayer')
      // 将文本图层div添加至每页pdf的div中
      document.getElementById('pdf_page').appendChild(textLayerDiv)
      // 创建新的TextLayerBuilder实例
      let textLayer = new TextLayerBuilder({
        textLayerDiv: textLayerDiv,
        pageIndex: page.pageIndex,
        viewport: viewport
      })
      textLayer.setTextContent(textContent)
      textLayer.render()
    })
  });
})