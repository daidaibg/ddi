<template>
	<view>
		<ul class="jjrlist">
			<li v-for="(item, index) in jjrList" :key="index" class="jjrlistli">
				<p class="jjr_title">2023年{{ item.name }}倒计时</p>
				<p class="jjy_date">{{ item.date }}</p>
				<CountDown :timestamp="item.timestamp" />
			</li>
			<!-- <li :key="-1" v-if="gooffworktime > 0" class="jjrlistli">
				<span class="jjrname">
					距离
					<i>下班时间</i>
					:&nbsp;
				</span>
			</li>
			<li v-else class="gooffwork jjrlistli">已经下班了，你还在卷什么!</li> -->
		</ul>
		<!-- <u-button type="primary"  @click="dingyue">订阅节假日倒计时</u-button> -->
	</view>
</template>

<script>
import { jjrDate } from '../../../static/js/jjr.js';
import CountDown from '../../../components/countDown/countDown.vue';
export default {
	components: { CountDown },
	data() {
		return {
			currentYear: null, //当前年分
			jjrList: [],
			gooffworktime: 0,
			gooffworkData: {}
		};
	},
	created() {
		this.xbdjs();
	},
	onLoad() {},
	onShareAppMessage: function(res) {
		return {
			title: '节假日倒计时',
			path: '/pages/indexApp/jjr/jjr', // 显示的页面
			// imageUrl: "/static/img/index/kt.png",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
		// }
	},
	beforeDestroy() {
		clearInterval(this.timer);
	},
	methods: {
		getjjr() {
			const date = new Date();
			let current_time = date.getTime();
			// date .getYear(); //获取当前年份(2位)
			this.currentYear = date.getFullYear(); //获取完整的年份(4位)
			let newJjrDate = [];
			for (let i = 0; i < jjrDate.length; i++) {
				let tgt_date = new Date(jjrDate[i].date);
				let target_time = tgt_date.getTime();
				let result_time = target_time - current_time;
				if (result_time != '' && result_time > 0) {
					newJjrDate.push({
						...jjrDate[i],
						timestamp: this.getInfo(result_time)
					});
				}
			}
			this.jjrList = newJjrDate;
		},
		xbdjs() {
			this.getjjr();
			this.timer = setInterval(() => {
				this.getjjr();
			}, 1000 - 5); //减去代码运行时间
		},
		getInfo(times) {
			let day = Math.floor(times / 1000 / 60 / 60 / 24);
			let hour = Math.floor((times / 1000 / 60 / 60) % 24);
			let min = Math.floor((times / 1000 / 60) % 60);
			let second = Math.floor((times / 1000) % 60);
			let obj = {
				day: day < 10 ? '0' + day : day,
				hour: hour < 10 ? '0' + hour : hour,
				min: min < 10 ? '0' + min : min,
				second: second < 10 ? '0' + second : second
			};
			return obj;
		},
		dingyue() {
			let openid = this.$currency.getOpenid();
			if (!openid) {
				wx.showToast({
					title: '请先登录',
					icon: 'none'
				});
				uni.navigateTo({
					url: '/pages/indexApp/setting/setting'
				});
				return;
			}
			wx.requestSubscribeMessage({
				tmplIds: ['p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24', 'p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g'],
				success: res => {
					if (res.errMsg == 'requestSubscribeMessage:ok') {
						this.binddy(openid);
					} else {
						wx.showToast({
							title: '订阅失败',
							icon: 'error'
						});
					}
				},
				fail: err => {
					wx.showToast({
						title: '取消订阅',
						icon: 'error'
					});
				}
			});
		},
		binddy(openid) {
			this.$http({
				url: '/wx/bindsubscribe',
				method: 'post',
				data: {
					tmplIds: 'p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24',
					jjr_tmplIds: 'p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g',
					openid: openid
				}
			}).then(res => {
				if (res.success) {
					wx.showToast({
						title: '订阅成功'
					});
				} else {
					wx.showToast({
						title: '订阅失败',
						icon: 'error'
					});
				}
			});
		},

		gettimes(item) {
			console.log(item);
			let Time = new Date(item.time).getTime();
			let time = Time - new Date().getTime();
			// console.log(time,time/1000/60/60/24)
			return time / 1000;
		},
		getdata(item, type) {
			return item;
		},
		finish() {
			this.getjjr();
		},
		getInfo(times) {
			let day = Math.floor(times / 1000 / 60 / 60 / 24);
			let hou = Math.floor((times / 1000 / 60 / 60) % 24);
			let min = Math.floor((times / 1000 / 60) % 60);
			let second = Math.floor((times / 1000) % 60);
			let obj = {
				day: day < 10 ? '0' + day : day,
				hour: hou < 10 ? '0' + hou : hou,
				min: min < 10 ? '0' + min : min,
				second: second < 10 ? '0' + second : second
			};
			return obj;
		},
		onChange(e, item, i) {
			// console.log(this.jjrList,e)
		}
	}
};
</script>

<style lang="scss" scoped>
.jjrlist {
	width: 100%;
	box-sizing: border-box;
	padding: 4px 10rpx;

	.jjrlistli {
		display: flex;
		height: 60rpx;
		line-height: 60rpx;
		width: 90%;
		background-color: rgba(39, 137, 255, 0.1);
		margin: 0 auto;
		height: 240rpx;
		border-radius: 16rpx;
		margin-bottom: 64rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		.jjr_title {
			text-align: center;
			font-size: 32rpx;
			color: #212529;
			// color: #2789FF;
		}
		.jjy_date {
			color: #555;
			font-size: 24rpx;
		}
	}

	.gooffwork {
		width: 100%;
		font-size: 40rpx;
		justify-content: center;
	}
}
</style>
