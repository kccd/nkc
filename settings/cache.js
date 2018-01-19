module.exports = {
  setHeaders: function(res, path, stats) {
    res.setHeader('Last-Modified', stats.mtime)
  }
};