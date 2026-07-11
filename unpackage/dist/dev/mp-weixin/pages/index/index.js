"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  Refresh();
}
const Refresh = () => "../../components/Refresh/Refresh/Refresh.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const toolGroups = [
      {
        name: "常用功能",
        desc: "呆呆酱是只可耐小猫咪哟！",
        items: [
          {
            image: "/static/img/index/kt2.png",
            name: "小空调",
            desc: "夏天降温",
            url: "/pages/indexApp/xkt/xkt",
            bg: "#eaf2ff"
          },
          {
            image: "/static/img/index/rl.png",
            name: "值班日历",
            desc: "排班查看",
            url: "/pages/indexApp/rl-new/rl-new",
            bg: "#fff1f2"
          },
          {
            image: "/static/img/index/djs.png",
            name: "除夕倒计时",
            desc: "时间提醒",
            url: "/pages/indexApp/djs/djs",
            bg: "#fff7ed"
          }
        ]
      },
      {
        name: "向僵尸开炮",
        desc: "开炮！开炮！开炮！",
        items: [
          {
            image: "https://www.gaobug.com/img/static/kaipao/equipment/yifu.png",
            name: "装备词条",
            desc: "开炮配置",
            url: "/pages/indexApp/kaipao-equipment-entries/kaipao-equipment-entries",
            bg: "#eaf2ff"
          }
        ]
      }
    ];
    const onRefresh = () => {
    };
    const navigateTos = ({ url }) => {
      if (!url)
        return;
      common_vendor.index.navigateTo({ url });
    };
    common_vendor.onShareAppMessage(() => ({
      title: "呆呆工具箱",
      path: "/pages/index/index"
    }));
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(toolGroups, (group, k0, i0) => {
          return {
            a: common_vendor.t(group.name),
            b: common_vendor.t(group.desc),
            c: common_vendor.f(group.items, (item, k1, i1) => {
              return {
                a: item.image,
                b: item.bg,
                c: common_vendor.t(item.name),
                d: common_vendor.t(item.desc),
                e: item.url,
                f: common_vendor.o(($event) => navigateTos(item), item.url)
              };
            }),
            d: group.name
          };
        }),
        b: common_vendor.o(onRefresh, "eb")
      };
    };
  }
};
_sfc_main.__runtimeHooks = 2;
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
