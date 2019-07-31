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