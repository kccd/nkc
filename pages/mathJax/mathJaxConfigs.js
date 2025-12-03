window.MathJax = {
  loader: {
    // 追加 mhchem 拓展以支持化学方程式 \ce{H2O}
    load: ['[tex]/mhchem'],
  },
  startup: {
    typeset: false,
  },
  options: {
    menuOptions: {
      settings: {
        enrich: false, // true to enable semantic-enrichment
        collapsible: true, // true to enable collapsible math
        speech: true, // true to enable speech generation
        braille: true, // true to enable Braille generation
        assistiveMml: true, // true to enable assistive MathML
      },
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
