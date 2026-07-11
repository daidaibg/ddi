<template>
	<view class="snow-calendar">
		<view class="background-glow glow-one" />
		<view class="background-glow glow-two" />
		<view class="calendar-toolbar">
			<view class="toolbar-copy">
				<text class="toolbar-title">值班日历</text>
				<text class="toolbar-subtitle">农历、节假日与轮班安排</text>
			</view>
			<view class="today-button" hover-class="today-button--pressed" @click="goToday">今天</view>
		</view>

		<view class="calendar-viewport" :style="viewportStyle" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @touchcancel="onTouchCancel" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseLeave">
			<view class="calendar-track" :class="{ 'calendar-track--animating': isAnimating && transitionEnabled }" :style="trackStyle" @transitionend="onTransitionEnd">
			<view v-for="item in calendarPages" :key="item.id" class="calendar-slide">
				<RlNewItem
					class="calendar-content"
					:now-date="item.date"
					:is-ready="item.isReady"
					:holiday-version="holidayVersion"
					:selected-date="selectedDate"
					:latest-date="setData.timestamp"
					:shifts-num="setData.shiftsNum"
					:holiday-map="holidayMap"
					@click-day="clickDay"
					@next="next"
					@prev="prev"
				>
					<view class="calendar-middle-action">
						<view class="add-config" hover-class="add-config--pressed" @click="openConfig">
						<u-icon name="setting" color="#ffffff" size="38rpx" />
						</view>
					</view>
				</RlNewItem>
			</view>
			</view>
			<view v-if="isAnimating && transitionEnabled" class="calendar-animation-signal" :style="animationSignalStyle" @animationend="onTransitionEnd" />
		</view>

		<view class="calendar-summary">
			<view class="summary-heading">
				<view><text class="summary-title">日期小笺</text><text class="summary-subtitle">{{ selectedDay ? selectedDay.ncWeek : '选择日期查看排班状态' }}</text></view>
				<text class="summary-date">{{ selectedDay ? `${selectedDay.cMonth} 月 ${selectedDay.cDay} 日` : '今日' }}</text>
			</view>
			<view v-if="selectedDay" class="summary-status">
				<text class="summary-lunar">{{ selectedDay.lunarLabel }}</text>
				<text v-if="selectedDay.isOnDuty" class="status-pill is-duty">值班日</text>
				<text v-else-if="selectedDay.isVacation" class="status-pill is-vacation">休息日</text>
				<text v-else-if="selectedDay.isCompensatoryLeave" class="status-pill is-workday">补班日</text>
				<text v-else class="status-pill is-normal">常规日期</text>
			</view>
			<view v-else class="summary-empty"><u-icon name="calendar" color="#df8ca8" size="30rpx" /><text>轻触日历中的日期，查看当天的农历与排班提示</text></view>
			<view class="rule-overview"><view><text>轮班周期</text><text class="rule-value">{{ setData.shiftsNum || '未设置' }}</text></view><view><text>基准日期</text><text class="rule-value">{{ setData.time || '未设置' }}</text></view></view>
		</view>

		<u-popup v-model="configShow" mode="bottom" round="28" closeable>
			<view class="config-panel">
				<view class="panel-heading">
					<text class="panel-title">轮班设置</text>
					<text class="panel-description">设置轮班周期和最近一次值班日期，保存后会保留在本机。</text>
				</view>
				<view class="setting-list">
					<view class="setting-item" hover-class="setting-item--pressed" @click="selectShiftNum">
						<view>
							<text class="setting-label">轮班周期</text>
							<text class="setting-tip">设为 0 时不计算值班日</text>
						</view>
						<view class="setting-value"><text>{{ setData.shiftsNum || '未设置' }}</text><u-icon name="arrow-right" color="#c8a4b0" size="24rpx" /></view>
					</view>
					<view class="setting-item" hover-class="setting-item--pressed" @click="selectLatestDate">
						<view>
							<text class="setting-label">最近值班日期</text>
							<text class="setting-tip">作为轮班计算的基准日期</text>
						</view>
						<view class="setting-value"><text>{{ setData.time || '请选择' }}</text><u-icon name="arrow-right" color="#c8a4b0" size="24rpx" /></view>
					</view>
				</view>
				<view class="panel-actions">
					<u-button plain custom-style="border-color:#efbfd0;color:#c9577d;background:#fff7fa;" @click="clearConfig">清空规则</u-button>
					<u-button type="error" custom-style="margin-left:20rpx;background:#dc6f95;border-color:#dc6f95;" @click="saveConfig">保存设置</u-button>
				</view>
			</view>
		</u-popup>
		<u-calendar v-model="calendarShow" mode="date" active-bg-color="#dc6f95" btn-type="error" max-date="2050-01-01" @change="timeChange" />
		<u-select v-model="selectShow" :list="shiftOptions" label-name="value" mode="single-column" @confirm="confirm" />
	</view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { onHide, onLoad, onReady, onShareAppMessage } from '@dcloudio/uni-app'
import getDate from '@/util/getDate.js'
import RlNewItem from './rl-new-item.vue'
import { randomPopupTexts } from '@/util/popupTexts.js'
import { buildHolidayMap, loadHolidayCalendar } from '@/util/rq.js'

const defaultConfig = { shiftsNum: 0, time: null, timeData: null, timestamp: null }
const currentMonth = ref(null)
const calendarPages = ref([])
const activePageIndex = ref(6)
const isAnimating = ref(false)
const transitionDirection = ref(0)
const transitionEnabled = ref(true)
const transitionDuration = ref(0)
const dragOffset = ref(0)
const viewportWidth = ref(uni.getSystemInfoSync().windowWidth)
const dragState = { startX: 0, startY: 0, startTime: 0, mode: '', input: '', active: false }
let pendingDragOffset = 0
let dragFrameToken = 0
let dragFramePending = false
const selectedDate = ref(new getDate().dateFormat())
const selectedDay = ref(null)
const configShow = ref(false)
const calendarShow = ref(false)
const selectShow = ref(false)
const setData = ref({ ...defaultConfig })
const holidayMap = ref({})
const holidayVersion = ref(0)
const attemptedHolidayYears = new Set()
const pendingHolidayResults = []
const shiftOptions = Array.from({ length: 31 }, (_, index) => ({ value: index + 1, label: index + 1 }))
const switchDistanceRatio = 0.22
const switchDistanceMin = 56
const switchVelocity = 0.45
const pageBuffer = 6
const pageEdge = 3
const pageBatchSize = 4
const preparedPageRadius = 2
const monthPageCache = new Map()
const monthPageCacheLimit = 24

const getMonthStart = date => new getDate(`${date.getFullYear()}/${date.getMonth()}/1`)
const createMonthPage = date => {
	const id = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
	const cached = monthPageCache.get(id)
	if (cached) {
		monthPageCache.delete(id)
		monthPageCache.set(id, cached)
		return cached
	}
	const page = { id, date: date.dateFormat(), isReady: false }
	monthPageCache.set(id, page)
	if (monthPageCache.size > monthPageCacheLimit) monthPageCache.delete(monthPageCache.keys().next().value)
	return page
}
const offsetMonth = (date, offset) => getMonthStart(new getDate(date.getOffsetMonth(offset).format))
const createCalendarPages = month => Array.from({ length: pageBuffer * 2 + 1 }, (_, index) => createMonthPage(offsetMonth(new getDate(month.date), index - pageBuffer)))
const getSlideWidth = () => viewportWidth.value || uni.getSystemInfoSync().windowWidth
const viewportStyle = computed(() => ({ '--calendar-slide-width': `${getSlideWidth()}px` }))
const trackStyle = computed(() => ({
	width: `${calendarPages.value.length * getSlideWidth()}px`,
	transform: `translate3d(${-activePageIndex.value * getSlideWidth() + dragOffset.value}px,0,0)`,
	transitionDuration: isAnimating.value && transitionEnabled.value ? `${transitionDuration.value}ms` : '0ms'
}))
const animationSignalStyle = computed(() => ({ animationDuration: `${transitionDuration.value}ms` }))
const refreshViewportWidth = () => {
	uni.createSelectorQuery().select('.calendar-viewport').boundingClientRect(rect => {
		if (rect?.width) viewportWidth.value = rect.width
	}).exec()
}
const prepareNearbyPages = () => {
	calendarPages.value.forEach((page, index) => {
		page.isReady = Math.abs(index - activePageIndex.value) <= preparedPageRadius
	})
}
const stabilizePages = () => {
	const pages = calendarPages.value
	let activeIndex = activePageIndex.value
	if (activeIndex < pageEdge) {
		const firstDate = new getDate(pages[0].date)
		const addedPages = Array.from({ length: pageBatchSize }, (_, index) => createMonthPage(offsetMonth(firstDate, index - pageBatchSize)))
		pages.unshift(...addedPages)
		activeIndex += pageBatchSize
		pages.splice(activeIndex + pageBuffer + 1)
	} else if (pages.length - activeIndex - 1 < pageEdge) {
		const lastDate = new getDate(pages[pages.length - 1].date)
		pages.push(...Array.from({ length: pageBatchSize }, (_, index) => createMonthPage(offsetMonth(lastDate, index + 1))))
		const removeCount = pages.length - (pageBuffer * 2 + 1)
		pages.splice(0, removeCount)
		activeIndex -= removeCount
	}
	activePageIndex.value = activeIndex
}

const applyHolidayResults = results => {
	const nextHolidayMap = results.reduce((map, result) => Object.assign(map, buildHolidayMap(result.calendar)), {})
	if (Object.keys(nextHolidayMap).length) {
		holidayMap.value = { ...holidayMap.value, ...nextHolidayMap }
		holidayVersion.value += 1
	}
}

const flushHolidayResults = () => {
	if (pendingHolidayResults.length) applyHolidayResults(pendingHolidayResults.splice(0))
}

const loadHolidayYears = async dates => {
	const years = [...new Set(dates.map(date => new getDate(date).getFullYear()))].filter(year => !attemptedHolidayYears.has(year))
	if (!years.length) return
	years.forEach(year => attemptedHolidayYears.add(year))
	const results = await Promise.all(years.map(loadHolidayCalendar))
	if (isAnimating.value) {
		pendingHolidayResults.push(...results)
		return
	}
	applyHolidayResults(results)
}

const loadConfig = () => {
	const savedConfig = uni.getStorageSync('snow-rl-config')
	setData.value = savedConfig ? { ...defaultConfig, ...savedConfig } : { ...defaultConfig }
}

const init = () => {
	const today = new getDate()
	currentMonth.value = createMonthPage(getMonthStart(today))
	calendarPages.value = createCalendarPages(currentMonth.value)
	activePageIndex.value = pageBuffer
	prepareNearbyPages()
	isAnimating.value = false
	transitionDirection.value = 0
	transitionDuration.value = 0
	dragOffset.value = 0
	selectedDate.value = today.dateFormat()
	selectedDay.value = null
}

const clickDay = day => {
	selectedDate.value = `${day.cYear}/${day.cMonth}/${day.cDay}`
	selectedDay.value = day
	uni.showToast({ icon: 'none', title: randomPopupTexts() })
}

const saveConfig = () => {
	uni.setStorageSync('snow-rl-config', { ...setData.value })
	configShow.value = false
	uni.showToast({ title: '设置已保存' })
}

const clearConfig = () => {
	uni.showModal({
		title: '清空轮班规则',
		content: '清空后将不再计算值班日，是否继续？',
		success: ({ confirm }) => {
			if (!confirm) return
			uni.removeStorageSync('snow-rl-config')
			setData.value = { ...defaultConfig }
			uni.showToast({ title: '规则已清空' })
		}
	})
}

const selectLatestDate = () => { calendarShow.value = true }
const selectShiftNum = () => { selectShow.value = true }
const openConfig = () => { configShow.value = true }
const timeChange = time => {
	setData.value.time = time.result
	setData.value.timeData = time
	setData.value.timestamp = new Date(time.year, time.month - 1, time.day).getTime()
}
const confirm = values => { setData.value.shiftsNum = values[0].value }

const getDampedOffset = offset => {
	const width = getSlideWidth()
	const distance = Math.abs(offset)
	if (distance <= width) return offset
	return Math.sign(offset) * (width + (distance - width) * 0.28)
}
const getTransitionDuration = (distance, velocity = 0) => {
	const ratio = Math.min(Math.abs(distance) / getSlideWidth(), 1)
	const speedAdjustment = Math.min(Math.abs(velocity) * 90, 90)
	return Math.max(180, Math.min(380, Math.round(150 + ratio * 230 - speedAdjustment)))
}
const setDragOffsetNow = offset => {
	dragFrameToken += 1
	dragFramePending = false
	pendingDragOffset = offset
	dragOffset.value = offset
}
const scheduleDragOffset = offset => {
	// #ifndef H5
	setDragOffsetNow(offset)
	return
	// #endif

	// #ifdef H5
	pendingDragOffset = offset
	if (dragFramePending) return
	dragFramePending = true
	const token = dragFrameToken
	const commit = () => {
		if (token !== dragFrameToken) return
		dragFramePending = false
		dragOffset.value = pendingDragOffset
	}
	requestAnimationFrame(commit)
	// #endif
}
const switchMonth = direction => {
	if (isAnimating.value) return
	if (!calendarPages.value[activePageIndex.value + direction]) return
	transitionDirection.value = direction
	transitionDuration.value = getTransitionDuration(getSlideWidth())
	isAnimating.value = true
	setDragOffsetNow(-direction * getSlideWidth())
}
const next = () => { switchMonth(1) }
const prev = () => { switchMonth(-1) }
const goToday = () => {
	if (isAnimating.value) return
	init()
	loadHolidayYears(calendarPages.value.map(page => page.date))
}
const resetDrag = (velocity = 0) => {
	if (isAnimating.value) return
	transitionDirection.value = 0
	transitionDuration.value = getTransitionDuration(Math.abs(dragOffset.value), velocity)
	isAnimating.value = true
	setDragOffsetNow(0)
}
const getPointerPosition = point => {
	const x = point?.pageX ?? point?.clientX ?? point?.x
	const y = point?.pageY ?? point?.clientY ?? point?.y
	return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}
const startDrag = (point, input) => {
	const position = getPointerPosition(point)
	if (!position || isAnimating.value || dragState.active) return
	dragState.startX = position.x
	dragState.startY = position.y
	dragState.startTime = Date.now()
	dragState.mode = ''
	dragState.input = input
	dragState.active = true
}
const updateDrag = point => {
	const position = getPointerPosition(point)
	if (!position || isAnimating.value || !dragState.active || dragState.mode === 'vertical') return
	const deltaX = position.x - dragState.startX
	const deltaY = position.y - dragState.startY
	if (!dragState.mode) {
		if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return
		dragState.mode = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
	}
	if (dragState.mode === 'horizontal') scheduleDragOffset(getDampedOffset(deltaX))
}
const finishDrag = point => {
	if (isAnimating.value || !dragState.active) return
	const mode = dragState.mode
	dragState.active = false
	dragState.input = ''
	if (mode !== 'horizontal') return
	const position = getPointerPosition(point)
	const deltaX = (position?.x ?? dragState.startX) - dragState.startX
	const elapsed = Math.max(Date.now() - dragState.startTime, 1)
	const velocity = deltaX / elapsed
	const currentOffset = getDampedOffset(deltaX)
	setDragOffsetNow(currentOffset)
	const shouldSwitch = Math.abs(deltaX) >= Math.max(switchDistanceMin, getSlideWidth() * switchDistanceRatio) || Math.abs(velocity) >= switchVelocity
	if (!shouldSwitch) {
		resetDrag(velocity)
		return
	}
	transitionDirection.value = deltaX < 0 ? 1 : -1
	transitionDuration.value = getTransitionDuration(Math.abs(-transitionDirection.value * getSlideWidth() - currentOffset), velocity)
	isAnimating.value = true
	setDragOffsetNow(-transitionDirection.value * getSlideWidth())
}
const cancelDrag = () => {
	if (!dragState.active || isAnimating.value) return
	const shouldReset = dragState.mode === 'horizontal'
	dragState.active = false
	dragState.input = ''
	if (shouldReset) resetDrag()
}
const abortInteraction = () => {
	dragState.active = false
	dragState.input = ''
	transitionDirection.value = 0
	setDragOffsetNow(0)
	if (!isAnimating.value) return
	transitionEnabled.value = false
	nextTick(() => {
		transitionEnabled.value = true
		isAnimating.value = false
	})
}
const onTouchStart = event => startDrag(event.touches?.[0], 'touch')
const onTouchMove = event => updateDrag(event.touches?.[0] || event.changedTouches?.[0])
const onTouchEnd = event => finishDrag(event.changedTouches?.[0])
const onTouchCancel = () => cancelDrag()
const onMouseDown = event => {
	if (event.button !== 0) return
	event.preventDefault?.()
	startDrag(event, 'mouse')
}
const onMouseMove = event => {
	if (dragState.input === 'mouse') updateDrag(event)
}
const onMouseUp = event => {
	if (dragState.input === 'mouse') finishDrag(event)
}
const onMouseLeave = () => {
	if (dragState.input === 'mouse') cancelDrag()
}
const onTransitionEnd = () => {
	if (!isAnimating.value) return
	if (transitionDirection.value) {
		activePageIndex.value += transitionDirection.value
		transitionEnabled.value = false
		stabilizePages()
		prepareNearbyPages()
		currentMonth.value = calendarPages.value[activePageIndex.value]
		setDragOffsetNow(0)
		transitionDirection.value = 0
		nextTick(() => {
			transitionEnabled.value = true
			isAnimating.value = false
			flushHolidayResults()
			loadHolidayYears(calendarPages.value.map(page => page.date))
		})
		return
	}
	isAnimating.value = false
}

onLoad(() => {
	loadConfig()
	init()
	loadHolidayYears(calendarPages.value.map(page => page.date))
})

onReady(() => {
	nextTick(refreshViewportWidth)
})

onHide(() => {
	abortInteraction()
})

onShareAppMessage(() => ({
	title: '私人小日历',
	path: '/pages/index/index?share=true'
}))
</script>

<style lang="scss" scoped>
.snow-calendar { position:relative; min-height:100vh; overflow:hidden; padding:28rpx 24rpx calc(48rpx + env(safe-area-inset-bottom)); background:radial-gradient(circle at 12% 3%,rgba(255,255,255,.96),transparent 25%),radial-gradient(circle at 94% 17%,rgba(243,174,202,.45),transparent 26%),linear-gradient(160deg,#fff8fa 0%,#fbeaf0 48%,#f6dbe6 100%); }
.background-glow { position:absolute; border-radius:50%; filter:blur(6rpx); opacity:.72; }.glow-one { top:260rpx; left:-190rpx; width:360rpx; height:360rpx; background:rgba(255,198,218,.52); }.glow-two { right:-170rpx; bottom:80rpx; width:390rpx; height:390rpx; background:rgba(231,172,211,.36); }
.calendar-toolbar { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; padding:4rpx 12rpx 26rpx; }
.toolbar-copy { display:flex; flex-direction:column; min-width:0; }
.toolbar-title { color:#553440; font-size:42rpx; font-weight:700; letter-spacing:2rpx; }
.toolbar-subtitle { margin-top:8rpx; color:#aa7f8d; font-size:23rpx; }
.today-button { padding:13rpx 24rpx; border:1rpx solid #efc2d1; border-radius:30rpx; color:#c9577d; background:rgba(255,255,255,.78); font-size:25rpx; box-shadow:0 6rpx 18rpx rgba(189, 102, 136, .12); }
.today-button--pressed, .add-config--pressed, .setting-item--pressed { opacity:.72; transform:scale(.98); }
.calendar-viewport { position:relative; z-index:1; height:1000rpx; overflow:hidden; touch-action:pan-y; user-select:none; -webkit-user-select:none; -webkit-user-drag:none; }
.calendar-track { display:flex; backface-visibility:hidden; will-change:transform; }.calendar-track--animating { transition-property:transform; transition-timing-function:cubic-bezier(.22,.61,.36,1); }
.calendar-slide { box-sizing:border-box; flex:0 0 var(--calendar-slide-width); width:var(--calendar-slide-width); padding:8rpx 20rpx 28rpx; }
.calendar-content { display:block; }
.calendar-middle-action { position:absolute; right:40rpx; bottom:-42rpx; z-index:2; }
.calendar-summary { position:relative; z-index:1; margin:0rpx 0 2rpx; padding:24rpx; border:1rpx solid #f6dfe8; border-radius:24rpx; background:linear-gradient(135deg,#fff8fb,#fff); box-shadow:0 10rpx 22rpx rgba(197,110,143,.08); }.summary-heading,.summary-status,.rule-overview { display:flex; align-items:center; justify-content:space-between; }.summary-heading > view { flex:1; min-width:0; }.summary-title,.summary-subtitle { display:block; }.summary-title { color:#643f4c; font-size:28rpx; font-weight:700; }.summary-subtitle { overflow:hidden; margin-top:6rpx; color:#b18b98; font-size:21rpx; text-overflow:ellipsis; white-space:nowrap; }.summary-date { flex:none; margin-left:16rpx; padding:7rpx 13rpx; border-radius:20rpx; color:#c95d83; background:#fff0f5; font-size:22rpx; }.summary-status { margin-top:18rpx; justify-content:flex-start; gap:12rpx; }.summary-lunar { overflow:hidden; max-width:56%; color:#8e6875; font-size:24rpx; text-overflow:ellipsis; white-space:nowrap; }.status-pill { padding:7rpx 14rpx; border-radius:18rpx; font-size:21rpx; }.status-pill.is-duty { color:#c9577d; background:#fff0f4; }.status-pill.is-vacation { color:#318764; background:#eff9f4; }.status-pill.is-workday { color:#61708d; background:#f2f3f8; }.status-pill.is-normal { color:#a97989; background:#faeff3; }.summary-empty { display:flex; align-items:center; gap:12rpx; min-height:58rpx; margin-top:16rpx; color:#aa8792; font-size:22rpx; line-height:1.5; }.rule-overview { gap:18rpx; margin-top:20rpx; padding-top:18rpx; border-top:1rpx dashed #f3dbe4; }.rule-overview view { display:flex; flex:1; flex-direction:column; min-width:0; }.rule-overview text { color:#bd98a4; font-size:20rpx; }.rule-overview .rule-value { overflow:hidden; margin-top:5rpx; color:#80505f; font-size:23rpx; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.add-config { display:flex; align-items:center; justify-content:center; width:82rpx; height:82rpx; border:6rpx solid #fff6f8; border-radius:50%; background:linear-gradient(135deg,#ef8cad,#d95f87); box-shadow:0 12rpx 26rpx rgba(183,71,111,.28); transition:transform .2s,opacity .2s; }
.config-panel { padding:48rpx 32rpx calc(40rpx + env(safe-area-inset-bottom)); background:#fffafb; }
.panel-heading { display:flex; flex-direction:column; padding-right:64rpx; }
.panel-title { color:#51323e; font-size:38rpx; font-weight:700; }
.panel-description { margin-top:14rpx; color:#a6818c; font-size:25rpx; line-height:1.6; }
.setting-list { margin-top:34rpx; overflow:hidden; border:1rpx solid #f4dce4; border-radius:24rpx; background:#fff; }
.setting-item { display:flex; align-items:center; justify-content:space-between; min-height:132rpx; padding:22rpx 24rpx; transition:transform .2s,opacity .2s; }
.setting-item + .setting-item { border-top:1rpx solid #f8e8ed; }
.setting-label, .setting-tip { display:block; }.setting-label { color:#543540; font-size:29rpx; font-weight:600; }.setting-tip { margin-top:7rpx; color:#b69aa4; font-size:22rpx; }
.setting-value { display:flex; align-items:center; gap:8rpx; max-width:48%; color:#c9577d; font-size:27rpx; }.setting-value text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.panel-actions { display:flex; margin-top:34rpx; }
.calendar-animation-signal { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; animation:calendar-track-finish .32s linear; }
@keyframes calendar-track-finish { from { transform:translateX(0); } to { transform:translateX(1px); } }
</style>
