var attachment_uploader = function(options){
  var uploader = {};
  //multi-part uploader.
  //data should be a FormData object
  var post_upload = function(target,data,callback){
    var xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function(e) {
      var percentComplete = (e.loaded / e.total) * 100;
      console.log("Uploaded " + percentComplete + "%");
      options.percentage_callback(percentComplete);
    };

    xhr.onreadystatechange=function(){
      if (xhr.readyState==4){
        if(xhr.status>=200&&xhr.status<300){
          callback(null,xhr.responseText);
        }else {
          callback(xhr.status.toString()+' '+xhr.responseText);
        }
      }
    }

    xhr.open("POST","/api/"+target.toString().toLowerCase(),true);
    //xhr.setRequestHeader("Content-type","application/json");
    xhr.send(data);

  };

  uploader.files_left = 0;

  var files_left_incr = function(){
    uploader.files_left += 1;
    options.files_left_callback(uploader.files_left);
  }

  var files_left_decr = function(){
    uploader.files_left -= 1;
    options.files_left_callback(uploader.files_left);
  }

  var create_upload = function (data){
    console.log('create upload start');
    return new Promise(function(resolve,reject){

      post_upload(options.upload_target, data , function(err,back){

        console.log('post upload called back')
        if(err){
          options.upload_failed_callback(err);
          reject(err)
        }else{
          options.upload_success_callback(back);
          resolve(back)
        }
      });

    })
  }

  function uploadListOfFile(items){
    console.log('ulof');
    return common.mapWithPromise(items,function(item){
      console.log('item');
      console.log(item);
      if(item&&item.size){
        var formData = new FormData();
        formData.append('file', item);
        return create_upload(formData)
        .catch(function(err){
          console.log(err);
        })
        .then(function(){
          files_left_decr()
        })
      }
    })
  }

  //点击上传附件
  uploader.uploadfile_click = function(){
    var items = geid('file-selector').files;
    if(items.length==0)return alert('至少选一个呗');
    if(items.length>10) return alert('一次不要上传超过10个文件');

    for(i=0;i<items.length;i++){
      files_left_incr();
    }

    uploadListOfFile(items)
    .then(function(){
      geid('file-selector').value = '';
    })
  };

  //When paste happens
  uploader.paste_handler = function(e) {
    var items = e.clipboardData.items;
    if(items.length>4)return alert('一次不要那么多文件,暂时先这样');

    for(i in items){
      console.log("Item: " + items[i].type);
      if (items[i].type) //if is valid type
      {
        var formData = new FormData();
        formData.append('file', items[i].getAsFile());
        create_upload(formData);
      }
      else {
        console.log("Discarding paste data: "+items[i].type);
      }
    }
  };

  return uploader;
}





var uploader = attachment_uploader({
  ////server/api/path-to-upload
  upload_target:ga('file-uploading','target'),

  upload_success_callback:function(info){  //info为刚上传的附件信息
    //alert(JSON.stringify(info));
    if(list)list.refresh();  //list为所有的附件列表（未刷新之前）
  },

  upload_failed_callback:function(info){
    alert('failed. \n'+info);
  },

  files_left_callback:function(num){
    if(num>0){
      geid('upload-counter').innerHTML = num.toString()+' file(s) left...';
    }else{
      geid('upload-counter').innerHTML = 'no files uploading.';
    }
  },

  percentage_callback:function(pctg){
    geid('upload-percentage').innerHTML = pctg.toFixed()+'%';
  }
});

//enable Ctrl + V paste
geid("paste-target").addEventListener("paste", uploader.paste_handler);

//上传附件的按钮
geid('upload-button').addEventListener('click', uploader.uploadfile_click);
