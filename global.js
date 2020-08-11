global.NKC = {};
global.NKC.NODE_ENV = (process.env.NODE_ENV === 'production')? process.env.NODE_ENV: 'development';
global.NKC.startTime = Date.now();
global.NKC.processId =  Number(process.env.PROCESS_ID) || 0;

global.throwErr = (code, message) => {
  if(message === undefined) {
    message = code;
    code = undefined;
  }
  const err = new Error(message);
  if(code) err.status = code;
  throw err;
};

Object.defineProperty(Array.prototype, "shuffle", {
  enumerable: false,
  value: function() {
    const array = this;
    let m = array.length;
    let t, i;
    while(m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }
});
