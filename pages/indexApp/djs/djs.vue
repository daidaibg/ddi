<template>
	<view class="djs">
		<div class="djs_back"><img src="https://www.daidaibg.com/imgs/xcx/chux.png" alt="" mode="aspectFill" /></div>
		<view class="title" :style="titleStyle">距离除夕还剩下</view>
		<view class="FlipClock" v-if="nowTimeStr != 'undefinedundefinedundefinedundefined'">
			<Flipper ref="day" :frontText="frontText.day" />
			<text>天</text>
			<Flipper ref="hour" :frontText="frontText.hour" />
			<text>时</text>
			<Flipper ref="minute" :frontText="frontText.minute" />
			<text>分</text>
			<Flipper ref="second" :frontText="frontText.second" />
			<text>秒</text>
		</view>
		<view class="timeold" v-else>除夕啦！！！</view>
	</view>
</template>

<script>
import Flipper from '../../../components/flipper/noAnimationFilpper.vue';
import calendar from '../../../util/lunar-alendar.js';

export default {
	components: {
		Flipper
	},
	name: 'djs',
	data() {
		return {
			nowTimeStr: '00000000',
			frontText: {
				day: '00',
				hour: '00',
				minute: '00',
				second: '00'
			},
			titleStyle: ''
		};
	},
	onShareAppMessage: function(res) {
		return {
			title: '除夕倒计时',
			path: '/pages/indexApp/djs/djs',
			success: function(res) {
				this.titleStyle = {};
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
		// }
	},
	methods: {


		// 初始化数字
		init() {
			const currentDate = new Date();

			const timeDifference = Math.max(this.chuxiDatDate - currentDate, 0); // 确保时间差不为负数
			// console.log(timeDifference,this.chuxiDatDate);
			const day = Math.floor(timeDifference / (1000 * 3600 * 24));

			const hoursLeft = timeDifference % (24 * 3600 * 1000);
			const hour = Math.floor(hoursLeft / (3600 * 1000));
			const minutesLeft = hoursLeft % (3600 * 1000);
			const minute = Math.floor(minutesLeft / (60 * 1000));
			const secondsLeft = minutesLeft % (60 * 1000);
			const second = Math.round(secondsLeft / 1000);
			const formatTime = num => (num < 10 ? '0' + num : num.toString());
			this.frontText = {
				day: formatTime(day),
				hour: formatTime(hour),
				minute: formatTime(minute),
				second: formatTime(second)
			};


			return this.frontText;
		},
		// 开始计时
		run() {
			this.timer = setInterval(() => {
				this.init();
			}, 1000);
		},

		// 日期时间补零
		padLeftZero(str) {
			return ('00' + str).substr(str.length);
		}
	},
	created() {},
	beforeMount() {
		this.timer &&clearInterval(this.timer)
	},
	mounted() {
		// 计算今年除夕
		const today = new Date();
		const thisYear = today.getFullYear();
		let chuxiDay = calendar.lunar2solar(thisYear, 12, 30);
		//获取去年 除夕 与今年除夕，判断除夕过完没有，因为公历2023年 阳历会2022年的时候
		let chuxiDayFormat=`${chuxiDay.cYear}/${chuxiDay.cMonth}/${chuxiDay.cDay} 00:00:00`
		let lastYearFormat=`${chuxiDay.cYear-1}/${chuxiDay.cMonth}/${chuxiDay.cDay} 00:00:00`
		let diff =new Date(lastYearFormat) -today
		if(diff>0){
			this.chuxiDayFormat =lastYearFormat
		}else{
			this.chuxiDayFormat =chuxiDayFormat
		}
		this.chuxiDatDate = new Date(this.chuxiDayFormat)
		this.init();
		this.run();
	}
};
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
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
}
.FlipClock {
	text-align: center;
	position: relative;
	z-index: 2;
	display: flex;
	justify-content: center;
}
.FlipClock /deep/ .M-Flipper {
	margin: 0 3rpx;
}

.FlipClock text {
	display: inline-block;
	line-height: 102rpx;
	font-style: normal;
	vertical-align: top;
	font-size: 40rpx;
	color: #e7e7e6;
	margin: 0 3rpx;
}
.timeold {
	font-size: 44px;
	text-align: center;
	color: #fff;
}
</style>
