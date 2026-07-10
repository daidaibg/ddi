"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      wd: 18,
      wdType: "leng",
      type: "guan",
      xktfengStyle: "",
      audioCtx: null,
      audioBackground: null,
      audioOpen: null
    };
  },
  onShareAppMessage: function(res) {
    return {
      title: "便携小空调",
      path: "/pages/indexApp/xkt/xkt",
      // 显示的页面
      // imageUrl: "/static/img/index/kt.png",
      success: function(res2) {
      },
      fail: function(res2) {
      }
    };
  },
  onLoad() {
    common_vendor.wx$1.setNavigationBarTitle({
      title: "便携小空调"
    });
    common_vendor.wx$1.setInnerAudioOption({
      obeyMuteSwitch: false
    });
    this.audioCtx = common_vendor.wx$1.createInnerAudioContext();
    this.audioCtx.src = "https://www.gaobug.com/img/static/xcx/audio/di.mp3";
    this.audioBackground = common_vendor.wx$1.createInnerAudioContext();
    this.audioBackground.src = "https://www.gaobug.com/img/static/xcx/audio/air-extractor-fan.mp3";
    this.audioBackground.loop = true;
    this.audioOpen = common_vendor.wx$1.createInnerAudioContext();
    this.audioOpen.src = "https://www.gaobug.com/img/static/xcx/audio/ac-work.mp3";
  },
  onUnload() {
    if (this.audioCtx && typeof this.audioCtx.destroy === "function") {
      this.audioCtx.destroy();
    }
    if (this.audioBackground && typeof this.audioBackground.destroy === "function") {
      this.audioBackground.destroy();
    }
    if (this.audioOpen && typeof this.audioOpen.destroy === "function") {
      this.audioOpen.destroy();
    }
  },
  methods: {
    switchMode(type) {
      common_vendor.index.__f__("log", "at pages/indexApp/xkt/xkt.vue:125", type);
      if (type == "re" || type == "leng") {
        if (this.type == "guan") {
          return;
        }
      }
      this.type = type;
      this.audioCtx.stop();
      this.audioCtx.play();
      if (type == "kai") {
        this.audioBackground.play();
        this.audioOpen.play();
      } else if (type == "guan") {
        this.audioBackground.stop();
        this.audioOpen.stop();
      } else if (type == "leng") {
        this.wdType = type;
      } else if (type == "re") {
        this.wdType = type;
      }
    },
    //温度加减
    wdJJ(flag) {
      if (this.type == "guan") {
        return;
      }
      this.audioCtx.stop();
      this.audioCtx.play();
      if (this.type == "guan") {
        return;
      }
      if (this.wd >= 30 && flag) {
        this.$refs.uToast.show({
          title: "你想把老子热化！",
          type: "warning"
        });
        return;
      } else if (this.wd <= 16 && !flag) {
        this.$refs.uToast.show({
          title: "你想冻死老子吧！",
          type: "warning"
        });
        return;
      }
      if (flag) {
        this.wd++;
      } else {
        this.wd--;
      }
    }
  }
};
if (!Array) {
  const _easycom_u_toast2 = common_vendor.resolveComponent("u-toast");
  _easycom_u_toast2();
}
const _easycom_u_toast = () => "../../../uni_modules/uview-pro/components/u-toast/u-toast.js";
if (!Math) {
  _easycom_u_toast();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: $data.type !== "guan"
  }, $data.type !== "guan" ? common_vendor.e({
    d: $data.wdType == "leng"
  }, $data.wdType == "leng" ? {} : {}, {
    e: $data.wdType == "re"
  }, $data.wdType == "re" ? {} : {}, {
    f: common_vendor.t($data.wd)
  }) : {}, {
    g: common_assets._imports_2,
    h: common_vendor.s($data.type == "guan" ? "background: rgb(166, 166, 166)" : "background: rgb(56, 247, 9)"),
    i: common_vendor.s($data.type == "guan" ? "opacity: 0;transition: opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;" : "opacity: 1;transition: opacity 2500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;"),
    j: common_assets._imports_3,
    k: common_vendor.o(($event) => $options.switchMode("leng"), "8a"),
    l: common_assets._imports_4,
    m: common_vendor.o(($event) => $options.switchMode($data.type !== "guan" ? "guan" : "kai"), "30"),
    n: common_vendor.s($data.type !== "guan" ? "margin: 0 60rpx;background-color: rgb(245, 0, 87)" : "margin: 0 60rpx;background-color: rgb(76, 175, 80)"),
    o: common_assets._imports_5,
    p: common_vendor.o(($event) => $options.switchMode("re"), "4c"),
    q: common_assets._imports_6,
    r: common_vendor.o(($event) => $options.wdJJ(true), "ea"),
    s: common_assets._imports_6,
    t: common_vendor.o(($event) => $options.wdJJ(false), "29"),
    v: common_vendor.sr("uToast", "acd858f8-0")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/indexApp/xkt/xkt.js.map
