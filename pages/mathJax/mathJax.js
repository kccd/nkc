window.renderMathJax = (content) => {
  const dom = document.getElementById('container');
  dom.innerText = content;
  MathJax.typesetPromise([dom]);
}