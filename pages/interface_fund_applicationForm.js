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
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', {type: 'support'})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function against(_id) {
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', {type: 'against'})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function revoked(type, _id) {
	nkcAPI('/fund/a/'+_id+'?type='+type, 'DELETE', {})
		.then(function(){
			screenTopAlert('操作成功！');
		})
		.catch(function(data){
			screenTopWarning(data.error);
		})
}