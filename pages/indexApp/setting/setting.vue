<template>
	<view class="sq">
		<view v-if="!wxUserInfo">
			<view class="imageWrap">
				<image src="http://www.daidaibg.com/statics/images/xcx.jpg" mode="" class="imagesss"></image>
			</view>
			<view class="title">
				小程序需要获得您以下权限
			</view>
			<view class="content">
				· 获得您的公开信息
			</view>
			<view class="buttom_Wrap">
				<button @click="getUserProfile" type="primary" open-type="getUserProfile"> 登录 </button>
			</view>
		</view>
		<view class="" v-else>
			<view class="userdata">
				<image :src="wxUserInfo.avatarUrl" mode="" class="imagesss"></image>
				<view class="userInfo">
					<view class="name">
						<text class="texts">{{wxUserInfo.nickName}}</text><text>（已授权）</text>
					</view>
					<view class="address">
						<text>地址：</text>
						<text>{{wxUserInfo.country}}-{{wxUserInfo.province}}-{{wxUserInfo.city}}</text>
					</view>
				</view>
			</view>
			<u-cell-group>
				<u-cell-item icon="phone-fill" :title="userPhone" :icon-style="{color:'#2789FF'}" border-top
					@click="cellclick('login')"></u-cell-item>
			</u-cell-group>
			<view class="signout u-border-bottom u-border-top" @click="signout">
				退出
			</view>
		</view>

		<u-action-sheet :list="list" v-model="show" cancel-btn @click="clicksignout"></u-action-sheet>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				wxUserInfo: null,
				list: [{
					text: '确定',
					color: 'red',
					fontSize: 28,
					subText: '将退出您的账号'
				}],
				show: false,
				userPhone:'',
			}
		},
		onLoad() {
			this.userdata()
		},
		onShow() {
			this.getUserData()
		},
		methods: {
			getUserData() {
				let userPhone = wx.getStorageSync('userPhone')
				if (userPhone) {
					var tell = /(\d{3})\d*(\d{4})/;
					this.userPhone = userPhone.replace(tell, '$1****$2')
				}else{
					this.userPhone = "绑定手机"
					this.$http({
						url: '/wx/userData/'+this.$currency.getOpenid(),
						method: 'get',
					}).then(res => {
						console.log("userData:", res)
						if (res.success) {
							wx.setStorageSync('userPhone', res.data.phone)
							this.getUserData()
						} else {
							wx.showToast({
								title: "未知异常获取用户失败",
								icon: "error"
							})
						}
					})
				}
			},
			cellclick(index) {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},

			signout() {
				this.show = true
			},
			clicksignout(index) {
				console.log(index)
				uni.clearStorageSync();
				this.wxUserInfo = null
			},
			userdata() {
				let wxUserInfo = wx.getStorageSync('wxUserInfo')
				let wxloginsession = uni.getStorageSync('wxloginsession');
				if (wxUserInfo && wxloginsession) {
					// console.log(wxUserInfo);
					this.wxUserInfo = wxUserInfo
				}
			},
			getUserProfile() {
				wx.showLoading({
					title: "登录中...",
					mask: true
				});
				wx.getUserProfile({
					desc: "获取您的名称",
					success: (res) => {
						console.log(res)
						wx.setStorageSync('wxUserInfo', res.userInfo)

						// wx.showToast({
						// 	title: "授权成功！"
						// })
						this.login()
					},
					fail: (err) => {
						console.log(err)
						wx.showToast({
							title: "授权失败！",
							icon: "error"
						})
					}
				})
			},
			login() {
				wx.login({
					success: (res) => {
						console.log(res.code)
						this.$http({
							url: '/wx/login',
							method: 'post',
							data: {
								code: res.code
							}
						}).then(res => {
							console.log("settinglogin:", res)
							if (res.success) {
								wx.setStorageSync('wxloginsession', res.data)
								this.userdata()
								this.getUserData()
								wx.showToast({
									title: "授权成功",
								})
							} else {
								wx.showToast({
									title: res.msg,
									icon: "error"
								})
							}
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.sq {
		width: 100%;
		min-height: 100vh;
		background: #f7f7f7;

		.imageWrap {
			width: 100%;
			display: flex;
			justify-content: center;
			padding: 60rpx;
			box-sizing: border-box;
			border-bottom: 2rpx #e2e2e2 solid;

			.imagesss {
				width: 360rpx;
				height: 360rpx;
			}

		}

		.title {
			font-size: 28rpx;
			font-weight: 900;
			padding: 30rpx 0 18rpx 30rpx;
		}

		.content {
			padding: 0 60rpx;
			color: #878787;
			font-size: 24rpx;
			margin-bottom: 30rpx;
		}

		.buttom_Wrap {
			width: 100%;
			padding: 0 60rpx;
			box-sizing: border-box;
			justify-content: center;
		}

		.userdata {
			width: 100%;
			display: flex;
			padding: 30rpx 40rpx;
			background: #FFF;
			margin-bottom: 10px;

			.imagesss {
				width: 100rpx;
				height: 100rpx;
			}

			.userInfo {
				margin-left: 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.texts {
					color: #737373;
				}

				.name {
					margin-bottom: 10rpx;

					text:first-child {
						color: #000;
						font-size: 30rpx;
						font-weight: 900;
					}
				}
			}
		}

		.signout {
			margin-top: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 100%;
			padding: 26rpx 32rpx;
			font-size: 28rpx;
			line-height: 30rpx;
			color: #606266;
			background-color: #fff;

		}
	}
</style>
