var in_browser = (typeof document !== 'undefined');

//render source to HTML.
function nkc_render(options){
  var render = {};
  var commonmark;
  var plain_escape;
  var XBBCODE;
  var xss;
  var twemoji;
  var tools;
  if(in_browser){
    //browser mode
    //inclusion here done by <script>
    commonmark = window.commonmark;
    plain_escape = window.plain_escape;
    XBBCODE = window.XBBCODE;
    xss = window.filterXSS;
    twemoji = window.twemoji;
    tools = NKC.methods.tools;
  }else{
    commonmark = require('commonmark');
    plain_escape = require('../pages/plain_escaper');
    XBBCODE = require('xbbcode-parser');
    xss = require('xss');
    twemoji = require('twemoji');
    tools = require("./tools");
  }

  //xss-----------------
  //xss白名单 .标签 = ["属性"]
  var default_whitelist = xss.whiteList;
  default_whitelist.font = ['color']
  default_whitelist.code = ['class']
  default_whitelist.span = ['class', 'style', 'contenteditable', 'dataType'];
  default_whitelist.a = ['target', 'href', 'title', 'class', 'style', 'datatype'];
  default_whitelist.p = ['align','style'];
  default_whitelist.div = ['style','class','contenteditable'];
  default_whitelist.table = ['border','width','cellpadding','cellspacing'];
  default_whitelist.tbody = [];
  default_whitelist.tr = [];
  default_whitelist.th = ['width'];
  default_whitelist.td = ['width','valign','colspan','top','rowspan'];
  default_whitelist.video = ['src','controls','preload','style','poster'];
  default_whitelist.math = [];
  default_whitelist.semantics = [];
  default_whitelist.mrow = [];
  default_whitelist.msup = [];
  default_whitelist.mn = [];
  default_whitelist.annotation = ['encoding'];
  default_whitelist.iframe = ['width','height','src','frameborder','allowfullscreen'];
  default_whitelist.embed = [];
	default_whitelist.img = ['src','class'];
	default_whitelist.pre = ['class'];
	for(var i = 1; i <= 6; i++) {
		default_whitelist['h'+i] = ['style'];
	}
  if(!in_browser){
    //default_whitelist.iframe = ['height','width','src','frameborder','allowfullscreen']
  }

  //style白名单
  var xssoptions = {
    whiteList:default_whitelist,
    css: {
      whiteList: {
        position: /^fixed|relative$/,
        top: true,
        left: true,
        fontSize: true,
        display: true,
        "background-image": true,
        "font-weight":true,
        "font-size":true,
        "font-style":true,
        "text-decoration-line":true,
        "text-decoration": true,
        "background-color":true,
        "color":true,
        "font-family":true,
        "text-align":true,
        "text-indent":true,
        "padding-bottom":true,
        "padding-top":true,
        "padding-left":true,
        "padding-right":true,
        "height":true,
        "width":true,
        "vertical-align":true,
        "margin-top":true,
        "bottom":true,
        "word-spacing":true,
        "border-bottom":true,
        "max-width": true
      }
    },
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if(isWhiteAttr) {
        if(tag === 'a' && name === 'href') {
          var valueHandled = value.replace('javascript:', '');
          return 'href="' + valueHandled + '"';
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
    url: {
      openTag: function(params,content) {

        var myUrl;

        if (!params) {
            myUrl = content.replace(/<.*?>/g,"");
        } else {
            myUrl = params.substr(1);
        }
        if(myUrl.indexOf("http") == -1) {
          myUrl = "http://"+myUrl
        }

        return '<a href="' + myUrl + '">';
      },
      closeTag: function(params,content) {
          return '</a>';
      }
    },
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

    quote:{
      openTag: function(params,content) {
        var username = params?(params.length?'引用 ' + params.slice(1).split(',')[0]+':<br>':''):''

        return '<blockquote class="xbbcode-blockquote">'+username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },
	  //恢复旧版引用
    /*quote:{
      openTag: function(params,content) {
        params = params? params.slice(1).split(','): '';
        var username = '';
        if(!params || params.length !== 4) {
          username = params?(params.length?'引用 ' + params[2]+':<br>':''):''
        } else {
          username = '';
          if(params[1] !== '-1') {
            username = params?(params? '回复 '+params[2]+' 在 <a href="'+ params[0] + '&' + 'highlight=' + params[3] + '#' + params[3] +'">'+params[1]+'楼</a> 的发言\n':''):'';
          } else {
            username = params?(params? '回复 '+params[2]+' 的发言\n':''):'';
          }
        }
        return '<blockquote class="xbbcode-blockquote">' + username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },*/

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


  // 论坛化学式转换器模块，由www.kechuang.org上的acmilan制作，复制时请保留本行和下一行。
  // Forum's Chemical Formula Converter. Made by acmilan in www.kechuang.org. Copy with this line and the previous line.
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

  var getHTMLForResource = function(r, allthumbnail){
    var rid = r.rid

    var extension = r.ext.toLowerCase();

    var replaced = ''

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'png':
      case 'svg':

      case 'bmp': //for S.D.P's post
      // if(!allthumbnail)replaced =
      // '<a href="/r/'+rid+'" target="_blank" title="'+oname_safe+'"><img class="PostContentImage" alt="'+rid+'" src="/r/'+rid+'" /></a><br/>';
      replaced = '<img src="/r/'+rid+'" />';
      break;

      //audio section
      case 'mp3':
      case 'mid':
      case 'wma':
      case 'ogg':
      replaced = '<audio src="/r/'+rid+'"></audio>';
      break;

      case 'mp4'://these are standards
      case 'webm':
      case 'ogg':
      replaced = '<video src="/r/'+rid+'"></video>';

      break;

      default: replaced = '<a src="/r/'+rid+'"></a>';

      /* default: replaced =
      '<div class="PostResourceDownload" style="width:100%;display:block;word-break:break-all;word-wrap:break-word;">'
      +'<a class="PostResourceDownloadLink" href="/r/'+rid+'" >'
      +'<img class="PostResourceDownloadThumbnail" src="/default/default_thumbnail.png"/>'+oname_safe+'</a>'
      +'<span class="PostResourceFileSize">'+fileSizeString+'</span>' + '<span class="PostResourceCounter">'+hits+'</span>'
      +'</div>'; */
    }
    return replaced
  }

  render.resource_extractor = /\#\{r=([0-9a-z]{1,16})\}/g

  //replace attachment tags in text to their appropriate HTML representation
  var attachment_filter = function(stringToFilter,post){
    return stringToFilter.replace(render.resource_extractor,function(match,p1,offset,string){
      var rid = p1;
      for(var i in post.resources){
        var r = post.resources[i]
        if(r.rid === rid){
          r._used = true;
          return getHTMLForResource(r)
        }
      }
      return plain_escape('(附件:' + rid + ')')
    })
  }

  var pwbb_experimental = function(post, isHTML){
    var content = post.c || "";
    var html = "";
    
    if(!isHTML){  //bbcode
      // 公式渲染
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
      .replace(/\[flash.*?](.+.*?)\[\/flash]/gi, '<a href="$1" target="_blank" style="font-size:20px;">点击此处查看视频</a>')
      .replace(/\[(\/?)strike]/g,'<$1s>')
      .replace(/  /g,'&nbsp&nbsp')
      .replace(/\[url.*?](.+.*?)\[\/url]/gi, '<a href="$1">$1</a>')
      // 渲染为html
      html = attachment_filter(html, post)
    } else {
      //在这里做了style的过滤
      html = custom_xss_process(content)
    }
    html = render.hiddenReplaceHTML(html)
    // fix for older posts where they forgot to inject attachments.

    // 旧的处理方法 仅作参考
    // 添加附件下载次数 
    if(0 && post.l === "html"){
      var extArray = ['jpg','jpeg','gif','png','svg','bmp','mp3','mp4','wma','mid','ogg','webm'];
      for(var i in post.resources){
        var r = post.resources[i];
        var filesize = r.size;
        var k = function(number){
          return (number || 0).toPrecision(3)
        };
        var fileSizeString = (filesize>1024)?((filesize>1048576)?k(filesize/1048576)+'M':k(filesize/1024)+'k'):k(filesize)+'b';
        if(extArray.indexOf(r.ext) > -1){
          continue;
        }
        // 临时的解决办法，下载次数及文件大小的显示机制需要调整
        var oname = r.oname.replace(/\(/ig, "\\(");
        oname = oname.replace(/\)/ig, "\\)");
        oname = oname.replace(/\./ig, "\\.");

        var reg = new RegExp(oname + "</a>", 'gm');
        html = html.replace(reg, r.oname+'<span class="PostResourceFileSize">'+fileSizeString+'</span><span class="PostResourceCounter">'+r.hits+'次下载</span></a>')
      }
    }
    // html = html.replace(/<img src="\/r(.+?)">/img,'<a href="/r$1" target="_blank" title="pic"><img class="PostContentImage" alt="pic" src="/r$1" /></a>');
    // 如果是外站图片，在渲染时需要将图片替换成本站默认图
    var imgsArray = html.match(/<img.*?>/igm);
    if(imgsArray) {
      for(var im = 0; im < imgsArray.length; im++) {
        if(/http/igm.test(imgsArray[im])) {
          if(!/kechuang/igm.test(imgsArray[im])) {
            var newStr = '<img src="/default/picdefault.png" />';
            html = html.replace(imgsArray[im], newStr)
          }
        }
      }
    }
    html = html.replace(/<img\ssrc="https:\/\/www\.kechuang\.org\/r\/(.+?)".*?>/img,'<img src="/r/$1" />');
    // 如果是默认图片则跳过
    // html = html.replace(/\<img.*?src="\/default\/picdefault.png".+?\>/img, '');
    // html = html.replace(/\<img.*?src="\/r\/(.+?)".+?\>/img,'<img src="/r/$1" dataimg="content"/>');
    // html = html.replace(/\<img(.*?)\/>/img,'<img $1 dataimg="content"/>');
    
    // 精简图片dom
    // html = html.replace(/\<img\s+?src=['"]\/r\/([0-9]+?)['"].*?>/img, '<img src="/r/$1" />');
    html = html.replace(/<img\s.*?>/img, function(content) {
      return content.replace(/<img\s.*?src=['"]\/r\/([0-9]+?)['"].*?>/img, function(c, v1) {
        return '<img src="/r/'+v1+'" />';
      });
    });
    // 精简视频dom
    // html = html.replace(/\<video\s+?src=['"]\/r\/([0-9]+?)['"].*?>.*?\<\/video>/img, '<video src="/r/$1"></video>');
    html = html.replace(/<video\s.*?>.*?<\/video>/img, function(content) {
      return content.replace(/<video\s.*?src=['"]\/r\/([0-9]+?)['"].*?>.*?<\/video>/img, function(c, v1) {
        return '<video src="/r/'+v1+'"></video>';
      });
    });
    // 精简音频
    // html = html.replace(/\<audio\s+?src=['"]\/r\/([0-9]+?)['"].*?>.*?\<\/audio>/img, '<audio src="/r/$1"></audio>');
    html = html.replace(/<audio\s.*?>.*?<\/audio>/img, function(content) {
      return content.replace(/<audio\s.*?src=['"]\/r\/([0-9]+?)['"].*?>.*?<\/audio>/img, function(c, v1) {
        return '<audio src="/r/'+v1+'"></audio>';
      });
    });
    // 附件精简
    // html = html.replace(/\<a\s+?href=['"]\/r\/([0-9]+?)['"].*?>.*?\<\/a>/img, '<a href="/r/$1"></a>');
    html = html.replace(/<a\s.*?>.*?<\/a>/img, function(content) {
      return content.replace(/<a\s.*?href=['"]\/r\/([0-9]+?)['"].*?>.*?<\/a>/img, function(c, v1) {
        return '<a href="/r/'+v1+'"></a>';
      });
    });
    // html = html.replace(/\<img class=".*?" src="\/r\/(.+?)".+?\>/img,'<a class="wrap" data-magnify="gallery" data-group="g1" data-src="/r/$1"><img class="img-responsive" alt="pic" src="/r/$1" /></a>');
    return html
  };

  var markdown_experimental = function(post){
    var content = post.c;
    var parsed = commonreader.parse(content);
    var rendered = commonwriter.render(parsed);
    rendered = attachment_filter(rendered, post);

    rendered= custom_xss_process(rendered);

    rendered = render.hiddenReplaceHTML(rendered);
    return rendered;
  };

  // 渲染html中的资源文件dom
  // 这里只针对html，其他格式的数据应先渲染成html再经此函数处理
  // 函数通过标准媒体标签加url里的/r/或www.kechuang.org/r/识别
  // 图片 <img src="/r/rid" />
  // 视频 <video src="/r/rid"></video>
  // 音频 <audio src="/r/rid"></video>
  // 附件 <a href="/r/rid"></a>
  // @param {String} html 
  // @param {[Object]} resources 资源文件对象所组成的数组
  var renderResourceDom = function(html, resources) {
    var k = function(number){
      return (number || 0).toPrecision(3)
    };
    var getSize = function(filesize) {
      return (filesize>1024)?((filesize>1048576)?k(filesize/1048576)+'M':k(filesize/1024)+'k'):k(filesize)+'b'
    };
    return html
      // 图片处理
      .replace(/<img\ssrc="\/r\/([0-9]+?)" \/>/img, function(content, v1) {
        var resource = resources[v1];
        if(!resource) {
          resource = {
            width: 1920,
            height: 1080,
            oname: "图片已丢失"
          }
        }
        var lazyImgStr = '<img data-src="/r/' + v1 + '" class="lazyload" dataimg="content" alt="'+resource.oname+'"/>';
        var imgStr = '<img src="/r/' + v1 + '" dataimg="content" alt="'+resource.oname+'"/>';
        if(!resource.width || !resource.height) {
          return '<div class="article-img-body">'+imgStr+'</div>';
        }
        return '<div class="article-img-body" style="width: '+resource.width+'px;"><div class="article-img-content" style="padding-top: '+ 
        resource.height*100/resource.width +
        '%;">'+lazyImgStr+'</div></div>';
      })
      // 视频处理
      .replace(/<video\ssrc="\/r\/([0-9]+?)"><\/video>/igm, function(content, v1) {
        var resource = resources[v1];
        if(!resource) {
          return "（视频：" + plain_escape(v1) + "）";
        }
        // return '<div class="article-video-body">' + '</div>';
        return '<div class="article-video-body"><div>' +
        '<video class="plyr-dom" preload="none" controls poster="/frameImg/'+v1+
        '" data-plyr-title="'+resource.oname+'"' +
        '><source src="/r/'+v1+
        '" type="video/mp4"></source>你的浏览器不支持video标签，请升级。</video>' + 
        '</div></div>'
      })
      // 音频处理
      .replace(/<audio\ssrc="\/r\/([0-9]+?)"><\/audio>/igm, function(content, v1) {
        var resource = resources[v1];
        if(!resource) {
          return "（音频：" + plain_escape(v1) + "）";
        }

        return '<div class="article-audio">'+
          /* '<div class="article-audio-name">' + plain_escape(resource.oname) + 
            '<div class="article-audio-size">' + getSize(resource.size) + '</div>' +
          '</div>'+ */
          '<audio class="plyr-dom" preload="none" controls>'+
            '<source src="/r/'+v1+'" type="audio/mp3" />'+
            '你的浏览器不支持audio标签，请升级。'+
          '</audio>'+
        '</div>';
      })
      // 附件处理
      .replace(/<a\shref="\/r\/([0-9]+?)"><\/a>/img, function(content, v1) {
        var resource = resources[v1];
        if(!resource) {
          return "（附件：" + plain_escape(v1) + "）";
        }

        return '<div class="article-attachment">' +
          '<div class="article-attachment-icon">' +
            '<img src="'+ tools.getUrl("fileCover", resource.ext) +'" />'+
          '</div>' + 
          '<div class="article-attachment-content">' +
            '<a class="article-attachment-name" href="/r/'+resource.rid+'" title="'+plain_escape(resource.oname)+'">' +
              plain_escape(resource.oname) + 
            '</a>' +
            '<div class="article-attachment-info">' +
              '<div class="article-attachment-size">'+getSize(resource.size)+'</div>' +
              '<div class="article-attachment-ext">'+(resource.ext||"").toUpperCase()+'</div>' +
              '<div class="article-attachment-hits">'+(resource.hits || 0)+'次下载</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      });
  };


  render.experimental_render = function(post){
    var content = post.c || '';
    var lang = post.l || '';
    var renderedHTML = '';
    switch (lang) {
      case 'html':
        renderedHTML = pwbb_experimental(post,true); //straight thru html
        break;

      case 'pwbb':
        renderedHTML = pwbb_experimental(post,false);
        break;

      case 'bbcode':
        renderedHTML = pwbb_experimental(post,false);
        break;

      case 'markdown':
        renderedHTML = markdown_experimental(post);
        break;

      default:
        renderedHTML = plain_escape(content)
    }
  
    var resources = {};
    post.resources = post.resources || [];
    for(var i = 0; i < post.resources.length; i++) {
      var r = post.resources[i];
      resources[r.rid] = r;
    }

    
    // 处理媒体文件dom
    renderedHTML = renderResourceDom(renderedHTML, resources);

    renderedHTML = twemoji.parse(renderedHTML, {
      folder: '/2/svg',
      base: '/twemoji',
      ext: '.svg'
    });
    // 渲染at
    // 取出帖子引用部分，帖子引用部分的at不被渲染
    var blockDomArray = renderedHTML.match(/<blockquote cite.*?blockquote>/im);
    var blockDomHtml = "";
    if(blockDomArray){
      blockDomHtml = blockDomArray[0];   
      renderedHTML = renderedHTML.replace(/<blockquote cite.*?blockquote>/im,'');
    }
    var atUsers = post.atUsers;
    if(atUsers && atUsers.length > 0) {
      for(var i = 0; i < atUsers.length; i++) {
        var user = "@"+atUsers[i].username;
        var reg = new RegExp(user, 'gm');
        renderedHTML = renderedHTML.replace(reg,'<a href="/u/' + atUsers[i].uid + '">' + user + '</a>')
      }
    }
    renderedHTML = blockDomHtml + renderedHTML;
    renderedHTML = linkAlienate(renderedHTML); //please check linkAlienate()
    return renderedHTML
  };

  return render;
}

var render = nkc_render();

if(in_browser){
}else{
  module.exports = render;
}