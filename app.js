//app.js
App({
	socketTask: '',
	errorCode: 0, // 错误代码
	interval: 0, // 定时器标识
	intervalNumber: 0, // 定时重连的次数
	state: 0, // 重连状态 0 离线 1 在线 2 重连
	bindMessage: 0, // 绑定回调
	globalData: {
		houseId: 'DEFAULT',
		housePwd: '',
		connectType: 'enter',
		wsurl: '', //连接IP
		userInfo: null,
		userName: '',
		host: '', //连接IP
		port: 8080, //连接端口 
		chatList: [], //聊天记录
		onMessage: [],
		selectsinger: null,
		currentIndex: 0,
		fullScreen: false,
		songlist: [],
		playing: false,
		innerAudioContext: null,
		backgroundManage: null
	},
	scope: null,
	onLaunch: function () {
		// 展示本地存储能力
		var logs = wx.getStorageSync('logs') || []
		logs.unshift(Date.now())
		wx.setStorageSync('logs', logs)

		wx.onNetworkStatusChange(function (res) {
			//alert(res.isConnected)
			console.log(res.networkType)
		})
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							// 可以将 res 发送给后台解码出 unionId
							this.globalData.userInfo = res.userInfo

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				}
			}
		})
	},
	onShow: function () {
		//检测用户是否微信版本是否支持自定义组件
		this.checkVersion()
	},
	checkVersion: function () {
		const version = Number(wx.getSystemInfoSync().SDKVersion.split('.').join(''))
		const canUseComponent = 163
		if (version < canUseComponent) {
			// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
			wx.showModal({
				title: '提示',
				content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
				success: function (res) {
					if (res.confirm || res.cancel) {
						// 关闭小程序
						wx.navigateBack({
							delta: 0
						})
					}
				}
			})
		}
		return;
	},
	// 发送socket消息
	sendMsg: function (msg, type) {
		var data = {
			data: msg,
			type: type,
			time: this.getTime(),
			nickname: this.globalData.userName,
		};
		this.socketTask.send({
			data: JSON.stringify(data)
		});
		return data;
	},
	sendStrMsg: function (msg) {
		this.socketTask.send({
			data: msg
		});
	},
	sendArrayMsg: function (msg) {
		let msgs = new Array();
		msgs.push(msg);
		console.log(JSON.stringify(msgs));
		this.socketTask.send({
			data: JSON.stringify(msgs)
		});
	},
	closeSocket: function () {
		this.socketTask.close({
			reason: '倒计时退出'
		});
	},
	// 连接服务器
	openConnect: function (wsurl, houseId, housePwd, connectType, messageCallback, scope) {
		this.scope = scope;
		if (!this.socketTask) {
			this.globalData.wsurl = wsurl;
			this.globalData.houseId = houseId;
			this.globalData.housePwd = housePwd;
			this.globalData.connectType = connectType;
			this.socketTask = wx.connectSocket({
				url: wsurl + "?houseId=" + houseId + "&housePwd=" + housePwd + "&connectType=" + connectType
			});
			// socket连接成功
			this.socketTask.onOpen(() => {
				if (this.state == 2) {
					this.state = 1;
					wx.showToast({
						icon: 'none',
						mask: true,
						title: '服务器连接成功',
					})
					if (this.interval) {
						clearInterval(this.interval);
					}
				}
				console.log('连接服务器成功！');
				scope && scope.setData({
					disabled: false
				})
			})
			// socket连接错误
			this.socketTask.onError(this.errorConnect)
			// socket被关闭
			this.socketTask.onClose(this.colseConnect)
		}
		if (!this.bindMessage) {
			// 收到服务器消息
			this.socketTask.onMessage((res) => {
				messageCallback(res);
			})
		}
		return this.socketTask;
	},

	// 连接被关闭
	colseConnect: function (res) {
		this.globalData.userName = '';
		this.socketTask = '';
		console.log('WebSocket连接被关闭！')
		console.log(res);
		this.scope && this.scope.setData({
			disabled: true
		})
		if (res.code == '1000') {
			console.log("正常关闭");
			return;
		}
		// if (res.code == '1006' && this.errorCode == 0) {
		// 	wx.redirectTo({
		// 		url : '/pages/index/index'
		// 	})
		// 	return;
		// }
		if (this.intervalNumber > 2) {
			wx.showModal({
				content: '服务器未开启',
				confirmText: '尝试重连',
				success: (res) => {
					if (res.confirm) {
						this.reconnect();
					}
				}
			})
		} else {
			this.justReconnect();
		}

	},
	// 连接错误
	errorConnect: function (res) {
		this.globalData.userName = '';
		console.log('WebSocket连接打开失败，请检查！')
		console.log(res);
		this.errorCode = 404;
		this.socketTask = '';
		if (this.state == 0) {
			wx.showModal({
				content: '服务器未开启',
				confirmText: '尝试重连',
				success: (res) => {
					if (res.confirm) {
						this.reconnect();
					}
				}
			})
			this.scope && this.scope.setData({
				disabled: true
			})
		}
	},
	// 重连机制
	justReconnect: function () {
		this.state = 2; // 重连
		this.interval = setInterval(() => {
			this.intervalNumber++;
			if (this.intervalNumber > 2) {
				clearInterval(this.interval);
				return;
			}

			// 定时检查服务器是否可连接
			this.openConnect(this.globalData.wsurl, this.globalData.houseId, this.globalData.housePwd, "enter", this.scope.socketReceiver, this.scope);
		}, 1500);
	},
	// 重连机制
	reconnect: function () {
		this.state = 2; // 重连
		this.interval = setInterval(() => {
			this.intervalNumber++;
			if (this.intervalNumber > 100) {
				clearInterval(this.interval);
				return;
			}
			wx.showToast({
				icon: 'none',
				mask: true,
				title: '正在重连第' + this.intervalNumber + '次',
				// duration : 1500 ,
			})
			if (this.intervalNumber == 33) {
				this.globalData.houseId = 'DEFAULT';
			}
			// 定时检查服务器是否可连接
			this.openConnect(this.globalData.wsurl, this.globalData.houseId, this.globalData.housePwd, "enter", this.scope.socketReceiver, this.scope);
		}, 1500);
	},
	getTime: function () {
		var myDate = new Date();
		return myDate.toLocaleString();
	},
	// 显示消息
	showMsg: function (msg) {
		var preg = /(\[([\:a-z0-9]+)\])/g,
			look = [],
			names = [];
		// 匹配数据
		var data = msg.replace(preg, (arg1, arg2, arg3, arg4, arg5) => {
			let splits = arg3.split(':');
			if (splits[0] in this.globalData.looks) {
				let items = this.globalData.looks[splits[0]]
				items.forEach((item, index) => {
					if (item.name == splits[1]) {
						names.push(item.url);
					}
				});
			}
			return '';
		});
		var pushItem = {
			msg: data
		};
		if (names.length > 0) {
			pushItem.looks = names;
			pushItem.type = 'look'; //表明是表情类型
		}
		return pushItem;
	},
	// 基础请求
	request: function (url, method, data, success, faild) {
		wx.request({
			url: url,
			data: data,
			method: method,
			dataType: 'json',
			success: function (res) {
				let data = res.data
				if (data.code == '20000') {
					success(data.data);
				} else {
					wx.showToast({
						icon: 'none',
						mask: true,
						title: data.message,
					})
					faild();
					return;
				}
			},
			fail: function (e) {
				console.log(e);
			}
		})
	},
	// get请求
	get(url, success, faild) {
		this.request(url, 'get', null, success, faild)
	},
	// post请求
	post(url, data, success, faild) {
		this.request(url, 'post', data, success, faild)
	},
})