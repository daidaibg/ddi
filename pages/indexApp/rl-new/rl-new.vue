<template>
	<view class="snow-calendar">
		<swiper class="swiper" :indicator-dots="false" :autoplay="false" easing-function="linear"
			:current="swiperActive" :duration="duration" circular @change="swiperChange"
			@animationfinish="animationfinish">
			<swiper-item v-for="(item, i) in swiperList" :key="i" class="swiper_item">
				<RlNewItem class="calender-content"
				 @next="next" 
				@prev="prev"
				 @clickDay="clickDay"
				:nowDate="item" :latestDate="setData.timestamp" :shiftsNum="setData.shiftsNum"
				ref="rlItemRef"
				>
					<view class="addconfig" @click="setconfig">
						<u-icon name="plus" color="#FFF" size="30px"></u-icon>
					</view>
				</RlNewItem>
			</swiper-item>
		</swiper>
		<u-popup v-model="configShow" mode="bottom" round="14" closeable>
			<view class="addWrap">
				<p>👿💀☠️💩🤡👹👺👻👽👾🤖😺😸😹😻😼😽🙀😿😾🙈🙉🙊</p>
				<p>保存后规则会存在缓存中，清除缓存需要重新设置规则哟！</p>
				<p>0 代表默认不值班哟🥰🥰🥰</p>
				<view class="item">
					<text>总班数：</text>
					<text @click="setletcNum">{{setData.shiftsNum}}</text>
				</view>
				<view class="item">
					<text>最近值班日期：</text>
					<text @click="setletcTime">{{setData.time||""}}</text>
				</view>
				<view class="submit">
					<u-button :ripple="true" @click="clearSub" plain size="medium ">清空规则
					</u-button>
					<u-button type="red" @click="submit" color="#E56C95" size="medium " style="margin-left: 14rpx;">
						确认
					</u-button>
		
				</view>
			</view>
		</u-popup>
		<u-calendar v-model="calendarshow" mode="date" @change="timeChange" border-radius="14px"  active-bg-color="#E56C95"
		btn-type="red" max-date="2050-01-01"
		>
		</u-calendar>
		<u-select v-model="selectshow" :list="list" @confirm="confirm" mode="single-column" label-name="value">
		</u-select>
	</view>
</template>

<script>
	import getDate from '@/util/getDate.js';
	import RlNewItem from './rl-new-item.vue';
	import {randomPopupTexts} from "@/static/js/popupTexts .js"
	const defaultConfig = {
		shiftsNum:0,//轮班天数
		time:null,
		timeData:null,
		timestamp:null
	}
	export default {
		components: {
			RlNewItem
		},
		data() {
			return {
				swiperActive: 2,
				swiperList: [],
				duration: 500,
				configShow:false,
				setData:{...defaultConfig}, //默认配置
				calendarshow:false,
				selectshow:false,
				list:[]
			};
		},
		created() {
			this.setDefaultConfig()
			this.init();
			this.list = Array.from({ length: 31 }, (_, index) => ({
			    value: index + 1,
			    label: index + 1
			}));
		},
		methods: {
			init() {
				// const nowDate = new getDate(`2023/11/09`)
				const nowDate = new getDate();
				this.swiperList = this.updateSwiperList(nowDate,[-2, -1, 0, 1, 2]);
			},
			clickDay(datDate){
				console.log(datDate);
				uni.showToast({
					icon:"none",
					title:randomPopupTexts()
				})
				
			},
			refreshDate(){
				let refs = this.$refs.rlItemRef
				if(refs){
					for (let i = 0; i < refs.length; i++) {
						refs[i].init()
					}
				}
			},
			//确认
			submit() {
				uni.setStorageSync('snow-rl-config', {
					...this.setData
				});
				this.refreshDate()
				uni.showToast({
					title: "设置成功！",
				})
				this.configShow = false;
			},
			//清空规则
			clearSub() {
				uni.removeStorageSync('snow-rl-config')
				this.setDefaultConfig()
				this.refreshDate()
				wx.showToast({
					title: "清空成功！",
				})
			
			},
			setDefaultConfig(){
				let data = uni.getStorageSync('snow-rl-config');
				console.log('snow-rl-config',data);
				if (data) {
					this.setData = data;
				} else {
					this.setData = {
						...defaultConfig
					};
				}
			},
			setletcTime() {
				this.calendarshow = true;
			},
			setletcNum() {
				this.selectshow = true;
			},
			//选择日期
			timeChange(time) {
				this.setData.time = time.result;
				this.setData.timeData = time;
				let timeStr = `${time.year}/${time.month}/${time.day}`
				this.setData.timestamp = Date.parse(timeStr)
				console.log(time,this.setData)
			},
			confirm(e) {
				this.setData.shiftsNum = e[0].value;
			},
			next(e) {
				console.log(this.swiperActive);
				e && e.preventDefault();
				if (this.swiperActive ==4) {
					this.swiperActive = 0;
				} else {
					this.swiperActive++;
				}

			},
			prev(e) {
				console.log(this.swiperActive);
				e && e.preventDefault();
				if (this.swiperActive == 0) {
					this.swiperActive ==4 ;
				} else {
					this.swiperActive--;
				}
			},
			updateSwiperList(nowDate,offsets){
				let newArr = [];
				for (let i = 0; i < offsets.length; i++) {
					newArr.push(nowDate.getOffsetMonth(offsets[i]).format);
				}
				return newArr
			},
			setconfig(){
				this.configShow =true
			},
			//轮播图切换
			swiperChange(e) {
				// this.swiperActive = 0
				this.swiperActive = e.detail.current;
				const nowDate = new getDate(this.swiperList[this.swiperActive]);
				const offsetMonths = [-2, -1, 0, 1, 2];
				let newArr= []
				if (this.swiperActive === 3) {
					newArr=this.updateSwiperList(nowDate,[2, -2, -1, 0, 1]);
				} else if (this.swiperActive === 4) {
					newArr=this.updateSwiperList(nowDate,[1, 2, -2, -1, 0]);
				} else if(this.swiperActive === 0){
					newArr=this.updateSwiperList(nowDate,[0, 1, 2, -2, -1]);
				} else if(this.swiperActive === 1){
					newArr=this.updateSwiperList(nowDate,[-1, 0, 1, 2, -2]);
				} else if(this.swiperActive === 2){
					newArr=this.updateSwiperList(nowDate,[-2, -1, 0, 1, 2]);
				}
				this.swiperList = newArr;
				console.log(this.swiperList,this.swiperActive, nowDate, this.swiperList[this.swiperActive]);
			},
			//动画结束时会触发
			animationfinish(e) {}
		}
	};
</script>

<style lang="scss" scoped>
	.snow-calendar {
		min-height: 100vh;
		background-color: #e56c95;
		box-sizing: border-box;
		padding-top: 36rpx;
	}

	.swiper {
		height: 100vh;
	}

	.swiper_item {
		box-sizing: border-box;
		padding: 24rpx;
	
	}


	.addconfig{
		width: 90rpx;
		height: 90rpx;
		// transform: translate(-60rpx,45%);
		border-radius: 45rpx;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #F56C6C;
		z-index: 99;
		box-shadow:
		  4rpx 6rpx 8rpx rgba(0,0,0, 0.205),
		  4rpx 8rpx 20rpx rgba(0,0,0, 0.4)
		;
		position: absolute;
			right: 60rpx;
			bottom: -40rpx;
		}
	.addWrap {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 16rpx;
		
	
		p {
			text-align: center;
			color: #bababa;
			font-size: 24rpx;
			margin-bottom: 40rpx;
		}
	
		.item {
			width: 100%;
			margin-top: 20rpx;
			height: 56rpx;
			line-height: 56rpx;
			display: flex;
			font-size: 30rpx;
			display: flex;
			justify-content: center;
	
			text:first-child {
				width: 220rpx;
				color: #D51757;
			}
	
			text:last-child {
				width: 220rpx;
				border-bottom: solid 2rpx #E56C95;
				color: #E56C95;
				text-indent: 30rpx;
			}
		}
	
		.submit {
			width: 70%;
			margin: 30rpx 0 100rpx 0;
			margin-left: 15%;
			display: flex;
			// align-items: center;
			// justify-content: center;
			// box-sizing: border-box;
		}
	}
</style>