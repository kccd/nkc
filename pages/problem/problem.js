var markdown = window.markdownit();

var xss = window.filterXSS;
var default_whitelist = xss.whiteList;
default_whitelist.img = ['src','style'];

var xssoptions = {
	whiteList:default_whitelist,
	onTagAttr: function(tag, name, value, isWhiteAttr) {
		if(isWhiteAttr) {
			if(tag === 'a' && name === 'href') {
				var valueHandled = value.replace('javascript:', '');
				return "href=" + valueHandled;
			}
		}
	}
};

var custom_xss = new xss.FilterXSS(xssoptions);
var custom_xss_process = function(str){
	return custom_xss.process(str)
};

function mdToHtml(md) {
  return markdown.render(md);
}

var data = $('#data').text();
var hljs = {
	highlightBlock: function(){}
};
data = JSON.parse(data);
update();
$('#title, #content, #reason, #solution, #QQ, #email').on('input', function() {
	update();
})/*.on('blur', function() {
	submit(data.id, function(){screenTopAlert('自动保存成功')});
});*/

function update() {
	var title = $('#title').val();
	var content = $('#content').val();
	var QQ = $('#QQ').val();
	var email = $('#email').val();
	$('#titleH2').text(title);
	$('#contentDiv').html(custom_xss_process(mdToHtml(content)));
	$('pre code').each(function(i, block) {
		hljs.highlightBlock(block);
	});
	return {
		t: title,
		c: content,
		QQ: QQ,
		email: email,
	}
}

$('input[name="select"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});

function submit(_id, callback) {
	var obj = update();
	obj.resolved = $('input[name="select"]').prop('checked');
  var dom = document.getElementById('typeId');
  if(!dom) throw 'selector error';
  obj.name = dom.value;
	nkcAPI('/problem/list/'+_id, 'PATCH', obj)
		.then(function() {
			if(callback) {
				return callback();
			}
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function deleteProblem(_id) {
	if(confirm('确定要删除该问题？') === false) return;
	nkcAPI('/problem/list/'+_id, 'delete', {})
		.then(function() {
			screenTopAlert('删除成功');
			setTimeout(function(){
				window.location.href = '/problem/list';
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
setInterval(function() {
	if(!$('input[name="select"]').prop('checked')) {
		submit(data.id, function(){
			screenTopAlert('自动保存成功');
		})
	}
}, 30*1000);

function changeType(problemId) {
  submit(problemId);
}