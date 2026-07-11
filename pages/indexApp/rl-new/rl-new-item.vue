<template>
	<view class="duty-calendar" :class="{ 'is-placeholder': !isReady }">
		<template v-if="isReady">
		<view class="calendar-header">
			<view class="month-control" hover-class="month-control--pressed" @click="emit('prev')"><u-icon name="arrow-left" color="#c9577d" size="28rpx" /></view>
			<view class="month-title"><text class="animal">{{ nowPeasant.Animal }}</text><text class="month-text">{{ nowYear }} 年 {{ nowMonth }} 月</text></view>
			<view class="month-control" hover-class="month-control--pressed" @click="emit('next')"><u-icon name="arrow-right" color="#c9577d" size="28rpx" /></view>
		</view>
		<view class="week-row"><text v-for="day in weekList" :key="day" class="week-day" :class="{ weekend: day === '六' || day === '日' }">{{ day }}</text></view>
		<view class="date-grid">
			<view v-for="item in previousMonthDays" :key="`previous-${item.cYear}-${item.cMonth}-${item.cDay}`" class="day-cell is-outside"><text>{{ item.cDay }}</text><text class="lunar-label">{{ item.lunarLabel }}</text></view>
			<view v-for="item in currentMonthDays" :key="`current-${item.cDay}`" class="day-cell" :class="dayClass(item)" hover-class="day-cell--pressed" @click="selectDay(item)">
				<text class="day-number">{{ item.cDay }}</text><text class="lunar-label">{{ item.lunarLabel }}</text>
				<text v-if="item.isOnDuty" class="day-tag tag-duty">值</text><text v-if="item.isVacation" class="day-tag tag-vacation" :class="{ 'has-duty': item.isOnDuty }">休</text><text v-if="item.isCompensatoryLeave" class="day-tag tag-workday">班</text>
			</view>
			<view v-for="item in nextMonthDays" :key="`next-${item.cYear}-${item.cMonth}-${item.cDay}`" class="day-cell is-outside"><text>{{ item.cDay }}</text><text class="lunar-label">{{ item.lunarLabel }}</text></view>
		</view>
		<view class="calendar-legend"><view><text class="legend-dot dot-today"></text>今天</view><view><text class="legend-dot dot-duty"></text>值班</view><view><text class="legend-dot dot-vacation"></text>休息</view><view><text class="legend-dot dot-workday"></text>补班</view></view>
		<slot />
		</template>
		<view v-else class="calendar-placeholder">
			<view class="placeholder-title" />
			<view class="placeholder-week" />
			<view class="placeholder-grid"><text v-for="item in 21" :key="item" /></view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import getDate from '@/util/getDate.js'
import lunarCalendar from '@/util/lunar-alendar.js'
import { solarHolidays, lunarHolidays } from '@/util/china-holidays.js'

const props = defineProps({ nowDate: { type: String, default: () => new getDate().dateFormat() }, isReady: { type: Boolean, default: true }, holidayVersion: { type: Number, default: 0 }, selectedDate: { type: String, default: '' }, shiftsNum: { type: Number, default: 0 }, latestDate: { type: Number, default: null }, holidayMap: { type: Object, default: () => ({}) } })
const emit = defineEmits(['click-day', 'next', 'prev'])
const weekList = ['一', '二', '三', '四', '五', '六', '日']
const millisecondsPerDay = 24 * 60 * 60 * 1000
const monthDataCache = new Map()
const monthDataCacheLimit = 24
const nowYear = ref(0), nowMonth = ref(0), nowPeasant = ref({}), previousMonthDays = ref([]), currentMonthDays = ref([]), nextMonthDays = ref([])

const selectedDateKey = computed(() => props.selectedDate.replace(/\//g, '-'))
const dateKey = day => `${day.cYear}-${day.cMonth}-${day.cDay}`
const pad = value => String(value).padStart(2, '0')
const getHolidayData = day => {
	const calendarHoliday = props.holidayMap[`${day.cYear}-${pad(day.cMonth)}-${pad(day.cDay)}`]
	const isVacation = calendarHoliday?.type === '休'
	const isCompensatoryLeave = calendarHoliday?.type === '班'
	const lunarHoliday = lunarHolidays[`${day.lMonth}-${day.lDay}`]
	const solarHoliday = solarHolidays[`${day.cMonth}-${day.cDay}`]
	const timestamp = new Date(day.cYear, day.cMonth - 1, day.cDay).getTime()
	const isWeekend = [6, 7].includes(day.nWeek)
	const isOnDuty = Boolean(props.shiftsNum && props.latestDate && (isVacation || (isWeekend && !isCompensatoryLeave)) && Math.floor(Math.abs(props.latestDate - timestamp) / millisecondsPerDay) % props.shiftsNum === 0)
	const builtInHoliday = lunarHoliday || solarHoliday
	const lunarLabel = calendarHoliday?.displayText || builtInHoliday?.name || day.IDayCn
	return { lunarLabel, isVacation, isCompensatoryLeave, isOnDuty }
}
const buildDay = (year, month, day) => {
	const lunarDay = lunarCalendar.solar2lunar(year, month, day)
	return { ...lunarDay, ...getHolidayData(lunarDay) }
}
const getMonthCache = key => {
	const cached = monthDataCache.get(key)
	if (!cached) return null
	monthDataCache.delete(key)
	monthDataCache.set(key, cached)
	return cached
}
const saveMonthCache = (key, value) => {
	monthDataCache.set(key, value)
	if (monthDataCache.size > monthDataCacheLimit) monthDataCache.delete(monthDataCache.keys().next().value)
}
const buildMonthData = () => {
	const date = new getDate(props.nowDate)
	const year = date.getFullYear()
	const month = date.getMonth()
	const daysInMonth = getDate.getDays({ year, month })
	const firstWeekday = getDate.getMonthWeekBegin({ year, month })
	const previousCount = Math.max(firstWeekday - 1, 0)
	const [previousYear, previousMonth] = month === 1 ? [year - 1, 12] : [year, month - 1]
	const previousDaysInMonth = getDate.getDays({ year: previousYear, month: previousMonth })
	const previousDays = Array.from({ length: previousCount }, (_, index) => buildDay(previousYear, previousMonth, previousDaysInMonth - previousCount + index + 1))
	const currentDays = Array.from({ length: daysInMonth }, (_, index) => buildDay(year, month, index + 1))
	const nextCount = 42 - previousCount - daysInMonth
	const [nextYear, nextMonth] = month === 12 ? [year + 1, 1] : [year, month + 1]
	return {
		nowYear: year,
		nowMonth: month,
		nowPeasant: lunarCalendar.solar2lunar(year, month, date.getDate()),
		previousDays,
		currentDays,
		nextDays: Array.from({ length: nextCount }, (_, index) => buildDay(nextYear, nextMonth, index + 1))
	}
}
const init = () => {
	if (!props.isReady) return
	const cacheKey = `${props.nowDate}|${props.shiftsNum}|${props.latestDate || ''}|${props.holidayVersion}`
	const monthData = getMonthCache(cacheKey) || buildMonthData()
	if (!monthDataCache.has(cacheKey)) saveMonthCache(cacheKey, monthData)
	nowYear.value = monthData.nowYear
	nowMonth.value = monthData.nowMonth
	nowPeasant.value = monthData.nowPeasant
	previousMonthDays.value = monthData.previousDays
	currentMonthDays.value = monthData.currentDays
	nextMonthDays.value = monthData.nextDays
}
const dayClass = day => ({ 'is-today': day.isToday, 'is-selected': dateKey(day) === selectedDateKey.value, 'is-duty': day.isOnDuty, 'is-vacation': day.isVacation, 'is-workday': day.isCompensatoryLeave })
const selectDay = day => emit('click-day', day)
watch(() => [props.nowDate, props.isReady, props.shiftsNum, props.latestDate, props.holidayVersion], init, { immediate: true })
</script>

<style lang="scss" scoped>
.duty-calendar { position:relative; padding:28rpx 22rpx 62rpx; border:1rpx solid rgba(255,255,255,.86); border-radius:34rpx; background:rgba(255,255,255,.91); box-shadow:0 20rpx 50rpx rgba(177,87,121,.16); }
.duty-calendar.is-placeholder { min-height:910rpx; }.calendar-placeholder { padding-top:8rpx; }.placeholder-title,.placeholder-week,.placeholder-grid text { display:block; border-radius:16rpx; background:#f9edf1; }.placeholder-title { width:38%; height:42rpx; margin:20rpx auto 54rpx; }.placeholder-week { height:44rpx; margin:0 8rpx 30rpx; }.placeholder-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:24rpx 18rpx; padding:0 12rpx; }.placeholder-grid text { height:72rpx; }
.calendar-header { display:flex; align-items:center; justify-content:space-between; padding:2rpx 4rpx 26rpx; }.month-title { display:flex; flex-direction:column; align-items:center; color:#563540; }.animal { color:#c9577d; font-size:23rpx; }.month-text { margin-top:3rpx; font-size:35rpx; font-weight:700; }.month-control { display:flex; align-items:center; justify-content:center; width:64rpx; height:64rpx; border-radius:50%; background:#fff2f6; transition:transform .2s,opacity .2s; }.month-control--pressed,.day-cell--pressed { opacity:.72; transform:scale(.94); }
.week-row,.date-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); }.week-row { padding:18rpx 0; border-top:1rpx solid #fae8ee; border-bottom:1rpx solid #fae8ee; }.week-day { text-align:center; color:#795d67; font-size:23rpx; }.weekend { color:#d87898; }
.date-grid { gap:12rpx 0; padding-top:22rpx; }.day-cell { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; height:88rpx; min-width:0; border-radius:18rpx; color:#49343b; font-size:29rpx; font-weight:600; transition:transform .2s,opacity .2s,background .2s; }.lunar-label { width:100%; margin-top:2rpx; overflow:hidden; color:#af939c; font-size:17rpx; font-weight:400; line-height:22rpx; text-align:center; text-overflow:ellipsis; white-space:nowrap; }.is-outside { color:#d7c6cc; font-weight:400; }.is-outside .lunar-label { color:#ddcfd3; }.is-vacation { background:#eff9f4; color:#318764; }.is-workday { background:#f2f3f8; color:#61708d; }.is-duty { background:#fff0f4; color:#c9577d; }.is-today { box-shadow:inset 0 0 0 2rpx #e89bb5; }.is-selected { color:#fff; background:linear-gradient(135deg,#ec91b0,#d95f87); box-shadow:0 8rpx 16rpx rgba(207,82,126,.24); }.is-selected .lunar-label { color:rgba(255,255,255,.85); }.day-tag { position:absolute; top:-5rpx; right:1rpx; display:flex; align-items:center; justify-content:center; width:27rpx; height:27rpx; border-radius:50%; color:#fff; font-size:17rpx; line-height:1; }.tag-duty { background:#df6d92; }.tag-vacation { background:#60af8c; }.tag-vacation.has-duty { right:auto; left:1rpx; }.tag-workday { background:#7b89a4; }.is-selected .day-tag { box-shadow:0 0 0 2rpx #fff; }
.calendar-legend { display:flex; flex-wrap:wrap; gap:16rpx 22rpx; padding:28rpx 8rpx 0; color:#9d7a86; font-size:20rpx; }.calendar-legend view { display:flex; align-items:center; }.legend-dot { display:inline-block; width:12rpx; height:12rpx; margin-right:7rpx; border-radius:50%; }.dot-today{border:2rpx solid #e89bb5}.dot-duty{background:#df6d92}.dot-vacation{background:#60af8c}.dot-workday{background:#7b89a4}
</style>
