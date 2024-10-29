function getJsonStringText(jsonString) {
  if (!jsonString) {
    return '';
  }
  let jsonData;
  try {
    jsonData = JSON.parse(jsonString);
  } catch (err) {
    return `(JSON解析错误：${err.message})${jsonString}`;
  }

  return getNodesText(jsonData.content);
}

function getNodesText(nodes = []) {
  let text = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      text += node.text;
    } else if (node.content && node.content.length > 0) {
      text += getNodesText(node.content);
    }
  }
  return text;
}

function getJsonStringTextSplit(jsonString, count = 500) {
  if (!jsonString) {
    return '';
  }

  const jsonData = JSON.parse(jsonString);

  const text = getNodesText(jsonData.content);

  return text.slice(0, count);
}

module.exports = {
  getJsonStringText,
  getJsonStringTextSplit,
};
