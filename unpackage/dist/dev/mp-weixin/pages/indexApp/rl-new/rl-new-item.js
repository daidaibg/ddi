"use strict";
const common_vendor = require("../../../common/vendor.js");
const util_getDate = require("../../../util/getDate.js");
const util_lunarAlendar = require("../../../util/lunar-alendar.js");
const util_chinaHolidays = require("../../../util/china-holidays.js");
if (!Array) {
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  _easycom_u_icon2();
}
const _easycom_u_icon = () => "../../../uni_modules/uview-pro/components/u-icon/u-icon.js";
if (!Math) {
  _easycom_u_icon();
}
const millisecondsPerDay = 24 * 60 * 60 * 1e3;
const _sfc_main = {
  __name: "rl-new-item",
  props: { nowDate: { type: String, default: () => new util_getDate.getDate().dateFormat() }, selectedDate: { type: String, default: "" }, shiftsNum: { type: Number, default: 0 }, latestDate: { type: Number, default: null }, holidayMap: { type: Object, default: () => ({}) } },
  emits: ["click-day", "next", "prev"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const weekList = ["一", "二", "三", "四", "五", "六", "日"];
    const nowYear = common_vendor.ref(0), nowMonth = common_vendor.ref(0), nowPeasant = common_vendor.ref({}), previousMonthDays = common_vendor.ref([]), currentMonthDays = common_vendor.ref([]), nextMonthDays = common_vendor.ref([]);
    const selectedDateKey = common_vendor.computed(() => props.selectedDate.replace(/\//g, "-"));
    const dateKey = (day) => `${day.cYear}-${day.cMonth}-${day.cDay}`;
    const pad = (value) => String(value).padStart(2, "0");
    const getHolidayData = (day) => {
      const calendarHoliday = props.holidayMap[`${day.cYear}-${pad(day.cMonth)}-${pad(day.cDay)}`];
      const isVacation = (calendarHoliday == null ? void 0 : calendarHoliday.type) === "休";
      const isCompensatoryLeave = (calendarHoliday == null ? void 0 : calendarHoliday.type) === "班";
      const lunarHoliday = util_chinaHolidays.lunarHolidays[`${day.lMonth}-${day.lDay}`];
      const solarHoliday = util_chinaHolidays.solarHolidays[`${day.cMonth}-${day.cDay}`];
      const timestamp = new Date(day.cYear, day.cMonth - 1, day.cDay).getTime();
      const isWeekend = [6, 7].includes(day.nWeek);
      const isOnDuty = Boolean(props.shiftsNum && props.latestDate && (isVacation || isWeekend && !isCompensatoryLeave) && Math.floor(Math.abs(props.latestDate - timestamp) / millisecondsPerDay) % props.shiftsNum === 0);
      const builtInHoliday = lunarHoliday || solarHoliday;
      const lunarLabel = (calendarHoliday == null ? void 0 : calendarHoliday.displayText) || (builtInHoliday ? `${day.cYear} ${builtInHoliday.name}（安排待更新）` : day.IDayCn);
      return { lunarLabel, isVacation, isCompensatoryLeave, isOnDuty };
    };
    const buildDay = (year, month, day) => {
      const lunarDay = util_lunarAlendar.calendar.solar2lunar(year, month, day);
      return { ...lunarDay, ...getHolidayData(lunarDay) };
    };
    const init = () => {
      const date = new util_getDate.getDate(props.nowDate);
      nowYear.value = date.getFullYear();
      nowMonth.value = date.getMonth();
      nowPeasant.value = util_lunarAlendar.calendar.solar2lunar(nowYear.value, nowMonth.value, date.getDate());
      const daysInMonth = util_getDate.getDate.getDays({ year: nowYear.value, month: nowMonth.value });
      const firstWeekday = util_getDate.getDate.getMonthWeekBegin({ year: nowYear.value, month: nowMonth.value });
      const previousCount = Math.max(firstWeekday - 1, 0);
      const [previousYear, previousMonth] = nowMonth.value === 1 ? [nowYear.value - 1, 12] : [nowYear.value, nowMonth.value - 1];
      const previousDaysInMonth = util_getDate.getDate.getDays({ year: previousYear, month: previousMonth });
      previousMonthDays.value = Array.from({ length: previousCount }, (_, index) => buildDay(previousYear, previousMonth, previousDaysInMonth - previousCount + index + 1));
      currentMonthDays.value = Array.from({ length: daysInMonth }, (_, index) => buildDay(nowYear.value, nowMonth.value, index + 1));
      const nextCount = 42 - previousCount - daysInMonth;
      const [nextYear, nextMonth] = nowMonth.value === 12 ? [nowYear.value + 1, 1] : [nowYear.value, nowMonth.value + 1];
      nextMonthDays.value = Array.from({ length: nextCount }, (_, index) => buildDay(nextYear, nextMonth, index + 1));
    };
    const dayClass = (day) => ({ "is-today": day.isToday, "is-selected": dateKey(day) === selectedDateKey.value, "is-duty": day.isOnDuty, "is-vacation": day.isVacation, "is-workday": day.isCompensatoryLeave });
    const selectDay = (day) => emit("click-day", day);
    common_vendor.watch(() => [props.nowDate, props.shiftsNum, props.latestDate, props.holidayMap], init, { immediate: true });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "arrow-left",
          color: "#c9577d",
          size: "28rpx"
        }),
        b: common_vendor.o(($event) => emit("prev"), "10"),
        c: common_vendor.t(nowPeasant.value.Animal),
        d: common_vendor.t(nowYear.value),
        e: common_vendor.t(nowMonth.value),
        f: common_vendor.p({
          name: "arrow-right",
          color: "#c9577d",
          size: "28rpx"
        }),
        g: common_vendor.o(($event) => emit("next"), "31"),
        h: common_vendor.f(weekList, (day, k0, i0) => {
          return {
            a: common_vendor.t(day),
            b: day,
            c: day === "六" || day === "日" ? 1 : ""
          };
        }),
        i: common_vendor.f(previousMonthDays.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.cDay),
            b: common_vendor.t(item.lunarLabel),
            c: `previous-${item.cYear}-${item.cMonth}-${item.cDay}`
          };
        }),
        j: common_vendor.f(currentMonthDays.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.cDay),
            b: common_vendor.t(item.lunarLabel),
            c: item.isOnDuty
          }, item.isOnDuty ? {} : {}, {
            d: item.isVacation
          }, item.isVacation ? {} : {}, {
            e: item.isCompensatoryLeave
          }, item.isCompensatoryLeave ? {} : {}, {
            f: `current-${item.cDay}`,
            g: common_vendor.n(dayClass(item)),
            h: common_vendor.o(($event) => selectDay(item), `current-${item.cDay}`)
          });
        }),
        k: common_vendor.f(nextMonthDays.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.cDay),
            b: common_vendor.t(item.lunarLabel),
            c: `next-${item.cYear}-${item.cMonth}-${item.cDay}`
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2a73b35f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/indexApp/rl-new/rl-new-item.js.map
