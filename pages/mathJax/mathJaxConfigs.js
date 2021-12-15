window.MathJax = {
  loader: {
    load: ["input/tex", "output/chtml"],
  },
  startup: {
    typeset: false,
  },
  options: {
    renderActions: {
      addMenu: [0, '', '']
    }
  },

  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: false, // use \$ to produce a literal dollar sign
  }
}