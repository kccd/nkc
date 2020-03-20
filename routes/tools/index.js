const router = require("koa-router")();
const fs = require("fs");
const path = require("path");
const StreamZip = require('node-stream-zip');

router
  // 工具列表
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    let toolsModel = db.ToolsModel;
    let toolList = await toolsModel.find();
    toolList.forEach((model, index) => {
      toolList[index] = model._doc;
    });
    data.list = toolList;
    ctx.template = "tools/list.pug";
    await next();
  })

  // 打开工具
  .get("/open/:toolid", async (ctx, next) => {
    const {data, db, params} = ctx;
    let toolsModel = db.ToolsModel;
    let toolinfo = await toolsModel.findOne({_id: params.toolid});
    console.log(toolinfo);
    
    data.toolinfo = toolinfo._doc;
    ctx.template = "tools/container.pug";
    await next();
  })

  // 上传和更新工具接口(压缩包 .zip)
  .post("/update", async (ctx, next) => {
    const {db, body} = ctx;
    const {fields, files} = body;
    const {file} = files;
    let completePath;
    // 检查和补全工具信息
    let {info, err} = cheackToolInfo(fields);
    if(err) ctx.throw(403, err);
    if(!fields._id) ctx.throw(500, "缺少参数 _id");
    if(file) {
      if(!isZipFile(file)) ctx.throw(403, "文件必须是一个压缩包");
      // 处理压缩包(如果有)
      try {
        // 解压完成之后的路径(还在tmp下)
        completePath = await zipExtractToDir(file.path, path.resolve("./tmp"));
      } catch (error) {
        ctx.throw(403, error);
      }
      // console.log(completePath);
    }
    // 更新工具信息
    let toolsModel = db.ToolsModel;
    await toolsModel.where({_id: fields._id}).update(info);
    // 把解压好的文件夹移动到最终位置(如果有)
    if(completePath) await moveDir(completePath, path.resolve(`./resources/tools/${fields._id}`));
    await next();
  })
  // 删除工具
  .del("/delete", async (ctx, next) => {
    const {db, query} = ctx;
    let id = query._id;
    if(!id) ctx.throw(403, "缺少参数 _id");
    let toolsModel = db.ToolsModel;
    await toolsModel.where({_id: id}).remove();
    deleteFolder(path.resolve(`./resources/tools/${id}`));
    await next();
  })
  // 上传工具
  .post("/upload", async (ctx, next) => {
    const {db, body} = ctx;
    const {fields, files} = body;
    const {file} = files;
    let completePath;
    // 检查和补全工具信息
    let {info, err} = cheackToolInfo(fields);
    if(err) ctx.throw(403, err);
    if(!info.isOtherSite) {
      if(!file) ctx.throw(403, "缺少压缩包");
      if(!isZipFile(file)) ctx.throw(403, "文件必须是一个压缩包");
      // 解压文件
      try {
        // 解压完成之后的路径(还在tmp下)
        completePath = await zipExtractToDir(file.path, path.resolve("./tmp"));
      } catch (error) {
        ctx.throw(403, error);
      }
      // console.log(completePath);
    } 
    // 信息入库
    let toolsModel = db.ToolsModel;
    let settingModel = db.SettingModel;
    let id = await settingModel.operateSystemID("tools", 1);
    let doc = toolsModel({...info, _id: id})
    await doc.save();
    // 移动文件到最终位置
    if(completePath) await moveDir(completePath, path.resolve(`./resources/tools/${id}`));
    await next();
  })




// 判断是否是zip压缩文件
function isZipFile(file) {
  if(!file.path || !file.name || !file.type) return false;
  if(!file.name.endsWith(".zip")) return false;
  return true;
}

// 解压zip文件到指定目录
function zipExtractToDir(zipFilePath, targetPath) {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({
      file: zipFilePath,
      storeEntries: true
    });
    zip.on('ready', () => {
      if(zip.entriesCount < 2) reject("压缩文件中请至少包含一个文件");
      let outsideDir = Object.values(zip.entries())[0];
      if(!outsideDir.isDirectory) reject("格式错误，请使用只包含一个文件夹的压缩包");
      zip.extract(null, targetPath, err => {
        if(err) throw err;
        zip.close();
        resolve(path.resolve(targetPath + "/" + outsideDir.name));
      });
    });
  })
}


// 检查和补全用户提交的工具信息
function cheackToolInfo(data) {
  let res = Object.create(null);
  if(!data.name) {
    res.err = "工具名不能为空";
    return res;
  }
  if(!data.entry) data.entry = "/index.html";
  if(!data.version) data.version = "1.0";
  if(data.isOtherSite === "true") data.isOtherSite = true;
  if(data.isOtherSite === "false") data.isOtherSite = false;
  if(!data.isOtherSite) data.isOtherSite = false;
  res.info = {
    version: data.version,
    name: data.name,
    summary: data.summary,
    author: data.author,
    uid: data.uid,
    entry: data.entry,
    isOtherSite: data.isOtherSite,
    lastModify: Date.now()
  }
  return res;
}


// 移动文件夹到新目录
function moveDir(sourcePath, toPath) {
  return new Promise((resolve, reject) => {
    deleteFolder(toPath); // 保证目标路径不存在同名文件夹
    fs.rename(sourcePath, toPath, err => {
      if(err) reject(err);
      resolve();
    })
  })
}


// 删除文件夹
function deleteFolder(path) {
	var files = [];
	if(fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolder(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};


module.exports = router;