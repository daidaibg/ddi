import { Request } from './http.js'
import holiday2026 from '@/static/calendar/holidays/2026.json'

const HOLIDAY_JSON_PATH = '/img/static/calendar/holidays'
const holidayCalendarCache = new Map()

const normalizeHolidayCalendar = response => response?.data?.data || response?.data || response
const isHolidayCalendar = (calendar, year) => calendar?.schemaVersion === 2 && calendar.year === year && Array.isArray(calendar.dates)

export const buildHolidayMap = calendar => {
	const holidayMap = {}
	for (const item of calendar?.dates || []) {
		holidayMap[item.date] = {
			...item,
			title: item.holidayName || '',
			name: item.holidayName || '',
			type: item.marker || '',
			displayText: item.displayText || ''
		}
	}
	return holidayMap
}

const getFallbackCalendar = year => year === 2026 ? holiday2026 : { schemaVersion: 2, year, dates: [] }

export const loadHolidayCalendar = year => {
	if (holidayCalendarCache.has(year)) return holidayCalendarCache.get(year)
	const request = (async () => {
		try {
			const calendar = normalizeHolidayCalendar(await Request({ url: `${HOLIDAY_JSON_PATH}/${year}.json` }))
			if (isHolidayCalendar(calendar, year)) return { calendar, source: 'remote' }
		} catch {}
		return { calendar: getFallbackCalendar(year), source: year === 2026 ? 'local' : 'fallback' }
	})()
	holidayCalendarCache.set(year, request)
	return request
}
