$(function() {
  var easyPost = new EasyPost();
  easyPost.init();
  var editor = geid('content');
  var proxy = geid('proxy');
  proxy.addEventListener('click', function(e) {
    replace_selection(editor, e.target.getAttribute('data-unicode'), true)
  })
});

function get_selection(the_id)
{
  var e = typeof(the_id)=='String'? document.getElementById(the_id) : the_id;

  //Mozilla and DOM 3.0
  if('selectionStart' in e)
  {
    var l = e.selectionEnd - e.selectionStart;
    return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
  }
  //IE
  else if(document.selection)
  {
    e.focus();
    var r = document.selection.createRange();
    var tr = e.createTextRange();
    var tr2 = tr.duplicate();
    tr2.moveToBookmark(r.getBookmark());
    tr.setEndPoint('EndToStart',tr2);
    if (r === null || tr === null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
    var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in the length
    var text_whole = e.value.replace(/[\r\n]/g,'.');
    var the_start = text_whole.indexOf(text_part,tr.text.length);
    return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
  }
  //Browser not supported
  else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
}

function replace_selection(the_id,replace_str,setSelection)
{
  var e = typeof(the_id)==='string'? document.getElementById(the_id) : the_id;
  selection = get_selection(the_id);
  var start_pos = selection.start;
  var end_pos = start_pos + replace_str.length;
  e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
  if(setSelection)set_selection(the_id,end_pos,end_pos);
  return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
}

function set_selection(the_id,start_pos,end_pos)
{
  var e = typeof(the_id)==='string'? document.getElementById(the_id) : the_id;

  //Mozilla and DOM 3.0
  if('selectionStart' in e)
  {
    e.focus();
    e.selectionStart = start_pos;
    e.selectionEnd = end_pos;
  }
  //IE
  else if(document.selection)
  {
    e.focus();
    var tr = e.createTextRange();

    //Fix IE from counting the newline characters as two seperate characters
    var stop_it = start_pos;
    for (i=0; i < stop_it; i++) if( e.value.charAt(i).search(/[\r\n]/) !== -1 ) start_pos = start_pos - .5;
    stop_it = end_pos;
    for (i=0; i < stop_it; i++) if( e.value.charAt(i).search(/[\r\n]/) !== -1 ) end_pos = end_pos - .5;

    tr.moveEnd('textedit',-1);
    tr.moveStart('character',start_pos);
    tr.moveEnd('character',end_pos - start_pos);
    tr.select();
  }
  return get_selection(the_id);
}

var EasyPost = function() {
  this.parents = geid('parents');
  this.children = geid('children');
  this.post = geid('post');
  this.title = geid('title');
  this.content = geid('content');
  //this.onlyM = geid('onlyM');
  this.postController = geid('postController');
  this.easyPost = geid('easyPost');
  this.goEditor = geid('goEditor');
};
EasyPost.prototype.init = function() {
  var self = this;
  nkcAPI('getForumsList', {})
    .then(function(result) {
      var path = window.location.pathname.match(/^\/(.)\/(\w+)/);
      if(path && path[1] === 'm') {
        self.type = 'm';
        self.mid = path[2];      //temp of the path key
        self.key = path[2];     //real target key when posting
      }
      else{
        self.type = 'f';
      }
      self.uid = result.uid;
      if(path && path[1] === 'f') {
        self.id = path[2];
      }
      return groupingForums(result.forumsList, self);
    })
    .then(function() {
      var parents = self.parents;
      var forumsList = self.forumsList;
      for(var i in forumsList) {
        parents.appendChild(createOption(forumsList[i].display_name));
      }
      for(var i in forumsList) {
        if(forumsList[i]._key === self.id) {
          parents.value = forumsList[i].display_name;
          parentsOnChange(self)();
          return
        }
        for(var j in forumsList[i].children) {
          if(forumsList[i].children[j]._key == self.id) {
            parents.value = forumsList[i].display_name;
            parentsOnChange(self)();
            return forumsList[i].children[j].display_name
          }
        }
      }
    })
    .then(function(value) {
      if(value) {
        self.children.value = value;
        childrenOnChange(self)();
      }
    })
    .catch(function(e) {
      console.log(e);
    });
  //geid('onlyM').onchange = onlyMOnChange(self);
  parents.onchange = parentsOnChange(self);
  children.onchange = childrenOnChange(self);
  post.onclick = onPost(self);
  self.goEditor.onclick = onGoEditor(self);
  easyPost.addEventListener('focusin', easyPostFocusIn(self));
  easyPost.addEventListener('focusout', easyPostFocusOut(self));
  $('#postController').hide();
};


var easyPostFocusIn = function(that) {
  return function(e) {
    e.stopPropagation();
    that.title.placeholder = '标题';
    if(window.__TIMEOUT) {
      clearTimeout(window.__TIMEOUT);
    }
    $('#postController').show('fast');
  }
};

var easyPostFocusOut = function(that) {
  return function(e) {
    e.stopPropagation();
    that.title.placeholder = '发一个新帖吧';
      __TIMEOUT = setTimeout(function () { //如果直接使用hide会出现问题
        if(!that.hasOwnProperty(document.activeElement)) {
          $('#postController').hide('fast');
        }
      }, 200);
  }
};

var childrenOnChange = function(that) {
  return function() {
    var result;
    var forumsList = that.forumsList;
    var chosenParent = that.parents.value;
    var chosenChild = that.children.value;
    for(var i in forumsList) {
      if(forumsList[i].display_name === chosenParent) {
        var parent = forumsList[i];
        for(var j in parent.children) {
          if(parent.children[j].display_name === chosenChild) result = parent.children[j]._key;
        }
      }
    }
    if(!result) {
      that.key = undefined;
      screenTopWarning('在当前学院下未找到所选专业,请重新选择.');
    }
    else {
      that.key = result;
      that.forumID = result;
    }
  }
};

var parentsOnChange = function(that) {
  return function() {
    var value = that.parents.value;
    var forumsList = that.forumsList;
    var children = that.children;
    for(var i in forumsList) {
      if(forumsList[i].display_name === value) {
        var childNodes = children.childNodes;
        //remove all childNodes except the first one '请选择一个专业'
        for(; childNodes.length > 3;) { //node.childNodes is a live collection.
          //keep the first two & last one elements
          //console.log('del -> ' + childNodes.length +
          children.removeChild(childNodes[childNodes.length - 2])
          //.innerHTML);
        }
        //append new
        var last = children.lastChild;
        for(var j in forumsList[i].children) {
          //console.log('add -> ' +
          children.insertBefore(createOption(forumsList[i].children[j].display_name), last)
          //.innerHTML);
        }
      }
    }
  }
};

// var onlyMOnChange = function(that) {
//   return function() {
//     if(this.checked) {
//       that.parents.setAttribute('disabled', 'disabled');
//       that.children.setAttribute('disabled', 'disabled');
//       that.type = 'm';
//       that.key = that.uid;
//     }
//     else {
//       that.parents.removeAttribute('disabled');
//       that.children.removeAttribute('disabled');
//       that.type = 'f';
//       that.key = that.forumID;
//     }
//   }
// };

var onPost = function(that) {
  return function() {
    var content = that.content.value;
    var title = that.title.value.trim();
    var target;
    if(that.type === 'm') {
      target = that.type + '/' + that.mid;
    }
    else {
      target = that.type + '/' + that.key;
    }
    var language = gv('lang').toLowerCase().trim();
    //var onlyM = that.onlyM.checked;
    var postObj;
    if (content === '') {
      screenTopWarning('请填写内容。');
      return;
    }
    if (title === '') {
      screenTopWarning('请填写标题。');
      return;
    }
    if (geid('parseURL').checked) {
      if (language === 'markdown') {
        content = common.URLifyMarkdown(content);
      }
      if (language === 'bbcode' || language === 'pwbb') {
        content = common.URLifyBBcode(content);
      }
    }
    var post = {
      t: title,
      c: content,
      l: language
    };
    // if(onlyM) {
    //   postObj = {
    //     post: post,
    //     target: 'm/' + that.uid
    //   }
    // }
    // else {
      if (target === 'f/undefined') {
        screenTopWarning('未指定正确的发送目标, 请选择正确的学院 -> 专业');
        return;
      }
      postObj = {
        target: target,
        post: post
      };
      if(that.type === 'm') {
        if(that.forumID)
          postObj.forumID = that.forumID;
        else {
          screenTopWarning('未指定正确的发送目标, 请选择正确的学院 -> 专业')
          throw 'no forum id specify'
        }
      }
    //}
    that.post.className = 'btn btn-primary disabled';
    return nkcAPI('postTo', postObj)
      .then(function (result) {
        var redirectTarget = result.redirect;
        redirect(redirectTarget ? redirectTarget : '/' + target);
      })
      .catch(function (err) {
        jwarning(err.detail);
        that.post.className = 'btn btn-primary';
      })
  }
};

var onGoEditor = function(that) {
  return function() {
    var url;
    var content = that.content.value;
    var type = that.type;
    var key;
    if(type === 'm') {
      key = that.mid;
      if(!that.forumID) {
        screenTopWarning('未指定正确的发送目标, 请选择正确的学院 -> 专业');
        return
      }
      url = '/editor?content=' + content + '&target=' + type + '/' + key + '&forumID=' + that.forumID;
      window.location.href = url;
    }
    else {
      key = that.key;
      if(!key) {
        screenTopWarning('未指定正确的发送目标, 请选择正确的学院 -> 专业');
        return;
      }
      url = '/editor?content=' + content + '&target=' + type + '/' + key;
      window.location.href = url;
    }
  }
};

var groupingForums = function(forumsList, that) {
  var group1;
  var group2;
  for(var index in forumsList) {
    var group = forumsList[index];
    if(group.parent == null) {
      group1 = group.group;
    }
    if(group.parent === '0') {
      group2 = group.group;
    }
  }
  that.forumsList = group1.concat(group2);
  for(var index in forumsList) {
    for(var i in that.forumsList) {
      if(forumsList[index].parent === that.forumsList[i]._key) {
        that.forumsList[i].children = forumsList[index].group;
      }
    }
  }
  that.forumsList.sort(function(a, b) {
    return a.order - b.order;
  });
  for(var i in that.forumsList) {
    if(that.forumsList[i].children)
    that.forumsList[i].children.sort(function(a, b) {
      return a.order - b.order;
    })
  }
};

var createOption = function(text) {
  var textNode = document.createTextNode(text);
  var option = document.createElement('option');
  option.appendChild(textNode);
  return option;
};


/**
 * Created by lzszo on 2017/5/11.
 */
