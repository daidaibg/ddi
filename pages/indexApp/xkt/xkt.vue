<template>
	<view class="xkt">
		<view class="tip">
			<image
				src="../../../static/img/xkt/dp.png"
				mode=""
				style="width: 28rpx; height: 28rpx;"
			/>
			<text>Tip: 为你的夏日带去清凉！</text>
		</view>

		<view class="xktContent">
			<view class="xkt_wk">
				<view class="wdWrap">
					<image src="../../../static/img/xkt/logo.png" mode="" />

					<view v-if="type !== 'guan'" class="xkt-wd">
						<view v-if="wdType === 'leng'" class="wdicon leng">
							❄️
						</view>

						<view v-if="wdType === 're'" class="wdicon re">
							☀️
						</view>

						<view class="wd">
							<text style="font-size: 46rpx;">
								{{ wd }}
							</text>
							<text style="font-size: 36rpx;">
								℃
							</text>
						</view>
					</view>
				</view>

				<view class="logo2">
					<image
						src="../../../static/img/xkt/logo2.png"
						mode=""
					/>
				</view>

				<view class="xian">
					<view
						class="dian"
						:style="{
							background:
								type === 'guan'
									? 'rgb(166, 166, 166)'
									: 'rgb(56, 247, 9)'
						}"
					/>
				</view>
			</view>
		</view>

		<view
			class="xktfeng"
			:style="{
				opacity: type === 'guan' ? 0 : 1,
				transition:
					type === 'guan'
						? 'opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)'
						: 'opacity 2500ms cubic-bezier(0.4, 0, 0.2, 1)'
			}"
		>
			<view style="transform: rotate(10deg);" />
			<view style="margin: 0 100rpx;" />
			<view style="transform: rotate(-10deg);" />
		</view>

		<!-- 模式按钮 -->
		<view class="caozuo">
			<view
				@click="switchMode('leng')"
				style="background: rgb(63, 81, 181);"
			>
				<image
					src="../../../static/img/xkt/xh.png"
					mode=""
				/>
			</view>

			<view
				@click="switchMode(type !== 'guan' ? 'guan' : 'kai')"
				:style="{
					margin: '0 60rpx',
					backgroundColor:
						type !== 'guan'
							? 'rgb(245, 0, 87)'
							: 'rgb(76, 175, 80)'
				}"
			>
				<image
					src="../../../static/img/xkt/gb.png"
					mode=""
					style="margin: 4rpx 0 0 4rpx;"
				/>
			</view>

			<view
				@click="switchMode('re')"
				style="background: orange;"
			>
				<image
					src="../../../static/img/xkt/ty.png"
					mode=""
				/>
			</view>
		</view>

		<!-- 温度按钮 -->
		<view class="sx caozuo">
			<view @click="changeTemperature(true)">
				<image
					src="../../../static/img/xkt/s.png"
					mode=""
				/>
			</view>

			<view @click="changeTemperature(false)">
				<image
					src="../../../static/img/xkt/s.png"
					mode=""
					style="transform: rotate(180deg); margin-top: 6rpx;"
				/>
			</view>
		</view>

		<u-toast ref="toastRef" />
	</view>
</template>

<script setup>
import { ref } from 'vue'
import {
	onLoad,
	onUnload,
	onShareAppMessage
} from '@dcloudio/uni-app'

const CLICK_AUDIO_URL =
	'https://www.gaobug.com/img/static/xcx/audio/di.mp3'

const FAN_AUDIO_URL =
	'https://www.gaobug.com/img/static/xcx/audio/air-extractor-fan.mp3'

const OPEN_AUDIO_URL =
	'https://www.gaobug.com/img/static/xcx/audio/ac-work.mp3'

const wd = ref(18)
const wdType = ref('leng')
const type = ref('guan')
const toastRef = ref(null)

let clickAudio = null
let fanAudio = null
let openAudio = null

/**
 * 初始化音频实例
 */
const initAudio = () => {
	try {
		// 微信小程序允许忽略静音开关。
		// 其他平台不支持时可能会进入 fail，不影响后续初始化。
		uni.setInnerAudioOption({
			obeyMuteSwitch: false,
			success() {
				console.log('音频选项设置成功')
			},
			fail(error) {
				console.warn('音频选项设置失败：', error)
			}
		})
	} catch (error) {
		console.warn('当前平台不支持 setInnerAudioOption：', error)
	}

	clickAudio = uni.createInnerAudioContext()
	clickAudio.src = CLICK_AUDIO_URL
	clickAudio.autoplay = false

	fanAudio = uni.createInnerAudioContext()
	fanAudio.src = FAN_AUDIO_URL
	fanAudio.autoplay = false
	fanAudio.loop = true

	openAudio = uni.createInnerAudioContext()
	openAudio.src = OPEN_AUDIO_URL
	openAudio.autoplay = false

	bindAudioEvents(clickAudio, '按钮音效')
	bindAudioEvents(fanAudio, '风扇音效')
	bindAudioEvents(openAudio, '开机音效')
}

/**
 * 监听音频事件，方便在开发者工具和真机中定位问题
 */
const bindAudioEvents = (audio, name) => {
	if (!audio) {
		return
	}

	audio.onCanplay(() => {
		console.log(`${name}可以播放`)
	})

	audio.onPlay(() => {
		console.log(`${name}开始播放`)
	})

	audio.onError((error) => {
		console.error(`${name}播放失败：`, error)

		uni.showToast({
			title: `${name}加载失败`,
			icon: 'none'
		})
	})
}

/**
 * 播放短音效
 *
 * stop 后立即 play 在部分基础库中可能没有声音，
 * 因此使用 seek(0) 将播放位置重置。
 */
const playClickSound = () => {
	if (!clickAudio) {
		return
	}

	try {
		clickAudio.seek(0)
		clickAudio.play()
	} catch (error) {
		console.error('按钮音效播放异常：', error)
	}
}

/**
 * 开机
 */
const startAirConditioner = () => {
	if (fanAudio) {
		fanAudio.play()
	}

	if (openAudio) {
		openAudio.seek(0)
		openAudio.play()
	}
}

/**
 * 关机
 */
const stopAirConditioner = () => {
	if (fanAudio) {
		fanAudio.stop()
	}

	if (openAudio) {
		openAudio.stop()
	}
}

/**
 * 切换模式
 */
const switchMode = (newType) => {
	// 关机状态下不能切换制冷或制热
	if (
		(newType === 'leng' || newType === 're') &&
		type.value === 'guan'
	) {
		return
	}

	type.value = newType
	playClickSound()

	switch (newType) {
		case 'kai':
			startAirConditioner()
			break

		case 'guan':
			stopAirConditioner()
			break

		case 'leng':
			wdType.value = 'leng'
			break

		case 're':
			wdType.value = 're'
			break
	}
}

/**
 * 调节温度
 */
const changeTemperature = (increase) => {
	if (type.value === 'guan') {
		return
	}

	playClickSound()

	if (increase && wd.value >= 30) {
		showWarning('你想把老子热化！')
		return
	}

	if (!increase && wd.value <= 16) {
		showWarning('你想冻死老子吧！')
		return
	}

	wd.value += increase ? 1 : -1
}

/**
 * 显示提示
 */
const showWarning = (title) => {
	// 兼容不同版本的 uView Toast
	if (toastRef.value?.show) {
		toastRef.value.show({
			title,
			message: title,
			type: 'warning'
		})
		return
	}

	uni.showToast({
		title,
		icon: 'none'
	})
}

/**
 * 销毁单个音频实例
 */
const destroyAudio = (audio) => {
	if (!audio) {
		return
	}

	try {
		audio.stop()
		audio.destroy()
	} catch (error) {
		console.warn('销毁音频失败：', error)
	}
}

onLoad(() => {
	uni.setNavigationBarTitle({
		title: '便携小空调'
	})

	initAudio()
})

onUnload(() => {
	destroyAudio(clickAudio)
	destroyAudio(fanAudio)
	destroyAudio(openAudio)

	clickAudio = null
	fanAudio = null
	openAudio = null
})

onShareAppMessage(() => {
	return {
		title: '便携小空调',
		path: '/pages/indexApp/xkt/xkt'
	}
})
</script>

<style lang="scss">
@import "../../../static/css/stylesheet.css";

.xkt {
	width: 100%;
	height: 100%;

	.tip {
		padding-top: 14rpx;
		text-align: center;

		text {
			color: rgba(0, 0, 0, 0.6);
		}
	}

	.xktContent {
		padding: 16rpx;

		.xkt_wk {
			position: relative;
			height: 240rpx;
			background-color: rgb(255, 255, 255);
			border: 2rpx solid rgb(224, 224, 224);
			border-radius: 10rpx 10rpx 20rpx 20rpx;
			box-shadow:
				0 8rpx 8rpx rgba(0, 0, 0, 0.3),
				0 0 6rpx rgba(0, 0, 0, 0.04);

			.wdWrap {
				display: flex;
				justify-content: space-between;
				height: 104rpx;
				margin-top: 10rpx;

				image {
					width: 89rpx;
					height: 89rpx;
				}

				.xkt-wd {
					margin-right: 36rpx;

					.wdicon {
						margin-top: 16rpx;
						font-size: 24rpx;
					}

					.wd {
						width: 60rpx;
						margin-top: 8rpx;
						margin-left: 22rpx;
						color: rgb(204, 204, 204);
						font-family: "Digital-7";
					}
				}
			}

			.logo2 {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 30rpx;

				image {
					width: 24rpx;
					height: 16rpx;
				}
			}

			.xian {
				position: relative;
				height: 2rpx;
				margin-top: 20rpx;
				background: rgb(224, 224, 224);

				.dian {
					position: absolute;
					top: 4rpx;
					right: 28rpx;
					width: 8rpx;
					height: 8rpx;
					border-radius: 50%;
				}
			}
		}
	}

	.xktfeng {
		display: flex;
		justify-content: center;
		width: 100%;
		margin: 16rpx 0;

		view {
			width: 5px;
			height: 90rpx;
			background-color: rgb(187, 187, 187);
		}
	}

	.caozuo {
		display: flex;
		justify-content: center;
		margin-top: 80rpx;

		view {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 90rpx;
			height: 90rpx;
			padding: 0;
			margin: 0;
			overflow: hidden;
			border-radius: 50%;
			box-shadow:
				0 8rpx 8rpx rgba(0, 0, 0, 0.3),
				0 0 6rpx rgba(0, 0, 0, 0.04);

			image {
				width: 54rpx;
				height: 54rpx;
			}
		}
	}

	.sx {
		flex-direction: column;
		align-items: center;
		margin-top: 0;

		view {
			margin-top: 60rpx;
			background-color: rgb(224, 224, 224);

			image {
				width: 30rpx;
				height: 30rpx;
			}
		}
	}
}
</style>