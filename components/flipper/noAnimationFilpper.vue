<template>
	<view class="time_wrap_list" :style="wrapStyle">
		<view class="noAnimationFilpper" v-for="(item, index) in frontTextList" :key="index">
			<view class="noAnimationFilpperitem">{{ item }}</view>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue'

	const props = defineProps({
		frontText: {
			type: [String, Number],
			default: '00'
		}
	})

	const frontTextList = computed(() => Array.from(String(props.frontText)))
	const wrapStyle = computed(() => `grid-template-columns: repeat(${frontTextList.value.length}, 1fr);`)
</script>

<style scoped lang="scss">
.time_wrap_list {
	display: grid;
	column-gap: 6rpx;
	flex-shrink: 0;
}
.noAnimationFilpper {
	display: inline-block;
	position: relative;
	width: 58rpx;
	height: 100rpx;
	line-height: 100rpx;
	border: solid 1rpx #000;
	border-radius: 12rpx;
	box-sizing: border-box;
	font-size: 80rpx;
	color: #fff;
	box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.5);
	text-align: center;
	font-family: 'Helvetica Neue';
	font-family: 'DS-DIGI';
	overflow: hidden;
	background: #000;
	flex-shrink: 0;
}
.noAnimationFilpperitem {
	width: 100%;
	height: 100%;
}
</style>
