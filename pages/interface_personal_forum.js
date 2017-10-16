

$(document).ready(function(){
  if($(window).width()<900){
    //$('.ThreadTitle1').css('width','80%');
    //$('.ThreadTitle2').css('width','18%');
    $('.ForumThreadStat').css('font-size','7px');
    $('.ThreadCheckboxes').css('width','12px');
    $('.ThreadCheckboxes').css('height','12px');
  }
})


function switchFunc(){
  var flag = false;
  var checkboxes = $('.ThreadCheckboxes');
  var forumManagement = $('.ForumManagement');
  return function () {
    console.log(flag);
    if (!flag) {
      $('.displayShit').hide();
      $('.configShit').show();
      if(checkboxes) checkboxes.show();
      if(forumManagement) forumManagement.show();
      flag = true;
      return;
    }
    $('.configShit').hide();
    $('.displayShit').show();
    if(checkboxes) checkboxes.hide();
    if(forumManagement) forumManagement.hide();
    flag = false;
  }
};

var switchManagementMode = switchFunc();


function applyAll(f){
  return common.mapWithPromise(extractSelectedCheckboxArrayOfID(),f)
}

function moveThread(tid,fid,cid){
  return nkcAPI('moveThread',{
    tid:tid,
    fid:fid,
    cid:cid,
  })
    .then(function(){
      screenTopAlert(tid + ' 已送 ' + fid + (cid?' 的 '+cid:''))
    })
    .catch(function(){
      screenTopWarning(tid+ ' 无法送 ' + fid+ (cid?' 的 '+cid:''))
    })
}

function recyclebtn(){
  if(moveThreadToForum('recycle'))geid('recyclebtn').disabled = true
}

function addColl(tid){
  return nkcAPI('addThreadToCollection',{tid:tid})
    .then(function(res){
      screenTopAlert('已收藏 '+tid)
    })
    .catch(jwarning)
}

function extractfid(){
  var targetforum = gv('TargetForum').trim().split(':')
  if(targetforum.length!==2)return screenTopWarning('请选择一个目标')
  targetforum = targetforum[0]
  return targetforum
}

function moveThreadTo(){
  var fid = extractfid()
  if(moveThreadToForum(fid)){
    geid('moveThreadTo').disabled=true
  }
}

function askCategoryOfForum(fid){
  fid = fid.toString()
  return nkcAPI('getForumCategories',{fid:fid})
    .then(function(arr){
      if(!arr.length)return null
      return screenTopQuestion('请选择一个分类：',['0:（无分类）'].concat(arr.map(function(i){return i._key+':'+i.name})))
    })
    .then(function(str){
      //console.log('selected:',str.split(':')[0]);
      if(!str)return null
      return str.split(':')[0]
    })
}

function moveThreadToForum(fid){
  askCategoryOfForum(fid)
    .then(function(cid){
      return applyAll(function(tid){
        return moveThread(tid,fid,cid)
      })
    })
    .then(function(){
      window.location.reload()
    })
    .catch(jwarning)

  return true
}

function addSelectedToMyCollection(){
  geid('addSelectedToMyCollection').disabled = true

  applyAll(function(item){
    return addColl(item)
  })
    .then(function(){
      geid('addSelectedToMyCollection').disabled = false
    })
    .catch(jwarning)
}

function renameForumCategory(fid){
  askCategoryOfForum(fid)
    .then(function(cid){
      var newname = prompt('请为这个分类输入新的名称：')
      if(!newname){
        return
      }
      else{
        return nkcAPI('modifyThreadType',{op:'rename',cid:cid,name:newname})
          .then(function(){
            screenTopAlert('修改成功')
            location.reload();
          })
      }
    })
}

function deleteForumCategory(fid){
  askCategoryOfForum(fid)
    .then(function(cid){
      var okay = confirm('确认要删除这个分类吗？')
      if(!okay){
        return
      }
      else{
        return nkcAPI('modifyThreadType',{op:'remove',cid:cid})
          .then(function(){
            screenTopAlert('已经删除。')
            location.reload();
          })
      }
    })
}

function addForumCategory(fid){
  var newcatname = prompt('请输入新的分类的名称：')
  if(!newcatname){
    return
  }
  else{
    return nkcAPI('modifyThreadType',{op:'add',name:newcatname,fid:fid})
      .then(function(){
        location.reload()
      })
  }
}

function askForumOfZone(fid){
  var userCert = fid.split(',')
  var new_fid = fid.split(',')[0]
  var forumCert = ['dev','editor','senior_moderator','moderator','scholar']

  //对数组进行过滤
  function rem(arr){
    var a = mix(userCert,forumCert).length;
    if(a != 0) return arr;  //有权限
    if(a == 0) return arr.class != 'classified';
  }

  //console.log(userCert,forumCert,mix(userCert,forumCert))
  return nkcAPI('getForumsOfZone',{fid:new_fid})
    .then(function(arr){
      //console.log(arr)
      return screenTopQuestion('请选择一个版块：',
        arr.filter(rem).map(function(item){
          return item._key+':'+item.display_name
        }))
        .then(function(ans){
          return ans.split(':')[0]
        })
    })
}

function newPostDirector(fid){
  askForumOfZone(fid)
    .then(function(selectedfid){
      redirect('/editor?target=f/'+selectedfid)
    })
}

//数组求交集
function mix(a,b){
  var res = [];
  for(var i=0;i<a.length;i++){
    for(var j=0;j<b.length;j++){
      if(a[i].match(b[j])){
        res.push(a[i]);
      }
    }
  }
  return res;
}

var submitConfig = function(key) {
  var moderators = gv('moderators').trim();
  moderators = moderators.replace('，', ',');
  var arr = moderators.split(',');
  for(var i in arr) {
    var v = arr[i].trim();
    if(!v) {
      arr.splice(i, 1)
    }
  }
  var config = {
    forumName: gv('forumName').trim(),
    description: gv('description').trim(),
    announcement: gv('announcement').trim(),
    moderators: arr,
    key: key
  };
  if(!config.description || !config.forumName) {
    screenTopWarning('请完善信息.');
    return;
  }
  return nkcAPI('configPersonalForum', config)
    .then(function() {
      location.reload();
    })
    .catch(function(e) {
      console.log(e)
      screenTopWarning(e.detail);
    })
};

var popPFSwitch = function(id) {
  var btn = geid('ppfBtn');
  var nowPopular = '取消热门';
  var nowNormal = '推至热门';
  nkcAPI('popPFSwitch', {pfID: id})
    .then(function() {
      if(btn.innerHTML === nowPopular) {
        btn.innerHTML = nowNormal;
        return
      }
      btn.innerHTML = nowPopular;
    })
    .catch(screenTopWarning)
};

function post_upload(target,data,callback)
{
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
        callback(null,xhr.responseText);
      }else {
        callback(true,xhr.status.toString()+' '+xhr.responseText);
      }
    }
  }
  xhr.open("POST","/api/"+target.toString().toLowerCase(),true);
  //xhr.setRequestHeader("Content-type","application/json");
  xhr.send(data);
}

function upload_callback(err, back) {
  if(err){
    screenTopWarning('failure: '+back);
  }else{
    screenTopAlert('上传成功,请刷新查看');
  }
}

function uploadForumAvatar(id) {
  var ele = geid('personalForumAvatarUploader');
  ele.click();
}

function avatarOnChange(id) {
  var ele = geid('personalForumAvatarUploader');
  if(!ele.files[0])return screenTopWarning('pick one, okay?');
  var formData = new FormData();
  formData.append('file', ele.files[0]);
  post_upload('/personalForumAvatar?id=' + id, formData,upload_callback);
}

function bannerOnChange(id) {
  var ele = geid('personalForumBannerUploader');
  if(!ele.files[0])return screenTopWarning('pick one, okay?');
  var formData = new FormData();
  formData.append('file', ele.files[0]);
  post_upload('/personalForumBanner?id=' + id, formData,upload_callback);
}

function uploadForumBanner() {
  var ele = geid('personalForumBannerUploader');
  ele.click();
}
