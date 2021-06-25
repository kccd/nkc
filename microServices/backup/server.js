require('colors');
const moment = require("moment");
const PATH = require('path');
const schedule = require('node-schedule');
const archiver = require('archiver');
const fs = require('fs');
const {spawn} = require('child_process');
const {
  folder,
  time,
} = require('../../config/backup.json');
const {
  database: dbName,
  username: dbUsername,
  password: dbPassword,
  address: dbAddress,
  port: dbPort
} = require('../../config/mongodb.json');


schedule.scheduleJob(time, backupDatabase);


async function backupDatabase() {
  const now = new Date();
  const folderPath = getDataFolderByDate(now);
  console.log(`${getTimestamp()} 开始备份数据库 ${dbName} ...`);
  let data = '', error = '';
  const command = [
    '--gzip',
    '--host',
    `${dbAddress}:${dbPort}`,
    '--db',
    dbName,
    '--out',
    `${folderPath}`,
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
    if(code !== 0) {
      return console.log(`${getTimestamp()} 备份失败\n${error}`);
    }
    console.log(`${getTimestamp()} 备份完成 开始压缩...`);
    const zipFilePath = getZipFilePathByDate(now);
    compressedDir(PATH.resolve(folderPath, dbName), zipFilePath)
      .then(() => {
        console.log(`${getTimestamp()} 压缩完成 ${zipFilePath}`);
      })
      .catch(err => {
        console.log(`${getTimestamp()} 压缩失败 ${err.message || err}`);
      });
  });
}

async function compressedDir(dirPath, zipFilePath) {

  return new Promise((resolve, reject) => {
    try{
      const targetDirPath = PATH.dirname(zipFilePath);
      fs.mkdirSync(targetDirPath, {
        recursive: true
      });

      const zipFile = fs.createWriteStream(zipFilePath);

      zipFile.on('error', (err) => {
        reject(err);
      });
      zipFile.on('finish', () => {
        resolve();
      });

      const archive = archiver('zip', {
        zlib: {level: 9}
      });
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          console.log(err);
        } else {
          reject(err);
        }
      });

      archive.on('error', function(err) {
        reject(err);
      });

      archive.directory(dirPath, false);

      archive.pipe(zipFile);
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  })

}

function getDataFolderByDate(t) {
  t = moment(t);
  const folderPath =  PATH.resolve(folder, `./${dbName}/${t.format('YYYY')}/${t.format('MM')}/cache`);
  fs.mkdirSync(folderPath, {
    recursive: true
  });
  return folderPath
}

function getZipFilePathByDate(t) {
  const folderPath = getDataFolderByDate(t);
  t = moment(t);
  return PATH.resolve(folderPath, `../${dbName}_${t.format('YYYYMMDD')}.zip`);
}

function getTimestamp(t) {
  t = t || new Date();
  t = moment(t);
  return t.format('YYYY-MM-DD HH:mm:ss') + ' backup';
}

console.log(`数据库自动备份服务已启动`);