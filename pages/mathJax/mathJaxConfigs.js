window.MathJax = {
  loader: {
    // 加载 mhchem 扩展以支持 \ce{H2O} 等化学式
    load: ['input/tex', 'output/chtml'],
  },
  startup: {
    typeset: false,
  },
  options: {
    renderActions: {
      addMenu: [0, '', ''],
    },
  },

  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: false, // use \$ to produce a literal dollar sign
    // 追加 mhchem 包
    packages: { '[+]': ['mhchem'] },
  },
};
