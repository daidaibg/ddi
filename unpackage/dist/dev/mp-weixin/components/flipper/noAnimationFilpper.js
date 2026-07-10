"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "noAnimationFilpper",
  props: {
    frontText: {
      type: [String, Number],
      default: "00"
    }
  },
  setup(__props) {
    const props = __props;
    const frontTextList = common_vendor.computed(() => Array.from(String(props.frontText)));
    const wrapStyle = common_vendor.computed(() => `grid-template-columns: repeat(${frontTextList.value.length}, 1fr);`);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(frontTextList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        b: common_vendor.s(wrapStyle.value)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2faf1ec8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/flipper/noAnimationFilpper.js.map
