<template>
	<view class="djs">
		<view class="djs_back">
			<image :src="imgSrc" mode="aspectFill" />
		</view>
		<!-- #ifdef MP-WEIXIN -->
		<image
			class="back-home-btn"
			:style="homeButtonStyle"
			src="/static/img/djs/back.png"
			mode="aspectFit"
			@tap="goHome"
		/>
		<!-- #endif -->
		<view class="title">距离除夕还剩下</view>
		<view class="FlipClock">
			<Flipper :frontText="frontText.day" />
			<text>天</text>
			<Flipper :frontText="frontText.hour" />
			<text>时</text>
			<Flipper :frontText="frontText.minute" />
			<text>分</text>
			<Flipper :frontText="frontText.second" />
			<text>秒</text>
		</view>
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue'
	import { onLoad, onShareAppMessage, onUnload } from '@dcloudio/uni-app'
	import Flipper from '../../../components/flipper/noAnimationFilpper.vue'
	import calendar from '../../../util/lunar-alendar.js'

	const imgSrc = ref('https://www.gaobug.com/img/static/xcx/chux.png')
	const homeButtonStyle = ref('top: 48px;')
	const frontText = reactive({
		day: '00',
		hour: '00',
		minute: '00',
		second: '00'
	})

	let timer = null
	let chuxiDate = null

	const formatTime = num => (num < 10 ? `0${num}` : `${num}`)

	const updateCountdown = () => {
		const currentDate = new Date()
		const timeDifference = Math.max(chuxiDate - currentDate, 0)
		const day = Math.floor(timeDifference / (1000 * 3600 * 24))
		const hoursLeft = timeDifference % (24 * 3600 * 1000)
		const hour = Math.floor(hoursLeft / (3600 * 1000))
		const minutesLeft = hoursLeft % (3600 * 1000)
		const minute = Math.floor(minutesLeft / (60 * 1000))
		const secondsLeft = minutesLeft % (60 * 1000)
		const second = Math.round(secondsLeft / 1000)

		frontText.day = formatTime(day)
		frontText.hour = formatTime(hour)
		frontText.minute = formatTime(minute)
		frontText.second = formatTime(second)
	}

	const startCountdown = () => {
		clearCountdown()
		timer = setInterval(updateCountdown, 1000)
	}

	const clearCountdown = () => {
		if (!timer) return

		clearInterval(timer)
		timer = null
	}

	const getChuxiDate = () => {
		const today = new Date()
		const thisYear = today.getFullYear()
		let dayNum = 30
		let chuxiDay = -1

		while (chuxiDay === -1) {
			chuxiDay = calendar.lunar2solar(thisYear, 12, dayNum)
			dayNum--
		}

		let lastChuxiDayNum = 30
		let lastYearChuxi = -1

		while (lastYearChuxi === -1) {
			lastYearChuxi = calendar.lunar2solar(thisYear - 1, 12, lastChuxiDayNum)
			lastChuxiDayNum--
		}

		const chuxiDayFormat = `${chuxiDay.cYear}/${chuxiDay.cMonth}/${chuxiDay.cDay} 00:00:00`
		const lastYearFormat = `${lastYearChuxi.cYear}/${lastYearChuxi.cMonth}/${lastYearChuxi.cDay} 00:00:00`
		const targetDate = new Date(lastYearFormat) - today > 0 ? lastYearFormat : chuxiDayFormat

		return new Date(targetDate)
	}

	const setHomeButtonPosition = () => {
		// #ifdef MP-WEIXIN
		const systemInfo = uni.getSystemInfoSync()
		const menuButton = uni.getMenuButtonBoundingClientRect()
		const top = menuButton?.top || systemInfo.statusBarHeight + 8

		homeButtonStyle.value = `top: ${top}px;`
		// #endif
	}

	const goHome = () => {
		uni.redirectTo({
			url: '/pages/index/index'
		})
	}

	onLoad(() => {
		setHomeButtonPosition()
		chuxiDate = getChuxiDate()
		updateCountdown()
		startCountdown()
	})

	onUnload(clearCountdown)

	onShareAppMessage(() => ({
		title: '除夕倒计时',
		path: '/pages/indexApp/djs/djs'
	}))
</script>

<style lang="scss" scoped>
	.djs_back {
		width: 100%;
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		z-index: 0;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.title {
		font-size: 36rpx;
		text-align: center;
		padding: 300rpx 0 100rpx 0;
		z-index: 1;
		position: relative;
		color: #e7e7e6;
	}

	.djs {
		width: 100%;
		position: relative;
		height: 100vh;
		overflow: hidden;
	}

	.back-home-btn {
		position: fixed;
		left: 24rpx;
		z-index: 999;
		width: 88rpx;
		height: 88rpx;
		filter: drop-shadow(0 8rpx 18rpx rgba(58, 0, 0, .34));
		transition: opacity .16s ease, transform .16s ease;
	}

	.back-home-btn:active {
		opacity: .82;
		transform: scale(.92);
	}

	.FlipClock {
		text-align: center;
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0 16rpx;
		box-sizing: border-box;
		overflow: visible;
	}

	.FlipClock ::v-deep .time_wrap_list,
	.FlipClock ::v-deep .noAnimationFilpper {
		flex-shrink: 0;
	}

	.FlipClock text {
		display: inline-block;
		flex-shrink: 0;
		line-height: 102rpx;
		font-style: normal;
		vertical-align: top;
		font-size: 36rpx;
		color: #e7e7e6;
		margin: 0 2rpx;
	}
</style>
