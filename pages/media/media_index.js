var quota = 12; // 每页显示数量
var skip = 0; // 当前页数
var media;
var j = 0;
const pictureExts = ["jpg", "jpeg", "png", "bmp", "svg", "gif"];
const videoExts = ["mp4", "mov", "3gp", "avi"];
const audioExts = ["mp3", "wav"];

$(document).ready(function() {
  media = new Vue({
    el: "#mediaList",
    data: {
      mediaType: 'picture',
      activeClass: 'mdui-color-theme-accent',
      uploadButtonClass: 'mdui-color-blue-600',
      uploadFileFail: 'uploadFileFail',
      mediaPictureLists: [],
      mediaVideoLists: [],
      mediaAudioLists: [],
      mediaAttachmentLists: [],
      uploadFileList: "",
      uploadFileInfoArr: []
    },
    methods: {
      buttonClick: function(type) {
        this.mediaType = type;
        quota = 12;
        skip = 0;
        if(type == "upload"){
          $("#pageTurnButtonDom").css("display", "none");
          $("#uploadFileButtonDom").css("display", "block");
        }else{
          $("#pageTurnButtonDom").css("display", "block");
          $("#uploadFileButtonDom").css("display", "none")
          loadMedia(type, quota, skip);
        }
      },
      pictureInsert: function(rid, ext, name) {
        return pictureInsert(rid, ext, name);
      },
      videoInsert: function(rid, ext, name) {
        return videoInsert(rid, ext, name);
      },
      audioInsert: function(rid, ext, name) {
        return audioInsert(rid, ext, name);
      },
      attachmentInsert: function(rid, ext, name) {
        return attachmentInsert(rid, ext, name);
      },
      uploadFile: function() {
        return uploadFile();
      }
    }
  })
  
  loadMedia("picture", quota, skip, "not");
  media.uploadFileList = $("#fileList").files;
  // document.getElementById("paste-target").addEventListener("paste", function(e) {
  //   console.log("粘贴事件");
  //   filePaste(e)
  // })
  $("#paste-target").on("paste", function(e){
    console.log("1")
    filePaste(e);
  })
  $("#paste-center").on("paste", function(e) {
    console.log("2");
    filePaste(e);
  })
})

// 加载多媒体文件
function loadMedia(type, q, s, turn) {
  if(turn == "prev"){
    skip = skip - 1;
    if(skip <= 0){
      skip = 0;
    }
  }else if(turn == "next") {
    skip = skip + 1;
  }
  nkcAPI('/me/media?quota='+q+'&skip='+skip+'&type='+type, 'get',{})
  .then(function(data) {
    if(type == "picture") {
      media.mediaPictureLists = data.resources;
    }else if(type == "video") {
      media.mediaVideoLists = data.resources; 
    }else if(type == "audio") {
      media.mediaAudioLists = data.resources;
    }else{
      media.mediaAttachmentLists = data.resources;
    }
    skip = parseInt(data.skip);
  })
  .catch(function(data) {
    console.log(data.error);
    skip = parseInt(data.skip);
  })
}

// 向上翻页
function prevPage() {
  var type = media.mediaType;
  loadMedia(type, quota, skip, 'prev')
}

// 向下翻页
function nextPage() {
  var type = media.mediaType;
  loadMedia(type, quota, skip, 'next');
}

// 图片插入到编辑器
function pictureInsert(rid, ext, name) {
  edInsertContent('text-elem', '/r/'+rid, ext, name);
}

// 视频插入到编辑器
function videoInsert(rid, ext, name) {
  edInsertContent('text-elem', '/r/'+rid, ext, name);
}

// 音频插入编辑器
function audioInsert(rid, ext, name) {
  edInsertContent('text-elem', '/r/'+rid, ext, name);
}

// 附件插入编辑器
function attachmentInsert(rid, ext, name) {
  edInsertContent('text-elem', '/r/'+rid, ext, name)
}

// 选择文件
function fileSelect(obj) {
  media.uploadFileInfoArr = [];
  media.uploadFileList = obj.files;
  var file = obj.files;
  for(var f=0;f<file.length;f++){
    // 文件类型
    var startIndex = file[f].name.lastIndexOf(".");
    var extension = file[f].name.substring(startIndex+1, file[f].name.length).toLowerCase();
    var fileType;
    if(pictureExts.indexOf(extension) > -1){
      fileType = "图片";
    }else if(videoExts.indexOf(extension) > -1){
      fileType = "视频";
    }else if(audioExts.indexOf(extension) > -1) {
      fileType = "音频";
    }else{
      fileType = "附件";
    }
    // 文件大小
    var fileObj = {
      name: file[f].name,
      size: fileSizeFormat(file[f].size),
      fileType: fileType,
      process: 0,
      percent: 0,
      status: "等待上传",
      ext: extension
    };
    media.uploadFileInfoArr.push(fileObj)
  }
}

// 粘贴文件
function filePaste(e) {
  media.uploadFileInfoArr = [];
  media.uploadFileList = [];
  var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
  var items = clipboardData.items;
  for(var i in items){
    if(items[i].type) {
      var file = items[i].getAsFile();
      var startIndex = file.name.lastIndexOf(".");
      var extension = file.name.substring(startIndex+1, file.name.length).toLowerCase();
      var fileType;
      if(pictureExts.indexOf(extension) > -1){
        fileType = "图片";
      }else if(videoExts.indexOf(extension) > -1){
        fileType = "视频";
      }else if(audioExts.indexOf(extension) > -1) {
        fileType = "音频";
      }else{
        fileType = "附件";
      }
      console.log(file)
      media.uploadFileList.push(file);
      var fileObj = {
        name: file.name,
        size: fileSizeFormat(file.size),
        fileType: fileType,
        process: 0,
        percent: 0,
        status: "等待上传",
        ext: extension
      };
      media.uploadFileInfoArr.push(fileObj)
    }
  }
}

// 上传文件
function uploadFile() {
  var items = media.uploadFileList;
  if(items.length == 0) return console.log("暂未选择任何文件");
  if(items.length > 50) return console.log("队列中文件太多");
  sendFile();
  function sendFile() {
    if(j >= items.length){
      j=0;
      // media.uploadFileList = "";
      // media.uploadFileInfoArr = [];
      return;
    }
    var formData = new FormData();
    formData.append("file", items[j]);
    var xhr = new XMLHttpRequest();
    xhr.upload.onprogress = function(e) {
      var percent = (e.loaded / e.total) *100;
      percent = percent.toFixed(0);
      if(parseInt(percent) > 98){
        percent = 99;
        if(videoExts.indexOf(media.uploadFileInfoArr[j].ext) > -1) {
          media.uploadFileInfoArr[j].status = "正在转码";
        }
      }
      media.uploadFileInfoArr[j].process = percent;
      media.uploadFileInfoArr[j].percent = percent;
    }
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4){
        if(xhr.status >= 200 && xhr.status < 300){
          media.uploadFileInfoArr[j].status = "上传完成";
          media.uploadFileInfoArr[j].process = 100;
          media.uploadFileInfoArr[j].percent = 100;
          j++;
          sendFile();
        }else{
          console.log(media.uploadFileInfoArr[j].size)
          if(media.uploadFileInfoArr[j].size > 209759635){
            media.uploadFileInfoArr[j].status = "上传失败,不得大于200M";
          }else{
            media.uploadFileInfoArr[j].status = "上传失败";
          }
          media.uploadFileInfoArr[j].statusType = "fail";
          media.uploadFileInfoArr[j].process = 0;
          media.uploadFileInfoArr[j].percent = 0;
          j++;
          sendFile();
        }
      }
    }
    xhr.open("POST", '/r', true);
    xhr.setRequestHeader("FROM", "nkcAPI");
    xhr.send(formData);
  }
}

// 点击选择文件按钮
function clickButton() {
  document.getElementById("fileList").click();
}

// 文件大小格式化
function fileSizeFormat(limit) {
  var size = "";
  if(limit < 0.1 * 1024){                      
    size = limit.toFixed(2) + "B";
  }else if(limit < 0.1 * 1024 * 1024){          
    size = (limit/1024).toFixed(2) + "KB";
  }else if(limit < 0.1 * 1024 * 1024 * 1024){       
    size = (limit/(1024 * 1024)).toFixed(2) + "MB";
  }else{                                           
    size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  var sizeStr = size + "";                
  var index = sizeStr.indexOf(".");       
  var dou = sizeStr.substr(index + 1 ,2);
  if(dou == "00"){                                    
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
}