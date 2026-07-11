"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const util_openid = require("./util/openid.js");
const uni_modules_uviewPro_index = require("./uni_modules/uview-pro/index.js");
const util_http = require("./util/http.js");
const util_currency = require("./util/currency.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/indexApp/xkt/xkt.js";
  "./pages/indexApp/rl-new/rl-new.js";
  "./pages/indexApp/djs/djs.js";
  "./pages/indexApp/kaipao-equipment-entries/kaipao-equipment-entries.js";
  "./pages/indexApp/kaipao-season-map/kaipao-season-map.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      autoUpdate();
      util_openid.ensureOpenid(false, { showError: false });
    });
    const autoUpdate = () => {
      if (common_vendor.wx$1.canIUse("getUpdateManager")) {
        const updateManager = common_vendor.wx$1.getUpdateManager();
        updateManager.onCheckForUpdate((res) => {
          if (res.hasUpdate)
            downLoadAndUpdate(updateManager);
        });
        return;
      }
      common_vendor.wx$1.showModal({
        title: "提示",
        content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
      });
    };
    const downLoadAndUpdate = (updateManager) => {
      updateManager.onUpdateReady(() => {
        updateManager.applyUpdate();
      });
      updateManager.onUpdateFailed(() => {
        common_vendor.wx$1.showModal({
          title: "已经有新版本了哟~",
          content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
        });
      });
    };
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(uni_modules_uviewPro_index.uViewPro);
  app.config.globalProperties.$http = util_http.Request;
  app.config.globalProperties.$currency = util_currency.currency;
  app.config.globalProperties.$url = util_http.baseVar;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
