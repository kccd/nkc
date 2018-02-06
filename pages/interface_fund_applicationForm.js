function agree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PATCH', {agree: true})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function disagree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PATCH', {agree: false})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function support(_id) {
	var content = $('#content').val();
	var obj = {
		type: 'support',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function against(_id) {
	var content = $('#content').val();
	if(!content) return screenTopWarning('请输入反对的理由。');
	var obj = {
		type: 'against',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function revoked(type, _id) {
	if(type === 'giveUp') {
		if(confirm('确定要放弃申请？') === false) return;
	}
	nkcAPI('/fund/a/'+_id+'?type='+type, 'DELETE', {})
		.then(function(){
			screenTopAlert('操作成功！');
		})
		.catch(function(data){
			screenTopWarning(data.error);
		})
}

function disableApplicationForm(id) {
	if(confirm('确定要封禁该基金申请？') === false) return;
	nkcAPI('/fund/a/'+id+'?type=disabled', 'DELETE',{})
		.then(function(data) {
			window.location.href = '/fund/list/'+ data.fund._id;
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}