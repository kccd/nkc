const os = require('node-os-utils');
const checkDiskSpace = require('check-disk-space').default
async function getCPUInfo() {
  const usage = await os.cpu.usage();
  return {
    usage
  }
}

async function getMemoryInfo() {
  return os.mem.info();
}


async function getDriveInfo(diskName) {
  return checkDiskSpace(diskName);
}

module.exports = {
  getCPUInfo,
  getMemoryInfo,
  getDriveInfo
}
