$(document).ready(function() {
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

var nkc_editor = function(){
  var editor = {};

  editor.assemblePostObject = function(){
    var post = {
      t:gv('title').trim(),
      c:gv('content'),
      l:gv('lang').toLowerCase().trim(),
      cat:gv('cat').trim()
    }


    if(post.t=='')post.t=undefined

    return post
  }

  editor.submit = function(){
    var post = editor.assemblePostObject()

    var target = gv('target').trim();

    if(post.c==''){screenTopWarning('请填写内容。');return;}
    if(target==''){screenTopWarning('请填写发表至的目标。');return;}

    if(geid('ParseURL').checked){
      if(post.l=='markdown'){
        post.c = common.URLifyMarkdown(post.c)
      }
      if(post.l=='bbcode'||post.l=='pwbb'){
        post.c = common.URLifyBBcode(post.c)
      }
    }

    //alert(JSON.stringify(post) )
    geid('post').disabled = true
    return nkcAPI('postTo',{
      target:target,
      post:post,
      forumID: geid('forumID').innerHTML
    })
    .then(function(result){
      var redirectTarget = result.redirect;
      redirect(redirectTarget?redirectTarget:'/'+target)
    })
    .catch(function(err){
      jwarning(err.detail)
      geid('post').disabled = false
    })
  }

  var debounce_timer;

  editor.trigger = function(e){
    if(debounce_timer){
      clearTimeout(debounce_timer)
    }
    debounce_timer = setTimeout(function(){
      editor.update()
    },300)
  }

  var extract_resource_from_tag = function(text){
    // this function extract resource tags from text,
    // then find matches in list.rlist(the uploaded resources array)

    if(!render||!render.resource_extractor)return undefined;
    if(!list||!list.rlist)return undefined;

    var arr = text.match(render.resource_extractor)
    if(!arr)return undefined

    var rarr = []
    arr.map(function(item){
      var reskey = item.replace(render.resource_extractor,'$1')
      list.rlist.map(function(item){
        if(item._key==reskey){
          rarr.push(item)
        }
      })
    })
    //
    // for(i in arr){
    //   var reskey = arr[i].replace(render.resource_extractor,'$1')
    //   for(k in list.rlist){
    //     if(list.rlist[k]._key==reskey){
    //       rarr.push(list.rlist[k])
    //     }
    //   }
    // }

    return rarr
  }

  editor.update = function(){

    var post = editor.assemblePostObject()
    post.r = extract_resource_from_tag(post.c)

    var title = post.t||""
    if(!title.length){
      title='标题为空'
      geid('parsedtitle').style.color='#ccc'
    }
    else{
      geid('parsedtitle').style.color='initial'
    }

    hset('parsedtitle',title); //XSS prone.

    var content = post.c
    var parsedcontent = '';

    parsedcontent = render.experimental_render(post)

    hset('parsedcontent',parsedcontent);
  }

  //enable click
  geid('title').addEventListener('keyup', editor.trigger);
  //enable click
  geid('content').addEventListener('keyup', editor.trigger);

  geid('post').addEventListener('click', editor.submit);
  geid('lang').addEventListener('change',editor.update);

  return editor;
}

function mathfresh(){
  if(MathJax){
    MathJax.Hub.PreProcess(geid('parsedcontent'),function(){MathJax.Hub.Process(geid('parsedcontent'))})
  }
  if(hljs){
    ReHighlightEverything() //interface_common code highlight
  }
}

var editor = nkc_editor();
window.onload = editor.update

var screenfitted = false
function fitscreen(){
  var h = $(window).height().toString()+'px'

  geid('content').style.height = !screenfitted?h:'300px';
  geid('parsedcontent').style['max-height'] = !screenfitted?h:'800px';

  screenfitted = !screenfitted
}

/*
geid('btnGroup').onclick = btnGroupClick;

function btnGroupClick(event) {
  geid('lang').value = 'bbcode';
  switch(event.target.innerHTML) {
    case '黑体':
      insertStyle('[b][/b]', 3);
      break;
    case '链接':
      insertStyle('[url=http://网址]文字描述[/url]', 12, 14);
      break;
    case '公式':
      insertStyle('[cf][/cf]', 4);
      break;
    case '颜色':
      insertStyle('[color=red]内容[/color]', 7, 10);
      break;
    default:
      throw 'unknown button type!!!!';
  }
}

function insertStyle(content, start, end) {
  var end = end || start;
  var textArea = geid('content');
  var value = textArea.value;
  console.log(textArea.value);
  var position = textArea.selectionStart;
  var v1 = value.slice(0, position);
  var v2 = value.slice(position);
  textArea.value = v1 + content + v2;
  textArea.focus();
  textArea.selectionStart = position + start;
  textArea.selectionEnd = position + end;
}
*/
