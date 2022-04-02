<template>
	<view class="login">
		<view class="" v-if="!userPhone">
			<view class="u-border-bottom">
				<u-input v-model="phone" :disabled="disabled" type="number" :border="false" :height="100" focus
					placeholder="请输入手机号" style="flex:1" />
			</view>
			<view class="u-border-bottom">
				<u-input v-model="code" type="number" :border="false" :height="100" placeholder="请输入验证码" style="flex:1"
					:maxlength="4" />
				<view class="dd-text">
					<text v-if="timestamp==0" @click="gecode"> 获取验证码</text>
					<u-count-down v-else :timestamp="timestamp" color="#989898" :show-days="false" :show-hours="false"
						:show-minutes="false" @end="timestamp=0">
					</u-count-down>
				</view>
			</view>
			<u-button type="primary" :loading="loading" @click="bindphone">绑定</u-button>
		</view>
		<view class="alreadybind" v-else>
			<h2>{{userPhone}}</h2>
			<h4>已经绑定手机号</h4>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code: '',
				phone: "",
				timestamp: 0,
				loading: false,
				disabled: false,
				userPhone: null
			}
		},
		created() {
			let userPhone = wx.getStorageSync('userPhone')
			if (userPhone) {
				this.userPhone = userPhone
			} else {
				this.userPhone = null
			}
		},
		methods: {
			bindphone() {
				console.log(this.$u.test.code(this.code, 4))
				if (this.phone == "" || this.code == '') {
					wx.showToast({
						title: "请输入手机号或验证码",
						icon: 'none'
					})
					return
				}
				if (!this.$u.test.mobile(this.phone)) {
					wx.showToast({
						title: "手机号格式错误",
						icon: 'none'
					})
					return
				}
				if (!this.$u.test.code(this.code, 4)) {
					wx.showToast({
						title: "验证码格式错误",
						icon: 'none'
					})
					return
				}

				this.$http({
					url: '/login',
					method: 'post',
					data: {
						phone: this.phone,
						code: this.code,
					}
				}).then(res => {
					if (res.success) {
						this.timestamp = 3
						wx.showToast({
							title: "绑定成功",
							icon: 'none'
						})
						wx.setStorageSync('userPhone', this.phone)
						uni.navigateBack({
							delta: 1
						})
					} else {
						wx.showToast({
							title: res.msg,
							icon: "error"
						})
					}
				})
			},
			gecode() {
				if (this.timestamp !== 0) {
					return
				}
				if (!this.$u.test.mobile(this.phone)) {
					wx.showToast({
						title: "手机号格式错误",
						icon: 'none'
					})
					return
				}
				this.$http({
					url: '/login/sendCode',
					method: 'post',
					data: {
						phone: this.phone,
						openId: this.$currency.getOpenid()
					}
				}).then(res => {
					if (res.success) {
						this.timestamp = 30
						wx.showToast({
							title: "发送成功",
						})
					} else {
						wx.showToast({
							title: res.msg,
							icon: "none"
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.login {
		width: 100%;
		min-height: 100vh;
		box-sizing: border-box;
		padding: 26rpx 82rpx;

		.u-border-bottom {
			display: flex;
			align-items: center;

			.dd-text {
				color: #686868;
				width: 150rpx;
				text-align: center;
			}
		}
		.alreadybind{
			text-align: center;
			h2{
				font-size: 40rpx;
				
			}
			h4{
				
			}
		}

	}
</style>
