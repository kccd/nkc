const url = "http://a.test:9000/r/22";

var container, pageDiv, pdfDoc;

var page = 0;

$("button.page").on("click", function() {
  if($(this).attr("data-type") === "next") {
    page ++;
  } else if(page > 1) {
    page --;
  }
  renderPDF(page);
});


function getPDF(url) {
  pdfjsLib.getDocument({
    url: url,
    rangeChunkSize: 65536*20,
    disableAutoFetch: true,
    disableStream:true
  }).then((pdf) => {
    console.log(pdf);
    pdfDoc = pdf;
    container = document.getElementById('container');
  });
}

function renderPDF(num) {
  console.log(1)
  pdfDoc.getPage(num).then((page) => {
    console.log(2)
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