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
const switchDistanceRatio = 0.22;
const switchDistanceMin = 56;
const switchVelocity = 0.45;
const pageBuffer = 6;
const pageEdge = 3;
const pageBatchSize = 4;
const preparedPageRadius = 2;
const monthPageCacheLimit = 24;
const _sfc_main = {
  __name: "rl-new",
  setup(__props) {
    const defaultConfig = { shiftsNum: 0, time: null, timeData: null, timestamp: null };
    const currentMonth = common_vendor.ref(null);
    const calendarPages = common_vendor.ref([]);
    const activePageIndex = common_vendor.ref(6);
    const isAnimating = common_vendor.ref(false);
    const transitionDirection = common_vendor.ref(0);
    const transitionEnabled = common_vendor.ref(true);
    const transitionDuration = common_vendor.ref(0);
    const dragOffset = common_vendor.ref(0);
    const viewportWidth = common_vendor.ref(common_vendor.index.getSystemInfoSync().windowWidth);
    const dragState = { startX: 0, startY: 0, startTime: 0, mode: "", input: "", active: false };
    const selectedDate = common_vendor.ref(new util_getDate.getDate().dateFormat());
    const selectedDay = common_vendor.ref(null);
    const configShow = common_vendor.ref(false);
    const calendarShow = common_vendor.ref(false);
    const selectShow = common_vendor.ref(false);
    const setData = common_vendor.ref({ ...defaultConfig });
    const holidayMap = common_vendor.ref({});
    const holidayVersion = common_vendor.ref(0);
    const attemptedHolidayYears = /* @__PURE__ */ new Set();
    const pendingHolidayResults = [];
    const shiftOptions = Array.from({ length: 31 }, (_, index) => ({ value: index + 1, label: index + 1 }));
    const monthPageCache = /* @__PURE__ */ new Map();
    const getMonthStart = (date) => new util_getDate.getDate(`${date.getFullYear()}/${date.getMonth()}/1`);
    const createMonthPage = (date) => {
      const id = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      const cached = monthPageCache.get(id);
      if (cached) {
        monthPageCache.delete(id);
        monthPageCache.set(id, cached);
        return cached;
      }
      const page = { id, date: date.dateFormat(), isReady: false };
      monthPageCache.set(id, page);
      if (monthPageCache.size > monthPageCacheLimit)
        monthPageCache.delete(monthPageCache.keys().next().value);
      return page;
    };
    const offsetMonth = (date, offset) => getMonthStart(new util_getDate.getDate(date.getOffsetMonth(offset).format));
    const createCalendarPages = (month) => Array.from({ length: pageBuffer * 2 + 1 }, (_, index) => createMonthPage(offsetMonth(new util_getDate.getDate(month.date), index - pageBuffer)));
    const getSlideWidth = () => viewportWidth.value || common_vendor.index.getSystemInfoSync().windowWidth;
    const viewportStyle = common_vendor.computed(() => ({ "--calendar-slide-width": `${getSlideWidth()}px` }));
    const trackStyle = common_vendor.computed(() => ({
      width: `${calendarPages.value.length * getSlideWidth()}px`,
      transform: `translate3d(${-activePageIndex.value * getSlideWidth() + dragOffset.value}px,0,0)`,
      transitionDuration: isAnimating.value && transitionEnabled.value ? `${transitionDuration.value}ms` : "0ms"
    }));
    const animationSignalStyle = common_vendor.computed(() => ({ animationDuration: `${transitionDuration.value}ms` }));
    const refreshViewportWidth = () => {
      common_vendor.index.createSelectorQuery().select(".calendar-viewport").boundingClientRect((rect) => {
        if (rect == null ? void 0 : rect.width)
          viewportWidth.value = rect.width;
      }).exec();
    };
    const prepareNearbyPages = () => {
      calendarPages.value.forEach((page, index) => {
        page.isReady = Math.abs(index - activePageIndex.value) <= preparedPageRadius;
      });
    };
    const stabilizePages = () => {
      const pages = calendarPages.value;
      let activeIndex = activePageIndex.value;
      if (activeIndex < pageEdge) {
        const firstDate = new util_getDate.getDate(pages[0].date);
        const addedPages = Array.from({ length: pageBatchSize }, (_, index) => createMonthPage(offsetMonth(firstDate, index - pageBatchSize)));
        pages.unshift(...addedPages);
        activeIndex += pageBatchSize;
        pages.splice(activeIndex + pageBuffer + 1);
      } else if (pages.length - activeIndex - 1 < pageEdge) {
        const lastDate = new util_getDate.getDate(pages[pages.length - 1].date);
        pages.push(...Array.from({ length: pageBatchSize }, (_, index) => createMonthPage(offsetMonth(lastDate, index + 1))));
        const removeCount = pages.length - (pageBuffer * 2 + 1);
        pages.splice(0, removeCount);
        activeIndex -= removeCount;
      }
      activePageIndex.value = activeIndex;
    };
    const applyHolidayResults = (results) => {
      const nextHolidayMap = results.reduce((map, result) => Object.assign(map, util_rq.buildHolidayMap(result.calendar)), {});
      if (Object.keys(nextHolidayMap).length) {
        holidayMap.value = { ...holidayMap.value, ...nextHolidayMap };
        holidayVersion.value += 1;
      }
    };
    const flushHolidayResults = () => {
      if (pendingHolidayResults.length)
        applyHolidayResults(pendingHolidayResults.splice(0));
    };
    const loadHolidayYears = async (dates) => {
      const years = [...new Set(dates.map((date) => new util_getDate.getDate(date).getFullYear()))].filter((year) => !attemptedHolidayYears.has(year));
      if (!years.length)
        return;
      years.forEach((year) => attemptedHolidayYears.add(year));
      const results = await Promise.all(years.map(util_rq.loadHolidayCalendar));
      if (isAnimating.value) {
        pendingHolidayResults.push(...results);
        return;
      }
      applyHolidayResults(results);
    };
    const loadConfig = () => {
      const savedConfig = common_vendor.index.getStorageSync("snow-rl-config");
      setData.value = savedConfig ? { ...defaultConfig, ...savedConfig } : { ...defaultConfig };
    };
    const init = () => {
      const today = new util_getDate.getDate();
      currentMonth.value = createMonthPage(getMonthStart(today));
      calendarPages.value = createCalendarPages(currentMonth.value);
      activePageIndex.value = pageBuffer;
      prepareNearbyPages();
      isAnimating.value = false;
      transitionDirection.value = 0;
      transitionDuration.value = 0;
      dragOffset.value = 0;
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
    const getDampedOffset = (offset) => {
      const width = getSlideWidth();
      const distance = Math.abs(offset);
      if (distance <= width)
        return offset;
      return Math.sign(offset) * (width + (distance - width) * 0.28);
    };
    const getTransitionDuration = (distance, velocity = 0) => {
      const ratio = Math.min(Math.abs(distance) / getSlideWidth(), 1);
      const speedAdjustment = Math.min(Math.abs(velocity) * 90, 90);
      return Math.max(180, Math.min(380, Math.round(150 + ratio * 230 - speedAdjustment)));
    };
    const setDragOffsetNow = (offset) => {
      dragOffset.value = offset;
    };
    const scheduleDragOffset = (offset) => {
      setDragOffsetNow(offset);
      return;
    };
    const switchMonth = (direction) => {
      if (isAnimating.value)
        return;
      if (!calendarPages.value[activePageIndex.value + direction])
        return;
      transitionDirection.value = direction;
      transitionDuration.value = getTransitionDuration(getSlideWidth());
      isAnimating.value = true;
      setDragOffsetNow(-direction * getSlideWidth());
    };
    const next = () => {
      switchMonth(1);
    };
    const prev = () => {
      switchMonth(-1);
    };
    const goToday = () => {
      if (isAnimating.value)
        return;
      init();
      loadHolidayYears(calendarPages.value.map((page) => page.date));
    };
    const resetDrag = (velocity = 0) => {
      if (isAnimating.value)
        return;
      transitionDirection.value = 0;
      transitionDuration.value = getTransitionDuration(Math.abs(dragOffset.value), velocity);
      isAnimating.value = true;
      setDragOffsetNow(0);
    };
    const getPointerPosition = (point) => {
      const x = (point == null ? void 0 : point.pageX) ?? (point == null ? void 0 : point.clientX) ?? (point == null ? void 0 : point.x);
      const y = (point == null ? void 0 : point.pageY) ?? (point == null ? void 0 : point.clientY) ?? (point == null ? void 0 : point.y);
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    };
    const startDrag = (point, input) => {
      const position = getPointerPosition(point);
      if (!position || isAnimating.value || dragState.active)
        return;
      dragState.startX = position.x;
      dragState.startY = position.y;
      dragState.startTime = Date.now();
      dragState.mode = "";
      dragState.input = input;
      dragState.active = true;
    };
    const updateDrag = (point) => {
      const position = getPointerPosition(point);
      if (!position || isAnimating.value || !dragState.active || dragState.mode === "vertical")
        return;
      const deltaX = position.x - dragState.startX;
      const deltaY = position.y - dragState.startY;
      if (!dragState.mode) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8)
          return;
        dragState.mode = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      }
      if (dragState.mode === "horizontal")
        scheduleDragOffset(getDampedOffset(deltaX));
    };
    const finishDrag = (point) => {
      if (isAnimating.value || !dragState.active)
        return;
      const mode = dragState.mode;
      dragState.active = false;
      dragState.input = "";
      if (mode !== "horizontal")
        return;
      const position = getPointerPosition(point);
      const deltaX = ((position == null ? void 0 : position.x) ?? dragState.startX) - dragState.startX;
      const elapsed = Math.max(Date.now() - dragState.startTime, 1);
      const velocity = deltaX / elapsed;
      const currentOffset = getDampedOffset(deltaX);
      setDragOffsetNow(currentOffset);
      const shouldSwitch = Math.abs(deltaX) >= Math.max(switchDistanceMin, getSlideWidth() * switchDistanceRatio) || Math.abs(velocity) >= switchVelocity;
      if (!shouldSwitch) {
        resetDrag(velocity);
        return;
      }
      transitionDirection.value = deltaX < 0 ? 1 : -1;
      transitionDuration.value = getTransitionDuration(Math.abs(-transitionDirection.value * getSlideWidth() - currentOffset), velocity);
      isAnimating.value = true;
      setDragOffsetNow(-transitionDirection.value * getSlideWidth());
    };
    const cancelDrag = () => {
      if (!dragState.active || isAnimating.value)
        return;
      const shouldReset = dragState.mode === "horizontal";
      dragState.active = false;
      dragState.input = "";
      if (shouldReset)
        resetDrag();
    };
    const abortInteraction = () => {
      dragState.active = false;
      dragState.input = "";
      transitionDirection.value = 0;
      setDragOffsetNow(0);
      if (!isAnimating.value)
        return;
      transitionEnabled.value = false;
      common_vendor.nextTick$1(() => {
        transitionEnabled.value = true;
        isAnimating.value = false;
      });
    };
    const onTouchStart = (event) => {
      var _a;
      return startDrag((_a = event.touches) == null ? void 0 : _a[0], "touch");
    };
    const onTouchMove = (event) => {
      var _a, _b;
      return updateDrag(((_a = event.touches) == null ? void 0 : _a[0]) || ((_b = event.changedTouches) == null ? void 0 : _b[0]));
    };
    const onTouchEnd = (event) => {
      var _a;
      return finishDrag((_a = event.changedTouches) == null ? void 0 : _a[0]);
    };
    const onTouchCancel = () => cancelDrag();
    const onMouseDown = (event) => {
      var _a;
      if (event.button !== 0)
        return;
      (_a = event.preventDefault) == null ? void 0 : _a.call(event);
      startDrag(event, "mouse");
    };
    const onMouseMove = (event) => {
      if (dragState.input === "mouse")
        updateDrag(event);
    };
    const onMouseUp = (event) => {
      if (dragState.input === "mouse")
        finishDrag(event);
    };
    const onMouseLeave = () => {
      if (dragState.input === "mouse")
        cancelDrag();
    };
    const onTransitionEnd = () => {
      if (!isAnimating.value)
        return;
      if (transitionDirection.value) {
        activePageIndex.value += transitionDirection.value;
        transitionEnabled.value = false;
        stabilizePages();
        prepareNearbyPages();
        currentMonth.value = calendarPages.value[activePageIndex.value];
        setDragOffsetNow(0);
        transitionDirection.value = 0;
        common_vendor.nextTick$1(() => {
          transitionEnabled.value = true;
          isAnimating.value = false;
          flushHolidayResults();
          loadHolidayYears(calendarPages.value.map((page) => page.date));
        });
        return;
      }
      isAnimating.value = false;
    };
    common_vendor.onLoad(() => {
      loadConfig();
      init();
      loadHolidayYears(calendarPages.value.map((page) => page.date));
    });
    common_vendor.onReady(() => {
      common_vendor.nextTick$1(refreshViewportWidth);
    });
    common_vendor.onHide(() => {
      abortInteraction();
    });
    common_vendor.onShareAppMessage(() => ({
      title: "私人小日历",
      path: "/pages/index/index?share=true"
    }));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goToday, "8b"),
        b: common_vendor.f(calendarPages.value, (item, k0, i0) => {
          return {
            a: "58292e92-1-" + i0 + "," + ("58292e92-0-" + i0),
            b: common_vendor.o(openConfig, item.id),
            c: common_vendor.o(clickDay, item.id),
            d: common_vendor.o(next, item.id),
            e: common_vendor.o(prev, item.id),
            f: "58292e92-0-" + i0,
            g: common_vendor.p({
              ["now-date"]: item.date,
              ["is-ready"]: item.isReady,
              ["holiday-version"]: holidayVersion.value,
              ["selected-date"]: selectedDate.value,
              ["latest-date"]: setData.value.timestamp,
              ["shifts-num"]: setData.value.shiftsNum,
              ["holiday-map"]: holidayMap.value
            }),
            h: item.id
          };
        }),
        c: common_vendor.p({
          name: "setting",
          color: "#ffffff",
          size: "38rpx"
        }),
        d: isAnimating.value && transitionEnabled.value ? 1 : "",
        e: common_vendor.s(trackStyle.value),
        f: common_vendor.o(onTransitionEnd, "9b"),
        g: isAnimating.value && transitionEnabled.value
      }, isAnimating.value && transitionEnabled.value ? {
        h: common_vendor.s(animationSignalStyle.value),
        i: common_vendor.o(onTransitionEnd, "e3")
      } : {}, {
        j: common_vendor.s(viewportStyle.value),
        k: common_vendor.o(onTouchStart, "5d"),
        l: common_vendor.o(onTouchMove, "3a"),
        m: common_vendor.o(onTouchEnd, "b3"),
        n: common_vendor.o(onTouchCancel, "bc"),
        o: common_vendor.o(onMouseDown, "13"),
        p: common_vendor.o(onMouseMove, "b5"),
        q: common_vendor.o(onMouseUp, "65"),
        r: common_vendor.o(onMouseLeave, "d3"),
        s: common_vendor.t(selectedDay.value ? selectedDay.value.ncWeek : "选择日期查看排班状态"),
        t: common_vendor.t(selectedDay.value ? `${selectedDay.value.cMonth} 月 ${selectedDay.value.cDay} 日` : "今日"),
        v: selectedDay.value
      }, selectedDay.value ? common_vendor.e({
        w: common_vendor.t(selectedDay.value.lunarLabel),
        x: selectedDay.value.isOnDuty
      }, selectedDay.value.isOnDuty ? {} : selectedDay.value.isVacation ? {} : selectedDay.value.isCompensatoryLeave ? {} : {}, {
        y: selectedDay.value.isVacation,
        z: selectedDay.value.isCompensatoryLeave
      }) : {
        A: common_vendor.p({
          name: "calendar",
          color: "#df8ca8",
          size: "30rpx"
        })
      }, {
        B: common_vendor.t(setData.value.shiftsNum || "未设置"),
        C: common_vendor.t(setData.value.time || "未设置"),
        D: common_vendor.t(setData.value.shiftsNum || "未设置"),
        E: common_vendor.p({
          name: "arrow-right",
          color: "#c8a4b0",
          size: "24rpx"
        }),
        F: common_vendor.o(selectShiftNum, "d6"),
        G: common_vendor.t(setData.value.time || "请选择"),
        H: common_vendor.p({
          name: "arrow-right",
          color: "#c8a4b0",
          size: "24rpx"
        }),
        I: common_vendor.o(selectLatestDate, "68"),
        J: common_vendor.o(clearConfig, "e1"),
        K: common_vendor.p({
          plain: true,
          ["custom-style"]: "border-color:#efbfd0;color:#c9577d;background:#fff7fa;"
        }),
        L: common_vendor.o(saveConfig, "62"),
        M: common_vendor.p({
          type: "error",
          ["custom-style"]: "margin-left:20rpx;background:#dc6f95;border-color:#dc6f95;"
        }),
        N: common_vendor.o(($event) => configShow.value = $event, "5d"),
        O: common_vendor.p({
          mode: "bottom",
          round: "28",
          closeable: true,
          modelValue: configShow.value
        }),
        P: common_vendor.o(timeChange, "24"),
        Q: common_vendor.o(($event) => calendarShow.value = $event, "c9"),
        R: common_vendor.p({
          mode: "date",
          ["active-bg-color"]: "#dc6f95",
          ["btn-type"]: "error",
          ["max-date"]: "2050-01-01",
          modelValue: calendarShow.value
        }),
        S: common_vendor.o(confirm, "27"),
        T: common_vendor.o(($event) => selectShow.value = $event, "bd"),
        U: common_vendor.p({
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
