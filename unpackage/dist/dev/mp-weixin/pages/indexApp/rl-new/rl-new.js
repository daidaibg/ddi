"use strict";
const common_vendor = require("../../../common/vendor.js");
const util_getDate = require("../../../util/getDate.js");
const util_popupTexts = require("../../../util/popupTexts.js");
const util_rq = require("../../../util/rq.js");
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _easycom_u_popup2 = common_vendor.resolveComponent("u-popup");
  const _easycom_u_calendar2 = common_vendor.resolveComponent("u-calendar");
  const _easycom_u_select2 = common_vendor.resolveComponent("u-select");
  (_easycom_u_icon2 + _easycom_u_button2 + _easycom_u_popup2 + _easycom_u_calendar2 + _easycom_u_select2)();
}
const _easycom_u_icon = () => "../../../uni_modules/uview-pro/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../../uni_modules/uview-pro/components/u-button/u-button.js";
const _easycom_u_popup = () => "../../../uni_modules/uview-pro/components/u-popup/u-popup.js";
const _easycom_u_calendar = () => "../../../uni_modules/uview-pro/components/u-calendar/u-calendar.js";
const _easycom_u_select = () => "../../../uni_modules/uview-pro/components/u-select/u-select.js";
if (!Math) {
  (_easycom_u_icon + RlNewItem + _easycom_u_button + _easycom_u_popup + _easycom_u_calendar + _easycom_u_select)();
}
const RlNewItem = () => "./rl-new-item.js";
const duration = 650;
const _sfc_main = {
  __name: "rl-new",
  setup(__props) {
    const defaultConfig = { shiftsNum: 0, time: null, timeData: null, timestamp: null };
    const swiperActive = common_vendor.ref(2);
    const swiperList = common_vendor.ref([]);
    const selectedDate = common_vendor.ref(new util_getDate.getDate().dateFormat());
    const selectedDay = common_vendor.ref(null);
    const configShow = common_vendor.ref(false);
    const calendarShow = common_vendor.ref(false);
    const selectShow = common_vendor.ref(false);
    const setData = common_vendor.ref({ ...defaultConfig });
    const holidayMap = common_vendor.ref({});
    const holidayLoadState = common_vendor.ref("idle");
    const attemptedHolidayYears = /* @__PURE__ */ new Set();
    const shiftOptions = Array.from({ length: 31 }, (_, index) => ({ value: index + 1, label: index + 1 }));
    const updateSwiperList = (date, offsets) => offsets.map((offset) => date.getOffsetMonth(offset).format);
    const loadHolidayYears = async (dates) => {
      const years = [...new Set(dates.map((date) => new util_getDate.getDate(date).getFullYear()))].filter((year) => !attemptedHolidayYears.has(year));
      if (!years.length)
        return;
      years.forEach((year) => attemptedHolidayYears.add(year));
      holidayLoadState.value = "loading";
      const results = await Promise.all(years.map(util_rq.loadHolidayCalendar));
      for (const result of results) {
        holidayMap.value = { ...holidayMap.value, ...util_rq.buildHolidayMap(result.calendar) };
      }
      holidayLoadState.value = results.some((result) => result.source !== "fallback") ? "ready" : "error";
    };
    const loadConfig = () => {
      const savedConfig = common_vendor.index.getStorageSync("snow-rl-config");
      setData.value = savedConfig ? { ...defaultConfig, ...savedConfig } : { ...defaultConfig };
    };
    const init = () => {
      const today = new util_getDate.getDate();
      swiperList.value = updateSwiperList(today, [-2, -1, 0, 1, 2]);
      swiperActive.value = 2;
      selectedDate.value = today.dateFormat();
      selectedDay.value = null;
    };
    const clickDay = (day) => {
      selectedDate.value = `${day.cYear}/${day.cMonth}/${day.cDay}`;
      selectedDay.value = day;
      common_vendor.index.showToast({ icon: "none", title: util_popupTexts.randomPopupTexts() });
    };
    const saveConfig = () => {
      common_vendor.index.setStorageSync("snow-rl-config", { ...setData.value });
      configShow.value = false;
      common_vendor.index.showToast({ title: "设置已保存" });
    };
    const clearConfig = () => {
      common_vendor.index.showModal({
        title: "清空轮班规则",
        content: "清空后将不再计算值班日，是否继续？",
        success: ({ confirm: confirm2 }) => {
          if (!confirm2)
            return;
          common_vendor.index.removeStorageSync("snow-rl-config");
          setData.value = { ...defaultConfig };
          common_vendor.index.showToast({ title: "规则已清空" });
        }
      });
    };
    const selectLatestDate = () => {
      calendarShow.value = true;
    };
    const selectShiftNum = () => {
      selectShow.value = true;
    };
    const openConfig = () => {
      configShow.value = true;
    };
    const timeChange = (time) => {
      setData.value.time = time.result;
      setData.value.timeData = time;
      setData.value.timestamp = new Date(time.year, time.month - 1, time.day).getTime();
    };
    const confirm = (values) => {
      setData.value.shiftsNum = values[0].value;
    };
    const next = () => {
      swiperActive.value = swiperActive.value === 4 ? 0 : swiperActive.value + 1;
    };
    const prev = () => {
      swiperActive.value = swiperActive.value === 0 ? 4 : swiperActive.value - 1;
    };
    const goToday = () => {
      init();
      loadHolidayYears(swiperList.value);
    };
    const swiperChange = (event) => {
      swiperActive.value = event.detail.current;
      const currentDate = new util_getDate.getDate(swiperList.value[swiperActive.value]);
      const offsetsByIndex = [[0, 1, 2, -2, -1], [-1, 0, 1, 2, -2], [-2, -1, 0, 1, 2], [2, -2, -1, 0, 1], [1, 2, -2, -1, 0]];
      swiperList.value = updateSwiperList(currentDate, offsetsByIndex[swiperActive.value]);
      loadHolidayYears(swiperList.value);
    };
    common_vendor.onLoad(() => {
      loadConfig();
      init();
      loadHolidayYears(swiperList.value);
    });
    common_vendor.onShareAppMessage(() => ({
      title: "私人小日历",
      path: "/pages/index/index?share=true"
    }));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goToday, "8b"),
        b: common_vendor.f(swiperList.value, (item, k0, i0) => {
          return {
            a: "58292e92-1-" + i0 + "," + ("58292e92-0-" + i0),
            b: common_vendor.o(openConfig, item),
            c: common_vendor.o(clickDay, item),
            d: common_vendor.o(next, item),
            e: common_vendor.o(prev, item),
            f: "58292e92-0-" + i0,
            g: common_vendor.p({
              ["now-date"]: item,
              ["selected-date"]: selectedDate.value,
              ["latest-date"]: setData.value.timestamp,
              ["shifts-num"]: setData.value.shiftsNum,
              ["holiday-map"]: holidayMap.value
            }),
            h: item
          };
        }),
        c: common_vendor.p({
          name: "setting",
          color: "#ffffff",
          size: "38rpx"
        }),
        d: swiperActive.value,
        e: duration,
        f: common_vendor.o(swiperChange, "37"),
        g: common_vendor.t(selectedDay.value ? selectedDay.value.ncWeek : "选择日期查看排班状态"),
        h: common_vendor.t(selectedDay.value ? `${selectedDay.value.cMonth} 月 ${selectedDay.value.cDay} 日` : "今日"),
        i: selectedDay.value
      }, selectedDay.value ? common_vendor.e({
        j: common_vendor.t(selectedDay.value.lunarLabel),
        k: selectedDay.value.isOnDuty
      }, selectedDay.value.isOnDuty ? {} : selectedDay.value.isVacation ? {} : selectedDay.value.isCompensatoryLeave ? {} : {}, {
        l: selectedDay.value.isVacation,
        m: selectedDay.value.isCompensatoryLeave
      }) : {
        n: common_vendor.p({
          name: "calendar",
          color: "#df8ca8",
          size: "30rpx"
        })
      }, {
        o: common_vendor.t(setData.value.shiftsNum || "未设置"),
        p: common_vendor.t(setData.value.time || "未设置"),
        q: holidayLoadState.value === "error"
      }, holidayLoadState.value === "error" ? {} : {}, {
        r: common_vendor.t(setData.value.shiftsNum || "未设置"),
        s: common_vendor.p({
          name: "arrow-right",
          color: "#c8a4b0",
          size: "24rpx"
        }),
        t: common_vendor.o(selectShiftNum, "cf"),
        v: common_vendor.t(setData.value.time || "请选择"),
        w: common_vendor.p({
          name: "arrow-right",
          color: "#c8a4b0",
          size: "24rpx"
        }),
        x: common_vendor.o(selectLatestDate, "69"),
        y: common_vendor.o(clearConfig, "6b"),
        z: common_vendor.p({
          plain: true,
          ["custom-style"]: "border-color:#efbfd0;color:#c9577d;background:#fff7fa;"
        }),
        A: common_vendor.o(saveConfig, "24"),
        B: common_vendor.p({
          type: "error",
          ["custom-style"]: "margin-left:20rpx;background:#dc6f95;border-color:#dc6f95;"
        }),
        C: common_vendor.o(($event) => configShow.value = $event, "5c"),
        D: common_vendor.p({
          mode: "bottom",
          round: "28",
          closeable: true,
          modelValue: configShow.value
        }),
        E: common_vendor.o(timeChange, "88"),
        F: common_vendor.o(($event) => calendarShow.value = $event, "50"),
        G: common_vendor.p({
          mode: "date",
          ["active-bg-color"]: "#dc6f95",
          ["btn-type"]: "error",
          ["max-date"]: "2050-01-01",
          modelValue: calendarShow.value
        }),
        H: common_vendor.o(confirm, "92"),
        I: common_vendor.o(($event) => selectShow.value = $event, "25"),
        J: common_vendor.p({
          list: common_vendor.unref(shiftOptions),
          ["label-name"]: "value",
          mode: "single-column",
          modelValue: selectShow.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-58292e92"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/indexApp/rl-new/rl-new.js.map
