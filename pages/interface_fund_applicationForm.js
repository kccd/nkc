var threads = [];
var application = {
  threads: []
};
$(function(){
  init();
});
function loadThreads(page, pid) {
  var url = '/me/threads';
  if(page) {
    url = '/me/threads?page='+page;
  }
  if(pid !== undefined) {
    url = '/me/threads?pid='+pid
  }
  nkcAPI(url, 'GET', {})
    .then(function(data) {
      for (var threadFromData of data.threads){
        var flag = false;
        for (var thread of threads){
          if(thread.tid === threadFromData.tid) {
            flag = true;
          }
        }
        if(!flag) {
          threads.push(threadFromData);
        }
      }
      var threadsFromData = data.threads;
      var paging = data.paging;
      console.log(data);
      var pagingListContent = '';
      var threadListContent = '';
      if(paging && paging.pageCount > 1){
        for (var i = 0; i < paging.pageCount; i++) {
          console.log(paging.page)
          if(i === paging.page) {
            pagingListContent += '<li>'+(i+1)+'</li>';
          } else {
            pagingListContent += '<li><a href="###" onclick="loadThreads('+i+')">'+(i+1)+'</a></li>';
          }
        }
      }
      for (var thread of threadsFromData) {
        threadListContent += '<div class="thread-list-body"><div class="col-xs-12 col-md-10 thread-list-title"><a href="/t/'+thread.tid+'" target="_blank">'+thread.firstPost.t+'</a></div><div class="col-xs-12 col-md-2"><span class="glyphicon glyphicon-plus-sign" onclick="chooseThread('+thread.tid+')"></span></div></div>';
      }
      $('#threadListPage').html(pagingListContent);
      $('#threadList').html(threadListContent);
    })
    .catch(function(err){
      jwarning(err);
    })
}
function chooseThread(tid) {
  for (var thread of threads) {
    if(thread.tid == tid && !application.threads.includes(tid)){
      application.threads.push(tid);
      displayThreadList();
    }
  }
}

function displayThreadList() {
  var content = '';
  for (var tid of application.threads){
    for (var thread of threads) {
      if(thread.tid == tid) {
        content += '<div class="thread-list-body"><div class="col-xs-12 col-md-10 thread-list-title"><a href="/t/'+thread.tid+'" target="_blank">'+thread.firstPost.t+'</a></div><div class="col-xs-12 col-md-2"><span class="glyphicon glyphicon-minus-sign" onclick="removeThread('+thread.tid+')"></span></div></div>';
      }
    }
  }
  $('#threadListChose').html(content);
  $('#choseThread').html('&nbsp;'+application.threads.length+'&nbsp;篇');
}

function removeThread(tid){
  var threads = application.threads;
  for (var i in application.threads) {
    if(threads[i] == tid){
      application.threads.splice(i,1);
      displayThreadList();
    }
  }
}

function clearThreads(){
  $('#threadListPage').html('');
  $('#threadList').html('');
}

function postUpload(data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.upload.onprogress = function(e) {
    var percentComplete = (e.loaded / e.total) * 100;
    console.log("Uploaded " + percentComplete + "%");
  };
  xhr.onreadystatechange=function()
  {
    if (xhr.readyState==4)
    {
      if(xhr.status>=200&&xhr.status<300){
        callback(JSON.parse(xhr.responseText));
      }else {
        jwarning(xhr.status.toString()+' '+xhr.responseText);
      }
    }
  };
  xhr.open("POST","/idPhotos",true);
  //xhr.setRequestHeader("Content-type","application/json");
  xhr.send(data);
}

function uploadPhoto(id, type) {
  $(id).on('change', function() {
    var inputFile = $(id).get(0);
    var file;
    if(inputFile.files.length > 0){
      file = inputFile.files[0];
    }else {
      return jwarning('未选择图片');
    }
    var formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', type);
    postUpload(formData, uploadSuccess);
  });
}

function uploadSuccess(obj){
  var photoType = obj.photoType;
  if(photoType === 'idCardA') {
    alert('上传的是身份证A面');
  } else if(photoType === 'idCardB') {
    alert('上传的是身份证B面');
  } else if(photoType === 'HandheldIdCard') {
    alert('上传的是手持身份证照片');
  } else if(photoType === 'life') {
    alert('上传的是生活照');
  } else {
    alert('未知的证件类型');
  }
}

function init() {
  $('#submitOfSearch').on('click', function() {
    var pid = $('#pid').val();
    if(pid === '') return jwarning('输入不能为空');
    loadThreads(0,pid);
  });
  $('#idCardPhotoA').on('click', function(){
    $('#uploadIdCardA').click();
  });
  $('#idCardPhotoB').on('click', function(){
    $('#uploadIdCardB').click();
  });
  $('#idCardPhotoHandheld').on('click', function() {
    $('#uploadIdCardHandheld').click();
  });
  $('#lifePhoto').on('click', function() {
    $('#uploadLife').click();
  });
  uploadPhoto('#uploadIdCardA', 'idCardA');
  uploadPhoto('#uploadIdCardB', 'idCardB');
  uploadPhoto('#uploadIdCardHandheld', 'HandheldIdCard');
  uploadPhoto('#uploadLife', 'life');
}
