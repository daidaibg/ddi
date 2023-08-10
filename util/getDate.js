class getDate {
	constructor(date) {
		if (date) {
			this.initDate = new Date(date)
		} else {
			this.initDate = new Date()
		}
	}

	getFullYear() {
		return this.initDate.getFullYear()
	}

	// 获取当前月
	getMonth() {
		return this.initDate.getMonth() + 1
	}

	// 获取当前日
	getDate() {
		return this.initDate.getDate()
	}

	// 日期格式化
	dateFormat() {
		return `${this.getFullYear()}/${this.getMonth()}/${this.getDate()}`
	}
	
	
	getOffsetMonth(offset) {
		const date = new Date(this.getFullYear(), this.getMonth()-1 + offset, this.getDate());
		// console.log(date,offset);
		return {
			format: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`,
			year:date.getFullYear(),
			month:date.getMonth(),
			day:date.getDate()
		};
	}
	// 获取当前月多少天
	static getDays({
		year,
		month
	}) {
		return new Date(year, month, 0).getDate()
	}

	// 获取当前月从星期几开始 0--代表周日 这里返回了7 
	static getMonthWeekBegin({
		year,
		month
	}) {
		return new Date(`${year}/${month}/01`).getDay() || 7
	}
	

	// 获取当前日期星期几
	static getWeekDay({
		year,
		month,
		day
	}) {
		return new Date(`${year}/${month}/${day}`).getDay() || 7
	}

	// 获取上个月天数 year--当前年  month--当前月
	static getUpDays({
		year,
		month
	}) {
		[year, month] = month === 1 ? [year - 1, 12] : [year, month - 1]
		return new Date(year, month, 0).getDate()
	}

	// 获取下个月天数 year--当前年  month--当前月
	static getDownDays({
		year,
		month
	}) {
		[year, month] = month === 12 ? [year + 1, 1] : [year, month + 1]
		return new Date(year, month, 0).getDate()
	}



}

export default getDate;