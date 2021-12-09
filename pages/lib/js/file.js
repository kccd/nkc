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

