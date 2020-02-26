NKC.methods.selectImage = function(o) {
  $('#moduleCrop').modal({
    show: false,
    backdrop: "static"
  });
  var options = {
    viewMode: 1,
    // aspectRatio: 1,
    checkCrossOrigin: false,
    movable: false,
    canSelectNewImage: true,
  };
  if(o) {
    for(var i in o) {
      if(!o.hasOwnProperty(i)) continue;
      options[i] = o[i];
    }
  }

  var this_ = this;

  var $image = $('#module_crop_image');

  $image.cropper(options);

  this.cropper = $image.data('cropper');

  $("#module_crop_input").on("change", function() {
    this_.selectedFile();
  });

  $("#module_crop_rotate_left").on("click", function() {
    this_.rotate("left");
  });

  $("#module_crop_rotate_right").on("click", function() {
    this_.rotate("right");
  });

  $("#module_crop_button").on("click", function() {
    this_.complete();
  });

  $('#moduleCrop').on('hidden.bs.modal', function () {
    $("#module_crop_input").val("");
    $("#module_crop_info").text("");
  });

  this.show = function(callback, o) {
    if(o) {
      if(o.aspectRatio) {
        this_.cropper.setAspectRatio(o.aspectRatio);
      }
      if(o.url) {
        setTimeout(function() {
          this_.cropper.replace(o.url);
        }, 200);
      }
    }
    this_.callback = callback;
    $('#moduleCrop').modal("show");
  };

  this.selectedFile = function() {
    var files = $("#module_crop_input").prop('files');
    NKC.methods.fileToUrl(files[0])
      .then(function(url) {
        this_.cropper.replace(url);
      })
  };
  this.complete = function() {
    $("#module_crop_info").text("图片处理中，请稍候...");
    try{
      this_.cropper.getCroppedCanvas().toBlob(function(blob) {
        console.log(blob);
        this_.callback(blob);
      });
    } catch(err) {
      console.log(err);
      if(options.errorInfo) {
        screenTopWarning(options.errorInfo)
      }
    }

  };
  this.close = function() {
    $('#moduleCrop').modal("hide");
  };
  this.rotate = function(type) {
    if(type === "left") {
      this_.cropper.rotate(-90);
    } else {
      this_.cropper.rotate(90);
    }
    if(options.resetCrop) {
      // 获取图片位置信息
      var imageData = this_.cropper.getImageData();
      var height = imageData.height;
      var top = imageData.top;
      var left = imageData.left;
      var width = imageData.width;
      if(height < 0) height = 0;
      if(top < 0) top = 0;
      if(left < 0) left = 0;
      if(width < 0) width = 0;
      this_.cropper.setCropBoxData({
        height: height,
        width: width,
        top: top,
        left: left
      });
    }
  }
};