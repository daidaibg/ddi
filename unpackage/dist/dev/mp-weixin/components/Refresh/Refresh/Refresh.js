"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loadingText: "下拉刷新!",
      triggered: false
      //设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    };
  },
  props: {
    loadingTextS: {
      type: String,
      default: () => {
        return "下拉刷新！";
      }
    }
  },
  methods: {
    onRefresh() {
      if (!this.triggered) {
        this.triggered = true;
        this.loadingText = "努力加载中...";
        common_vendor.wx$1.vibrateShort({
          type: "heavy"
        });
        this.$emit("onRefresh");
        let timer = setTimeout(() => {
          this.triggered = false;
          this.loadingText = "下拉刷新！";
          clearTimeout(timer);
        }, 2500);
      }
    },
    loadMore() {
      common_vendor.index.__f__("log", "at components/Refresh/Refresh/Refresh.vue:54", "loadMore");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$2,
    b: common_vendor.t($data.loadingText),
    c: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "54"),
    d: $data.triggered,
    e: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "d2")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/components/Refresh/Refresh/Refresh.js.map
