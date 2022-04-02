import Vue from 'vue'
import App from './App'
import uView from "uview-ui";
import { Request ,baseVar} from "./util/http.js"
import * as currency from "./util/currency.js"
Vue.use(uView);
Vue.config.productionTip = false
Vue.prototype.$http=Request
Vue.prototype.$currency=currency 
Vue.prototype.$url=baseVar 
// 如此配置即可
App.mpType = 'app'

const app = new Vue({
    ...App,
})
app.$mount()
