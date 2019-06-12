var editor = {};

function postComment(tid, pid, firstInput) {
  var postContainer = $(".edit_"+pid+"_container");
  if(!postContainer.length) return;
  if(postContainer.html()) {
    if(postContainer.is(":hidden")) {
      return postContainer.show();
    } else {
      return postContainer.hide();
    }

  }
  var subBtn = $('<button class="btn btn-primary btn-sm" onclick="submitPostComment(\''+tid+'\', \''+pid+'\', '+firstInput+')">提交</button>');
  var btnDiv = $("<div class='text-right m-t-05'></div>");
  if(!firstInput) {
    var quitBtn = $('<button class="btn btn-default btn-sm m-r-05" onclick="closePostComment(\''+pid+'\')">取消</button>');
    btnDiv.append(quitBtn);
  }
  btnDiv.append(subBtn);
  var editDom = $("<div id='edit_"+pid+"' class='m-t-1 m-b-05'></div>");
  postContainer.append(editDom, btnDiv);
  editor[pid] = UE.getEditor('edit_' + pid, {
    toolbars: [
      [
        'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'blockquote', 'horizontal', 'superscript', 'subscript', '|', 'fontsize', 'forecolor', 'backcolor',  '|', 'indent', '|','link', 'unlink', '|', 'emotion', 'inserttable', '|' ,'removeformat', 'pasteplain', '|', 'justifyleft', 'justifycenter', 'justifyright', '|'
      ]
    ],
    maximumWords: 200, // 最大字符数
    initialFrameHeight: 100, // 编辑器高度
    autoHeightEnabled:false, // 编辑器是否随着行数增加而自动长高
    scaleEnabled: false, // 是否允许拉长
    topOffset: 0, // toolbar工具栏在滚动时的固定位置
    //- imagePopup: false, // 是否开启图片调整浮层
    //- enableContextMenu: false, // 是否开启右键菜单
    enableAutoSave: false, // 是否启动自动保存
    elementPathEnabled: false, // 是否显示元素路径
    imageScaleEnabled: false, // 启用图片拉伸缩放
  });
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
      markDiv("#post_comment_" + data.comment.pid);
      editor[pid].execCommand('cleardoc');
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

var comments = {};

function viewPostComments(tid, pid) {
  var commentsDiv = $("#post_comments_" + pid);
  commentsDiv.show();
  postComment(tid, pid, true);
  $(".show_comments_button_" + pid).hide();
  $(".hide_comments_button_" + pid).show();
  nkcAPI("/p/" + pid, "GET")
    .then(function(data) {
      var html = data.html;
      comments[pid] = html?html:" ";
      commentsDiv.html(html);
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

function hidePostComments(pid) {
  $(".show_comments_button_" + pid).show();
  $(".hide_comments_button_" + pid).hide();
  closePostComment(pid);
  $("#post_comments_" + pid).hide();

}