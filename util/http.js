export var baseVar = {
	// baseUrl:"https://www.daidaibg.com/wzry-server",
	socketUrl:"wss://www.daidaibg.com/wss",
	baseUrl:  "https://www.gaobug.com",
}

if(process.env.NODE_ENV === 'development'){ 
	// baseVar.baseUrl="http://localhost:9527"
	// baseVar.socketUrl="ws://192.168.0.227:3668/wzry-server/socket"
}else{ 
	console.log('生产环境') 
}
export const Request = (opts) => {
	let wxloginsession = uni.getStorageSync('wxloginsession') || {};
	let openid = uni.getStorageSync('openid') || wxloginsession.openid || '';
	let httpDefaultOpts = {
		url: (opts.baseUrl || baseVar["baseUrl"]) + opts.url,
		data: opts.data || {},
		method: opts.method || 'GET',
		header: {
			'openid': openid,
			'content-type': 'application/json'
		},
		dataType: 'json'
	}

	return new Promise(function(resolve, reject) {

		uni.request({
			...httpDefaultOpts,
			success: (res) => {
				// console.log('httpsuccess',res);
				resolve(res.data)
			},
			fail:(err)=>{
				console.log('httpfail',err)
				resolve({
					success:false,
					msg:"未知异常"
				})
			}
		})
	})

}

