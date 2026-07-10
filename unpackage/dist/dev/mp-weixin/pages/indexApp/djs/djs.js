"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const util_lunarAlendar = require("../../../util/lunar-alendar.js");
if (!Math) {
  Flipper();
}
const Flipper = () => "../../../components/flipper/noAnimationFilpper.js";
const _sfc_main = {
  __name: "djs",
  setup(__props) {
    const imgSrc = common_vendor.ref("https://www.gaobug.com/img/static/xcx/chux.png");
    const homeButtonStyle = common_vendor.ref("top: 48px;");
    const frontText = common_vendor.reactive({
      day: "00",
      hour: "00",
      minute: "00",
      second: "00"
    });
    let timer = null;
    let chuxiDate = null;
    const formatTime = (num) => num < 10 ? `0${num}` : `${num}`;
    const updateCountdown = () => {
      const currentDate = /* @__PURE__ */ new Date();
      const timeDifference = Math.max(chuxiDate - currentDate, 0);
      const day = Math.floor(timeDifference / (1e3 * 3600 * 24));
      const hoursLeft = timeDifference % (24 * 3600 * 1e3);
      const hour = Math.floor(hoursLeft / (3600 * 1e3));
      const minutesLeft = hoursLeft % (3600 * 1e3);
      const minute = Math.floor(minutesLeft / (60 * 1e3));
      const secondsLeft = minutesLeft % (60 * 1e3);
      const second = Math.round(secondsLeft / 1e3);
      frontText.day = formatTime(day);
      frontText.hour = formatTime(hour);
      frontText.minute = formatTime(minute);
      frontText.second = formatTime(second);
    };
    const startCountdown = () => {
      clearCountdown();
      timer = setInterval(updateCountdown, 1e3);
    };
    const clearCountdown = () => {
      if (!timer)
        return;
      clearInterval(timer);
      timer = null;
    };
    const getChuxiDate = () => {
      const today = /* @__PURE__ */ new Date();
      const thisYear = today.getFullYear();
      let dayNum = 30;
      let chuxiDay = -1;
      while (chuxiDay === -1) {
        chuxiDay = util_lunarAlendar.calendar.lunar2solar(thisYear, 12, dayNum);
        dayNum--;
      }
      let lastChuxiDayNum = 30;
      let lastYearChuxi = -1;
      while (lastYearChuxi === -1) {
        lastYearChuxi = util_lunarAlendar.calendar.lunar2solar(thisYear - 1, 12, lastChuxiDayNum);
        lastChuxiDayNum--;
      }
      const chuxiDayFormat = `${chuxiDay.cYear}/${chuxiDay.cMonth}/${chuxiDay.cDay} 00:00:00`;
      const lastYearFormat = `${lastYearChuxi.cYear}/${lastYearChuxi.cMonth}/${lastYearChuxi.cDay} 00:00:00`;
      const targetDate = new Date(lastYearFormat) - today > 0 ? lastYearFormat : chuxiDayFormat;
      return new Date(targetDate);
    };
    const setHomeButtonPosition = () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const menuButton = common_vendor.index.getMenuButtonBoundingClientRect();
      const top = (menuButton == null ? void 0 : menuButton.top) || systemInfo.statusBarHeight + 8;
      homeButtonStyle.value = `top: ${top}px;`;
    };
    const goHome = () => {
      common_vendor.index.redirectTo({
        url: "/pages/index/index"
      });
    };
    common_vendor.onLoad(() => {
      setHomeButtonPosition();
      chuxiDate = getChuxiDate();
      updateCountdown();
      startCountdown();
    });
    common_vendor.onUnload(clearCountdown);
    common_vendor.onShareAppMessage(() => ({
      title: "除夕倒计时",
      path: "/pages/indexApp/djs/djs"
    }));
    return (_ctx, _cache) => {
      return {
        a: imgSrc.value,
        b: common_vendor.s(homeButtonStyle.value),
        c: common_assets._imports_0$1,
        d: common_vendor.o(goHome, "82"),
        e: common_vendor.p({
          frontText: frontText.day
        }),
        f: common_vendor.p({
          frontText: frontText.hour
        }),
        g: common_vendor.p({
          frontText: frontText.minute
        }),
        h: common_vendor.p({
          frontText: frontText.second
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c78e8d02"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/indexApp/djs/djs.js.map
