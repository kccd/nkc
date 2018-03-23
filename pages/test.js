// //选中操作文本
// $('textarea').mouseup(function(){
//     var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
//     //txt是对象
//     console.log(txt)

//     var newstr = txt + "";
//     //newstr是字符串
//     console.log(newstr)
// })


//获取鼠标选中文本
function mouseChioceTxt(){
    $('textarea').mouseup(function(){
        var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
        //txt是对象
        //console.log(txt)

        var newstr = txt + "";
        //newstr是字符串
        console.log(newstr)
        return newstr;
    })
}


//将文字加粗
function fontBold(para){
    console.log("即将要加粗的文字",para);
    var char = "****";
    para = char + para + char;
    console.log("已经加粗的文字",para)
    return para
}


//将文字加斜体
function fontItalic(para){
    console.log("即将要倾斜的文字",para);
    var char = "**";
    para = char + para + char;
    console.log("已经倾斜的文字",para)
    return para;
}


//给标题选择标题号, h1-h6
function fontTitleNum(num,para){
    console.log("标题尺寸",num)
    console.log("改尺寸之前的标题",para);
    //根据标题尺寸选择使用#的数量
    var n = parseInt(num.substr(num.length-1,1));

    //n只能在1-6之间，否则返回错误
    if(n<1 || n>6){
        return false
    }

    var char = "#";
    for(var a=1;a<n;a++){
        char = "#" + char
    }
    console.log(char)
    //拼接字符串
    para = "\n" + char + " " + para + "\n";
    console.log("修改尺寸之后的标题",para)
    return para;

}


//包裹代码（暂时只提供多行）
function fontCodeMany(para){
    var char = "```";
    para = "\n\n" + char + "\n" + para + "\n" + char + "\n\n";

    return para
}


//添加引用
function fontAddQuote(para){
    console.log("即将要被引用起来的文字",para)
    var char = ">"
    para = "\n" + char + para + "\n\n\n";
    console.log("引用之后的文字",para)
    return para;
}


//将文字设为链接
//link必须有http头
function fontSetLink(link,para){
    console.log("即将要被设置为链接的文字",para);
    para = "[" + para + "](" + link + ")";
    console.log("已经被设置为链接的文字",para)
    return para;
}



//-------------------------------------------------



// //添加操作快捷键
// //ps:当使用快捷键时，调用函数
// function addShortCutKey(func){

// }


$(document).ready(function(){

    //输出选中的文本，并使用快捷键
    $('textarea').keydown(function(){
        //添加代码块 Ctrl+K
        if(window.event.ctrlKey && window.event.keyCode == 75){
            preventBrowerBehavior()
            var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
            //txt是对象
            var newstr = txt + "";
            //newstr是字符串
            var newpara = fontCodeMany(newstr)
            replaceSelection("content",newpara)
        }
        //加粗 Ctrl+B
        if(window.event.ctrlKey && window.event.keyCode == 66){
            preventBrowerBehavior()
            var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
            //txt是对象
            var newstr = txt + "";
            //newstr是字符串
            var newpara = fontBold(newstr)
            replaceSelection("content",newpara)
        }
        //倾斜 Ctrl+I
        if(window.event.ctrlKey && window.event.keyCode == 73){
            preventBrowerBehavior()
            var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
            //txt是对象
            var newstr = txt + "";
            //newstr是字符串
            var newpara = fontItalic(newstr)
            replaceSelection("content",newpara)
        }
        //设为标题h1-h6 Ctrl+H
        if(window.event.ctrlKey && window.event.keyCode == 72){
            preventBrowerBehavior()
            var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
            //txt是对象
            var newstr = txt + "";
            //newstr是字符串
            var newpara = fontTitleNum("h2",newstr)
            replaceSelection("content",newpara)
        }
        //添加引用 Ctrl+Q
        if(window.event.ctrlKey && window.event.keyCode == 81){
            preventBrowerBehavior()
            var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
            //txt是对象
            var newstr = txt + "";
            //newstr是字符串
            var newpara = fontAddQuote(newstr)
            replaceSelection("content",newpara)
        }
        
    })

})


//将鼠标选中的对象转为字符串
function textareaObjToStr(){
    var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
    var newstr = txt + "";
    return newstr;
}


//阻止浏览器的默认行为
function preventBrowerBehavior(){
    window.event.preventDefault();
    window.event.cancelable = true;
}


//替换textarea中选择的文本
function replaceSelection(name, text) {
    // 获取编辑器textarea对象
    var editor = document.getElementById(name);
    if (!editor) {
        var editors = document.getElementsByName(name);
        if (editors && editors.length>0) {
            editor = editors[0];
        }
    }
    if (!text) { // 如果没传递文本就不执行
        editor.focus(); //归还焦点
        return false;
    }
    if (editor.createTextRange && editor.caretPos) { // 老IE
        editor.focus(); // 防止无限扩选
        var selectStr = editor.caretPos.text;
        if (selectStr && selectStr.substring(selectStr.length - 1)==" ") {
            text += " "; // 右边多选中一个空格，替换后再补一个空格，优化编辑体验
        }
        editor.caretPos.text = text;
    } else if (editor.setSelectionRange) { 
    // 非老IE，利用选区的开始索引和结束索引重新拼串，而不是直接操作选取，达到替换选取的目的
        // 获取选中的问题
        var selectionStart; // textarea选中文本的开始索引
        var selectionEnd; // textarea选中文本的结束索引
        selectionStart = editor.selectionStart;
        selectionEnd = editor.selectionEnd;
        var selectStr = editor.value.substring(selectionStart, selectionEnd);
        if (selectStr && selectStr.substring(selectStr.length - 1)==" ") {
            text += " ";
        }
        var leftStr = editor.value.substring(0, selectionStart);
        var rightStr = editor.value.substring(selectionEnd, editor.value.length);
        editor.value = leftStr + text + rightStr;
        //重新选中新文本
        selectionEnd = selectionStart + text.length;
        editor.setSelectionRange(selectionStart, selectionEnd);
        //非IE浏览器必须获取焦点
        editor.focus();
    }
}


//在textarea中使用快捷键来执行某个函数
function useShortCutKey(name){
    var textname = "#" + name;
    console.log(textname)
    $(textname).keydown(function(){
        if(window.event.ctrlKey && window.event.keyCode == 75){
            preventBrowerBehavior();
            var str1 = textareaObjToStr();
            replaceSelection(name,str1);
        }

    })
}


