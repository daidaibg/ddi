<template>
	<view class="index_wrap">
		<Refresh @onRefresh="onRefresh">
			<view class="home_hero">
				<view class="hero_text">
					<text class="hero_eyebrow">DAIDAI TOOLS</text>
					<text class="hero_title">呆呆工具箱</text>
					<text class="hero_desc">个人娱乐工具整理开发。</text>
				</view>
				<image src="https://www.gaobug.com/img/daidai/av/daidai1.png" mode="aspectFill" class="hero_img"></image>
			</view>
			<view class="openid-action">
				<button class="openid-retry" :loading="refreshingOpenid" @tap="refreshOpenid">重新获取 openid</button>
			</view>

			<view class="tool_group" v-for="group in toolGroups" :key="group.name">
				<view class="section_head">
					<text class="section_title">{{ group.name }}</text>
					<text class="section_sub">{{ group.desc }}</text>
				</view>

				<view class="index_app">
					<view class="item" v-for="item in group.items" :key="item.url" @click="navigateTos(item)">
						<view class="icon_box" :style="{ backgroundColor: item.bg }">
							<u-icon v-if="item.icon" :name="item.icon" color="#1769e0" size="42"></u-icon>
							<image v-else :src="item.image" mode="aspectFit" class="imagecla"></image>
						</view>
						<view class="item_text_wrap">
							<text class="textcla">{{item.name}}</text>
							<text class="descla">{{item.desc}}</text>
						</view>
					</view>
				</view>
			</view>
		</Refresh>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import Refresh from '../../components/Refresh/Refresh/Refresh.vue'
	import { onLoad, onShareAppMessage, onUnload } from '@dcloudio/uni-app'
	import { ensureOpenid } from '../../util/openid.js'

	const refreshingOpenid = ref(false)
	const toolGroups = [
		{
			name: '常用功能',
			desc: '呆呆酱是只可耐小猫咪哟！',
			items: [
				{
					image: '/static/img/index/kt2.png',
					name: '小空调',
					desc: '夏天降温',
					url: '/pages/indexApp/xkt/xkt',
					bg: '#eaf2ff'
				},
				{
					image: '/static/img/index/rl.png',
					name: '值班日历',
					desc: '排班查看',
					url: '/pages/indexApp/rl-new/rl-new',
					bg: '#fff1f2'
				},
				{
					image: '/static/img/index/djs.png',
					name: '除夕倒计时',
					desc: '时间提醒',
					url: '/pages/indexApp/djs/djs',
					bg: '#fff7ed'
				}
			
			]
		},{
			name: '向僵尸开炮',
			desc: '开炮！开炮！开炮！',
			items: [
				{
					image: 'https://www.gaobug.com/img/static/kaipao/equipment/yifu.png',
					name: '装备词条',
					desc: '开炮配置',
					url: '/pages/indexApp/kaipao-equipment-entries/kaipao-equipment-entries',
					bg: '#eaf2ff'
				},
				{
					icon: 'map-fill',
					name: '赛季地图',
					desc: '查看地图绘制结果',
					url: '/pages/indexApp/kaipao-season-map/kaipao-season-map',
					bg: '#eaf2ff'
				}
			]
		}
	]

	const onRefresh = () => {}

	const refreshOpenid = async () => {
		if (refreshingOpenid.value) return

		refreshingOpenid.value = true
		try {
			const openid = await ensureOpenid(true)
			if (openid) uni.showToast({ title: 'openid 获取成功', icon: 'success' })
		} finally {
			refreshingOpenid.value = false
		}
	}

	const navigateTos = ({ url }) => {
		if (!url) return

		uni.navigateTo({ url })
	}
	
	onShareAppMessage(() => ({ 
		title: '呆呆工具箱',
		path: '/pages/index/index'
	}))
</script>

<style lang="scss">
	.index_wrap {
		min-height: 100vh;
		padding: 28rpx 24rpx 48rpx;
		background: #f4f7ff;
		box-sizing: border-box;
		color: #0f172a;
	}

	.home_hero {
		position: relative;
		min-height: 300rpx;
		padding: 34rpx;
		border-radius: 30rpx;
		overflow: hidden;
		background:
			radial-gradient(circle at 78% 16%, rgba(255, 255, 255, .86) 0, rgba(255, 255, 255, 0) 24%),
			radial-gradient(circle at 18% 18%, rgba(255, 216, 247, .82) 0, rgba(255, 216, 247, 0) 30%),
			radial-gradient(circle at 74% 82%, rgba(128, 236, 255, .62) 0, rgba(128, 236, 255, 0) 32%),
			linear-gradient(135deg, #8d7cff 0%, #6dbbff 46%, #ff9ed8 100%);
		box-shadow: 0 22rpx 52rpx rgba(120, 112, 255, .28);
		box-sizing: border-box;
	}

	.openid-action {
		display: flex;
		justify-content: flex-end;
		margin-top: 16rpx;
	}

	.openid-retry {
		height: 52rpx;
		padding: 0 20rpx;
		border-radius: 999rpx;
		background: #fff;
		box-shadow: 0 8rpx 18rpx rgba(15, 23, 42, .08);
		color: #1769e0;
		font-size: 23rpx;
		font-weight: 800;
		line-height: 52rpx;
	}

	.openid-retry::after {
		border: 0;
	}

	.home_hero::before {
		content: "";
		position: absolute;
		left: -56rpx;
		top: -70rpx;
		width: 270rpx;
		height: 270rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, .24);
		box-shadow:
			330rpx 40rpx 0 -92rpx rgba(255, 255, 255, .72),
			470rpx 184rpx 0 -112rpx rgba(255, 255, 255, .56),
			160rpx 250rpx 0 -118rpx rgba(255, 255, 255, .5);
	}

	.home_hero::after {
		content: "";
		position: absolute;
		right: -70rpx;
		bottom: -84rpx;
		width: 320rpx;
		height: 320rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, .18);
		box-shadow: -230rpx -120rpx 0 -92rpx rgba(255, 245, 182, .58);
	}

	.hero_text {
		position: relative;
		z-index: 2;
		width: 65%;
		color: #fff;
	}

	.hero_eyebrow,
	.hero_title,
	.hero_desc,
	.section_title,
	.section_sub,
	.textcla,
	.descla {
		display: block;
	}

	.hero_eyebrow {
		font-size: 20rpx;
		letter-spacing: 2rpx;
		opacity: .78;
		font-weight: 800;
	}

	.hero_title {
		margin-top: 12rpx;
		font-size: 48rpx;
		line-height: 1.12;
		font-weight: 900;
	}

	.hero_desc {
		margin-top: 16rpx;
		font-size: 25rpx;
		line-height: 1.5;
		color: rgba(255, 255, 255, .84);
	}

	.hero_img {
		position: absolute;
		right: 0;
		top: 0;
		width: 42%;
		height: 100%;
		opacity: .9;
		filter: drop-shadow(0 18rpx 34rpx rgba(79, 70, 229, .28));
	}

	.icon_box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		width: 76rpx;
		height: 76rpx;
		border-radius: 22rpx;
	}

	.icon_box image {
		width: 54rpx;
		height: 54rpx;
	}

	.tool_group {
		margin-top: 30rpx;
	}

	.section_head {
		margin: 0 4rpx 18rpx;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.section_title {
		font-size: 32rpx;
		font-weight: 900;
	}

	.section_sub {
		font-size: 22rpx;
		color: #64748b;
	}

	.index_app {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
	}

	.item {
		min-height: 120rpx;
		padding: 24rpx;
		border-radius: 24rpx;
		background: #fff;
		box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, .06);
		box-sizing: border-box;
		display: flex;

		.item_text_wrap {
			margin-left: 28rpx;
		}
	}

	.textcla {
		font-size: 28rpx;
		font-weight: 900;
		color: #0f172a;
	}

	.descla {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #64748b;
	}
</style>

