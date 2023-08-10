<template>
	<div class="dd-calender">
		<!-- 顶部日期切换-->
		<div class="header-title">
			<view class="left" @click="prev"><u-icon name="play-left" color="#E56C95" size="40rpx"></u-icon></view>
			<view class="current_month">
				<p class="animal">{{ nowpeasant.Animal }}</p>
				<p class="small">{{ nowYear }}</p>
				<span>年</span>
				<p class="" style="font-size: 40rpx;font-weight: 900;">{{ nowMonth }}</p>
				<span>月</span>
			</view>
			<view class="right" @click="next"><u-icon name="play-right" color="#E56C95" size="40rpx"></u-icon></view>
		</div>
		<!-- week -->
		<view class="weekBox">
			<view class="item" :style="{ color: item === '日' || item === '六' ? '#E56C95' : '#333' }"
				v-for="(item, index) of weekList" :key="index">{{ item }}</view>
		</view>
		<!-- list -->
		<view class="list">
			<view class="day blur" v-for="(item, index) of upMonthDayList" :key="index.cDay">
				<view>{{ item.cDay }}</view>
				<view class="lunarCalendar" v-if="isLunarCalendar">{{ item.lunarLabel }}</view>
			</view>
			<view class="day" :class="{ 
					toDay: nowDay == item.cDay,
					duty:item.isOnDuty,
					vacation:item.isVacation,
					compensatory_leave:item.isCompensatoryLeave
				}"
				v-for="(item, index) of nowMonthDayList" :key="index" @click="dayChange(item)">
				<view class="number">{{ item.cDay }}</view>
				<view class="lunarCalendar" v-if="isLunarCalendar">{{ item.lunarLabel}}</view>
				<!-- 优先值班 假期靠后-->
				<view class="tag duty_day" v-if="item.isOnDuty">
					值
				</view>
				<view class="tag vacation_day" v-if="item.isVacation">
					休
				</view>
				<view class="tag compensatory_leave_day" v-if="item.isCompensatoryLeave">
					班
				</view>
			</view>
			<view class="day blur" v-for="(item, index) of downMonthDayList" :key="index.cDay">
				<view>{{ item.cDay }}</view>
				<view class="lunarCalendar" v-if="isLunarCalendar">{{ item.lunarLabel }}</view>
			</view>
		</view>
		<slot></slot>
	</div>
</template>

<script>
	import getDate from '@/util/getDate.js';
	import lunarCalendar from '@/util/lunar-alendar.js';
	import {
		solarHolidays,
		lunarHolidays
	} from "@/static/js/china_holidays.js"
	import {
		vacation
	} from "@/static/js/rq.js";
	//// 一天的毫秒数
	const millisecondsPerDay = 24 * 60 * 60 * 1000;
	export default {
		components: {},
		data() {
			return {
				weekList: [`一`, `二`, `三`, `四`, `五`, `六`, `日`],
				nowYear: '', // 当前年
				nowMonth: '', // 当前月
				nowDay: '', // 当前日
				nowMonthDays: '', // 当前月多少天
				nowpeasant: {}, //当前日期信息
				beginMonthWeek: '', // 这个月开始时间是星期几
				upMonthDayList: [], // 上个月剩下的日期数据
				nowMonthDayList: [], // 这个月的日期数组
				downMonthDayList: [], // 下个月剩下的日期数据
				isLunarCalendar: true, // 是否开启农历
			};
		},
		props: {
			//日期
			nowDate: {
				type: String,
				default: function() {
					return new getDate().dateFormat()
				}
			},
			//排班天数
			shiftsNum: {
				type: Number,
				default: 0
			},
			//最近值班日期 时间戳格式
			latestDate: {
				default: null
			}
		},
		watch: {
			nowDate(val) {
				this.init()
			}
		},
		created() {
			this.init();
		},
		methods: {
			dayChange(dayDate) {
				this.$emit("clickDay",dayDate)
			},
			getHolidaysData(dayDate) {
				let lunarDateStr = dayDate.lMonth + "-" + dayDate.lDay;
				let solarDateStr = dayDate.cMonth + "-" + dayDate.cDay;
				let timeStr = `${dayDate.cYear}/${dayDate.cMonth}/${dayDate.cDay}`
				let dayTimestamp = Date.parse(timeStr)
				let newData = {
					lunarLabel: "", // 农历显示字段，可能节假日 优先农历节假日
					isOnDuty: false, //是否值班
					isVacation:false, //是否假期
					isCompensatoryLeave:false,//是否调休
				}
				
				//处理是否是国家节假日与国家调休
				function addLeadingZero(number) {
				    return number < 10 ? "0" + number : number;
				}
							
				const vacationData = vacation[`${dayDate.cYear}${addLeadingZero(dayDate.cMonth)}${addLeadingZero(dayDate.cDay)}`]
				if(vacationData){
					if(vacationData.type=='休'){
						newData.isVacation=true;
					}else{
						newData.isCompensatoryLeave=true
					}
				}
				
				//农历节假日
				let lunarDate = lunarHolidays[lunarDateStr];
				//阳历节假日
				let solarDate = solarHolidays[solarDateStr];
				if (lunarDate) {
					newData.lunarLabel = lunarDate.name
				} else if (solarDate) {
					newData.lunarLabel = solarDate.name
				} else {
					newData.lunarLabel = dayDate.IDayCn
				}
			
				//计算是不是值班日
				if (this.shiftsNum && this.latestDate) {
					// 1、当前日期是国家节假日
					//  2、周六周日进行值班并且非调休
					if (newData.isVacation|| [6,7].includes(dayDate.nWeek) && !newData.isCompensatoryLeave) {
						const timestampDiff = Math.abs(this.latestDate - dayTimestamp);
						const daysDifference = Math.floor(timestampDiff / millisecondsPerDay)
						newData.isOnDuty = daysDifference % this.shiftsNum === 0
					}
					
			
				}

				return newData

			},
			//生成月份数据
			generateMonthData(year, month, days) {
				const monthData = [];
				for (let i = 1; i <= days; i++) {
					const peasant = lunarCalendar.solar2lunar(year, month, i);
					const holidaysData = this.getHolidaysData(peasant)
					monthData.push({
						day: i,
						lunarCalendar: peasant.IDayCn === '初一' ? peasant.IMonthCn : peasant.IDayCn,
						...peasant,
						...holidaysData,
					});
				}
				return monthData
			},
			init() {
				const nowDate = new getDate(this.nowDate);
				this.nowYear = nowDate.getFullYear();
				this.nowMonth = nowDate.getMonth();
				this.nowDay = nowDate.getDate();
				this.nowpeasant = lunarCalendar.solar2lunar(this.nowYear, this.nowMonth, this.nowDay);
				// console.log(this.nowpeasant);
				//这个月天数
				this.nowMonthDays = getDate.getDays({
					year: this.nowYear,
					month: this.nowMonth
				});
				this.beginMonthWeek = getDate.getMonthWeekBegin({
					year: this.nowYear,
					month: this.nowMonth
				});
				// 上个月天数
				let upMonthDay = getDate.getUpDays({
					year: this.nowYear,
					month: this.nowMonth
				});
				this.upMonthDayList = []; // 上个月数据置空
				let upDay = this.beginMonthWeek - 1 < 0 ? 0 : this.beginMonthWeek - 1;

				const [upYear, upMonth] = this.nowMonth === 1 ? [this.nowYear - 1, 12] : [this.nowYear, this.nowMonth - 1];

				for (let i = 0; i < upDay; i++) {
					const peasant = lunarCalendar.solar2lunar(upYear, upMonth, upMonthDay - i);
					const holidaysData = this.getHolidaysData(peasant)
					this.upMonthDayList.unshift({
						day: upMonthDay - i,
						lunarCalendar: peasant.IDayCn === '初一' ? peasant.IMonthCn : peasant.IDayCn,
						...peasant,
						...holidaysData,
					});
				}

				// 当前月的数据
				this.nowMonthDayList = this.generateMonthData(this.nowYear, this.nowMonth, this.nowMonthDays)

				// 下个月的数据
				let downMonthDay = getDate.getDownDays({
					year: this.nowYear,
					month: this.nowMonth
				}); // 下个月的天数
				this.downMonthDayList = []; // 上个月数据置空
				let downDay = 7 - ((upDay + this.nowMonthDays) % 7);
				downDay = downDay < 0 ? 0 : downDay;
				downDay=downDay==7?0:downDay
				const [downYear, downMonth] = this.nowMonth === 12 ? [this.nowYear + 1, 1] : [this.nowYear, this.nowMonth +
					1
				];
				for (let i = 0; i < downDay; i++) {
					const peasant = lunarCalendar.solar2lunar(downYear, downMonth, i + 1);
					const holidaysData = this.getHolidaysData(peasant)
					this.downMonthDayList.push({
						day: i + 1,
						...peasant,
						...holidaysData
					});
				}

				// console.log({
				// 	nowDate: this.nowDate,
				// 	nowYear: this.nowYear,
				// 	nowMonth: this.nowMonth,
				// 	nowDay: this.nowDay,
				// 	nowMonthDays: this.nowMonthDays,
				// 	beginMonthWeek: this.beginMonthWeek,
				// 	upDay,
				// 	downDay,
				// 	upMonthDayList: this.upMonthDayList,
				// 	nowMonthDayList: this.nowMonthDayList,
				// 	downMonthDayList: this.downMonthDayList
				// });
			},
			next(e) {
				this.$emit('next', e);
			},
			prev(e) {
				this.$emit('prev', e);
			},
			changeDay(a) {
				// console.log(a);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.dd-calender {
		box-sizing: border-box;
		background-color: #fff;
		border-radius: 50rpx;
		min-height: 800rpx;
		position: relative;
		box-shadow:
			5rpx 10rpx 8rpx rgba(0, 0, 0, 0.11),
			10rpx 20rpx 31rpx rgba(0, 0, 0, 0.22);
		box-sizing: border-box;
		padding: 16rpx;
	}

	.header-title {
		width: 100%;
		height: 100rpx;
		display: flex;

		.current_month {
			width: 50%;
			display: flex;
			// flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #e56c95;

			span {
				margin: 0 8rpx;
			}

			position: relative;

			.animal {
				font-weight: 900;
				margin-right: 40rpx;
				font-size: 40rpx;
			}
		}

		.left,
		.right {
			width: 25%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.weekBox {
		padding: 40rpx 0;
		display: grid;
		grid-template-columns: repeat(7, 1fr);

		.item {
			text-align: center;
		}
	}

	.list {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 12rpx 24rpx;

		.day {
			height: 80rpx;
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			color: #333;
			font-size: 32rpx;
			font-weight: 600;
			border-radius: 12rpx;
			position: relative;
			.lunarCalendar {
				width: 100%;
				font-size: 18rpx;
				margin-top: -20rpx;
				color: rgba(30, 31, 36, 0.5);
			}
		}

		.blur {
			opacity: 0.3;
		}

		.tag{
			$duty-day-size: 30rpx;
			width: $duty-day-size;
			height: $duty-day-size;
			top: -10rpx;
			position: absolute;
			font-size: 20rpx;
			border-radius: 6rpx;
			text-align: center;
			line-height: $duty-day-size;
			color: #fff;
		}
		//假期
		.vacation{
			background: rgba(0,168,112,.2);
		}
		//值班日期
		.duty {
			background-color: rgba(235, 51, 51, .1);
			//节假日并且值班
			&.vacation{
				.vacation_day{
					left: -10rpx;
					opacity: .5;
				}
			}
		}
		//调休日期
		.compensatory_leave{
			background-color: rgba(78,88,119,.1);
		
		}

		.duty_day {
			right: -10rpx;
			background: rgba(235, 51, 51, 0.9);
		}
		.vacation_day{
			right: -10rpx;
			background: rgba(0,168,112,.9);
			
		}
		.compensatory_leave_day{
			right: -10rpx;
			background-color: rgba(78,88,119,.9);
		}

		.toDay {
			background-color: rgba(225, 5, 144, 0.5);
			color: #fff;

			.lunarCalendar {
				color: #fff;
			}
		}
	}
</style>