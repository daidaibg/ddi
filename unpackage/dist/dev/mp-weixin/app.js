"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const uni_modules_uviewPro_index = require("./uni_modules/uview-pro/index.js");
const util_http = require("./util/http.js");
const util_currency = require("./util/currency.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/indexApp/xkt/xkt.js";
  "./pages/indexApp/rl-new/rl-new.js";
  "./pages/indexApp/djs/djs.js";
  "./pages/indexApp/kaipao-equipment-entries/kaipao-equipment-entries.js";
}
const _sfc_main = {
  onLaunch() {
    this.autoUpdate();
  },
  onShow: function() {
  },
  onHide: function() {
  },
  methods: {
    autoUpdate() {
      var self = this;
      if (common_vendor.wx$1.canIUse("getUpdateManager")) {
        const updateManager = common_vendor.wx$1.getUpdateManager();
        updateManager.onCheckForUpdate(function(res) {
          if (res.hasUpdate) {
            self.downLoadAndUpdate(updateManager);
          }
        });
      } else {
        common_vendor.wx$1.showModal({
          title: "提示",
          content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。"
        });
      }
    },
    /**
     * 下载小程序新版本并重启应用
     */
    downLoadAndUpdate: function(updateManager) {
      updateManager.onUpdateReady(function() {
        updateManager.applyUpdate();
      });
      updateManager.onUpdateFailed(function() {
        common_vendor.wx$1.showModal({
          title: "已经有新版本了哟~",
          content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
        });
      });
    }
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
