<template>

	<!-- 2789FF -->
	<view class="">

		<template v-if="pagetype=='list'">
			<u-navbar title="列表" :background=" { background: '#2789FF' }" title-color="#FFF" back-icon-color="#FFF"
				:custom-back="listBack">
			</u-navbar>
			<ul class="roomlist">
				<li v-for="(item,i) in roomList" :key="item.roomNum" :style="{background:item.color}"
					@click="intoRoom(item)">
					<view class="usernum">
						<u-icon name="account-fill" color="#fff" size="20"></u-icon>：{{item.userNum}}
					</view>
					<view class="roomList-status flex" :class="{'roomList-status-ingame':item.roomStatus=='inGame'}">
						{{roomStatusData[item.roomStatus]}}
					</view>
					<p>{{item.roomNum}}</p>
				</li>
			</ul>
			<u-button type="primary" @click="chuangjian">创建</u-button>
		</template>
		<template v-else-if="pagetype=='room'">
			<u-navbar :background=" { background: '#2789FF' }" back-icon-color="#FFF" :custom-back="roomBack">
				<view class="title_inner" style="color:#FFF;text-align: center;flex: 1;font-size: 16px;">
					房间:{{roomInfo.roomNum}}&nbsp;<span
						:style="{color:roomStatusDataCorlor[roomInfo.roomStatus],fontSize: '14px',marginLeft: '4px'}">({{roomStatusData[roomInfo.roomStatus]}})</span>
				</view>
			</u-navbar>
			<view class="" v-if="roomInfo.Homeowner.id==openid ">
				<u-button type="primary" @click="startGame" size="mini" v-if=" ['gameOver','await'].includes(roomInfo.roomStatus)"
					style="margin: 0 10px;">开始
				</u-button>
				<u-button type="primary" @click="GameEnd" size="mini" v-if="roomInfo.roomStatus=='inGame'"
				
					style="margin: 0 10px;">结束
				</u-button>
			</view>

			<ul class="roomsinner">
				<li v-for="(item,i) in roomUsers" :key="item.id" @longpress="actionUser(item)">
					<view class="numindex">
						{{i+1}}
					</view>
					<view class="outKill flex flex-direction"
						v-if="item.userStatus ||item.isOut ||item.id==openid &&item.shenfen&& roomInfo.roomStatus=='inGame' ">
						<!-- <view class="" v-if="item.is=='kill'" style="color: red;">KILL</view> -->
						<view class="" v-if="item.userStatus=='offLine'" style="color: rgb(223, 223, 223)">离线</view>
						<view class="" v-else-if="item.userStatus=='out'" style="color:rgb(223, 223, 223)">退出房间</view>
						<view class="" v-if="item.isOut" style="color:#F56C6C;font-weight: 900;font-size: 16px;">kILL
						</view>
						<view class="" style="font-size: 16px;color: #67C23A;font-weight: 900;"
							v-if="item.id==openid &&item.shenfen">
							{{item.shenfen}}
						</view>
					</view>
					<view class="outKill flex flex-direction" v-if="roomInfo.roomStatus=='gameOver'&& item.shenfen">
						<view class="" :style="{color:item.isUndercover?'#F56C6C':'#FFF'}">
							{{item.shenfen}}
						</view>
					</view>
					<image :src="item.avatarUrl"></image>
					<p>{{item.nickName}}</p>
				</li>
			</ul>
			<view class="gameends">
				<view class="" v-if="roomInfo.msg" style="font-size: 22px;text-align: center;color: #67C23A;">
						{{roomInfo.msg}}
				</view>
				
			</view>
			<view class="gamerules">
				<p>房主长按操作其他人员(第一位为房主)；</p>
				<h5>游戏准备：</h5>
				<p>4人游戏：3平民，1卧底；</p>
				<p>5人游戏：3平民，1卧底，1白板；</p>
				<p>6人游戏：4平民，1卧底，1白板；</p>
				<p>7人游戏：5平民，1卧底，1白板；</p>
				<p>8人游戏：6平民，1卧底，1白板；</p>
				<p>9人游戏：6平民，2卧底，1白板；</p>
				<p></p>
				<h5>游戏规则，具体如下：</h5>
				<p>1、在场所有人中只有1人拿到与其它人手中的词语不同的词语，{有可能一人拿到白板}除此人以外，其他人则持有相同词语。</p>
				<p>2、每人每轮用一句话描述自己拿到的词语，词语禁止重复，话中不能出现所持词语，不能让卧底察觉，也要给同伴以暗示。</p>
				<p>3、每轮描述完毕，所有在场的'人投票选出怀疑谁是卧底，得票最多的人出局。若没有人的得票超过半数（50%），则没有人出局。若卧底出局，则游戏结束。若卧底未出局，游戏继续。</p>
				<p>4、反复2—3流程。、胜利条件：如所有卧底及白板出局，则平民获胜；当＜7人游戏时，如卧底在还剩2人时存活即获胜，当≥7人游戏时，如卧底在还剩3人时存活即获胜；如所有卧底出局且白板存活，则白板获胜。
				</p>
				<p>5、拿到词语后不能说出来。</p>
				<h5>场内及场外纪律：</h5>
				<p>1、游戏过程中，场内人员禁止与场外人员交流，场内人员交流时禁止询问他人持有词语。</p>
				<p>2、游戏过程中，场外人员禁止大喊大叫，可以笑。</p>
				<h5>拿到白板后：</h5>
				<p>1、只能通过前边人的话语大概猜出词语，继续模仿别人的词语来说。</p>
			</view>

		</template>
	</view>
</template>

<script>
	// 消息类
	class MsgContent {
		constructor(param = {}, action = 'heartbeat', controller = 'Index') {
			this.param = param;
			this.action = action;
			this.controller = controller;
		}
	}
	export default {
		data() {
			return {
				isSocketClose: false, // 是否关闭socket
				reconnectCount: 5, // 重连次数
				heartbeatInterval: "", // 心跳定时器
				isStart: false,
				openid: '',
				pagetype: 'list',
				roomUsers: [], //房间内用户列表
				roomInfo: {}, //房间信息
				wxUserInfo: {},
				roomList: [], //房间列表
				roomStatusData: {
					"inGame": "游戏中",
					"await": "等待中",
					"gameOver": '结束'
				},
				roomStatusDataCorlor: {
					"inGame": "#F56C6C",
					"await": "#67C23A",
					"gameOver":'#909399'
				},
				IdentityEmun: {
					PM: "平民",
					WD: "卧底",
					BB: "白板"
				}
			}
		},
		onShareAppMessage: function(res) {
			return {
				title: '谁是卧底',
				path: '/pages/indexApp/sswd/sswd', // 显示的页面
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
		onShow() {
			this.isSocketClose = false
			this.getRoomList()
		},
		// uni.closeSocket();
		mounted() {
			let openid = this.$currency.getOpenid()

			if (openid) {
				this.openid = openid
				this.pagetype = 'list'
				this.init()

			} else {
				wx.showToast({
					title: "请先登录",
					icon: "none"
				})
				uni.navigateTo({
					url: '/pages/indexApp/setting/setting'
				})
			}

		},
		onUnload() {
			this.isSocketClose = true
			this.tuichu()
		},

		methods: {
			//操作用户
			actionUser(item) {
				let itemList = ['投票出局']
				uni.showActionSheet({
					itemList: itemList,
					success: (res) => {
						// console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
						if (res.tapIndex == 0) { //投票出局
							this.$http({
								url: '/Throw/out',
								method: 'post',
								data: {
									roomNum: this.roomInfo.roomNum,
									userId: item.id
								}
							}).then(res => {
								if (res.success) {
									
								} else {
									wx.showToast({
										title: "投票出局失败!",
										icon: "error"
									})
								}
							})
						}


					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			startGame() {

				if (this.roomUsers.length < 4 || this.roomUsers.length > 9) {
					uni.showModal({
						title: '提示',
						content: '房间人数太多或房间人数太少',
						showCancel: false,
						success: function(res) {
							if (res.confirm) {}
						}
					});
					return
				}
				this.$http({
					url: '/room/start/' + this.roomInfo.roomNum,
					method: 'get',
				}).then(res => {

					if (res.success) {

					} else {
						wx.showToast({
							title: "开始失败!",
							icon: "error"
						})
					}
				})
			},
			//  获取房间列表  /room/list
			getRoomList() {
				this.$http({
					url: '/room/list',
					method: 'get',

				}).then(res => {
					console.log("房间列表:", res)
					if (res.success) {
						this.roomList = res.data
					} else {
						wx.showToast({
							title: "房间列表获取失败!",
							icon: "none"
						})
					}
				})

			},
			// 进入房间
			intoRoom(item) {
				uni.showLoading({
					title: '进入房间中...',
				})
				let wxUserInfo = wx.getStorageSync('wxUserInfo')
				this.$http({
					url: '/into/room',
					method: 'post',
					data: {
						...wxUserInfo,
						id: this.openid,
						roomNum: item.roomNum
					},
				}).then(res => {
					uni.hideLoading()
					console.log("进入房间:", res)
					if (res.success) {
						this.pagetype = 'room'
						this.roomInfo = res.data.roomInfo;
						this.roomInfo.roomNum = res.data.roomNum
						this.roomUsers = res.data.roomInfo.users
					} else {
						wx.showToast({
							title: "进入房间失败!",
							icon: "error"
						})
					}
				})
			},
			//  获取房间信息  
			getRoomInfo(roomNum) {
				this.$http({
					url: '/room/info/' + roomNum,
					method: 'get',
				}).then(res => {
					console.log("房间信息:", res)
					if (res.success) {
						this.pagetype = 'room'
						this.roomInfo = res.data.roomInfo;
						this.roomInfo.roomNum = res.data.roomNum
						this.roomUsers = res.data.roomInfo.users
					} else {
						wx.showToast({
							title: "房间列表获取失败!",
							icon: "none"
						})
					}
				})
			},
			// 创建
			chuangjian() {
				uni.showLoading({
					title: '创建房间中...',
				})
				let wxUserInfo = wx.getStorageSync('wxUserInfo')
				this.wxUserInfo = wxUserInfo
				this.$http({
					url: '/found/home',
					method: 'post',
					data: {
						...wxUserInfo,
						id: this.openid
					}
				}).then(res => {
					uni.hideLoading()
					console.log("/found/home:", res)
					if (res.success) {
						this.pagetype = 'room'
						this.roomInfo = res.data.roomInfo;
						this.roomInfo.roomNum = res.data.roomNum
						this.roomUsers = res.data.roomInfo.users
					} else {
						wx.showToast({
							title: "创建房间失败!",
							icon: "error"
						})
					}
				})
			},
			//退出 房间
			tuichu() {
				uni.showLoading({
					title: '退出房间中...',
				})
				this.pagetype = 'list'
				this.$http({
					url: '/out/room',
					method: 'post',
					data: {
						id: this.openid,
						roomNum: this.roomInfo.roomNum
					}
				}).then(res => {
					uni.hideLoading()
					// console.log("退出:", res)
					if (res.success) {
						this.roomList = res.data;
						this.outRoomClearnData()
					} else {
						wx.showToast({
							title: "房间列表获取失败!",
							icon: "none"
						})
					}
				})
			},
			
			// 结束游戏
			GameEnd(){
				this.$http({
					url: '/room/end/'+this.roomInfo.roomNum,
					method: 'get',
					data: {
						id: this.openid,
						roomNum: this.roomInfo.roomNum
					}
				}).then(res => {
					uni.hideLoading()
					console.log("结束游戏:", res)
					if (res.success) {
						
					} else {
						wx.showToast({
							title: "结束游戏失败!",
							icon: "none"
						})
					}
				})
			},
			//初始化websock
			init() {
				let _this = this
				var url = this.$url.socketUrl
				uni.connectSocket({
					url: url + '/' + this.openid,
					fail: (err) => {
						uni.showToast(JSON.stringify(err))
					}
				});
				uni.onSocketOpen(function(res) {
					console.log('WebSocket打开');
					_this.reconnectCount = 5
					// 5秒发送一次心跳
					clearInterval(_this.heartbeatInterval)
					_this.heartbeatInterval = null
					_this.heartbeatInterval = setInterval(() => {
						_this.sendMsg(new MsgContent({
							name: 'PING',
							id: _this.openid
						}))
					}, 5000)
				});
				uni.onSocketError(function(res) {
					console.log('WebSocket连接打开失败，请检查！');
					//如果不是人为关闭的话，进行重连
					if (!_this.isSocketClose) {
						reconnect(url)
					}
				});
				uni.onSocketMessage(function(res) {

					let serverData = JSON.parse(res.data)
					console.log("Message:", serverData)
					if (serverData.type == 'RefreshRoomInfo') { //在房间内 情况下刷新房间信息
						_this.handleRoomData(serverData)
					} else if (serverData.type == 'RefreshList') { //刷新房间列表
						_this.roomList = serverData.data
					} else if (serverData.type == 'userBeOut') { //刷房间内有人被投出局
							wx.showToast({
								title:  serverData.data.userData.nickName+ "被投票出局!",
								icon: "none"
							})
						_this.handleRoomData(serverData)
					} else if (serverData.type == 'goInGame') { //重连在游戏中  userBeOut
						uni.hideLoading()
						_this.intoRoom({
							roomNum: serverData.roomNum
						})
					} else if (serverData.type == 'sswd') {
						uni.hideLoading()
						console.log("连接成功")
						_this.outRoomClearnData(true)
					}
				})
				// 未知异常关闭后重连
				uni.onSocketClose(function(res) {
					console.log('WebSocket 已关闭！');
					if (!_this.isSocketClose) {
						reconnect(url)
					}
				});
				//重连
				const reconnect = () => {

					uni.showLoading({
						title: '断线重连中',
					})
					let timer = setTimeout(() => {
						let str = `第${5-this.reconnectCount+1}次断线重连中...`
						uni.showLoading({
							title: str,
						})
						console.log(str)
						this.reconnectCount--
						if (this.reconnectCount <= 0) {
							this.$toast("error")
							//如果重连次数为0，则做退出处理
							uni.navigateTo({
								url: 'pages/indexApp/xkt/xkt'
							})
						} else {
							// 连接
							uni.connectSocket({
								url: url + "/" + this.openid,
							});
						}
						clearTimeout(timer)
						timer = null
					}, 3000)
				}
			},

			//处理房间内数据
			handleRoomData(serverData) {
				let _this = this
				if (_this.roomInfo.roomNum && _this.pagetype == 'room') {
					_this.pagetype = 'room'
					_this.roomInfo = serverData.data.roomInfo;
					_this.roomInfo.roomNum = serverData.data.roomNum
					_this.roomUsers = serverData.data.roomInfo.users
				}
			},
			//退出房间后清空房间数据
			outRoomClearnData(ishttp) {
				this.pagetype = 'list',
					this.roomUsers = [], //房间内用户列表
					this.roomInfo = {}; //房间信息
				if (ishttp) {
					this.getRoomList()
				}

			},
			sendMsg(msg) { //向后端发送命令
				msg = JSON.stringify(msg)
				// console.log(msg)
				try {
					//通过 WebSocket 连接发送数据
					uni.sendSocketMessage({
						data: msg,
						success: (e) => {
							// console.log('sendsuccess',e)
						},
						fail: (err) => {
							console.log('senderr', err)
						}
					});
				} catch (e) {
					this.isSocketClose = true;
					uni.closeSocket()
				}
			},
			//在列表页面返回
			listBack() {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			},
			roomBack() {
				if (this.roomInfo.roomStatus == 'inGame') {
					uni.showModal({
						title: '提示',
						content: '正在游戏中，确定要退出游戏？',
						success: (res) => {
							if (res.confirm) {
								this.tuichu()
							} else if (res.cancel) {}
						}
					});
				} else if (['gameOver','await'].includes(this.roomInfo.roomStatus)) {
					this.tuichu()
				}

			}
		}
	}
</script>

<style lang="scss">
	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.flex-direction {
		flex-direction: column;
	}

	.roomsinner,
	.roomlist {
		display: flex;
		flex-wrap: wrap;

		li {
			width: 100px;
			height: 100px;
			border: rgb(184, 184, 184) 1px solid;
			border-radius: 6px;
			margin: 10px;
			position: relative;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
				position: absolute;
				left: 0;
				top: 0;
			}

			p {
				position: absolute;
				bottom: 0;
				font-size: 12px;
				text-align: center;
				left: 0;
				width: 100%;
				line-height: 20px;
				background-color: rgb(208, 242, 255);

			}

			.numindex {
				position: absolute;
				width: 26px;
				height: 26px;
				background: rgba(0, 0, 0, .7);
				border-radius: 50%;
				color: #fff;
				z-index: 100;
				text-align: center;
				line-height: 26px;
				font-size: 12px;
				flex-direction: column;
			}

			.outKill {
				width: 100%;
				height: 100%;
				color: #FFF;
				position: absolute;
				z-index: 50;
				left: 0;
				top: 0;
				background: rgba(0, 0, 0, .7);
				font-size: 14px;

			}

			.usernum {
				position: absolute;
				right: 0;
				top: 0;
				background: rgba(0, 0, 0, .7);
				color: #FFF;
				padding: 2px 4px;
				border-radius: 4px;
				font-size: 10px;
				line-height: 16px;
			}

			.roomList-status {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				z-index: 60;

				&.roomList-status-ingame {
					background: rgba(0, 0, 0, .3);
					color: #cb0000;
				}
			}
		}
	}

	.gamerules {
		margin-top: 100rpx;
		box-sizing: border-box;
		padding: 10px 10px;

		h5 {
			font-size: 16px;
			font-weight: 900;
			line-height: 30px;
		}

		p {
			font-size: 14px;
			line-height: 18px;
		}
	}
</style>
