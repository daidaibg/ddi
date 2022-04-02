<template>
	<view class="rl">
		<div class="title">
			<view class="left" @click="clickLeft">
				<u-icon name="play-left" color="#E56C95" size="20px"></u-icon>
			</view>
			<view class="c">
				<h1 class="" style="font-size: 40rpx;font-weight: 900;">{{Month}}</h1>
				<p class="small">{{Year}}</p>
			</view>
			<view class="right" @click="clickRight">
				<u-icon name="play-right" color="#E56C95" size="20px"></u-icon>
			</view>
		</div>
		<div class="body">
			<div class="lightgrey body-list">
				<ul>
					<li>周一</li>
					<li>周二</li>
					<li>周三</li>
					<li>周四</li>
					<li>周五</li>
					<li>周六</li>
					<li>周日</li>
				</ul>
			</div>
			<!-- 				indicator-dots -->
			<swiper class="swiper" :indicator-dots="false" :autoplay="false" easing-function="linear"
				:current="swiperActive" :duration="500" circular @change="swiperChange"
				@animationfinish="animationfinish">
				<swiper-item v-for="current in 3" :key="current">
					<div class="darkgrey body-list">
						<ul>
							<li v-for="(item,i) in dataLIst[current]" :key="i" :class="item.class||''">{{item.name||""}}
								<span v-if="returnFlag(item.class)" class="posXiu">{{item.pos}}</span>
								<span v-if="returnQuan(item.class)" class="posZhi">值</span>
								<p class="HolidayName">{{item.title}}</p>
							</li>
						</ul>
					</div>
				</swiper-item>
			</swiper>
		</div>
		<view class="add" @click="adds">
			<u-icon name="plus" color="#FFF" size="30px"></u-icon>
		</view>
		<u-popup v-model="show" mode="bottom" round="14" closeable>
			<view class="addWrap">
				<p>保存后规则会存在缓存中，清除缓存需要重新设置规则哟！</p>
				<view class="item">
					<text>总班数：</text>
					<text @click="setletcNum">{{setData.num}}</text>
				</view>
				<view class="item">
					<text>最近值班日期：</text>
					<text @click="setletcTime">{{setData.time}}</text>
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
		<u-select v-model="elsectshow" :list="list" @confirm="confirm" mode="single-column" label-name="value">
		</u-select>
	</view>
</template>

<script>
	import {
		vacation
	} from "../../../static/js/rq.js";
	export default {
		data() {
			return {
				disabled: true,
				my_date: null,
				my_year: null,
				my_month: null,
				my_day: null,
				month_olympic: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], //闰年
				month_normal: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], //非闰年
				month_name: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				dataLIst: [
					[],
					[],
					[]
				],
				Month: "",
				Year: "",
				dataFlag: "", //默认时间
				num: null,
				show: false,
				calendarshow: false,
				elsectshow: false,
				setData: {}, //默认配置
				list: [], //总班数下拉框
				swiperActive: 0
			}
		},
		onLoad() {
			this.userdata()
			this.setdefault()
			let list = []
			for (var i = 1; i < 32; i++) {
				list.push({
					value: i,
					label: i
				})
			}
			this.list = list
			this.init()

		},
		onShareAppMessage: function(res) {
			return {
				title: '私人小日历',
				path: '/pages/indexApp/rl/rl', // 显示的页面
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
		onShareTimeline: function(res) {
			return {
				title: "私人小日历",
				query: ``,
				imageUrl: "/static/img/fx.png"
			}
		},
		watch: {
			// swiperActive(newvalue, oldValue) {
			// 	console.log(newvalue, oldValue)
			// }
		},
		methods: {


			userdata() {
				let wxUserInfo = wx.getStorageSync('wxUserInfo')
				if (wxUserInfo) {
					this.wxUserInfo = wxUserInfo
					wx.setNavigationBarTitle({
						title: wxUserInfo.nickName + "私人小日历"
					})
				}
			},
			//设置默认配置
			setdefault() {
				let data = uni.getStorageSync('userData');
				if (data) {
					this.setData = data;
					this.dataFlag = data.time
					this.num = data.num
				} else {
					this.setData = {};
					this.dataFlag = null
					this.num = null
				}
			},
			//清空规则
			clearSub() {
				uni.removeStorageSync('userData')
				this.setdefault()
				this.refreshDate();
				console.log(this.setData, this.dataFlag, this.num)
				wx.showToast({
					title: "清空成功！",
				})
			},
			//确认
			submit() {
				uni.setStorageSync('userData', {
					...this.setData
				});
				this.setdefault()
				this.refreshDate();
				wx.showToast({
					title: "设置成功！",
				})
				this.show = false;
			},
			//选择日期
			timeChange(time) {
				// console.log(time)
				this.setData.time = time.result;

			},
			confirm(e) {
				console.log(e)
				this.setData.num = e[0].value;
			},
			//点击加号
			adds() {
				this.show = true;
			},
			//选择日期
			setletcTime() {
				this.calendarshow = true;
			},
			setletcNum() {
				this.elsectshow = true;
			},
			//国家规定节假日休息与调班
			returnFlag(type) {
				if (!type) {
					return false
				}
				if (type.indexOf("xiu") !== -1 || type.indexOf("ban") !== -1 || type.indexOf("zhi") !== -1) {
					return true
				} else {
					return false
				}
			},
			//值班
			returnQuan(type) {
				if (!type) {
					return false
				}
				if (type.indexOf("quan") !== -1) {
					return true
				} else {
					return false
				}
			},


			init() {
				let my_date = new Date();
				this.my_date = my_date;
				this.my_year = my_date.getFullYear();
				this.my_month = my_date.getMonth();
				this.my_day = my_date.getDate()
				this.refreshDate()
			},
			//获取某年某月第一天是星期几
			dayStart(month, year) {
				var tmpDate = new Date(year, month, 1);
				return (tmpDate.getDay());
			},
			//计算某年是不是闰年，通过求年份除以4的余数即可
			daysMonth(month, year) {
				var tmp = year % 4;
				if (tmp == 0) {
					return (this.month_olympic[month]);
				} else {
					return (this.month_normal[month]);
				}
			},
			//计算除以排班天数 是否整除
			dayscha(num) {
				var tmp = num % this.num;
				if (tmp == 0) {
					return true;
				} else {
					return false;
				}
			},

			refreshDate() {
				// console.log(this.swiperActive)
				let nexPreMonth = this.getNexMonthYear(this.my_month, this.my_year)
				if (this.swiperActive == 0) {
					this.dataLIst[0] = this.getDataList(this.my_year, this.my_month);
					this.dataLIst[1] = this.getDataList(nexPreMonth.nexYear, nexPreMonth.nexMonth);
					this.dataLIst[2] = this.getDataList(nexPreMonth.preYear, nexPreMonth.preMonth);
				} else if (this.swiperActive == 1) {
					// this.dataLIst[1] = this.getDataList(this.my_year,this.my_month);
					this.dataLIst[2] = this.getDataList(nexPreMonth.nexYear, nexPreMonth.nexMonth);
					this.dataLIst[0] = this.getDataList(nexPreMonth.preYear, nexPreMonth.preMonth);
				} else if (this.swiperActive == 2) {
					// this.dataLIst[2] = this.getDataList(this.my_year,this.my_month);
					this.dataLIst[0] = this.getDataList(nexPreMonth.nexYear, nexPreMonth.nexMonth);
					this.dataLIst[1] = this.getDataList(nexPreMonth.preYear, nexPreMonth.preMonth);
				}

				// console.log(this.dataLIst, this.my_month, this.my_year, nexPreMonth)
				this.Month = this.month_name[this.my_month]; //设置英文月份显示
				this.Year = this.my_year; //设置年份显示
			},

			//获去下一个月是几月，几年
			getNexMonthYear(currentMonth, year) {
				let nexMonth = currentMonth + 1;
				let preMonth = currentMonth - 1;
				let nexYear = year;
				let preYear = year;
				if (nexMonth > 11) {
					nexYear = nexYear + 1;
					nexMonth = 0;
				}
				if (preMonth < 0) {
					preYear = preYear - 1;
					preMonth = 11;
				}
				return {
					nexMonth: nexMonth,
					nexYear: nexYear,
					preMonth: preMonth,
					preYear: preYear,

				}
			},
			//动画结束时会触发
			animationfinish(e) {
				// console.log(e.detail)
				let active = e.detail.current;
				if (active == 2 && this.swiperActive == 1 || active == 1 && this.swiperActive == 0 || active == 0 && this
					.swiperActive == 2) {
					this.clickRight(false, () => {
						this.swiperActive = active;
					})
				} else if (active == 1 && this.swiperActive == 2 || active == 0 && this.swiperActive == 1 || active == 2 &&
					this
					.swiperActive == 0) {
					this.clickLeft(false, () => {
						this.swiperActive = active;
					})
				}
				this.refreshDate();
			},
			//轮播图切换
			swiperChange(e) {
				// this.swiperActive = 0


			},
			//点击右侧
			clickRight(e, cb) {
				this.my_month++;
				if (this.my_month > 11) {
					this.my_year++;
					this.my_month = 0;
				}
				if (cb) {
					cb && cb()
				} else {
					if (this.swiperActive == 0) {
						this.swiperActive = 1
					} else if (this.swiperActive == 1) {
						this.swiperActive = 2
					} else if (this.swiperActive == 2) {
						this.swiperActive = 0
					}
				}

				e && e.preventDefault();
			},
			//点击左侧
			clickLeft(e, cb) {
				e && e.preventDefault();
				this.my_month--;
				if (this.my_month < 0) {
					this.my_year--;
					this.my_month = 11;
				}
				if (cb) {
					cb()
				} else {
					if (this.swiperActive == 1) {
						this.swiperActive = 0
					} else if (this.swiperActive == 2) {
						this.swiperActive = 1
					} else if (this.swiperActive == 0) {
						this.swiperActive = 2
					}
				}


			},

			//获取列表
			getDataList(year, month) {
				// console.log(year, month)
				var dataLIst = [],
					obj = {};
				var totalDay = this.daysMonth(month, year); //获取该月总天数
				var firstDay = this.dayStart(month, year); //获取该月第一天是星期几
				var myclass;
				// console.log(firstDay)
				if (firstDay == 0) {
					firstDay = 7
				}
				for (var i = 1; i < firstDay; i++) {
					dataLIst.push({}); //为起始日之前的日期创建空白节点
				}
				for (let i = 1; i <= totalDay; i++) {
					if ((i < this.my_day && year == this.my_date.getFullYear() && month == this.my_date
							.getMonth()) || year < this.my_date.getFullYear() || (year == this.my_date
							.getFullYear() && month < this.my_date.getMonth())) {
						//当该日期在今天之前时，以浅灰色字体显示
						obj = {
							name: i,
							class: "lightgrey"
						}

					} else if (i == this.my_day && year == this.my_date.getFullYear() && month == this
						.my_date.getMonth()) {
						//当天日期以绿色背景突出显示
						obj = {
							name: i,
							class: "decolor box"
						}
					} else {
						//当该日期在今天之后时，以深灰字体显示
						obj = {
							name: i,
							class: "darkgrey"
						}
					}
					let currentDate = "" + year + (month + 1) + i;
					let guojiaFree = "default";
					//判断国家节假日是不是存在这个日期
					if (vacation[currentDate]) {
						if (vacation[currentDate].type == "休") { //类型为休添加样式
							obj.class = "xiu",
								obj.pos = "休"
							obj.title = vacation[currentDate].title
							guojiaFree = "xiu"
						} else if (vacation[currentDate].type == "班") {
							obj.class = "ban"
							obj.pos = "班"
							guojiaFree = "ban"
						}

					}
					//配置的两个值存在
					if (this.num && this.dataFlag) {
						//判断需不需要值班
						let dataFor = "" + year + "-" + ((month + 1) < 10 ? "0" + (month + 1) : (
							month + 1)) + "-" + (i < 10 ? "0" + i : i);
						let cha = this.datedifference(this.dataFlag, dataFor); //相差多少天
						let dutyFalg = this.dayscha(cha); //是否是整数
						let weeks = new Date(dataFor).getDay(); //当前周几
						// console.log(dutyFalg,weeks)
						// console.log(dutyFalg)
						if (dutyFalg) {
							obj.class = "zhi"
							if (weeks == 0 && guojiaFree !== "ban" || weeks == 6 && guojiaFree !== "ban") {
								obj.class += " quan"

							} else {}
						}
						if (guojiaFree == "xiu") {
							if (dutyFalg) {
								obj.class += " quan"
							}
						}
					}

					dataLIst.push(obj)
				}
				// console.log(dataLIst)
				return dataLIst
			},
			//计算相差多少天
			datedifference(sDate1, sDate2) { //sDate1和sDate2是2006-12-18格式
				var dateSpan,
					tempDate,
					iDays;
				sDate1 = Date.parse(sDate1);
				sDate2 = Date.parse(sDate2);
				dateSpan = sDate2 - sDate1;
				dateSpan = Math.abs(dateSpan);
				iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
				return iDays
			}
		}
	}
</script>

<style lang="scss">
	.rl {
		width: 100%;
	}

	.title {
		width: 100%;
		height: 100rpx;
		display: flex;

		.c {
			width: 50%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #E56C95;
		}

		.left,
		.right {
			width: 25%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.lightgrey {
		color: #a8a8a8;
		/*浅灰色*/
	}

	.darkgrey {
		color: #565656;
		/*深灰色*/
	}

	.decolor {
		// color: #E56C95;
		color: #409EFF;
	}

	.box {
		// border:1px solid #E56C95;
		background: #D0E7FE;
	}

	.xiu {
		color: #67C23A;
		// border:1px solid #67C23A;
		background: #CBF5DE;

	}

	.ban {
		// color:#EEEEEE; 
		background: #EEEEEE;

		.posXiu {
			color: #999999;
		}
	}

	.zhi {
		// color: #F56C6C;

		// border:1px solid #F56C6C;
		background: #F8E2E2;
	}

	.quan {
		background: url(../../../static/img/quan.png) no-repeat center;
		background-size: auto 70%;
		background-color: #F8E2E2;

		.posXiu {
			color: #67C23A;
		}

	}

	.body-list ul {
		width: 100%;
		font-family: arial;
		font-weight: bold;
		font-size: 28rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.swiper {
		height: 500rpx;
	}

	.body-list ul li {
		position: relative;
		width: 13.5%;
		height: 72rpx;
		line-height: 72rpx;
		list-style-type: none;
		display: block;
		box-sizing: border-box;
		text-align: center;
		margin: 0.39%;
		border-radius: 8rpx;

		.posXiu {
			position: absolute;
			font-size: 20rpx;
			top: 4rpx;
			left: 4rpx;
			height: 20rpx;
			line-height: 20rpx;
		}

		.posZhi {
			position: absolute;
			font-size: 20rpx;
			right: 4rpx;
			top: 4rpx;
			height: 20rpx;
			line-height: 20rpx;
			color: #F56C6C;
		}

		.HolidayName {
			color: #565656;
			font-size: 20rpx;
			height: 20rpx;
			line-height: 20rpx;
			width: 100%;
			bottom: 0;
			font-weight: none;
			// left: 0;
			text-align: center;
			position: absolute;
		}
	}

	.add {
		width: 90rpx;
		height: 90rpx;
		position: absolute;
		bottom: 30rpx;
		right: 30rpx;
		border-radius: 45rpx;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #F56C6C;
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
			margin: 30rpx 0 50rpx 0;
			margin-left: 15%;
			display: flex;
			// align-items: center;
			// justify-content: center;
			// box-sizing: border-box;
		}
	}
</style>
