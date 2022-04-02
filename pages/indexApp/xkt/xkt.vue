<template>
	<view class="xkt">
		<view class="tip">
			<image src="../../../static/img/xkt/dp.png" mode="" style="width: 28rpx;height: 28rpx;"></image>
			<text>
				Tip: 为你的夏日带去清凉！
			</text>
		</view>
		<view class="xktContent">
			<view class="xkt_wk">
				<view class="wdWrap">
					<image src="../../../static/img/xkt/logo.png" mode=""></image>
					<view class="xkt-wd" v-if="type!=='guan'">
						<view class="wdicon leng" v-if="wdType=='leng'">❄️</view>
						<view class="wdicon re"  v-if="wdType=='re'">☀️</view>
						<view class="wd">
							<text style="font-size: 46rpx;"> {{wd}}</text>
							<text style="font-size: 36rpx;">℃</text>
						</view>
					</view>
				</view>
				<view class="logo2">
					<image src="../../../static/img/xkt/logo2.png" mode=""></image>
				</view>
				<view class="xian">
					<view class="dian" :style="type=='guan'?'background: rgb(166, 166, 166)': 'background: rgb(56, 247, 9)'">
						
					</view>
				</view>
			</view>
			
		</view>
		<view class="xktfeng" :style="type=='guan'?'opacity: 0;transition: opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;':'opacity: 1;transition: opacity 2500ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;'">
			<view style="transform: rotate(10deg);">
				
			</view>
			<view style="margin: 0 100rpx;">
				
			</view>
			<view style="transform: rotate(-10deg);">
				
			</view>
		</view>
		<!-- 按钮 -->
		<view class="caozuo">
			<view type="default" @click="switchMode('leng')" style="background: rgb(63, 81, 181);">
				<image src="../../../static/img/xkt/xh.png" mode=""></image>
			</view>
			<view type="default" @click="switchMode(type!== 'guan'?'guan':'kai')" 
			:style="type!== 'guan'?'margin: 0 60rpx;background-color: rgb(245, 0, 87)':'margin: 0 60rpx;background-color: rgb(76, 175, 80)'">
				<image src="../../../static/img/xkt/gb.png" mode="" style="margin: 4rpx 0 0 4rpx;"></image>
			</view>
			<view type="default" @click="switchMode('re')" style="background: orange;">
				<image src="../../../static/img/xkt/ty.png" mode=""></image>
			</view>
		</view>
		<view class="sx caozuo">
			<view type="default" @click="wdJJ(true)" >
				<image src="../../../static/img/xkt/s.png" mode=""></image>
			</view>
			<view type="default" @click="wdJJ(false)" >
				<image src="../../../static/img/xkt/s.png" mode="" style="transform: rotate(180deg);margin-top: 6rpx;"></image>
			</view>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				wd: 18,
				wdType:"leng",
				type:"guan",
				xktfengStyle:"",
				audioCtx:null,
				audioBackground:null,
				audioOpen:null,
			}
		},
		onShareAppMessage: function(res) {
			return {
				title: '便携小空调',
				path: '/pages/indexApp/xkt/xkt', // 显示的页面
				// imageUrl: "/static/img/index/kt.png",
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			}
			// }
		},
		onLoad() {
			wx.setNavigationBarTitle({
				title: "便携小空调"
			})
			wx.setInnerAudioOption({
				obeyMuteSwitch:false
			})
			this.audioCtx =wx.createInnerAudioContext()
			this.audioCtx.src = 'http://www.daidaibg.com/statics/audio/di.mp3';
			this.audioBackground =wx.createInnerAudioContext()
			this.audioBackground.src = 'http://www.daidaibg.com/statics/audio/air-extractor-fan.mp3';
			this.audioBackground.loop =true;
			this.audioOpen =wx.createInnerAudioContext()
			this.audioOpen.src = 'http://www.daidaibg.com/statics/audio/ac-work.mp3';
			
		},
		onUnload(){
			this.audioCtx.destroy()
			this.audioBackground.destroy()
			this.audioOpen.destroy()
		},
		methods: {
			switchMode(type) {
				console.log(type)
				if(type=="re" || type=='leng'){
					if(this.type=='guan'){
						return
					}
				}
				this.type = type;
				this.audioCtx.stop()
				this.audioCtx.play()
				if(type=="kai"){
					this.audioBackground.play()
					this.audioOpen.play()
				}else if(type=="guan"){
					this.audioBackground.stop()
					this.audioOpen.stop()
				}else if(type=="leng"){
					this.wdType =type
				}else if(type=="re"){
					this.wdType =type
				}
				

			},
			//温度加减
			wdJJ(flag){
				if(this.type=='guan'){
					return
				}
				this.audioCtx.stop()
				this.audioCtx.play()
				if(this.type == "guan"){
					return;
				}
				if(this.wd>=30&&flag){
					this.$refs.uToast.show({
						title: '你想把老子热化！',
						type: 'warning',
					})
					return
				}else if(this.wd<=16&&!flag){
					this.$refs.uToast.show({
						title: '你想冻死老子吧！',
						type: 'warning',
					})
					return
				}
				if(flag){
					this.wd++
				}else{
					this.wd--
				}
				
			}
		}
	}
</script>

<style lang="scss">
	@import  "../../../static/css/stylesheet.css";
	.xkt {
		width: 100%;
		height: 100%;


		.tip {
			text-align: center;
			padding-top: 14rpx;

			text {
				color: rgba(0, 0, 0, 0.6)
			}
		}

		.xktContent {
			padding: 16rpx;

			.xkt_wk {
				border-radius: 10rpx;
				border-bottom-left-radius: 20rpx;
				border-bottom-right-radius: 20rpx;
				background-color: rgb(255, 255, 255);
				height: 240rpx;
				border: 2rpx solid rgb(224, 224, 224);
				box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.3), 0 0 6rpx rgba(0, 0, 0, .04);
				position: relative;

				.wdWrap {
					margin-top: 10rpx;
					display: flex;
					justify-content: space-between;
					height: 104rpx;
					image {
						width: 89rpx;
						height: 89rpx;
					}

					.xkt-wd {
						margin-right: 36rpx;
						.wdicon {
							font-size: 24rpx;
							margin-top: 16rpx;
						}
						.wd{
							margin-left: 22rpx;
							margin-top: 8rpx;
							width: 60rpx;
							font-family: "Digital-7"; //'Digital-7 Mono
							color: rgb(204, 204, 204);
						}

					}
				}
				.logo2{
					display: flex;
					align-items: center;
					justify-content: center;
					margin-top: 30rpx;
					image{
						width: 24rpx;
						height: 16rpx;
					}
				}
				.xian{
					margin-top: 20rpx;
					height: 2rpx;
					background: rgb(224, 224, 224);
					position: relative;
					.dian{
						width: 8rpx;
						height: 8rpx;
						position: absolute;
						right: 28rpx;
						top: 4rpx;
						;
						border-radius: 50%;
					}
				}
			}
			
		}
		//风
		.xktfeng{
			width: 100%;
			display: flex;
			justify-content: center;
			margin: 16rpx 0;
			view{
				background-color: rgb(187, 187, 187);
				width: 5px;
				height: 90rpx;
			}
		}
		.caozuo{
			display: flex;
			justify-content: center;
			margin-top: 80rpx;
			view{
				width: 90rpx;
				height: 90rpx;
				border-radius:50%;
				overflow: hidden;
				box-shadow: 0 8rpx 8rpx rgba(0, 0, 0, 0.3), 0 0 6rpx rgba(0, 0, 0, .04);
				margin: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0;
				image{
					width: 54rpx;
					height: 54rpx;
				}
			}
		}
		.sx{
			margin-top: 0rpx;
			flex-direction: column;
			align-items: center;
			view{
				background-color: rgb(224, 224, 224);
				margin-top: 60rpx;
				image{
						width: 30rpx;
						height: 30rpx;
				}
				
			}
		}
	}
</style>
