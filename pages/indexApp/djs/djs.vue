<template>
	<view class="djs">
		<div class="djs_back"><img src="https://www.daidaibg.com/imgs/xcx/chux.png" alt="" mode="aspectFill"/></div>
		<view class="title" :style="titleStyle">距离除夕还剩下</view>
		<view class="FlipClock" v-if="nowTimeStr != 'undefinedundefinedundefinedundefined'">
			<Flipper ref="flipperDay1" :frontText="frontText.day1" />
			<Flipper ref="flipperDay2" :frontText="frontText.day2" />
			<text>天</text>
			<Flipper ref="flipperHour1" :frontText="frontText.hour1" />
			<Flipper ref="flipperHour2" :frontText="frontText.hour2" />
			<text>时</text>
			<Flipper ref="flipperMinute1" :frontText="frontText.minute1" />
			<Flipper ref="flipperMinute2" :frontText="frontText.minute2" />
			<text>分</text>
			<Flipper ref="flipperSecond1" :frontText="frontText.second1" />
			<Flipper ref="flipperSecond2" :frontText="frontText.second2" />
			<text>秒</text>
		</view>
		<view class="timeold" v-else>除夕啦！！！</view>
	</view>
</template>

<script>
// import Flipper from '../../../components/flipper/flipper.vue';
import Flipper from '../../../components/flipper/noAnimationFilpper.vue';
export default {
	components: {
		Flipper
	},
	name: 'djs',
	data() {
		return {
			nowTimeStr: '00000000',
			frontText: {
				day1: 0,
				day2: 0,
				hour1: 0,
				hour2: 0,
				minute1: 0,
				minute2: 0,
				second1: 0,
				second2: 0
			},
			titleStyle:""
		};
	},
	onShareAppMessage: function(res) {
		return {
			title: '除夕倒计时',
			path: '/pages/indexApp/djs/djs',
			success: function(res) {
				this.titleStyle={
				}
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
			//获取当前日期
			let curr_date = new Date();
			let current_time = curr_date.getTime();
			//设置目标日期
			let tgt_date = new Date('2023-01-21 00:00:00');
			let target_time = tgt_date.getTime();
			//计算出相差的时间，目标日期-当前日期 = 相差日期
			let result_time = target_time - current_time;
			//计算出天、时、分、秒
			let day, hour, minute, second;
			if (result_time != '' && result_time > 0) {
				day = Math.floor(result_time / (1000 * 3600 * 24));
			
				let leave1 = result_time % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
				hour = Math.floor(leave1 / (3600 * 1000));
				let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
				minute = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
				let leave3 = leave2 % (60 * 1000); 
				second = Math.round(leave3 / 1000);
				
				// hour = Math.floor((result_time / 1000 / 60 / 60) % 60);
				// minute = Math.floor((result_time / 1000 / 60 ) % 60);
				// second = Math.floor((result_time / 1000) % 60);
			}

			let str_day = day < 10 ? '0' + day : day;
			let str_hour = hour < 10 ? '0' + hour : hour;
			let str_minute = minute < 10 ? '0' + minute : minute;
			let str_second = second < 10 ? '0' + second : second;

			console.log(current_time, target_time, str_day, str_hour, str_minute, str_second);
			let nowTimeStr = '' + str_day + str_hour + str_minute + str_second;
			this.frontText={
				day1: nowTimeStr[0],
				day2: nowTimeStr[1],
				hour1: nowTimeStr[2],
				hour2: nowTimeStr[3],
				minute1: nowTimeStr[4],
				minute2: nowTimeStr[5],
				second1: nowTimeStr[6],
				second2: nowTimeStr[7]
			}
			// for (let i = 0; i < this.flipObjs.length; i++) {
			// 	this.flipObjs[i].setFront(nowTimeStr[i]);
			// }
			this.nowTimeStr = nowTimeStr;
			return nowTimeStr;
		},
		// 开始计时
		run() {
			this.timer = setInterval(() => {
				let nowTimeStr = this.nowTimeStr;
				let nextTimeStr = this.init();
			
			}, 1000);
		},

		// 日期时间补零
		padLeftZero(str) {
			return ('00' + str).substr(str.length);
		}
	},
	created() {},
	mounted() {
		this.flipObjs = [
			this.$refs.flipperDay1,
			this.$refs.flipperDay2,
			this.$refs.flipperHour1,
			this.$refs.flipperHour2,
			this.$refs.flipperMinute1,
			this.$refs.flipperMinute2,
			this.$refs.flipperSecond1,
			this.$refs.flipperSecond2
		];
		this.init();
		if (this.nowTimeStr == 'undefinedundefinedundefinedundefined') {
			return;
		}

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
}
.FlipClock /deep/ .M-Flipper {
	margin: 0 3rpx;
}
.FlipClock /deep/ .noAnimationFilpper {
	margin: 0 4rpx;
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
