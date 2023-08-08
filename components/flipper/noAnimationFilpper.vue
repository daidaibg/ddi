<template>
	<div class="time_wrap_list" :style="wrapStyle">
		<div class="noAnimationFilpper" v-for="i in frontText.length" :key="i">
			<div class="noAnimationFilpperitem">{{ frontText[i] }}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'noAnimationFilpper',
	data() {
		return {};
	},
	props: {
		// front paper text
		// 前牌文字
		frontText: {
			type: [ String],
			default: "00"
		}
	},
	computed:{
		wrapStyle(){
			return `grid-template-columns:repeat(${this.frontText.length}, 1fr);`
		}
	},
	methods: {
		_textClass(number) {
			return 'number' + number;
		},
		_flip(type, front, back) {
			// 如果处于翻转中，则不执行
			if (this.isFlipping) {
				return false;
			}
			this.frontTextFromData = front;
			this.backTextFromData = back;
			// 根据传递过来的type设置翻转方向
			this.flipType = type;
			// 设置翻转状态为true
			this.isFlipping = true;
			setTimeout(() => {
				// 设置翻转状态为false
				this.isFlipping = false;
				this.frontTextFromData = back;
			}, this.duration);
		},
		// 下翻牌
		flipDown(front, back) {
			this._flip('down', front, back);
		},
		// 上翻牌
		flipUp(front, back) {
			this._flip('up', front, back);
		},
		// 设置前牌文字
		setFront(text) {
			this.frontTextFromData = text;
		},
		// 设置后牌文字
		setBack(text) {
			this.backTextFromData = text;
		}
	},
	created() {
		this.frontTextFromData = this.frontText;
		this.backTextFromData = this.backText;
	}
};
</script>

<style scoped lang="scss">
.time_wrap_list {
	display: grid;
	column-gap: 6rpx;
}
.noAnimationFilpper {
	display: inline-block;
	position: relative;
	width: 58rpx;
	height: 100rpx;
	line-height: 100rpx;
	border: solid 1rpx #000;
	border-radius: 12rpx;
	font-size: 80rpx;
	color: #fff;
	box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.5);
	text-align: center;
	font-family: 'Helvetica Neue';
	font-family: 'DS-DIGI';
	overflow: hidden;
	background: #000;
}
.noAnimationFilpperitem {
}
</style>
