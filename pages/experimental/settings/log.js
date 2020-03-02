function saveLogSettings(){
	var dom = $("input[name='operation']");
	var selectedOperationsId = [];
	for(var i = 0; i < dom.length; i ++) {
		var o = dom.eq(i);
		if(o.prop("checked")) selectedOperationsId.push(o.attr("data-operation"));
	}
	nkcAPI('/e/settings/log', 'POST', {
		selectedOperationsId: selectedOperationsId
	})
		.then(function() {
			sweetSuccess("保存成功");
		})
		.catch(sweetError)
}