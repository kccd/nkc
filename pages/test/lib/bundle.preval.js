/**
 * 在这个文件的开头写 // @preval 在编译时执行这个模块，引用此模块的地方会获得导出，注意导出结果要可序列化
 * 这里只能写commomjs，因为babel-plugin-preval会直接把这段字符串丢进vm执行，不会过语法转换
 */

// @preval
const buildTime = new Date().toString();
module.exports = {
  buildTime,
  cwd: process.cwd(),
  dirname: __dirname,
  filename: __filename,
  mode: process.env.NODE_ENV || "development"
}