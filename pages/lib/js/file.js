import SparkMD5 from '../../../public/external_pkgs/spark-md5/spark-md5.min';
/*
* 返回文件在本地的URL
* @param {File} file 文件对象
* @param {String} URL
* @author pengxiguaa 2019-7-26
* */
export function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reads = new FileReader();
    reads.onerror = reject;
    reads.onload = function (e) {
      resolve(this.result);
    };
    reads.readAsDataURL(file);
  });
}

export function getFileMD5(file) {
  return new Promise(function(resolve, reject) {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunkSize = 2097152,                             // Read in chunks of 2MB
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();
    fileReader.onload = function (e) {
      console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result);                   // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        console.log('finished loading');
        //- console.info('computed hash', spark.end());  // Compute hash
        resolve(spark.end());
      }
    };

    fileReader.onerror = function (err) {
      console.log(err);
      reject(err);
    };

    function loadNext() {
      var start = currentChunk * chunkSize,
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  });
}

/*
* 文件数据转文件
* @param {Blob} blob 文件数据
* @param {String} fileName 文件名
* @return {File} 文件
* @author pengxiguaa 2019-7-29
* */
export function blobToFile(blob, fileName) {
  blob.lastModifiedDate = new Date();
  blob.name = fileName || Date.now() + '.png';
  return blob;
}

/*
* base64数据转文件
* @param {base64} base64 文件数据
* @return {File} 文件
* */
export function base64ToFile(base64) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  };
  const blob = new Blob([u8arr], { type: mime });
  blob.lastModifiedDate = new Date();
  blob.name = 'base64ToFile.jpg';
  return blob;
}