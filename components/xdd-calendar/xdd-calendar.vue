<template>
	<view class="box">
		<view class="calendarBox" :style="{borderRadius: `${radius > 80 ? 80 : radius}rpx`, boxShadow: `0 4rpx 20rpx ${pageBgColor}`}">
			<!-- 顶部插槽 -->
			<slot name="header"></slot>
			
			<!-- 顶部选择日期 -->
			<view class="navBox">
				<view class="enlargeBox">
					<image class="arrow" :src="arrowImg" mode="widthFix" @click="quickSelect('up')"></image>
				</view>
				<picker mode="date" :value="`${nowYear}-${nowMonth}`" fields="month" @change="bindDateChange">
					<view class="date">{{nowYear}}年{{nowMonth}}月</view>
				</picker>
				<view class="enlargeBox">
					<image class="arrow rightArrow" :src="arrowImg" mode="widthFix" @click="quickSelect('down')"></image>
				</view>
			</view>
			
			<!-- week -->
			<view class="weekBox">
				<view class="item" :style="{'color': item === '日' || item === '六' ? 'red' : '#333', }" v-for="(item, index) of weekList" :key="index">{{item}}</view>
			</view>
			
			<!-- list -->
			<view class="list">
				<view class="day blur" v-for="(item, index) of upMonthDayList" :key="index.day">
					<view>{{item.day}}</view>
					<view class="lunarCalendar" v-if="isLunarCalendar">{{item.lunarCalendar}}</view>
				</view>
				<view class="day" :class="{toDay: nowDay == item.day}"
				:style="itemDayStyle + (nowDay != item.day ? dayStyle : toDayStyle)"
				 v-for="(item, index) of nowMonthDayList" :key="index" @click="dayChange(item)">
					<view class="number">{{item.day}}</view>
					<view class="lunarCalendar" v-if="isLunarCalendar">{{item.lunarCalendar}}</view>
				</view>
				<view class="day blur" v-for="(item, index) of downMonthDayList" :key="index.day">
					<view>{{item.day}}</view>
					<view class="lunarCalendar" v-if="isLunarCalendar">{{item.lunarCalendar}}</view>
				</view>
			</view>
			
			<!-- 尾部插槽 -->
			<slot name="footer"></slot>
		</view>
		<view class="page pageOne" :style="{borderRadius: `${radius > 80 ? 80 : radius}rpx`, boxShadow: `0 4rpx 20rpx ${pageBgColor}`}"></view>
		<view class="page pageTwo" :style="{borderRadius: `${radius > 80 ? 80 : radius}rpx`, boxShadow: `0 4rpx 20rpx ${pageBgColor}`}"></view>
	</view>
</template>

<script>
	import getDateFun from './date.js'
	import lunarCalendar from '../../util/lunar-alendar.js'
	export default {
		name: "xdd-calendar",
		props: {
			// 每周从星期几开始 默认周日
			weekBegin: {
				type: Number | String,
				default: function(){
					return 7
				}
			},
			// 是否开启农历
			isLunarCalendar: {
				type: Boolean,
				default: function(){
					return true
				}
			},
			// 上下页箭头
			arrowImg: {
				type: String,
				default: function(){
					return '/static/arrow.png'
				}
			},
			
			// 圆角
			radius: {
				type: Number | String,
				default: function(){
					return 50
				}
			},
			// 页表阴影颜色
			pageBgColor: {
				type: String,
				default: function(){
					return `rgba(242, 138, 95, .8)`
				}
			},
			// 自定义样式 每一天
			itemDayStyle: {
				type: String,
				default: function(){
					return ''
				}
			},
			// 自定义样式 除去今天
			dayStyle: {
				type: String,
				default: function(){
					return ''
				}
			},
			// 自定义样式 今天
			toDayStyle: {
				type: String,
				default: function(){
					return ''
				}
			}
		},
		data() {
			return {
				nowYear: '', // 当前年
				nowMonth: '', // 当前月
				nowDay: '', // 当前日
				monthDays: '', // 当前月多少天
				beginMonthWeek: '', // 这个月开始时间是星期几
				
				weekList: [`日`, `一`, `二`, `三`, `四`, `五`, `六`],
				
				upMonthDayList: [], // 上个月剩下的日期数据
				nowMonthDayList: [], // 这个月的日期数组
				downMonthDayList: [], // 下个月剩下的日期数据
			};
		},
		created() {
			this.weekBegin == 6 ? this.weekList = [`六`, `日`, `一`, `二`, `三`, `四`, `五`] : ''
			this.bindDateChange()
		},
		methods:{
			// 上下月
			quickSelect(type){
				let [year, month, e] = ['', '', {}]
				if(type === 'up'){
					[year, month] = this.nowMonth === 1 ? [this.nowYear - 1, 12] : [this.nowYear, this.nowMonth - 1]
				}else if(type === 'down'){
					[year, month] = this.nowMonth === 12 ? [this.nowYear + 1, 1] : [this.nowYear, this.nowMonth + 1]
				}
				e = {detail: {value: `${year}-${month}`}}
				this.bindDateChange(e)
			},
			
			// 选择日期
			bindDateChange(e){
				this.nowYear = e ? e.detail.value.split('-')[0] - 0 : getDateFun.getFullYear()
				this.nowMonth = e ? e.detail.value.split('-')[1] - 0 : getDateFun.getMonth()
				this.nowDay = getDateFun.getDate()
				this.monthDays = getDateFun.getDays({year: this.nowYear, month: this.nowMonth})
				this.beginMonthWeek = getDateFun.getMonthWeekBegin({year: this.nowYear, month: this.nowMonth})
				// 选择日期事件
				this.$emit('selectDate', {year: this.nowYear, month: this.nowMonth, day: this.nowDay})
				
				// 上个月的数据
				let upMonthDay = getDateFun.getUpDays({year: this.nowYear, month: this.nowMonth}) // 上个月的天数
				this.upMonthDayList = [] // 上个月数据置空
				let upDay = 0
				switch (this.weekBegin){
					case 7 | '7':
						upDay = this.beginMonthWeek % 7
						break 
					case 6 | '6':
						upDay = (this.beginMonthWeek % 7 + 1) % 7
						break
				}
				const [upYear, upMonth] = this.nowMonth === 1 ? [this.nowYear - 1, 12] : [this.nowYear, this.nowMonth - 1]
				for(let i = 0; i < upDay; i++){
					const peasant = lunarCalendar.solar2lunar(upYear, upMonth, upMonthDay - i)
					this.upMonthDayList.unshift({
						day: upMonthDay - i,
						week: getDateFun.getWeekDay({year: upYear, month: upMonth, day: upMonthDay - i}),
						lunarCalendar: peasant.IDayCn === '初一' ? peasant.IMonthCn : peasant.IDayCn
					})
				}
				
				// 当前月的数据
				this.nowMonthDayList = []
				for(let i = 1; i <= this.monthDays; i++){
					const peasant = lunarCalendar.solar2lunar(this.nowYear, this.nowMonth, i)
					this.nowMonthDayList.push({
						day: i,
						week: getDateFun.getWeekDay({year: this.nowYear, month: this.nowMonth, day: i}),
						lunarCalendar: peasant.IDayCn === '初一' ? peasant.IMonthCn : peasant.IDayCn
					})
				}
				
				// 下个月的数据
				let downMonthDay = getDateFun.getDownDays({year: this.nowYear, month: this.nowMonth}) // 下个月的天数
				this.downMonthDayList = [] // 上个月数据置空
				let downDay = (7 - (upDay + this.monthDays) % 7) % 7
				const [downYear, downMonth] = this.nowMonth === 12 ? [this.nowYear + 1, 1] : [this.nowYear, this.nowMonth + 1]
				for(let i = 0; i < downDay; i++){
					const peasant = lunarCalendar.solar2lunar(downYear, downMonth, i + 1)
					this.downMonthDayList.push({
						day: i + 1,
						week: getDateFun.getWeekDay({year: downYear, month: downMonth, day: i + 1}),
						lunarCalendar: peasant.IDayCn === '初一' ? peasant.IMonthCn : peasant.IDayCn
					})
				}
			},
			
			// 点击事件
			dayChange(e){
				const peasant = this.isLunarCalendar ? lunarCalendar.solar2lunar(this.nowYear, this.nowMonth, e.day) : {}
				const date = {
					year: this.nowYear,
					month: this.nowMonth,
					day: e.day,
					week: e.week,
					IYearCn: peasant.lYear || '',
					IMonthCn: peasant.IMonthCn || '',
					IDayCn: peasant.IDayCn || ''
				}
				this.$emit('change', date)
			}
		}
	}
</script>

<style lang="scss">
	.box{
		// position: relative;
	}
	
	.calendarBox {
		background-color: #FFF;
		border-radius: 20rpx;
		padding: 50rpx 30rpx;
		font-size: 30rpx;
		color: #333;
	}

	.navBox {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.enlargeBox {
			width: 50rpx;
			height: 50rpx;
			display: flex;
			align-items: center;

			.arrow {
				width: 30rpx;
				height: 30rpx;
			}

			.rightArrow {
				transform: rotate(180deg);
			}
		}
		.enlargeBox:last-child{
			justify-content: flex-end;
		}
	}
	
	.weekBox{
		padding: 40rpx 0;
		display: flex;
		align-items: center;
		text-align: center;
		.item{
			width: calc(100% / 7);
		}
	}
	
	.page{
		width: calc(100% - 60rpx);
		height: 100rpx;
		position: relative;
		top: -70rpx;
		left: 0;
		right: 0;
		margin: auto;
		z-index: -1;
		background-color: #FFF;
	}
	.pageTwo{
		width: calc(100% - 120rpx);
		top: -150rpx;
		z-index: -2;
	}
	
	.list{
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.day{
			width: calc(100% / 7);
			height: 90rpx;
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			.lunarCalendar{
				width: 100%;
				font-size: 18rpx;
				margin-top: -20rpx;
			}
		}
		.blur{
			opacity: 0.3;
		}
		.toDay{
			background-color: rgba(225, 5, 144, .5);
			color: #FFF;
		}
	}
	
	
</style>