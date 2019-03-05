var upLoadFile;
var hasImage = false;
$('#uploadSignModal').on('change', function() {
	var file = $('#uploadSignModal')[0].files[0];
	if(file) {
		upLoadFile = file;
	}
	var reader = new FileReader();
	reader.onload = function() {
		var url = reader.result;
    // displayAvatar(url);
    var html = '<img src="'+url+'" style="width: 100%" id="storeSignImageModal">';
    $('#storeSignImageDomModal').html(html);
	};
  reader.readAsDataURL(upLoadFile);
  hasImage = true;
});

/**
 * 编辑店铺招牌
 */
function editStoreSign() {
  console.log("加载招牌设置");
}

/**
 * 保存店铺招牌设置
 */
function saveStoreSign(storeId) {
  if(!hasImage) return screenTopWarning("请选择背景图");
	var formData = new FormData();
  formData.append('file', upLoadFile);
	$.ajax({
		url: '/shop/manage/'+storeId+'/decoration/sign',
		method: 'POST',
		cache: false,
		data: formData,
		headers: {
			'FROM': 'nkcAPI'
		},
		dataType: 'json',
		contentType: false,
		processData: false,
	})
		.done(function() {
			screenTopAlert('保存成功');
      $('#storeSignModal').modal('hide');
      location.href = '/shop/manage/'+storeId+'/decoration#signAnchor';
		})
		.fail(function(data) {
			screenTopWarning(JSON.parse(data.responseText).error);
		})
}

/**
 * 编辑店铺导航
 */
function editStoreNavigation() {

}

/**
 * 
 */

/**
 * 编辑客服中心
 */
function editStoreService() {

}

/**
 * 保存客服中心设置
 */
function saveStoreService(storeId) {
  var timeWordStart = $("#timeWordStart option:selected").val();
  var timeWordEnd = $("#timeWordEnd option:selected").val();
  var timeRestStart = $("#timeRestStart option:selected").val();
  var timeRestEnd = $("#timeRestEnd option:selected").val();
  var serviceTimeWork = [timeWordStart, timeWordEnd];
  var serviceTimeRest = [timeRestStart, timeRestEnd];

  var serviceMobile = $("#serviceMobile").val();
  var servicePhone = $("#servicePhone").val();

  var post = {
    serviceTimeWork,
    serviceTimeRest,
    serviceMobile,
    servicePhone
  }

  nkcAPI('/shop/manage/'+storeId+'/decoration/service', "POST", post)
  .then(function(data) {
    screenTopAlert("保存成功");
    $('#storeServiceModal').modal('hide');
    location.href = '/shop/manage/'+storeId+'/decoration#serviceAnchor';
  })
  .catch(function(data) {
    screenTopWarning(JSON.parse(data.responseText).error);
  })
}

/**
 * 编辑店内搜索
 */
function editStoreSearch() {

}

/**
 * 保存店内搜索设置
 */
function saveStoreSearch(storeId) {
  var presetKey = $("#presetKey").val();
  var recommendKey1 = $("#recommendKey1").val();
  var recommendKey2 = $("#recommendKey2").val();
  var recommendKey3 = $("#recommendKey3").val();
  var recommendKeys = [recommendKey1, recommendKey2, recommendKey3]

  var post = {
    presetKey,
    recommendKeys
  }

  nkcAPI('/shop/manage/'+storeId+'/decoration/search', "POST", post)
  .then(function(data) {
    screenTopAlert("保存成功");
    $('#storeSearchModal').modal('hide');
    location.href = '/shop/manage/'+storeId+'/decoration#searchAnchor';
  })
  .catch(function(data) {
    screenTopWarning(JSON.parse(data.responseText).error);
  })
}

/**
 * 编辑店内分类
 */
function editStoreClassfy() {

}

/**
 * 编辑商品推荐
 */
function editStoreFeatured(storeId) {
  nkcAPI('/shop/manage/'+storeId+'/decoration/featured', "GET", {})
  .then(function(data) {
    var totalDom = [];
    var featuredCount = data.storeLeftFeatureds.length;
    console.log(data.storeLeftFeatureds)
    var featuredList = data.storeLeftFeatureds;
    for(var i in data.products){
      var dom;
      if(data.products[i].isFeatured == true){
        dom = '<div class="form-group"></div><div class="media"><div class="media-left"><a href="/shop/product/'+data.products[i].productId+'"><img class="media-object" src="/r/'+data.products[i].imgMaster+'" style="width: 50px; height: 50px;" /></a></div><div class="media-body"><p class="media-heading" style="font-size:smaller;">'+data.products[i].productDescription+'</p><p style="font-size:smaller;">'+data.products[i].productFinalPrice+'</p></div><div class="media-right"><p>已推荐</p><button class="btn btn-danger btn-sm" onclick="addStoreFeatured('+data.products[i].productId+')">取消推荐</button></div></div>';
      }else{
        dom = '<div class="form-group"></div><div class="media"><div class="media-left"><a href="/shop/product/'+data.products[i].productId+'"><img class="media-object" src="/r/'+data.products[i].imgMaster+'" style="width: 50px; height: 50px;" /></a></div><div class="media-body"><p class="media-heading" style="font-size:smaller;">'+data.products[i].productDescription+'</p><p style="font-size:smaller;">'+data.products[i].productFinalPrice+'</p></div><div class="media-right"><button class="btn btn-primary btn-sm" onclick="">推荐</button></div></div>';
      }
      totalDom.push(dom);
    }
    $("#featuredModalBody").html(totalDom);
    $("#featuredCount").html(featuredCount);
    $("#featuredList").val(featuredList);
  })
  .catch(function(data) {
    screenTopWarning(data || data.error);
  })
}

/**
 * 添加商品推荐
 */
function addStoreFeatured(productId) {

}

/**
 * 取消商品推荐
 */
function delStoreFeatured(productId) {

}

/**
 * 保存商品推荐
 */
function saveStoreFeatured(storeId) {

}