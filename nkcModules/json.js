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
function getNodesTextSlice(nodes = [], count = 500) {
  let text = '';
  for (const node of nodes) {
    if( text.length > count ){
        break; 
    }
    if (node.type === 'text') {
      text += node.text;
    } else if (node.content && node.content.length > 0) {
      text += getNodesTextSlice(node.content);
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
function getJsonStringTextSlice(jsonString, count = 500) {
  if (!jsonString) {
    return '';
  }
  const jsonData = JSON.parse(jsonString);
  const text = getNodesTextSlice(jsonData.content);
  return text.slice(0, count);
}

function getJsonStringNodes(jsonString) {
  if (!jsonString) {
    return [];
  }

  const jsonData = JSON.parse(jsonString);

  const getNodes = (content) => {
    const nodes = [];
    for (const item of content) {
      nodes.push(item);
      if (item.content && item.content.length > 0) {
        nodes.push(...getNodes(item.content));
      }
    }
    return nodes;
  };

  return getNodes(jsonData.content);
}

function getJsonStringResourcesId(jsonString) {
  const nodes = getJsonStringNodes(jsonString);
  const resourcesId = [];
  const resourceNodeTypes = [
    'nkc-picture-block',
    'nkc-picture-inline',
    'nkc-picture-float',
    'nkc-video-block',
    'nkc-audio-block',
    'nkc-attachment-block',
  ];
  for (const node of nodes) {
    if (resourceNodeTypes.includes(node.type)) {
      resourcesId.push(node.attrs.id);
    }
  }
  return resourcesId;
}

module.exports = {
  getJsonStringText,
  getJsonStringTextSplit,
  getJsonStringResourcesId,
  getJsonStringTextSlice,
};
