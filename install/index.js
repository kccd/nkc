const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const upload = require("../settings/upload");
const lockPath = path.resolve(__dirname, './install.lock');
const configPath = path.resolve(__dirname, '../config');
const {
  initConfig,
} = require('../defaultData');

const apiFunction = require("../nkcModules/apiFunction");

async function updateConfig(type, data) {
  const config = await getConfig(type);
  Object.assign(config, data);
  await modifyConfig(type, config);
}

async function modifyConfig(type, data) {
  const targetFilePath = path.resolve(configPath, `./${type}.json`);
  await fsPromises.writeFile(targetFilePath, JSON.stringify(data, '', 2));
}

async function getConfig(type) {
  const targetFilePath = path.resolve(configPath, `./${type}.json`);
  return JSON.parse((await fsPromises.readFile(targetFilePath)).toString());
}

async function install() {
  await upload.initFolders();
  await initConfig();
  await updateConfig('cookie', {
    secret: apiFunction.getRandomString('a0', 256),
    experimentalSecret: apiFunction.getRandomString('a0', 256),
  });
  await updateConfig('account', {
    username: 'admin',
    password: apiFunction.getRandomString('a0', 8)
  });
  await fsPromises.writeFile(lockPath, ``);
  console.log(`\n\nthe installation is complete\n`);
  process.exit(0);
}


install()
  .catch(err => {
    console.error(err);
  })