var markdown = window.markdownit();
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

function mdToHtml(md) {
	return markdown.render(md);
}
function update() {
	var title = $('#title').val();
	var content = $('#content').val();
	var QQ = $('#QQ').val();
	var email = $('#email').val();
	$('#titleH2').text(title);
	$('#contentDiv').html(mdToHtml(content));
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
	submit(data.id, function(){
		screenTopAlert('自动保存成功');
	})
}, 30*1000);

