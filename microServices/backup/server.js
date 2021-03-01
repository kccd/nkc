require('colors');
const crypto = require('crypto');
const moment = require("moment");
const PATH = require('path');
const schedule = require('node-schedule');
const archiver = require('archiver');
const http = require('http');
const {spawn} = require('child_process');
const {
  folder,
  time,
  whitelist = [],
  address,
  port,
  legalTime,
  secret
} = require('../../config/backup.json');
const {
  database: dbName,
  username: dbUsername,
  password: dbPassword,
  address: dbAddress,
  port: dbPort
} = require('../../config/mongodb.json');


schedule.scheduleJob(time, async () => {
  console.log(`${getTimestamp()} 开始备份数据库 ${dbName} ...`);
  let data = '', error = '';
  const command = [
    '--gzip',
    '--host',
    `${dbAddress}:${dbPort}`,
    '--db',
    dbName,
    '--out',
    `${getDataFolderByDate()}`,
  ];

  if(dbUsername && dbPassword) {
    command.push('-u');
    command.push(dbUsername);
    command.push('-p');
    command.push(dbPassword);
  }

  const day = Number(moment().format("DD"));
  if(day % 4 !== 0) {
    command.push(`--excludeCollection`);
    command.push(`logs`);
  }
  if(day % 12 !== 0) {
    command.push(`--excludeCollection`);
    command.push(`visitorLogs`);
  }
  const process = spawn('mongodump', command);
  process.stdout.on('data', (d) => {
    d = d.toString();
    console.log(d);
    data += (d+'\n');
  });
  process.stderr.on('data', (d) => {
    d = d.toString();
    console.log(d);
    error += (d+'\n');
  });
  process.on('close', (code) => {
    let info = '';
    if (code === 0) {
      info = `${getTimestamp()} 备份完成`;
    } else {
      info = `${getTimestamp()} 备份失败\n${error}`;
    }
    console.log(info);
  });
});



const server = http.createServer((req, res) => {
  const url = new URL(`http://test${req.url}`);
  const token = url.searchParams.get('token');
  const now = new Date();
  const hour = now.getHours();
  const [startingTime, endTime] = legalTime.split('-');

  if(hour < Number(startingTime) || hour > Number(endTime)) {
    return returnNull(res);
  }

  const ip = getIp(req);

  if(whitelist.length !== 0 && !whitelist.includes(ip)) {
    return returnNull(res);
  }

  const md5 = crypto.createHash('md5');
  const result = md5.update(secret + moment(now).format("YYYYMMDD")).digest("hex");
  if(token !== result) {
    return returnNull(res);
  }


  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('warning', function(err) {
    console.log(err);
    if (err.code === 'ENOENT') {
    } else {
      res.statusCode = 500;
      res.end(err.message);
    }
  });

  archive.on('error', function(err) {
    console.log(err);
    res.statusCode = 500;
    res.end(err.message);
  });

  archive.directory(getDataFolderByDate(new Date()), false);

  archive.pipe(res);
  archive.finalize();

});

server.listen(port, address, () => {
  console.log(`backup server is running at ${address}:${port}`);
  if(process.connected) process.send('ready');
  process.on('message', function(msg) {
    if (msg === 'shutdown') {
      server.close();
      console.log(`backup service stopped`.green);
      process.exit(0);
    }
  });
});


function returnNull(res) {
  res.statusCode = 404;
  res.end();
}

function getDataFolderByDate(t) {
  t = t || new Date();
  t = moment(t);
  return PATH.resolve(folder, `./${t.format('YYYYMMDD')}`);
}

function getTimestamp(t) {
  t = t || new Date();
  t = moment(t);
  return t.format('YYYY-MM-DD HH:mm:ss') + ' backup';
}

function getIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}
