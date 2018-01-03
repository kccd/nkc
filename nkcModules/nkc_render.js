var in_browser = (typeof document !== 'undefined');

//render source to HTML.
function nkc_render(options){
  var render = {};
  var commonmark;
  var plain_escape;
  var XBBCODE;
  var xss;
  var twemoji;
  if(in_browser){
    //browser mode
    //inclusion here done by <script>
    commonmark = window.commonmark;
    plain_escape = window.plain_escape;
    XBBCODE = window.XBBCODE;
    xss = window.filterXSS;
    twemoji = window.twemoji;
    console.log('nkc_render.js running in browser.');
  }else{
    commonmark = require('commonmark');
    plain_escape = require('../pages/plain_escaper');
    XBBCODE = require('xbbcode-parser');
    xss = require('xss');
    twemoji = require('twemoji');
  }

  //xss-----------------

  var default_whitelist = xss.whiteList;

  //console.log(default_whitelist);
  default_whitelist.font = ['color']
  default_whitelist.code = ['class']
  default_whitelist.span = ['class', 'style', 'aria-hidden'];
  default_whitelist.a = ['href', 'title', 'target', 'style'];
  default_whitelist.div = ['style'];
  default_whitelist.math = [];
  default_whitelist.semantics = [];
  default_whitelist.mrow = [];
  default_whitelist.msup = [];
  default_whitelist.mn = [];
  default_whitelist.annotation = ['encoding'];
  if(!in_browser){
    //default_whitelist.iframe = ['height','width','src','frameborder','allowfullscreen']
  }

  var xssoptions = {
    whiteList:default_whitelist,
    css: {
      whiteList: {
        position: /^fixed|relative$/,
        top: true,
        left: true,
        fontSize: true,
        display: true
      }
    },
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if(isWhiteAttr) {
        if(tag === 'a' && name === 'href') {
          var valueHandled = value.replace('javascript:', '');
          return "href=" + valueHandled;
        }
      }
    }
  }

  //according to liuhu's blame for inconvenience
  function linkAlienate(html){
    if(in_browser){
      return html
    }else{
      var cheerio = require('cheerio')
      var $ = cheerio.load(html)
      //for all <a> s
      $('a').each(function(i,elem){
        var href = $(elem).attr('href')
        if(href) {
          //check its href
          var isExternalLink =
            !(href.match(/kechuang\.org/i)||href.match(/^\/[^\/]/))
          //open in new window
          if(isExternalLink){
            $(elem).attr('target','_blank')
          }
        }
      })
      return $.html()
    }
  }
  var custom_xss = new xss.FilterXSS(xssoptions)
  var custom_xss_process = function(str){
    return custom_xss.process(str)
  }

  //markdown--------------------

  var commonreader = new commonmark.Parser();
  var commonwriter = new commonmark.HtmlRenderer({
    sourcepos:true,
    //safe:true, //ignore <tags>
  });

  render.commonmark_render = function(md){
    var parsed = commonreader.parse(md)
    var rendered = commonwriter.render(parsed)

    return rendered;
    //return custom_xss_process(rendered);
  }

  render.commonmark_safe = function(md){
    return custom_xss_process(render.commonmark_render(md))
  }

  //xbbcode------------------------

  XBBCODE.addTags({
    align:{
      openTag:function(params,content){
        var alignment = params.slice(1)
        return '<div style="display:block;text-align:'+alignment+';">'
      },
      closeTag:function(params,content){
        return '</div>'
      },
    },

    strike:{
      openTag:function(params,content){
        return '<s>'
      },
      closeTag:function(params,content){
        return '</s>'
      },
    },

    /*quote:{
      openTag: function(params,content) {
        var username = params?(params.length?'引用 ' + params.slice(1).split(',')[0]+':<br>':''):''

        return '<blockquote class="xbbcode-blockquote">'+username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },*/
    quote:{
      openTag: function(params,content) {
        params = params? params.slice(1).split(','): '';
        var username = '';
        if(!params || params.length !== 4) {
          username = params?(params.length?'引用 ' + params[2]+':<br>':''):''
        } else {
          username = '';
          if(params[1] !== '-1') {
            username = params?(params? '回复 '+params[2]+' 在 <a href="'+ params[0] + '#' + params[3] +'">'+params[1]+'楼</a> 的发言\n':''):'';
          } else {
            username = params?(params? '回复 '+params[2]+' 的发言\n':''):'';
          }
        }
        return '<blockquote class="xbbcode-blockquote">' + username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },

    "code": {
      openTag: function(params,content) {
        //for phpwind compatibility
        //consider following input: [code brush:cpp;toolbar:false;]

        var class_string = params?params.match(/brush\:([a-zA-Z0-9]{1,19})/):null
        class_string = class_string?class_string[1]:''

        return '<pre><code class="lang-'+class_string+'">' + content.replace(/\n/g,'{#newline#}');
      },
      closeTag: function(params,content) {
        return '</code></pre>';
      },
      noParse: true,
      displayContent:false,
    },

    b:{
      openTag:function(){
        return '<b>'
      },
      closeTag:function(){
        return '</b>'
      }
    },

    size:{
      openTag:function(params,content){
        var color = params.slice(1)

        return '<font size='+ color +'>'
      },
      closeTag:function(){
        return '</font>'
      }
    },

    font:{
      openTag:function(params,content){
        var fontstr = params.slice(1)

        return '<font face='+ fontstr +'>'
      },
      closeTag:function(){
        return '</font>'
      }
    }

  })

  render.plain_render = plain_escape;


  // 论坛化学式转换器模块，由bbs.kechuang.org上的acmilan制作，复制时请保留本行和下一行。
  // Forum's Chemical Formula Converter. Made by acmilan in bbs.kechuang.org. Copy with this line and the previous line.
  // 1.1版，解决了上标内存泄露问题
  // 1.2版，解决了字符串尾内存泄露问题
  // 1.3版，解决了尾下标不正确问题
  // now modified by novakon for nkc project
  function chemFormulaConverter(inputString)
  {
    // 初始化临时字符串
    newString=inputString
    // 检验是否转换过
    // 替换点号
    newString=newString.replace(/\&/g,'·')
    .replace(/\~/g,'↑')
    .replace(/\!/g,'↓')

    // 插入下标代码
    oldString=newString;
    newString="";
    index=0;
    while(oldString!="")
    {
      index1=oldString.search(/[a-z\)]\d+/i)+1;
      if(index1<=0)
      {
        break;
      }
      index2=index1+oldString.substring(index1).search(/\D/);
      if(index2-index1<=0)
      {
        index2=oldString.length
      }
      newString+=oldString.substring(0,index1);
      newString+="[sub]"
      newString+=oldString.substring(index1,index2);
      newString+="[/sub]"
      oldString=oldString.substring(index2);
    }
    newString+=oldString;
    // 插入上标代码
    oldString=newString;
    newString="";
    while(oldString!="")
    {
      index1=oldString.search(/\^/);
      if(index1<0)
      {
        break;
      }
      index2=index1+oldString.substring(index1).search(/[\+\-]/);
      if(index2-index1<=0)
      {
        index2=oldString.length
      }
      newString+=oldString.substring(0,index1);
      newString+="[sup]";
      newString+=oldString.substring(index1+1,index2+1);
      newString+="[/sup]"
      oldString=oldString.substring(index2+1);
    }
    newString+=oldString

    return newString;
  }

  function chemFormulaReplacer(html){
    return html.replace(/\[cf]([^]+?)\[\/cf]/g,function(match,p1) {
      return chemFormulaConverter(p1)
    })
  }

  render.hiddenReplaceHTML = function(text){
    return text.replace(/\[hide=([0-9]{1,3}).*?]([^]*?)\[\/hide]/gm, //multiline match
    function(match,p1,p2,offset,string){
      var specified_xsf = parseInt(p1)
      var hidden_content = p2

      //return '[hide='+specified_xsf+']'+hidden_content+'[/hide]'

      return '<div class="nkcHiddenBox">'
      +'<div class="nkcHiddenNotes">'+'浏览这段内容需要'+specified_xsf.toString()+'学术分'+'</div>'
      +'<div class="nkcHiddenContent">'+hidden_content+'</div>'
      +'</div>'
    })
  }


  var getHTMLForResource = function(r,allthumbnail){
    var rid = r.rid
    var oname_safe = plain_escape(r.oname)
    var filesize = r.size

    var k = function(number){

      return (number || 0).toPrecision(3)
    }

    var hits = r.hits?r.hits.toString()+'次':'';

    var fileSizeString = (filesize>1024)?((filesize>1048576)?k(filesize/1048576)+'M':k(filesize/1024)+'k'):k(filesize)+'b'

    var extension = r.ext

    var replaced = ''

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'png':
      case 'svg':

      case 'bmp': //for S.D.P's post
      if(!allthumbnail)replaced =
      '<a href="/r/'+rid+'" target="_blank" title="'+oname_safe+'"><img class="PostContentImage" alt="'+rid+'" src="/r/'+rid+'" /></a><br/>'

      if(allthumbnail){
        replaced =
        '<div class="PostResourceDownload" style="width:100%;display:block;word-break:break-all;word-wrap:break-word;">'
        +'<a class="PostResourceDownloadLink" href="/r/'+rid+'" >'
        +'<img class="PostResourceDownloadThumbnail" src="/rt/'+rid+'"/>'+oname_safe+'</a>'
        +'<span class="PostResourceFileSize">'+fileSizeString+'</span>'
        +'</div>'
      }

      break;
      //audio section
      case 'mp3':
      case 'mid':
      case 'wma':
      case 'ogg':
      replaced =
      '<a href="/r/'+rid+'" >'+oname_safe+'</a><br><audio src="/r/'+rid+'" controls preload="none">你的浏览器可能不支持audio标签播放音乐。升级吧。</audio>'

      break;

      case 'mp4'://these are standards
      case 'webm':
      case 'ogg':
      replaced =
      '<a href="/r/'+rid+'" >'+oname_safe+'</a><br><video src="/r/'+rid+'" controls preload="none">你的浏览器可能不支持video标签播放视频。升级吧。</video>'

      break;

      default: replaced =
      '<div class="PostResourceDownload" style="width:100%;display:block;word-break:break-all;word-wrap:break-word;">'
      +'<a class="PostResourceDownloadLink" href="/r/'+rid+'" >'
      +'<img class="PostResourceDownloadThumbnail" src="/default/default_thumbnail.png"/>'+oname_safe+'</a>'
      +'<span class="PostResourceFileSize">'+fileSizeString+'</span>' + '<span class="PostResourceCounter">'+hits+'</span>'
      +'</div>';
    }

    return replaced
  }

  render.resource_extractor = /\#\{r=([0-9a-z]{1,16})\}/g

  //replace attachment tags in text to their appropriate HTML representation
  var attachment_filter = function(stringToFilter,post){
    //console.log(stringToFilter);
    return stringToFilter.replace(render.resource_extractor,function(match,p1,offset,string){
      var rid = p1
      for(var i in post.resources){
        var r = post.resources[i]
        if(r.rid===rid){
          r._used = true;
          return getHTMLForResource(r)
        }
      }
      return plain_escape('(附件:' + rid + ')')
    })
  }

  var pwbb_experimental = function(post,isHTML){
    var content = post.c||''
    
    var html = ''

    if(!isHTML){  //bbcode
      html = chemFormulaReplacer(content)
      html =
      XBBCODE.process({
        text:html,
        escapeHtml:true,
      })

      .html
      .replace(/&#91;/g,'[')
      .replace(/&#93;/g,']')
      .replace(/\[[/]{0,1}backcolor[=#a-zA-Z0-9]{0,16}]/g,'')

      // for history reasons..
      .replace(/\n/g,'<br>')
      .replace(/\{#newline#}/g,'\n')
      .replace(/\[attachment=([0-9]{1,16})\]/g,'#{r=$1}')
      //.replace('http:','')
      .replace(/\[flash.*?](.+.*?)\[\/flash]/gi,
      //'<embed class="PostEmbedFlash" src="$1" allowFullScreen="true" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>')
      '<a href="$1" target="_blank" style="font-size:20px;">点击此处查看视频</a>')
      .replace(/\[(\/?)strike]/g,'<$1s>')
      .replace(/  /g,'&nbsp&nbsp')
      html = attachment_filter(html,post)
      // now post.r are marked with _used:true
    }
    else{
      html = custom_xss_process(content)
    }
    html = render.hiddenReplaceHTML(html)
    // fix for older posts where they forgot to inject attachments.
    var count = 0
    for(var i in post.resources){
      var r = post.resources[i]
      if(!r._used){
        var allthumbnail = true
        if(count==0){
          html+='<hr class="HrPostContentUnusedAttachment"/>'
          count++;
        }

        if(count>=50)throw '[nkc_render]too much attachment included! refuse to process.'

        html+=getHTMLForResource(r,allthumbnail)
      }
    }
    return html
  }

  var markdown_experimental = function(post){
    var content = post.c;
    var parsed = commonreader.parse(content);
    var rendered = commonwriter.render(parsed)
    rendered = attachment_filter(rendered,post)

    rendered= custom_xss_process(rendered);

    rendered = render.hiddenReplaceHTML(rendered);
    return rendered;
  }

  render.experimental_render = function(post){
    var content = post.c||''
    var lang = post.l||''
    var renderedHTML = ''
    switch (lang) {
      case 'html':
      renderedHTML = pwbb_experimental(post,true) //straight thru html
      break;

      case 'pwbb':
        renderedHTML = pwbb_experimental(post,false)
        break;

      case 'bbcode':
      renderedHTML = pwbb_experimental(post,false)
      break;

      case 'markdown':
      renderedHTML = markdown_experimental(post)
      break;0

      default:
      renderedHTML = plain_escape(content)
    }
    renderedHTML = twemoji.parse(renderedHTML, {
      folder: '/2/svg',
      base: '/twemoji',
      ext: '.svg'
    });
    renderedHTML = linkAlienate(renderedHTML) //please check linkAlienate()
    var atUsers = post.atUsers;
    if(atUsers && atUsers.length > 0) {
      for(var user of atUsers) {
        var matchSpace = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + ' ';
        //双空格会产生奇怪转义
        var matchSpecial = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + '&#xA0;';
        var matchEnter = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + '<br>';
        renderedHTML = renderedHTML.replace(matchSpace, '<a href="/m/' + user.uid + '">' + matchSpace + '</a>');
        renderedHTML = renderedHTML.replace(matchSpecial, '<a href="/m/' + user.uid + '">' + matchSpecial + '</a>')
        renderedHTML = renderedHTML.replace(matchEnter, '<a href="/m/' + user.uid + '">' + matchEnter + '</a>')
      }
    }
    return renderedHTML
  }

  return render;
}

var render = nkc_render();

if(in_browser){
}else{
  module.exports = render;
}
