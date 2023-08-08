// 获取日期的各种方法
class getDateFun {
	// 获取当前年
	getFullYear(date = new Date()) {
		return date.getFullYear()
	}
	
	// 获取当前月
	getMonth(date = new Date()) {
		return date.getMonth() + 1
	}
	
	// 获取当前日
	getDate(date = new Date()) {
		return date.getDate()
	}
	
	// 获取当前月多少天
	getDays({year, month}) {
		return new Date(year, month, 0).getDate()
	}
	
	// 获取当前月从星期几开始 0--代表周日 这里返回了7 
	getMonthWeekBegin({year, month}) {
		return new Date(`${year}/${month}/01`).getDay() || 7
	}
	
	// 获取当前日期星期几
	getWeekDay({year, month, day}){
		return new Date(`${year}/${month}/${day}`).getDay() || 7
	}
	
	// 获取上个月天数 year--当前年  month--当前月
	getUpDays({year, month}) {
		[year, month] = month ===1 ? [year - 1, 12] : [year, month - 1]
		return new Date(year, month, 0).getDate()
	}
	
	// 获取下个月天数 year--当前年  month--当前月
	getDownDays({year, month}) {
		[year, month] = month === 12 ? [year + 1, 1] : [year, month + 1]
		return new Date(year, month, 0).getDate()
	}
	
	// 日期格式化
	dateFormat() {

	}
}

export default new getDateFun()