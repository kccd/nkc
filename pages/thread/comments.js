var editor = {};

function postComment(tid, pid, firstInput) {
  var postContainer = $(".edit_"+pid+"_container");
  if(!postContainer.length) return;
  var editContainer = $(".edit_"+pid+"_container_input");
  if(!editContainer.length) return;
  if(editContainer.html()) {
    if(postContainer.is(":hidden")) {
      return postContainer.show();
    } else if(!firstInput) {
      return postContainer.hide();
    } else {
      return;
    }
  }
  var subBtn = $('<button class="btn btn-primary btn-sm" onclick="submitPostComment(\''+tid+'\', \''+pid+'\', '+firstInput+')">提交</button>');
  var btnDiv = $("<div class='text-right m-t-05 m-b-1'></div>");
  if(!firstInput) {
    var quitBtn = $('<button class="btn btn-default btn-sm m-r-05" onclick="closePostComment(\''+pid+'\')">取消</button>');
    btnDiv.append(quitBtn);
  }
  btnDiv.append(subBtn);
  var editDom = $("<div id='edit_"+pid+"' class='m-t-1 m-b-05'></div>");
  editContainer.append(editDom, btnDiv);
  if(editor[pid] && editor[pid].destroy) {
    editor[pid].destroy();
  }
  editor[pid] = UE.getEditor('edit_' + pid, NKC.configs.ueditor.commentConfigs);
  postContainer.show();
}

function closePostComment(pid) {
  $(".edit_"+pid+"_container").hide();
}

function submitPostComment(tid, pid, firstInput) {
  var content = editor[pid].getContent();
  nkcAPI("/t/" + tid, "POST", {
    postType: "comment",
    post: {
      c: content,
      l: "html",
      parentPostId: pid
    }
  })
    .then(function(data) {
      var comment = data.comment;
      var parentPost = comment.parentPost;
      var html = data.html;
      if(data.level1Comment) {
        viewPostComments(tid, pid, 999999, function() {
          screenTopAlert("评论成功");
          if(!firstInput) closePostComment( pid);
          NKC.methods.markDom($("#post_comment_" + data.comment.pid + ">.highlight"));
          NKC.methods.scrollToDom($("#post_comment_" + data.comment.pid));
          editor[pid].execCommand('cleardoc');
        });
      } else {
        var postComments = $("#post_comments_div_" + parentPost.pid);
        var postComment = $("#post_comment_" + parentPost.pid);
        if(!postComments.length) {
          if(!postComment.length) return;
          /*postComments = $("<div class='post-comments' id='post_comments_div_"+parentPost.pid+"'></div>");
          postComment.find(".edit_"+parentPost.pid+"_container").before(postComments);*/
          postComments = $("<div class='post-comments' id='post_comments_div_"+parentPost.pid+"'></div>");
          postComment.append(postComments);
        }
        postComments.append(html);
        screenTopAlert("评论成功");
        if(!firstInput) closePostComment( pid);
        NKC.methods.markDom($("#post_comment_" + data.comment.pid + ">.highlight"));
        NKC.methods.scrollToDom($("#post_comment_" + data.comment.pid));
        editor[pid].execCommand('cleardoc');
        initUserPanel();
      }
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

var comments = {};

function viewPostComments(tid, pid, page, callback) {
  var commentsDiv = $("#post_comments_" + pid);
  commentsDiv.show();
  postComment(tid, pid, true);
  $(".show_comments_button_" + pid).hide();
  $(".hide_comments_button_" + pid).show();
  var url = "/p/" + pid;
  if(page) {
    url = "/p/" + pid + "?page=" + page;
  }
  nkcAPI(url, "GET")
    .then(function(data) {
      var html = data.html;
      var buttonValue = data.paging.buttonValue;
      comments[pid] = html?html:" ";
      commentsDiv.html(html);
      var pagingDom = createPageDom(buttonValue, tid, pid);
      commentsDiv.prepend(pagingDom);
      commentsDiv.append(pagingDom.clone());
      $(".dropdown-menu.stop-propagation").on("click",function (e) {
        e.stopPropagation();
      });
      if(callback) callback();
      if(NKC.methods.initVideo) {
        setTimeout(function() {
          NKC.methods.initVideo();
        }, 300);
        
      }
      initUserPanel();
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

function createPageDom(buttonValue, tid, pid) {
  var dom = $("<div class='paging-button post-comments-page'></div>");
  for(var i = 0; i < buttonValue.length; i++) {
    var b = buttonValue[i];
    var btn;
    var klass = "";
    if(i === 0) {
      klass = "radius-left"
    }
    if(i === (buttonValue.length - 1)) {
      klass = "radius-right"
    }
    if(b.type === "active") {
      klass += " active";
    }
    if(b.type === "null") {
      btn = $("<a class='pointer button "+klass+"' >...</a>");
    } else {
      btn = $('<a onclick="viewPostComments(\''+ tid +'\', \''+ pid +'\', ' + b.num + ')" class="pointer button '+ klass+'">'+(b.num + 1)+'</a>');
    }
    dom.append(btn);
  }
  return dom;
}

function hidePostComments(pid) {
  $(".show_comments_button_" + pid).show();
  $(".hide_comments_button_" + pid).hide();
  closePostComment(pid);
  $("#post_comments_" + pid).hide();

}
// 新生成的dom，注册事件
function initUserPanel() {
  if(!window.floatUserPanel) return;
  floatUserPanel.initPanel()
}