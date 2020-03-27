const cheerio = require("./cheerio");
const plainEscape = require("../plainEscaper");
const fs = require("fs");
const path = require("path");
const filePath = path.resolve(__dirname, "./sources");
const files = fs.readdirSync(filePath);
const sources = {};
for(const filename of files) {
  const name = filename.split(".")[0];
  sources[name] = require(filePath + `/${name}`);
}

module.exports = (type, html, resources = []) => {
  const _resources = {};
  resources.map(r => {
    _resources[r.rid] = r
  });
  const sourceMethods = sources[type];
  const $ = cheerio.load(html);
  for(const name in sourceMethods) {
    if(!sourceMethods.hasOwnProperty(name)) continue;
    const method = sourceMethods[name];
    $(`nkcsource[data-type="${name}"]`).replaceWith(function() {
      const dom = $(this);
      const _html = dom.toString();
      const id = dom.data().id + "";
      const resource = id? _resources[id]: undefined;
      if(resource) {
        resource.oname = plainEscape(resource.oname || "");
      }
      return method(_html, id, resource);
    });
  }
  return $("body").html();
};