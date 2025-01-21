const xss = require('xss');

const defaultWL = Object.assign({}, xss.whiteList);

defaultWL.font = ['color'];
defaultWL.code = ['class'];
defaultWL.p = ['align', 'style'];
defaultWL.table = ['border', 'width', 'cellpadding', 'cellspacing', 'class'];
defaultWL.tbody = [];
defaultWL.tr = [];
defaultWL.th = ['width'];
defaultWL.td = ['width', 'valign', 'colspan', 'top', 'rowspan'];
defaultWL.math = [];
defaultWL.semantics = [];
defaultWL.mrow = [];
defaultWL.msup = [];
defaultWL.mn = [];
defaultWL.annotation = ['encoding'];
defaultWL.iframe = [];
defaultWL.embed = [];
defaultWL.section = ['data-tag', 'data-type', 'data-id', 'data-message'];
defaultWL.ul = ['data-tag', 'data-type'];
defaultWL.img = [
    'src',
    'alt',
    'class',
    'data-src',
    'data-type',
    'dataimg',
    'style',
    'data-tag',
    'data-id',
    'data-global-data',
    'data-global-click',
    'data-global-long-press',
];
defaultWL.video = [
    'src',
    'class',
    'preload',
    'controls',
    'poster',
    'data-rid',
    'data-plyr-title',
    'data-tag',
    'data-type',
    'data-id',
];
defaultWL.audio = [
    'src',
    'class',
    'preload',
    'controls',
    'data-rid',
    'data-tag',
    'data-type',
    'data-id',
    'data-size',
];
defaultWL.source = ['src', 'type', 'size', 'data-size'];
defaultWL.span = [
    'class',
    'style',
    'data-type',
    'data-mask',
    'data-id',
    '_rendered',
    'style',
    'data-tag',
    'title',
    'data-url',
    'data-visitor-access',
    'data-title',
    'data-source',
    'data-sid',
    'data-global-click',
    'data-global-data',
];
defaultWL.div = defaultWL.span;
defaultWL.a = [
    'class',
    'href',
    'target',
    'title',
    'style',
    'data-type',
    'data-tag',
    'data-id',
    'data-url',
    'data-title',
    'data-global-click',
    'data-global-data',
];
defaultWL.pre = ['class', 'data-tag', 'data-type', 'data-id'];
defaultWL.em = [
    'class',
    'style',
    'note-tag',
    'note-id',
    'tag-type',
    'contenteditable',
];

for (var i = 1; i <= 6; i++) {
    defaultWL['h' + i] = ['style'];
}

module.exports = (html = '') => {
    html = xss(html, {
        whiteList: defaultWL,
        onTagAttr: function(tag, name, value, isWhiteAttr) {
            if (isWhiteAttr) {
                if (tag === 'a' && name === 'href') {
                    const valueHandled = value.replace('javascript:', '');
                    return `href=${valueHandled}`;
                }
            }
        },
        css: {
            whiteList: {
                top: true,
                left: true,
                fontSize: true,
                display: true,
                'font-weight': true,
                'font-size': true,
                'font-style': true,
                'text-decoration-line': true,
                'text-decoration': true,
                'background-color': true,
                color: true,
                'font-family': true,
                'text-align': true,
                'text-indent': true,
                'padding-bottom': true,
                'padding-top': true,
                'padding-left': true,
                'padding-right': true,
                height: true,
                width: true,
                'vertical-align': true,
                'margin-top': true,
                bottom: true,
                'word-spacing': true,
                'border-bottom': true,
                'max-width': true,
            },
        },
    });
    return html;
};