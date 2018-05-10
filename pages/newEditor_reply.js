
var E = window.wangEditor
var editor = new E('#ReplyContent')
//自定义菜单配置
editor.customConfig.menus = [
    'head',  // 标题
    'bold',  // 粗体
    'fontSize',  // 字号
    //'fontName',  // 字体
    'italic',  // 斜体
    'underline',  // 下划线
    'strikeThrough',  // 删除线
    'foreColor',  // 文字颜色
    'backColor',  // 背景颜色
    'link',  // 插入链接
    //'list',  // 列表
    'justify',  // 对齐方式
    'quote',  // 引用
    'emoticon',  // 表情
    //'image',  // 插入图片
    'table',  // 表格
    'video',  // 插入视频
    'formula',  // 公式
    'code',  // 插入代码
    'undo',  // 撤销
    'redo',  // 重复
]
editor.create()
editor.customConfig.pasteTextHandle = function (content) {
    // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
    return content + '<p>在粘贴内容后面追加一行</p>'
}