import { createSSRApp } from 'vue'
import App from './App'
import uViewPro from '@/uni_modules/uview-pro'
import { Request ,baseVar} from "./util/http.js"
import * as currency from "./util/currency.js"

export function createApp() {
    const app = createSSRApp(App)
    app.use(uViewPro)
    app.config.globalProperties.$http = Request
    app.config.globalProperties.$currency = currency
    app.config.globalProperties.$url = baseVar

    return {
        app
    }
}
// 如此配置即可

