const http = require('http');
const FILE = require("../../nkcModules/file");
const pictureExtensions = FILE.getExtensionByType('mediaPicture');
const breakpointExtensions = FILE.getExtensionByType('breakpoint');

module.exports = async (ctx, next) => {
  const {remoteFile} = ctx;
  const {encodeRFC5987ValueChars} = ctx.nkcModules.nkcRender;
  const {
    url,
    query,
    isAttachment = false,
    filename = '',
  } = remoteFile;
  const fileUrl = new URL(url);
  for(const key in query) {
    fileUrl.searchParams.set(key, query[key]);
  }
  let ext = filename.split('.');
  ext = ext.pop() || '';
  ext = ext.toLowerCase();
  if(!ext) ctx.throw(500, `远程文件格式不能为空`);
  const fileRes = await getRemoteFileRes(fileUrl.toString(), ctx);
  let contentDisposition;
  const filenameEncode = encodeRFC5987ValueChars(filename);
  if (isAttachment || (!pictureExtensions.includes(ext) && (!breakpointExtensions.includes(ext)))) {
    contentDisposition = `attachment; filename=${filenameEncode};`;
  } else {
    contentDisposition = `inline; filename=${filenameEncode};`;
  }
  ctx.type = ext;
  ctx.body = fileRes;
  ctx.set('content-disposition', contentDisposition);
  const fileResContentLength = fileRes.headers[`content-length`];
  const fileResAcceptRanges = fileRes.headers[`accept-ranges`];
  const fileResCacheControl = fileRes.headers[`cache-control`];
  const fileResRange = fileRes.headers[`content-range`];
  const fileResConnection = fileRes.headers[`connection`];
  const fileResEtag = fileRes.headers[`etag`];
  if(fileResAcceptRanges) ctx.set('accept-ranges', fileResAcceptRanges);
  if(fileResCacheControl) ctx.set('cache-control', fileResCacheControl);
  if(fileResConnection) ctx.set('connection', fileResConnection);
  if(fileResContentLength) ctx.set('content-length', fileResContentLength);
  if(fileResEtag) ctx.set('etag', fileResEtag);
  if(ctx.fresh) {
    ctx.status = 304;
    return;
  }
  if(fileResRange) {
    ctx.set(`content-range`, fileResRange);
    ctx.status = 206;
  }
  ctx.fileContentLength = fileResContentLength;
};

function getRemoteFileRes(url, ctx) {
  const headerRange = ctx.request.headers['range'];
  const options = {
    agent: new http.Agent({
      "keepAlive": true,
      "timeout": 30000
    }),
    method: 'GET',
  };
  if (headerRange) {
    options.headers = {
      range: headerRange
    }
  }
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, res => {
      res.on('error', reject);
      resolve(res);
    });
    req.on('error', reject);
    req.end();
  });
}