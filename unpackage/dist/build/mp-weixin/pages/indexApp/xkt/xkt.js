(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/indexApp/xkt/xkt"],{"40ab":function(t,n,i){"use strict";i.d(n,"b",(function(){return a})),i.d(n,"c",(function(){return o})),i.d(n,"a",(function(){return e}));var e={uToast:function(){return i.e("node-modules/uview-ui/components/u-toast/u-toast").then(i.bind(null,"239f"))}},a=function(){var t=this.$createElement;this._self._c},o=[]},"7ed1":function(t,n,i){},"83b7":function(t,n,i){"use strict";var e=i("7ed1"),a=i.n(e);a.a},a037:function(t,n,i){"use strict";(function(t){var n=i("4ea4");i("a32b");n(i("66fd"));var e=n(i("c450"));wx.__webpack_require_UNI_MP_PLUGIN__=i,t(e.default)}).call(this,i("543d")["createPage"])},b7a2:function(t,n,i){"use strict";i.r(n);var e=i("dfef"),a=i.n(e);for(var o in e)["default"].indexOf(o)<0&&function(t){i.d(n,t,(function(){return e[t]}))}(o);n["default"]=a.a},c450:function(t,n,i){"use strict";i.r(n);var e=i("40ab"),a=i("b7a2");for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(n,t,(function(){return a[t]}))}(o);i("83b7");var u=i("f0c5"),d=Object(u["a"])(a["default"],e["b"],e["c"],!1,null,null,null,!1,e["a"],void 0);n["default"]=d.exports},dfef:function(t,n,i){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={data:function(){return{wd:18,wdType:"leng",type:"guan",xktfengStyle:"",audioCtx:null,audioBackground:null,audioOpen:null}},onShareAppMessage:function(t){return{title:"便携小空调",path:"/pages/indexApp/xkt/xkt",success:function(t){},fail:function(t){}}},onLoad:function(){wx.setNavigationBarTitle({title:"便携小空调"}),wx.setInnerAudioOption({obeyMuteSwitch:!1}),this.audioCtx=wx.createInnerAudioContext(),this.audioCtx.src="http://www.daidaibg.com/statics/audio/di.mp3",this.audioBackground=wx.createInnerAudioContext(),this.audioBackground.src="http://www.daidaibg.com/statics/audio/air-extractor-fan.mp3",this.audioBackground.loop=!0,this.audioOpen=wx.createInnerAudioContext(),this.audioOpen.src="http://www.daidaibg.com/statics/audio/ac-work.mp3"},onUnload:function(){this.audioCtx.destroy(),this.audioBackground.destroy(),this.audioOpen.destroy()},methods:{switchMode:function(t){console.log(t),("re"!=t&&"leng"!=t||"guan"!=this.type)&&(this.type=t,this.audioCtx.stop(),this.audioCtx.play(),"kai"==t?(this.audioBackground.play(),this.audioOpen.play()):"guan"==t?(this.audioBackground.stop(),this.audioOpen.stop()):("leng"==t||"re"==t)&&(this.wdType=t))},wdJJ:function(t){"guan"!=this.type&&(this.audioCtx.stop(),this.audioCtx.play(),"guan"!=this.type&&(this.wd>=30&&t?this.$refs.uToast.show({title:"你想把老子热化！",type:"warning"}):this.wd<=16&&!t?this.$refs.uToast.show({title:"你想冻死老子吧！",type:"warning"}):t?this.wd++:this.wd--))}}};n.default=e}},[["a037","common/runtime","common/vendor"]]]);