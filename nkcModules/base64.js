function isBase64(content = '') {
  try {
    const buffer = Buffer.from(content, 'base64');
    return buffer.toString('base64') === content;
  } catch (_) {
    return false;
  }
}

module.exports = {
  isBase64,
};
