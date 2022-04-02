export const getOpenid = () => {
		let wxloginsession = uni.getStorageSync('wxloginsession');
		if (wxloginsession) {
			return wxloginsession.openid
		}
		return false

	}
