const jsDiff = require('diff');
const render = require('./nkc_render');

function contentDiff(oldContent, newContent, options = {}) {
  const { addedClass = 'DiffAdded', removedClass = 'DiffRemoved' } = options;
  let diff;
  // jsDiff.diffChars方法虽然比较效果好但是非常耗资源
  if (oldContent.length >= 10000 || newContent.length >= 10000) {
    diff = jsDiff.diffWords(oldContent, newContent);
  } else {
    diff = jsDiff.diffChars(oldContent, newContent);
  }
  let outputHTML = '';

  diff.forEach(function (part) {
    let styleStr = part.added ? addedClass : part.removed ? removedClass : null;
    part.value = render.plain_render(part.value);
    outputHTML += styleStr
      ? `<span class="${styleStr}">${part.value}</span>`
      : part.value;
  });
  return outputHTML;
}

module.exports = {
  contentDiff,
};
