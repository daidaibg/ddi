<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { ensureOpenid } from './util/openid.js'

onLaunch(() => {
	// #ifdef MP-WEIXIN
	autoUpdate()
	ensureOpenid(false, { showError: false })
	// #endif
})

const autoUpdate = () => {
	if (wx.canIUse('getUpdateManager')) {
		const updateManager = wx.getUpdateManager()
		updateManager.onCheckForUpdate((res) => {
			if (res.hasUpdate) downLoadAndUpdate(updateManager)
		})
		return
	}

	wx.showModal({
		title: '提示',
		content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
	})
}

const downLoadAndUpdate = (updateManager) => {
	updateManager.onUpdateReady(() => {
		updateManager.applyUpdate()
	})
	updateManager.onUpdateFailed(() => {
		wx.showModal({
			title: '已经有新版本了哟~',
			content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
		})
	})
}
</script>

<style lang="scss">
	@import "@/uni_modules/uview-pro/index.scss";
	@font-face {
		font-family: 'DS-DIGI';
		src: url('./static/font/DS-DIGI.ttf');
	}
	page,
	view,
	text,
	image,
	button,
	input,
	textarea,
	scroll-view,
	swiper,
	swiper-item {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		background-color: #F6F9FA;
		min-height: 100%;
	}
</style>
