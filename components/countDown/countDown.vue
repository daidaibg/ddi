<template>
	<view class="countDown">
		<view class="countDown_item">{{timestamp.day}}</view>
		<text  class="unit">天</text>
		<view class="countDown_item">{{timestamp.hour}}</view>
		<text  class="unit">时</text>
		<view class="countDown_item">{{timestamp.min}}</view>
		<text class="unit">分</text>
		<view class="countDown_item">{{timestamp.second}}</view>
		<text  class="unit">秒</text>
	</view>
</template>

<script>
export default {
	name: 'countDown',
	data() {
		return {};
	},
	props:{
		timestamp:{
			type:Object,
			default:null
		}
	},
	onLoad() {
		console.log(this.timestamp);
	},
	methods:{
		
	}
};
</script>

<style scoped lang="scss">

	
$item-height:60rpx;
.countDown{
	display: flex;
}
.unit{
	line-height: $item-height;
	color: #212529;
}
.countDown_item{
	 position: relative;
	 width: 100rpx;
	 height: $item-height;
	 line-height: $item-height;
	 // border: solid 1rpx #343a40;
	 border: solid 1rpx #2789FF;
	 border-radius: 12rpx;
	 font-size: 52rpx;
	 color: #fff;
	 // box-shadow: 0 0 6rpx rgba(52,58,64, 0.5);
	 box-shadow: 0 0 6rpx rgba(39,137,255, 0.5);
	 // font-family: 'Helvetica Neue';
	 font-family: 'DS-DIGI';
	 // background: #343a40;
	 background: #2789FF;
	 margin: 0 16rpx;
	 text-align: center;
}
</style>
