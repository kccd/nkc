// 监听textarea，将文本放入mathOutput中
function putTextToOutput() {
  var mathText = document.getElementById("mathInput").value;
  document.getElementById("mathOutput").innerHTML = mathText;
  mathfreshnew()
}

// 渲染预览中的公式
function mathfreshnew(){
  if(MathJax){
    MathJax.Hub.PreProcess(document.getElementById("mathOutput"),function(){MathJax.Hub.Process(document.getElementById("mathOutput"))})
  }
}