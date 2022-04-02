<template>
	<view class="loading_wrap">
		<scroll-view class='goods_list' :scroll-y="true" :scroll-with-animation="true" @refresherrefresh="onRefresh"
			:lower-threshold="60" :refresher-enabled='true' :refresher-triggered="triggered"
			refresher-default-style="none" :refresher-threshold="60" refresher-background="#2789FF"
			style="height: 100vh;" @scrolltolower="loadMore">
			<view slot="refresher" class="refresh-container"
				style="width: 100%; height: 60px;  display: flex; align-items: center;justify-content: center;color:#FFF">
				<view class="loading_content" >
					<image src="/static/img/bb.png" mode="" style="width: 40rpx;height: 40rpx;" class="loading_img"></image>
					<text style="color: #F3F4F6;
				font-size: 26rpx;">{{loadingText}}</text>
				</view>
			</view>
			<slot></slot>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadingText: "下拉刷新!",
				triggered: false, //设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
			}
		},
		props: {
			loadingTextS: {
				type: String,
				default: () => {
					return "下拉刷新！"
				}
			}
		},
		methods: {
			onRefresh() {
				if (!this.triggered) {
					this.triggered = true;
					this.loadingText = "努力加载中..."
					// vibrateLong
					wx.vibrateShort({
						type: "heavy",
					})
					this.$emit("onRefresh")
					let timer = setTimeout(() => {
						this.triggered = false
						this.loadingText = "下拉刷新！"
						clearTimeout(timer)
					}, 2500)
				}
			},
			loadMore() {
				console.log("loadMore")
			}
		}
	}
</script>

<style lang="scss">
	@keyframes firstdiv{
	   0%{
	      transform: scale(1.2);
	   }
	   25%{
	      transform: scale(1);
	   }
	   50%{
	      transform: scale(0.8);
	   }
	   75%{
	      transform: scale(1);
	   }
	   100%{
	      transform: scale(1.2);
	   }
	}
	.loading_wrap {
		::-webkit-scrollbar {
			display: none;
			width: 0;
			height: 0;
			color: transparent;
		}
		
		.loading_content {
			position: absolute;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			flex-direction: column;
			.loading_img{
				 animation: firstdiv 1s linear 2s infinite alternate;
			}
			
		}
	}
</style>
