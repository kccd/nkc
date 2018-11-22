var forumInfoDiv = $('#forumInfoDiv');
var fixedForumInfoDiv = $('#fixedForumInfoDiv');
var digestThreadsDiv = $('#digestThreadsDiv');
var fixedDigestThreadsDiv = $('#fixedDigestThreadsDiv');


$(document).ready(function(){
  if($(window).width()<900){
    //$('.ThreadTitle1').css('width','80%');
    //$('.ThreadTitle2').css('width','18%');
    $('.ForumThreadStat').css('font-size','7px');
    $('.ThreadCheckboxes').css('width','12px');
    $('.ThreadCheckboxes').css('height','12px');
  }
  displayAside();
  
  // var qrcodes = document.getElementsByClassName('qrcode');
  // var qrcodes = $(".qrcode");
  // for(var i in qrcodes){
  //   var qrcode = qrcodes[i];
  //   if(qrcode) {
  //     var path = window.location.href;
  //     path = path.replace(/\?.*/g, '');
  //     QRCode.toCanvas(qrcode, path, {
  //       scale: 3,
  //       margin: 1,
  //       color: {dark: '#000000'}
  //     }, function(err) {
  //       if(err){
  //         //- screenTopWarning(err);
  //       }
  //     })
  //   }
  // }
  // var qrcode = geid('formCode1');
  // if(qrcode) {
  //   var path = window.location.href;
  //   path = path.replace(/\?.*/g, '');
  //   QRCode.toCanvas(qrcode, path, {
  //     scale: 3,
  //     margin: 1,
  //     color: {dark: '#000000'}
  //   }, function(err) {
  //     if(err){
  //       //- screenTopWarning(err);
  //     }
  //   })
  // }
});


function enterManagementMode(){
  $('.ThreadCheckboxes').show()
  $('.ForumManagement').show()
}

function applyAll(f){
  return common.mapWithPromise(extractSelectedCheckboxArrayOfID(),f)
}

function recyclebtn(){
  if(moveThreadToForum('recycle'))geid('recyclebtn').disabled = true
}

function addColl(tid){
  return nkcAPI('/t/'+tid+'/addColl', 'POST',{})
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
  return nkcAPI('/f/'+fid+'/category', 'GET',{})
  .then(function(arr){
    arr = arr.categorys;
    if(!arr.length)return null
    return screenTopQuestion('请选择一个分类：',['0:（无分类）'].concat(arr.map(function(i){return i.cid+':'+i.name})))
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
  .catch(function(data) {
  	screenTopAlert(data.error || data)
  })

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
      return nkcAPI('/f/'+fid+'/category', 'PATCH',{cid:cid,name:newname})
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
      return nkcAPI('/f/'+fid+'/category/'+cid, 'DELETE',{})
      .then(function(){
        screenTopAlert('已经删除。')
        location.reload();
      })
    }
  })
}

function addForumCategory(fid){
  var newCatName = prompt('请输入新的分类的名称：')
  if(!newCatName){
    return
  }
  else{
    return nkcAPI('/f/'+fid+'/category', 'POST',{name:newCatName})
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
    redirect('/editor?type=forum&id='+selectedfid)
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


$(window).scroll(function() {

	displayAside();
});

function initPosition() {
	var forumInfoDivWidth = forumInfoDiv.css('width');
	var forumInfoDivPadding = forumInfoDiv.css('padding');



	var digestThreadsDivWidth = digestThreadsDiv.css('width');
	var digestThreadsDivPadding = digestThreadsDiv.css('padding');
	var digestThreadsDivLeft = digestThreadsDiv.offset().left;

	fixedForumInfoDiv.css({
		width: forumInfoDivWidth,
		padding: forumInfoDivPadding
	});

	fixedDigestThreadsDiv.css({
		width: digestThreadsDivWidth,
		padding: digestThreadsDivPadding,
		left: digestThreadsDivLeft
	});
}

function displayAside() {
	if($(window).width() < 992) {
		$('#topB').hide();
		fixedForumInfoDiv.hide();
		fixedDigestThreadsDiv.hide();
	} else {
		$('#topB').show();
		initPosition();
		var forumInfoHeight = forumInfoDiv.height();
		var digestThreadsHeight = digestThreadsDiv.height();
		var scrollTop = $(window).scrollTop();

		if(scrollTop > forumInfoHeight) {
			fixedForumInfoDiv.show();
		} else {
			fixedForumInfoDiv.hide();
		}
		if(scrollTop > digestThreadsHeight) {
			fixedDigestThreadsDiv.show();
		} else {
			fixedDigestThreadsDiv.hide();
		}
	}

}


function fastVisit(value) {
	if(!value) return;
	var arr = value.split(':');
	if(arr.length !== 2) return;
	var fid = arr[1];
	window.location.href = '/f/' + fid;
}

window.onresize = function() {
	displayAside()
};