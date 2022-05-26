const commConfig = require('../../config/comm.json');
function GetWebConfigs() {
  return {
    enabled: commConfig.moleculer.web.enabled,
    host: commConfig.moleculer.web.host,
    port: commConfig.moleculer.web.port
  }
}

module.exports = {
  GetWebConfigs,
}
