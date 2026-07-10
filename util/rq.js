import { Request } from './http.js'

const HOLIDAY_CACHE_PREFIX = 'calendar-holidays-v1-'
const HOLIDAY_JSON_PATH = '/img/static/calendar/holidays'

const formatDate = date => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const eachDate = (startDate, endDate, callback) => {
	const [year, month, day] = startDate.split('-').map(Number)
	const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
	const current = new Date(year, month - 1, day)
	const end = new Date(endYear, endMonth - 1, endDay)
	while (current <= end) {
		callback(formatDate(current))
		current.setDate(current.getDate() + 1)
	}
}

export const buildHolidayMap = calendar => {
	const holidayMap = {}
	for (const holiday of calendar?.holidays || []) {
		eachDate(holiday.startDate, holiday.endDate, date => {
			holidayMap[date] = {
				date,
				title: holiday.name,
				name: holiday.name,
				type: '休',
				status: 'holiday',
				holidayYear: holiday.year,
				holidayStart: holiday.startDate,
				holidayEnd: holiday.endDate,
				displayText: holiday.displayText
			}
		})
		for (const date of holiday.workdays || []) {
			holidayMap[date] = {
				date,
				title: holiday.name,
				name: holiday.name,
				type: '班',
				status: 'workday',
				holidayYear: holiday.year,
				holidayStart: holiday.startDate,
				holidayEnd: holiday.endDate,
				displayText: `${holiday.name}调休上班`
			}
		}
	}
	return holidayMap
}

const getFallbackCalendar = year => ({ schemaVersion: 1, year, holidays: [] })

export const loadHolidayCalendar = async year => {
	const cacheKey = `${HOLIDAY_CACHE_PREFIX}${year}`
	const cached = uni.getStorageSync(cacheKey)
	if (cached?.schemaVersion === 1 && cached.year === year && Array.isArray(cached.holidays)) {
		return { calendar: cached, source: 'cache' }
	}

	const response = await Request({ url: `${HOLIDAY_JSON_PATH}/${year}.json` })
	if (response?.schemaVersion === 1 && response.year === year && Array.isArray(response.holidays)) {
		uni.setStorageSync(cacheKey, response)
		return { calendar: response, source: 'remote' }
	}

	return { calendar: getFallbackCalendar(year), source: 'fallback' }
}
