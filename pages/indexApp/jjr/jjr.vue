<template>
	<view>
		<ul class="jjrlist">
			<li v-for="(item,index) in jjrList" :key="index" class="jjrlistli">
				<span class="jjrname">距离<i>{{item.jjr_name}}</i> :&nbsp;</span>
				<u-count-down :timestamp="gettimes(item)"  autoplay  
				separator="zh"  separator-color="#383838" font-size="34" color="#000" separator-size="24"
					@change="(e)=>onChange(e,item,index)" @end="finish">
				</u-count-down>
			</li>
			<li :key="-1" v-if="gooffworktime>0"  class="jjrlistli">
				<span class="jjrname">距离<i>下班时间</i> :&nbsp;</span>
				<!-- <view class="time">
					<text class="time__item"> {{ gooffworkData.day }}</text><span>&nbsp;天</span>
					<text class="time__item">{{ gooffworkData.hour}}</text>
					<span>&nbsp;时</span>
					<text class="time__item">{{ gooffworkData.min }}</text><span>&nbsp;分</span>
					<text class="time__item">{{ gooffworkData.second }}</text><span>&nbsp;秒</span>
				</view> -->
				<u-count-down :timestamp="gooffworktime/1000"  autoplay
				separator="zh"  separator-color="#383838" font-size="34" color="#000" separator-size="24"
					 @end="finish">
				</u-count-down>
			</li>
			<li v-else class="gooffwork jjrlistli">
				已经下班了，你还在卷什么!
			</li>
		</ul>
		<u-button type="primary"  @click="dingyue">订阅节假日倒计时</u-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				jjrList: [

				],
				gooffworktime: 0,
				gooffworkData: {},
			}
		},
		created() {
			this.getjjr()
		},
		onLoad() {
			this.initxb()
		},
		onShareAppMessage: function(res) {
			return {
				title: '提醒',
				path: '/pages/indexApp/jjr/jjr', // 显示的页面
				// imageUrl: "/static/img/index/kt.png",
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			}
			// }
		},
		methods: {
			initxb(){
				let sixtime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 18 * 60 * 60 *
					1000).getTime() - new Date().getTime()
				if (sixtime > 0) {
					this.gooffworktime = sixtime
					// this.gooffworkData = this.getInfo(sixtime) // {day: 01,hour: 01,min:01,second: 01}
				} else {
					this.gooffworktime = 0
					// if (this.timer) {
					// 	clearTimeout(this.timer);
					// 	this.timer = null;
					// }
				}
			},
			xbdjs() {
				this.initxb()
				this.timer = setInterval(() => {
					this.initxb()
				}, 1000)
			},
			dingyue() {
				let openid = this.$currency.getOpenid()
				if (!openid) {
					wx.showToast({
						title: "请先登录",
						icon: "none"
					})
					uni.navigateTo({
						url: '/pages/indexApp/setting/setting'
					})
					return
				}
				wx.requestSubscribeMessage({
					tmplIds: ['p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24','p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g'],
					success: (res) => {
						if (res.errMsg == 'requestSubscribeMessage:ok') {

							this.binddy(openid)
						} else {
							wx.showToast({
								title: "订阅失败",
								icon: "error"
							})
						}
					},
					fail: (err) => {
						wx.showToast({
							title: "取消订阅",
							icon: "error"
						})
					}
				})
			},
			binddy(openid) {
				this.$http({
					url: '/wx/bindsubscribe',
					method: 'post',
					data: {
						tmplIds: 'p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24',
						jjr_tmplIds:'p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g',
						openid: openid
					}
				}).then(res => {
					if (res.success) {
						wx.showToast({
							title: "订阅成功",
						})
					} else {
						wx.showToast({
							title: "订阅失败",
							icon: "error"
						})
					}
				})
			},
			getjjr() {
				this.$http({
					url: '/wx/greaterTodayTime',
					method: 'get',
				}).then(res => {
					if (res.success) {
						this.jjrList = res.data.reverse()

					} else {
						wx.showToast({
							title: res.msg,
							icon: "error"
						})
					}
				})
			},

			gettimes(item) {
				let Time = new Date(item.time).getTime();
				let time = Time - (new Date().getTime())
				// console.log(time,time/1000/60/60/24)
				return time/1000
			},
			getdata(item, type) {
				return item
			},
			finish() {
				this.getjjr()
			},
			getInfo(times) {
				let day =  Math.floor(times/1000/60/60/24); 
				let hou =Math.floor(times/1000/60/60%24);
				let min = Math.floor(times/1000/60%60); 
				let second =Math.floor(times/1000%60)
				let obj = {
					day: day < 10 ? '0' + day : day,
					hour: hou < 10 ? '0' + hou : hou,
					min: min < 10 ? '0' + min : min,
					second: second < 10 ? '0' + second : second
				};
				return obj
			},
			onChange(e, item, i) {
				// console.log(this.jjrList,e)
			}
		}
	}
</script>

<style lang="scss">
	.jjrlist {
		width: 100%;
		box-sizing: border-box;
		padding: 4px 10rpx;

		.jjrlistli {
			display: flex;
			height: 60rpx;
			line-height: 60rpx;
			color: #383838;

			.jjrname {
				display: flex;

				i {
					color: #000;
					font-size: 34rpx;
					padding: 0 6px;
				}
			}

			.time {
				text {
					color: #000;
					padding: 0 6px;
					font-size: 34rpx;
				}
			}
		}

		.gooffwork {
			width: 100%;
			font-size: 40rpx;
			justify-content: center;

		}
	}
</style>
