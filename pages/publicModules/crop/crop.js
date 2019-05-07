var moduleCrop = {};
moduleCrop.cropper = {};

/* 初始化图片裁剪工具
* @param {Function} callback 回调函数 callback(data), data为裁剪后的图片数据
* @param {Object} o 参数 详情https://github.com/fengyuanchen/cropperjs#options
* @author pengxiguaa 2019-5-5
* */

moduleCrop.init = function(callback, o) {
  var options = {
    viewMode:0,
    aspectRatio: 1,
    checkCrossOrigin: false,
    movable: false,
    canSelectNewImage: true,
  };
  if(o) {
    for(var i in o) {
      options[i] = o[i];
    }
  }

  if(options.canSelectNewImage) {
    $(".crop-select-panel").css("display", "inline-block");
  } else {
    $(".crop-select-panel").css("display", "none");
  }

  var $image = $('#module_crop_image');

  $image.cropper(options);

  moduleCrop.cropper = $image.data('cropper');

  moduleCrop.complete = function() {
    try{
      moduleCrop.cropper.getCroppedCanvas().toBlob(function(blob) {
        moduleCrop.hide();
        callback(blob);
      });
    }
    catch(e)
    {
      if(options.errorInfo) {
        moduleCrop.hide();
        screenTopWarning(options.errorInfo)
      }
    }
  };

  // 显示裁剪框
  moduleCrop.show = function() {
    $("#module_crop").show();
  };
  // 隐藏裁剪框
  moduleCrop.hide = function() {
    $("#module_crop").hide();
  };
  moduleCrop.selectFile = function() {
    $("#module_crop_input").click();
  };
  moduleCrop.selectedFile = function() {
    var files = $("#module_crop_input").prop('files');
    fileToUrl(files[0])
      .then(function(url) {
        moduleCrop.replace(url);
      })
  };

  // 显示需要裁剪的图片
  // @param {String} url 图片链接
  moduleCrop.replace = function(url) {
    moduleCrop.cropper.replace(url);
  };

  moduleCrop.cancel = function() {
    moduleCrop.hide();
    $("#module_crop_input").val("");
  };
  moduleCrop.rotate = function(type) {
    if(type === "left") {
      moduleCrop.cropper.rotate(-90);
    } else {
      moduleCrop.cropper.rotate(90);
    }
    if(options.resetCrop) {
      // 获取图片位置信息
      var imageData = moduleCrop.cropper.getImageData();
      var height = imageData.height;
      var top = imageData.top;
      var left = imageData.left;
      var width = imageData.width;
      if(height < 0) height = 0;
      if(top < 0) top = 0;
      if(left < 0) left = 0;
      if(width < 0) width = 0;
      moduleCrop.cropper.setCropBoxData({
        height: height,
        width: width,
        top: top,
        left: left
      })
    }
  }
};
