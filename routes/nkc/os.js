const router = require('koa-router')();
const {attachment} = require('../../config/store.json');
router
  .get('/', async (ctx, next) => {
    const {nkcModules, data} = ctx;
    const {usage} = await nkcModules.os.getCPUInfo();
    const {
      totalMemMb,
      usedMemMb,
    } = await nkcModules.os.getMemoryInfo();
    const disks = [];
    for(const a of attachment) {
      const {
        free,
        size,
        diskPath,
      } = await nkcModules.os.getDriveInfo(a.path);
      const disk = {
        ...a,
        free,
        size,
        diskPath,
      };
      disks.push(disk);
    }
    data.disks = disks;
    data.totalMemory = totalMemMb;
    data.usedMemory = usedMemMb;
    data.cpuUsage = usage;
    data.nav = "os";
    ctx.template = "nkc/os/os.pug";
    // 次路由未开放
    await next();
  })
module.exports = router;
