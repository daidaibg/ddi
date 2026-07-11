"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
if (!Array) {
  const _easycom_u_toast2 = common_vendor.resolveComponent("u-toast");
  _easycom_u_toast2();
}
const _easycom_u_toast = () => "../../../uni_modules/uview-pro/components/u-toast/u-toast.js";
if (!Math) {
  _easycom_u_toast();
}
const CLICK_AUDIO_URL = "https://www.gaobug.com/img/static/xcx/audio/di.mp3";
const FAN_AUDIO_URL = "https://www.gaobug.com/img/static/xcx/audio/air-extractor-fan.mp3";
const OPEN_AUDIO_URL = "https://www.gaobug.com/img/static/xcx/audio/ac-work.mp3";
const _sfc_main = {
  __name: "xkt",
  setup(__props) {
    const wd = common_vendor.ref(18);
    const wdType = common_vendor.ref("leng");
    const type = common_vendor.ref("guan");
    const toastRef = common_vendor.ref(null);
    let clickAudio = null;
    let fanAudio = null;
    let openAudio = null;
    const initAudio = () => {
      try {
        common_vendor.index.setInnerAudioOption({
          obeyMuteSwitch: false,
          success() {
            common_vendor.index.__f__("log", "at pages/indexApp/xkt/xkt.vue:171", "音频选项设置成功");
          },
          fail(error) {
            common_vendor.index.__f__("warn", "at pages/indexApp/xkt/xkt.vue:174", "音频选项设置失败：", error);
          }
        });
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/indexApp/xkt/xkt.vue:178", "当前平台不支持 setInnerAudioOption：", error);
      }
      clickAudio = common_vendor.index.createInnerAudioContext();
      clickAudio.src = CLICK_AUDIO_URL;
      clickAudio.autoplay = false;
      fanAudio = common_vendor.index.createInnerAudioContext();
      fanAudio.src = FAN_AUDIO_URL;
      fanAudio.autoplay = false;
      fanAudio.loop = true;
      openAudio = common_vendor.index.createInnerAudioContext();
      openAudio.src = OPEN_AUDIO_URL;
      openAudio.autoplay = false;
      bindAudioEvents(clickAudio, "按钮音效");
      bindAudioEvents(fanAudio, "风扇音效");
      bindAudioEvents(openAudio, "开机音效");
    };
    const bindAudioEvents = (audio, name) => {
      if (!audio) {
        return;
      }
      audio.onCanplay(() => {
        common_vendor.index.__f__("log", "at pages/indexApp/xkt/xkt.vue:208", `${name}可以播放`);
      });
      audio.onPlay(() => {
        common_vendor.index.__f__("log", "at pages/indexApp/xkt/xkt.vue:212", `${name}开始播放`);
      });
      audio.onError((error) => {
        common_vendor.index.__f__("error", "at pages/indexApp/xkt/xkt.vue:216", `${name}播放失败：`, error);
        common_vendor.index.showToast({
          title: `${name}加载失败`,
          icon: "none"
        });
      });
    };
    const playClickSound = () => {
      if (!clickAudio) {
        return;
      }
      try {
        clickAudio.seek(0);
        clickAudio.play();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/indexApp/xkt/xkt.vue:240", "按钮音效播放异常：", error);
      }
    };
    const startAirConditioner = () => {
      if (fanAudio) {
        fanAudio.play();
      }
      if (openAudio) {
        openAudio.seek(0);
        openAudio.play();
      }
    };
    const stopAirConditioner = () => {
      if (fanAudio) {
        fanAudio.stop();
      }
      if (openAudio) {
        openAudio.stop();
      }
    };
    const switchMode = (newType) => {
      if ((newType === "leng" || newType === "re") && type.value === "guan") {
        return;
      }
      type.value = newType;
      playClickSound();
      switch (newType) {
        case "kai":
          startAirConditioner();
          break;
        case "guan":
          stopAirConditioner();
          break;
        case "leng":
          wdType.value = "leng";
          break;
        case "re":
          wdType.value = "re";
          break;
      }
    };
    const changeTemperature = (increase) => {
      if (type.value === "guan") {
        return;
      }
      playClickSound();
      if (increase && wd.value >= 30) {
        showWarning("你想把老子热化！");
        return;
      }
      if (!increase && wd.value <= 16) {
        showWarning("你想冻死老子吧！");
        return;
      }
      wd.value += increase ? 1 : -1;
    };
    const showWarning = (title) => {
      var _a;
      if ((_a = toastRef.value) == null ? void 0 : _a.show) {
        toastRef.value.show({
          title,
          message: title,
          type: "warning"
        });
        return;
      }
      common_vendor.index.showToast({
        title,
        icon: "none"
      });
    };
    const destroyAudio = (audio) => {
      if (!audio) {
        return;
      }
      try {
        audio.stop();
        audio.destroy();
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/indexApp/xkt/xkt.vue:360", "销毁音频失败：", error);
      }
    };
    common_vendor.onLoad(() => {
      common_vendor.index.setNavigationBarTitle({
        title: "便携小空调"
      });
      initAudio();
    });
    common_vendor.onUnload(() => {
      destroyAudio(clickAudio);
      destroyAudio(fanAudio);
      destroyAudio(openAudio);
      clickAudio = null;
      fanAudio = null;
      openAudio = null;
    });
    common_vendor.onShareAppMessage(() => {
      return {
        title: "便携小空调",
        path: "/pages/indexApp/xkt/xkt"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_assets._imports_1,
        c: type.value !== "guan"
      }, type.value !== "guan" ? common_vendor.e({
        d: wdType.value === "leng"
      }, wdType.value === "leng" ? {} : {}, {
        e: wdType.value === "re"
      }, wdType.value === "re" ? {} : {}, {
        f: common_vendor.t(wd.value)
      }) : {}, {
        g: common_assets._imports_2,
        h: type.value === "guan" ? "rgb(166, 166, 166)" : "rgb(56, 247, 9)",
        i: type.value === "guan" ? 0 : 1,
        j: type.value === "guan" ? "opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)" : "opacity 2500ms cubic-bezier(0.4, 0, 0.2, 1)",
        k: common_assets._imports_3,
        l: common_vendor.o(($event) => switchMode("leng"), "75"),
        m: common_assets._imports_4,
        n: common_vendor.o(($event) => switchMode(type.value !== "guan" ? "guan" : "kai"), "8a"),
        o: type.value !== "guan" ? "rgb(245, 0, 87)" : "rgb(76, 175, 80)",
        p: common_assets._imports_5,
        q: common_vendor.o(($event) => switchMode("re"), "91"),
        r: common_assets._imports_6,
        s: common_vendor.o(($event) => changeTemperature(true), "b2"),
        t: common_assets._imports_6,
        v: common_vendor.o(($event) => changeTemperature(false), "83"),
        w: common_vendor.sr(toastRef, "acd858f8-0", {
          "k": "toastRef"
        })
      });
    };
  }
};
_sfc_main.__runtimeHooks = 2;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/indexApp/xkt/xkt.js.map
