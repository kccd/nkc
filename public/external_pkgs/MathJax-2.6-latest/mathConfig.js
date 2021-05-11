MathJax.Hub.Config({
  jax: ["input/TeX","output/CommonHTML"],
  extensions: ["tex2jax.js","MathZoom.js"],
  tex2jax:{
      inlineMath:  [["$", "$"], ["\\(","\\)"]],
      displayMath: [["$$","$$"], ["\\[","\\]"]],
    ignoreClass:'container',
    processClass:"ThreadPostBody|QuestionText"
  },
  "CommonHTML":{
    showMathMenu:false,
    preferredFont:"STIX",
    scale: 100,
    minScaleAdjust: 50
  },
  TeX: {
    equationNumbers: {autoNumber: "AMS"}
  }
})
console.log("1")
console.log(MathJax)
console.log(document.getElementsByTagName('body'))
MathJax.Hub.PreProcess(document.getElementsByTagName('body'),function(){MathJax.Hub.Process(document.getElementsByTagName('body'))})