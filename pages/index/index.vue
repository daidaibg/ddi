<template>
	<view class="index_wrap">
		<Refresh @onRefresh="onRefresh">
			<u-swiper :list="list" class="swiper_wrap" border-radius="0rpx" height="340rpx" title name="image"
				:title-style="titleStyle" img-mode="aspectFill" bg-color="#2789FF"></u-swiper>
			<view class="index_app">
				<view class="item" v-for="item in appList" :key="item.url" @click="navigateTos(item)">
					<image :src="item.image" mode="" class="imagecla"></image>
					<text class="textcla">{{item.name}}</text>

				</view>
			</view>
		</Refresh>
	</view>
</template>

<script>
	import Refresh from "../../components/Refresh/Refresh/Refresh.vue"
	export default {
		// options: { styleIsolation: 'shared' }  , //可以样式穿透
		data() {
			return {
				titleStyle: {
					textAlign: 'center'
				},
				title: 'Hello',
				list: [{
						image: '/static/img/index/a.jpg',
						title: '热烈的夏天太短，每一秒都值得去爱'
					},

					{
						image: '/static/img/index/c.jpg',
						title: '谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳 '
					},
				],

				appList: [{
						image: '/static/img/index/kt2.png',
						name: "小空调",
						url: "/pages/indexApp/xkt/xkt"
					},
					{
						image: '/static/img/index/rl.png',
						name: "日历",
						url: "/pages/indexApp/rl/rl"
					},
					{
						image: '/static/img/index/djs.png',
						name: "倒计时",
						url: "/pages/indexApp/djs/djs"
					},
					{
						image: '/static/img/index/tx.png',
						name: "节假日",
						url: "/pages/indexApp/jjr/jjr"
					},
					{
						image: '/static/img/index/sq.png',
						name: "设置",
						url: "/pages/indexApp/setting/setting"
					},
				],
			}
		},
		components: {
			Refresh
		},
		onLoad() {
			// uni.navigateTo({
			// 	url:"/pages/indexApp/rl/rl"
			// })
		},
		methods: {
			onRefresh() {

			},
			navigateTos(item) {
				if (item.url) {
					uni.navigateTo({
						url: item.url
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.index_wrap {
		.swiper_wrap {
			width: 100%;

		}
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.index_app {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		background-color: #FFF;
		border: 0 solid #e4e7ed;

		.item {
			width: 25%;
			display: flex;
			position: relative;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 160rpx;

			.textcla {
				font-size: 22rpx;
				margin-top: 12rpx;
				color: #323133;
			}

			.imagecla {
				width: 60rpx;
				height: 60rpx;
			}
		}

	}
</style>
