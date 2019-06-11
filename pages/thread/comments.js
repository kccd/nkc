var editor = {};

function postComment(tid, pid) {
  var postContainer = $(".edit_"+pid+"_container");
  postContainer.addClass("m-b-1");
  if(postContainer.html()) {
    return postContainer.show();
  }
  var subBtn = $('<button class="btn btn-default btn-sm" onclick="submitPostComment(\''+tid+'\', \''+pid+'\')">提交</button>');
  var quitBtn = $('<button class="btn btn-default btn-sm" onclick="closePostComment(\''+pid+'\')">取消</button>');
  var editDom = $("<div id='edit_"+pid+"' class='m-t-1 m-b-05'></div>");
  postContainer.append(editDom, subBtn, quitBtn);
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

function submitPostComment(tid, pid) {
  var content = editor[pid].getContent();
  nkcAPI("/t/" + tid, "POST", {
    post: {
      c: content,
      l: "html",
      parentPostId: pid
    }
  })
    .then(function() {
      screenTopAlert("评论成功");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

var comments = {};

function viewPostComments(pid) {
  var commentsDiv = $("#post_comments_" + pid);
  commentsDiv.show();
  $(".show_comments_button_" + pid).hide();
  $(".hide_comments_button_" + pid).show();
  if(comments[pid]) {
    return;
  }
  nkcAPI("/p/" + pid + "/post", "GET")
    .then(function(data) {
      var html = data.html;
      if(!html) return;
      commentsDiv.html(html);
      comments[pid] = html;
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

function hidePostComments(pid) {
  $(".show_comments_button_" + pid).show();
  $(".hide_comments_button_" + pid).hide();
  $("#post_comments_" + pid).hide();
}