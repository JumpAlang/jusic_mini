const origin = getApp();
const app = origin.globalData
const Lyric = require('../../utils/lyric.js')
const util = require('../../utils/util.js')

const SEQUENCE_MODE = 1
const RANDOM_MOD = 2
const SINGLE_CYCLE_MOD = 3

Page({
  onShareAppMessage: function () {
    return {
      title: this.data.currentSong ? '来和我一起听：' + this.data.currentSong.name + '-' + this.data.currentSong.artist : '选个房间一起听歌吧',
      imageUrl: this.data.currentSong ? this.data.currentSong.pictureUrl : '',
      path: "/pages/player/player?houseId=" + this.data.houseId + "&housePwd=" + this.data.housePwd
    };
  },
  onShareTimeline: function () {
    return {
      title: this.data.currentSong ? '来和我一起听：' + this.data.currentSong.name + '-' + this.data.currentSong.artist : '来和我一起听歌吧',
      imageUrl: this.data.currentSong ? this.data.currentSong.pictureUrl : '',
      path: "/pages/player/player?houseId=" + this.data.houseId + "&housePwd=" + this.data.housePwd
    };
  },
  data: {
    isShowConfirm: false,
    inputPwd: '',
    playurl: '',
    playIcon: 'icon-play',
    cdCls: 'pause',
    currentLyric: null,
    currentLineNum: 0,
    toLineNum: -1,
    currentSong: null,
    dotsArray: new Array(2),
    currentDot: 0,
    playMod: SEQUENCE_MODE,
    uid: '',
    houseId: '',
    housePwd: '',
    houseName: '',
    connectType: 'enter',
    httpFirstUrl: 'https://tx.alang.run/api/', //'http://www.alang.run:8080/',//'http://localhost:8888/',//
    wsFirstUrl: 'wss://tx.alang.run/wss/', //'wss://www.alang.run/wss/',//'ws://localhost:8888/server/',//
    wsLastUrl: '/websocket',
    wsurl: '', //'ws://www.alang.run/wss/433/11lyjuu3/websocket', //连接IP
    chatList: [], //聊天记录
    disabled: true,
    showHouses: false,
    houseList: [],
    currentHouse: {
      name: '一起听歌吧'
    },
    showSearchMusic: false,
    showSearchMusicList: false,
    showSearchMusicUser: false,
    searchContent: null,
    searchItemContent: null,
    searchUserContent: null,
    sources: [{
        value: 'wy',
        name: '网易',
        checked: 'true'
      },
      {
        value: 'qq',
        name: 'QQ'
      },
      {
        value: 'mg',
        name: '咪咕'
      },
      {
        value: 'lz',
        name: '禁歌'
      }
    ],
    sourcesItem: [{
        value: 'wy',
        name: '网易',
        checked: 'true'
      },
      {
        value: 'wy_user',
        name: '网易用户'
      },
      {
        value: 'qq',
        name: 'QQ'
      },
      {
        value: 'qq_user',
        name: 'QQ用户'
      }
    ],
    sourcesUser: [{
      value: 'wy',
      name: '网易',
      checked: 'true'
    }],
    source: 'wy',
    sourceItem: 'wy',
    sourceUser: 'wy',
    searchItemPlaceHolder: '试下为空搜索',
    page: 1,
    pageItem: 1,
    pageUser: 1,
    size: 10,
    hasMore: false,
    hasMoreItem: false,
    hasMoreUser: false,
    songs: [],
    songsItem: [],
    songsUser: [],
    backgroundManage: {},
    showForAudit: true,
    showAddHouse: false,
    form: {
      needPwd: false,
      retain: false,
      inputHouseDesc: '',
      inputHouseName: '',
      inputHousePwd: '',
      inputHouseRetain: ''
    },
    favoriteMap: {},
    newslist: [],
    scrollTop: 0,
    increase: false, //图片添加区域隐藏
    aniStyle: true, //动画效果
    message: "",
    previewImgList: [],
    showTalkMsg: false,
    toMsgView: null,
    focus: true,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    sessionId: '',
    showManual:false
  },
  onLoad: function (option) {
    if (!origin.globalData.backgroundManage) {
      origin.globalData.backgroundManage = wx.getBackgroundAudioManager();
      this.setData({
        currentSong: {
          url: 'https://alang-srt.oss-cn-beijing.aliyuncs.com/sea-short.mp3',
          name: '青山湾的大海',
          album: {
            name: '白噪音'
          },
          pictureUrl: 'https://alang-srt.oss-cn-beijing.aliyuncs.com/logo1024.png',
          artist: '大自然',
          duration: 99
        }
      });
      origin.globalData.backgroundManage.src = this.data.currentSong.url;
      origin.globalData.backgroundManage.title = this.data.currentSong.name;
      origin.globalData.backgroundManage.epname = this.data.currentSong.album.name;
      origin.globalData.backgroundManage.singer = this.data.currentSong.artist;
      origin.globalData.backgroundManage.coverImgUrl = this.data.currentSong.pictureUrl;
      this._musicEvent();
    }
    if (option.houseId) {
      this.setData({
        showHouses: false,
        houseId: option.houseId,
        housePwd: option.housePwd,
        connectType: option.connectType,
        showForAudit: false
      });
      this.connectSocket();
      this.setHouseName(option.houseId);
    } else {
      this.getHouseListForAudit();
    }
    try {
      let collect = wx.getStorageSync('collectMusic');
      // console.log(collect);
      // console.log(typeof collect);
      if (collect && collect != undefined) {
        this.setData({
          favoriteMap: JSON.parse(collect)
        });
        console.log("收", this.data.favoriteMap);
      }
      // Do something with return value
    } catch (e) {
      // Do something when catch error
    }
    if (origin.globalData.userInfo) {
      console.log("global:", origin.globalData.userInfo);
      this.setData({
        userInfo: origin.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      origin.userInfoReadyCallback = res => {
        console.log("global callback:", res.userInfo);

        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log("currentpage:", res.userInfo);

          origin.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getHouses() {
    this.getHouseList();
    this.setData({
      showHouses: true
    });
  },
  setHouseName: function (houseId) {
    let that = this;
    origin.post(this.data.httpFirstUrl + 'house/search', {}, function (res) {
      that.setData({
        houseList: res
      });
      for (let i = 0; i < res.length; i++) {
        if (res[i].id == houseId) {
          that.setData({
            houseName: res[i].name
          });
          wx.setNavigationBarTitle({
            title: res[i].name
          })
          break;
        }
      }
    });
  },
  getHouseListForAudit: function () {
    // wx.setNavigationBarTitle({
    //   title: '听歌房'
    // })
    let that = this;
    origin.post(this.data.httpFirstUrl + 'house/search', {}, function (res) {
      that.setData({
        houseList: res
      });
      for (let i = 0; i < res.length; i++) {
        if (res[i].name == 'success') {
          that.setData({
            showHouses: true,
            showForAudit: false
          });
          return;
        }
      }
    });
  },
  getHouseList: function () {
    // wx.setNavigationBarTitle({
    //   title: '听歌房'
    // })
    let that = this;
    origin.post(this.data.httpFirstUrl + 'house/search', {}, function (res) {
      that.setData({
        houseList: res
      });
    });
  },
  reconnectSocket() {
    origin.openConnect(this.data.wsurl, this.data.houseId, this.data.housePwd, "enter", this.socketReceiver, this);
  },
  connectSocket() {
    let number = util.randomUtils.randomNumBoth(100, 1000000);
    let numberWord = util.randomUtils.randomWord(false, 8);
    this.setData({
      sessionId: numberWord
    });
    this.data.wsurl = this.data.wsFirstUrl + number + "/" + numberWord + this.data.wsLastUrl;
    console.log(this.data.wsurl);
    origin.openConnect(this.data.wsurl, this.data.houseId, this.data.housePwd, this.data.connectType, this.socketReceiver, this);

  },
  socketReceiver: function (e) {
    console.log("返回结果", e);
    let type;
    if (type = util.messageUtils.isKnowMessageType(e.data)) {
      let messageType = type; //messageUtils.parseMessageType(res.data);
      console.log(messageType);

      let messageContent = util.messageUtils.parseMessageContent(e.data);
      console.log(messageContent);
      switch (messageType) {
        case util.messageUtils.messageType.HOUSE_USER:
          let users = messageContent.data;
          for (let i = 0; i < users.length; i++) {
            this.data.newslist.push({
              content: (i + 1) + "." + users[i].nickName + "[" + users[i].sessionId + "]",
              type: "notice"
            });
          }
          this.setData({
            newslist: this.data.newslist
          });
          this.bottom();
          break;
        case util.messageUtils.messageType.AUTH_ADMIN:
          this.data.newslist.push({
            content: messageContent.message,
            type: "notice"
          });
          this.setData({
            newslist: this.data.newslist
          });
          break;
        case util.messageUtils.messageType.SETTING_NAME:
          this.data.newslist.push({
            content: messageContent.message,
            type: "notice"
          });
          this.setData({
            newslist: this.data.newslist
          });
          break;
        case util.messageUtils.messageType.AUTH_ROOT:
          this.data.newslist.push({
            content: messageContent.message,
            type: "notice"
          });
          this.setData({
            newslist: this.data.newslist
          });
          break;
        case util.messageUtils.messageType.GOODMODEL:
          var data = messageContent.data;
          if (data == "GOOD") {
            wx.showToast({
              icon: 'none',
              title: '当前是点赞模式',
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '已退出点赞模式',
            })
          }
          // this.$forceUpdate();

          break;
        case util.messageUtils.messageType.VOLUMN:
          //console.log(messageContent.data);
          // music.volume = Number(messageContent.data) / 100;
          // this.$store.commit("setPlayerVolume", messageContent.data);

          break;
        case util.messageUtils.messageType.ONLINE:
          if (
            messageContent.data.count !== undefined &&
            typeof messageContent.data.count !== "undefined" &&
            messageContent.data.count !== null &&
            messageContent.data.count !== ""
          ) {
            wx.setNavigationBarTitle({
              title: this.data.houseName + '[' + messageContent.data.count + ']'
            })
          }
          break;
        case util.messageUtils.messageType.PICK:
          if (messageContent.message == "goodlist") {
            console.log("点赞列表");
          }
          this.setData({
            songslist: messageContent.data
          });
          break;
        case util.messageUtils.messageType.MUSIC:
          // this.lastLyric="";
          // this.$store.commit("setPlayerLyric", "");
          // this.firstLoaded = 0;

          let jumpTime = (Date.now() - messageContent.data.pushTime);
          if (jumpTime < messageContent.data.duration) { //如果歌曲已经播放完毕不要再加载
            messageContent.data.duration = messageContent.data.duration / 1000;
            this.setData({
              currentSong: messageContent.data
            });
            if (
              messageContent.data.lyric === undefined ||
              typeof messageContent.data.lyric === "undefined" ||
              messageContent.data.lyric === null ||
              messageContent.data.lyric === ""
            ) {
              this.setData({
                currentLyric: new Lyric('')
              })
            } else {
              const lyric = this._normalizeLyric(messageContent.data.lyric);
              // console.log("lyric",lyric);
              const currentLyric = new Lyric(lyric)
              this.setData({
                currentLyric: currentLyric
              });
            }
            this.setData({
              duration: this._formatTime(this.data.currentSong.duration)
            });
            this._createAudio();
          }
          break;
        case util.messageUtils.messageType.NOTICE:
          if (
            messageContent.message !== undefined &&
            typeof messageContent.message !== "undefined" &&
            messageContent.message !== null &&
            messageContent.message !== ""
          ) {
            this.data.newslist.push({
              content: messageContent.message,
              type: "notice"
            });
            this.setData({
              newslist: this.data.newslist
            });
            if (messageContent.message == '连接到服务器成功！') {
              if (this.data.userInfo && this.data.userInfo.nickName) {
                this.settingName(this.data.userInfo.nickName);
              }
            }
            if (messageContent.message != '点歌成功') {
              wx.showToast({
                icon: 'none',
                mask: false,
                title: messageContent.message,
              })
            }
            this.bottom();
            // this.$store.commit("pushChatData", {
            //   content: messageContent.message,
            //   type: "notice"
            // });
            // if(messageContent.message=="点歌成功")
            //   this.$toast.message({message:messageContent.message,time:1000});
            // }else{
            //   this.$toast.message(messageContent.message);
            // }
          }
          break;
        case util.messageUtils.messageType.ENTER_HOUSE:
          wx.hideLoading({
            success: (res) => {}
          })
          if (Number(messageContent.code) === 20000) {
            //  this.setData({showHouses:false});
            if (this.data.userInfo && this.data.userInfo.nickName) {
              this.settingName(this.data.userInfo.nickName);
            }
          } else {
            this.getHouseList();
          }
          wx.showToast({
            icon: 'none',
            mask: false,
            title: messageContent.message,
          })
          break;
        case util.messageUtils.messageType.CHAT:

          let reg = /^点歌\s+?(.*)/;
          if (reg.test(messageContent.data.content)) {
            wx.showToast({
              icon: 'none',
              title: messageContent.data.nickName + messageContent.data.content,
              duration: 2000
            })
          }
          let imgList = [];
          let matchUrlList = messageContent.data.content.match(
            /[picture].*?:\/\/[^\s]*/gi
          );
          if (matchUrlList !== null) {
            for (let i = 0; i < matchUrlList.length; i++) {
              let imgUrl = matchUrlList[i].replace("picture:", "");
              this.data.previewImgList.push(imgUrl);
              this.setData({
                previewImgList: this.data.previewImgList
              });
              imgList.push(imgUrl);
              messageContent.data.content = messageContent.data.content.replace(
                matchUrlList[i],
                ""
              );
            }
          }
          messageContent.data.images = imgList;
          messageContent.data.sendTime = util.timeUtils.secondsToYYYY_HH_mm_ss(messageContent.data.sendTime);
          this.data.newslist.push(messageContent.data);
          this.setData({
            newslist: this.data.newslist
          });
          this.bottom();
          break;
        case util.messageUtils.messageType.ANNOUNCEMENT:
          if (messageContent.data.content) {
            setTimeout(function () {
              wx.showToast({
                icon: 'none',
                mask: false,
                title: "公告：" + messageContent.data.content,
                duration: 6000
              })
            }, 2000);
          }
          break;
        case util.messageUtils.messageType.SEARCH:
          wx.hideLoading({
            success: (res) => {}
          })
          if (this.data.page == 1) {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              this.setData({
                songs: messageContent.data.data
              });
              if (messageContent.data.totalSize > messageContent.data.data.length) {
                this.setData({
                  hasMore: true
                });
              } else {
                this.setData({
                  hasMore: false
                });
              }
            } else {
              this.setData({
                hasMore: false,
                songs: null
              });
            }

          } else {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              var a = messageContent.data;
              var e = this.data.songs.concat(a.data);
              this.setData({
                songs: e
              });
              a.totalSize > e.length ? this.setData({
                hasMore: true
              }) : this.setData({
                hasMore: false
              });
            } else {
              this.setData({
                hasMore: false
              });
            }
          }
          break;
        case util.messageUtils.messageType.SEARCH_SONGLIST:
          wx.hideLoading({
            success: (res) => {}
          })
          if (this.data.pageItem == 1) {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              this.setData({
                songsItem: messageContent.data.data
              });
              if (messageContent.data.totalSize > messageContent.data.data.length) {
                this.setData({
                  hasMoreItem: true
                });
              } else {
                this.setData({
                  hasMoreItem: false
                });
              }
            } else {
              this.setData({
                hasMoreItem: false,
                songsItem: null
              });
            }

          } else {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              var a = messageContent.data;
              var e = this.data.songsItem.concat(a.data);
              this.setData({
                songsItem: e
              });
              a.totalSize > e.length ? this.setData({
                hasMoreItem: true
              }) : this.setData({
                hasMoreItem: false
              });
            } else {
              this.setData({
                hasMoreItem: false
              });
            }
          }
          break;
        case util.messageUtils.messageType.SEARCH_USER:
          wx.hideLoading({
            success: (res) => {}
          })
          if (this.data.pageUser == 1) {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              this.setData({
                songsUser: messageContent.data.data
              });
              if (messageContent.data.totalSize > messageContent.data.data.length) {
                this.setData({
                  hasMoreUser: true
                });
              } else {
                this.setData({
                  hasMoreUser: false
                });
              }
            } else {
              this.setData({
                hasMoreUser: false,
                songsUser: null
              });
            }

          } else {
            if (messageContent.data.data && messageContent.data.data.length > 0) {
              var a = messageContent.data;
              var e = this.data.songsUser.concat(a.data);
              this.setData({
                songsUser: e
              });
              a.totalSize > e.length ? this.setData({
                hasMoreUser: true
              }) : this.setData({
                hasMoreUser: false
              });
            } else {
              this.setData({
                hasMoreUser: false
              });
            }
          }
          break;
        case util.messageUtils.messageType.ADD_HOUSE:
          wx.hideLoading({
            success: (res) => {}
          })
          if (Number(messageContent.code) === 20000) {
            if (this.data.userInfo && this.data.userInfo.nickName) {
              this.settingName(this.data.userInfo.nickName);
            }
            wx.setNavigationBarTitle({
              title: this.data.form.inputHouseName
            })
            this.setData({
              houseId: messageContent.data,
              housePwd: this.data.form.inputHousePwd,
              connectType: "",
              showHouses: false,
              showAddHouse: false,
              houseName: this.data.form.inputHouseName
            });

            // let userName = window.localStorage.getItem("USER_NAME");
            // if (userName) {
            //   this.settingName(userName);
            //  }
          } else {
            wx.showToast({
              icon: 'none',
              mask: false,
              title: messageContent.message
            })
          }
          break;
        default:
          // console.log('未知消息类型', messageType, source);
          break;
      }
    }
  },
  onShow: function () {
    // this._init()
    // this.setData({
    //   uid: this.getUid()
    // })
  },
  // 创建播放器
  _createAudio: function (playUrl) {
    // wx.hideLoading();
    wx.showLoading({
      title: '加载中',
    })
    // if (!this.manage) {
    //   this.manage = wx.getBackgroundAudioManager();
    // }
    let manage = origin.globalData.backgroundManage;
    manage.src = this.data.currentSong.url;
    manage.title = this.data.currentSong.name;
    manage.epname = this.data.currentSong.album.name;
    manage.singer = this.data.currentSong.artist;
    manage.coverImgUrl = this.data.currentSong.pictureUrl;
    if (this.data.currentSong.pushTime) {
      let jumpTime = (Date.now() - this.data.currentSong.pushTime) / 1000;
      manage.startTime = 0;
      setTimeout(function () {
        manage.seek(jumpTime + 0.3)
      }, 300);
    }
    origin.globalData.backgroundManage = manage;
  },
  _musicEvent: function () {
    let that = this;
    origin.globalData.backgroundManage.onError(() => {
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
      console.log("错误播放");
      // wx.showToast({
      //   title: '错误被播放',
      // })
    })
    origin.globalData.backgroundManage.onCanplay(() => {
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
    });
    origin.globalData.backgroundManage.onPlay(() => {
      that.setData({
        playIcon: 'icon-pause',
        cdCls: 'play'
      })
      // wx.showToast({
      //   title: '我播放了',
      // })
    });
    origin.globalData.backgroundManage.onPause(() => {
      that.setData({
        playIcon: 'icon-play',
        cdCls: 'pause'
      })
      // wx.showToast({
      //   title: '我被暂停了',
      // })
    })
    origin.globalData.backgroundManage.onStop(() => {
      // wx.showToast({
      //   title: '我被停止了',
      // })
      if (origin.globalData.backgroundManage.currentTime == undefined || origin.globalData.backgroundManage.currentTime < that.data.currentSong.duration) {
        origin.globalData.backgroundManage.src = that.data.currentSong.url;
        origin.globalData.backgroundManage.title = that.data.currentSong.name;
        origin.globalData.backgroundManage.epname = that.data.currentSong.album.name;
        origin.globalData.backgroundManage.singer = that.data.currentSong.artist;
        origin.globalData.backgroundManage.coverImgUrl = that.data.currentSong.pictureUrl;
        origin.globalData.backgroundManage.startTime = 0
        if (that.data.currentSong.pushTime) {
          let jumpTime = (Date.now() - that.data.currentSong.pushTime) / 1000;
          setTimeout(function () {
            origin.globalData.backgroundManage.seek(jumpTime + 0.3);
            origin.globalData.backgroundManage.play();
          }, 300);
        }

      }
      // console.log("我停止了", that.data.currentSong, origin.globalData.backgroundManage);
      // origin.globalData.backgroundManage.play();
    })
    origin.globalData.backgroundManage.onWaiting(() => {
      // wx.showToast({
      //   title: '我在等待缓存',
      // })
      console.log("等待缓存。。。");
    });
    origin.globalData.backgroundManage.onSeeking(() => {
      // wx.showToast({
      //   title: '我准备跳转',
      // })
      console.log("监听背景音频开始跳转操作事件")
    })
    origin.globalData.backgroundManage.onSeeked(() => {
      // wx.showToast({
      //   title: '我完成跳转了',
      // })
      console.log("监听背景音频完成跳转操作事件")
    })
    // 监听播放拿取播放进度
    origin.globalData.backgroundManage.onTimeUpdate(() => {
      const currentTime = origin.globalData.backgroundManage.currentTime;
      // if(this.data.showHouses || this.data.showSearchMusic || this.data.showForAudit || this.data.showAddHouse || this.data.showSearchMusicList || this.data.showSearchMusicUser){
      //   return;
      // }
      // console.log(currentTime,this.data.currentSong.duration,currentTime / this.data.currentSong.duration);
      that.setData({
        currentTime: that._formatTime(currentTime),
        percent: currentTime / that.data.currentSong.duration
      })
      if (that.data.currentLyric) {
        that.handleLyric(currentTime * 1000)
      }
    })
  },
  // 去掉歌词中的转义字符
  _normalizeLyric: function (lyric) {
    return lyric.replace(/&#58;/g, ':').replace(/&#10;/g, '\n').replace(/&#46;/g, '.').replace(/&#32;/g, ' ').replace(/&#45;/g, '-').replace(/&#40;/g, '(').replace(/&#41;/g, ')').replace(/\\r/g, ""); //.replace(/r?n\[/g, "\n[");
  },
  // 歌词滚动回调函数
  handleLyric: function (currentTime) {
    let lines = [{
        time: 0,
        txt: ''
      }],
      lyric = this.data.currentLyric,
      lineNum
    lines = lines.concat(lyric.lines)
    for (let i = 0; i < lines.length; i++) {
      if (i < lines.length - 1) {
        let time1 = lines[i].time,
          time2 = lines[i + 1].time
        if (currentTime > time1 && currentTime < time2) {
          lineNum = i - 1
          break;
        }
      } else {
        lineNum = lines.length - 2
      }
    }
    this.setData({
      currentLineNum: lineNum,
      currentText: lines[lineNum + 1] && lines[lineNum + 1].txt
    })

    let toLineNum = lineNum - 5
    if (lineNum > 5 && toLineNum != this.data.toLineNum) {
      this.setData({
        toLineNum: toLineNum
      })
    }
  },
  _formatTime: function (interval) {
    interval = interval | 0
    const minute = interval / 60 | 0
    const second = this._pad(interval % 60)
    return `${minute}:${second}`
  },
  /*秒前边加0*/
  _pad(num, n = 2) {
    let len = num.toString().length
    while (len < n) {
      num = '0' + num
      len++
    }
    return num
  },
  changeMod: function () {
    let playMod = this.data.playMod + 1
    if (playMod > SINGLE_CYCLE_MOD) {
      playMod = SEQUENCE_MODE
    }
    this.setData({
      playMod: playMod
    })
  },
  prev: function () {
    app.currentIndex = this.getNextIndex(false)
    this._init()
  },
  next: function () {
    this.sendMsg("/music/skip/vote", null);

    // app.currentIndex = this.getNextIndex(true)
    // this._init()
  },
  sendMsg: function (url, data) {
    let msg = this.constructMsgData(url, data);
    console.log(msg);

    origin.sendArrayMsg(msg);
  },
  constructMsgData: function (url, data) {
    let dataStr = "[object Object]";
    if (data) {
      dataStr = JSON.stringify(data);
    }
    return "SEND\ndestination:" + url + "\n\n" + dataStr + "\u0000";
  },
  getTime: function () {
    var myDate = new Date();
    return myDate.toLocaleString();
  },
  /**
   * 获取不同播放模式下的下一曲索引
   * @param nextFlag: next or prev
   * @returns currentIndex
   */
  getNextIndex: function (nextFlag) {
    let ret,
      currentIndex = app.currentIndex,
      mod = this.data.playMod,
      len = this.data.songslist.length
    if (mod === RANDOM_MOD) {
      ret = util.randomNum(len)
    } else {
      if (nextFlag) {
        ret = currentIndex + 1 == len ? 0 : currentIndex + 1
      } else {
        ret = currentIndex - 1 < 0 ? len - 1 : currentIndex - 1
      }
    }
    return ret
  },
  togglePlaying: function () {
    if (origin.globalData.backgroundManage.paused) {
      origin.globalData.backgroundManage.play();
    } else {
      origin.globalData.backgroundManage.pause();
    }
    // wx.getBackgroundAudioPlayerState({
    //   success: function (res) {
    //     var status = res.status
    //     if (status == 1) {
    //       wx.pauseBackgroundAudio()
    //     } else {
    //       wx.playBackgroundAudio()
    //     }
    //   }
    // })
  },
  openList: function () {
    console.log("songlist", this.data.songslist);
    if (!this.data.songslist.length) {
      return
    }
    this.setData({
      translateCls: 'uptranslate'
    })
  },
  openFavorite: function () {
    this.setData({
      translateCls: 'downtranslate',
      translateClsFavorite: 'uptranslate'
    })
  },
  closeFavorite: function () {
    this.setData({
      translateClsFavorite: 'downtranslate'
    })
  },
  close: function () {
    this.setData({
      translateCls: 'downtranslate'
    })
  },
  closePick: function () {
    this.setData({
      showSearchMusic: false
    })
  },
  playthis: function (e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    if(index != 0){
      this.sendMsg('/music/good/' + id, null);
    }
    // const index = e.currentTarget.dataset.index
    // app.currentIndex = index
    // this._init()
    // this.close()
  },
  copyId: function(e){
    let song = e.currentTarget.dataset.data;
    wx.setClipboardData({
      data: song.id,
      success: function (res) {
　　　　　//复制成功的操作
        wx.showToast({
          icon:'none',
          title: '已复制（歌曲|歌单）id'
        })
      }
    });
  },
  pickthis: function (e) {},
  playAllFavorite: function () {
    for (let key in this.data.favoriteMap) {
      let item = this.data.favoriteMap[key];
      this.sendMsg("/music/pick", {
        name: item.name,
        id: item.id,
        source: item.source,
        sendTime: Date.now()
      });
    }
    this.closeFavorite();
    // const index = e.currentTarget.dataset.index
    // app.currentIndex = index
    // this._init()
    // this.close()
  },
  changeDot: function (e) {
    this.setData({
      currentDot: e.detail.current
    })
  },
  _selectItemRank: function (event) {
    const data = event.currentTarget.dataset.data;
    if (data.needPwd) {
      this.setData({
        isShowConfirm: true,
        currentHouse: data
      })
    } else {
      wx.setNavigationBarTitle({
        title: data.name
      })
      this.setData({
        houseId: data.id,
        connectType: "enter",
        showHouses: false,
        houseName: data.name
      });

      wx.showLoading({
        title: '正在进入房间',
      })
      if (!this.data.disabled) {
        this.sendMsg("/house/enter", {
          id: data.id
        });
      } else {
        this.connectSocket();
        wx.hideLoading({
          success: (res) => {}
        })
      }
    }
  },
  setValue: function (e) {
    this.setData({
      inputPwd: e.detail.value
    })
  },
  setSearchKey: function (e) {
    this.setData({
      searchContent: e.detail.value
    })
  },
  setSearchItemKey: function (e) {
    this.setData({
      searchItemContent: e.detail.value
    })
  },
  setSearchUserKey: function (e) {
    this.setData({
      searchUserContent: e.detail.value
    })
  },
  gotoMusicItem: function (e) {
    let userList = e.currentTarget.dataset.data;
    const items = this.data.sourcesItem;
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === (this.data.sourceUser + '_user');
    }
    this.setData({
      showSearchMusicList: true,
      showSearchMusicUser: false,
      searchItemContent: userList.userId,
      sourceItem: this.data.sourceUser + '_user',
      sourcesItem: items
    })
    this.searchItemFromButton();
  },
  gotoMusic: function (e) {
    let songList = e.currentTarget.dataset.data;
    const items = this.data.sources;
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = this.data.sourceItem.startsWith(items[i].value);
    }
    this.setData({
      showSearchMusicList: false,
      showSearchMusic: true,
      searchContent: '*' + songList.id,
      source: this.data.sourceItem.startsWith('wy') ? 'wy' : 'qq',
      sources: items
    })
    this.searchFromButton();
  },
  hotMusic: function () {
    if (this.data.source == 'lz' || this.data.source == 'mg') {
      this.setData({
        source: 'wy'
      })
      const items = this.data.sources;
      for (let i = 0, len = items.length; i < len; ++i) {
        items[i].checked = items[i].value === 'wy'
      }

      this.setData({
        sources: items
      })
    }

    this.setData({
      searchContent: '*热歌榜'
    });
    this.searchFromButton();
  },
  cancel: function () {
    this.setData({
      isShowConfirm: false,
    })
  },
  confirmAcceptance: function () {
    if (!this.data.inputPwd) {
      wx.showToast({
        icon: 'none',
        // mask : true , 
        title: '密码不能为空',
      })
    } else {
      this.enterHouse();
    }
  },
  enterHouse: function () {
    wx.showLoading({
      title: '正在进入房间',
    })
    let that = this;
    origin.post(this.data.httpFirstUrl + 'house/enter', {
      id: this.data.currentHouse.id,
      password: this.data.inputPwd
    }, function (res) {
      wx.setNavigationBarTitle({
        title: that.data.currentHouse.name
      })
      that.setData({
        isShowConfirm: false,
        houseId: that.data.currentHouse.id,
        housePwd: that.data.inputPwd,
        connectType: "enter",
        showHouses: false,
        houseName: that.data.currentHouse.name
      });
      if (that.data.disabled) {
        that.connectSocket();
        wx.hideLoading({
          success: (res) => {}
        })
      } else {
        that.sendMsg("/house/enter", {
          id: that.data.currentHouse.id,
          password: that.data.inputPwd
        });
      }
    });
  },
  showSearchPage: function () {
    this.setData({
      showSearchMusic: true
    });
  },
  showSearchUserPage: function () {
    this.setData({
      showSearchMusicUser: true,
      showSearchMusicList: false
    });
  },
  openMusicList: function () {
    this.setData({
      showSearchMusicList: false,
      showSearchMusic: true
    });
  },
  openMusicItem: function () {
    const items = this.data.sourcesItem;
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = this.data.sourceItem === items[i].value;
    }

    this.setData({
      showSearchMusicList: true,
      showSearchMusicUser: false,
      sourcesItem: items
    });
  },
  closeMusicItem: function () {
    this.setData({
      showSearchMusicList: false
    });
  },
  closeMusicUser: function () {
    this.setData({
      showSearchMusicUser: false
    });
  },
  showSearchItemPage: function () {
    const items = this.data.sourcesItem;
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = this.data.sourceItem === items[i].value;
    }
    this.setData({
      showSearchMusic: false,
      showSearchMusicList: true,
      sourcesItem: items
    });
  },
  radioChangeItem(e) {
    let value = e.detail.value;
    if (value == "qq_user") {
      this.data.searchItemPlaceHolder = "qq用户id即qq号";
    } else if (value == "wy_user") {
      this.data.searchItemPlaceHolder = "网易用户id不知，点左上按钮";
    } else {
      let placeholders = ["搜索[民谣]来听下吧", "试下为空搜索(*^__^*)", "请输入关键字，如'摇滚'"];
      this.data.searchItemPlaceHolder = placeholders[Math.floor(Math.random() * 3)];
    }
    this.setData({
      sourceItem: value,
      pageItem: 1,
      hasMoreItem: false,
      searchItemPlaceHolder: this.data.searchItemPlaceHolder
    });

    console.log("当前radio", this.data.sourceItem);
    //todo 清空列表，设置搜索第一页，
  },
  radioChange(e) {
    this.setData({
      source: e.detail.value,
      page: 1,
      hasMore: false
    });

    console.log("当前radio", this.data.source);
    //todo 清空列表，设置搜索第一页，
  },
  radioUserChange(e) {
    //todo 清空列表，设置搜索第一页，
  },
  searchFromButton: function () {
    this.setData({
      page: 1,
      hasMore: false
    });
    this.search(1);
  },
  searchItemFromButton: function () {
    this.setData({
      pageItem: 1,
      hasMoreItem: false
    });
    this.searchItem(1);
  },
  searchUserFromButton: function () {
    this.setData({
      pageUser: 1,
      hasMoreUser: false
    });
    this.searchUser(1);
  },
  search: function (page) {
    wx.showLoading({
      title: '搜索中',
    })
    this.sendMsg("/music/search", {
      name: this.data.searchContent ? this.data.searchContent.trim() : '',
      sendTime: Date.now(),
      source: this.data.source,
      pageIndex: page,
      pageSize: this.data.size
    });

    //todo 清空列表，搜索第一页，
  },
  searchItem: function (page) {
    wx.showLoading({
      title: '搜索中',
    })
    console.log("搜索item", this.data.sourceItem);
    this.sendMsg("/music/searchsonglist", {
      name: this.data.searchItemContent ? (this.data.searchItemContent + '').trim() : '',
      sendTime: Date.now(),
      source: this.data.sourceItem,
      pageIndex: page,
      pageSize: this.data.size
    });

    //todo 清空列表，搜索第一页，
  },
  searchUser: function (page) {
    wx.showLoading({
      title: '搜索中',
    })
    this.sendMsg("/music/searchuser", {
      nickname: this.data.searchUserContent ? this.data.searchUserContent.trim() : '',
      sendTime: Date.now(),
      source: this.data.sourceUser,
      pageIndex: page,
      pageSize: this.data.size
    });

    //todo 清空列表，搜索第一页，
  },
  getMoreSongs: function () {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1,
        hasMore: false
      }), this.search(this.data.page);
    }
  },
  getMoreSongsItem: function () {
    if (this.data.hasMoreItem) {
      this.setData({
        pageItem: this.data.pageItem + 1,
        hasMoreItem: false
      }), this.searchItem(this.data.pageItem);
    }
  },
  getMoreSongsUser: function () {
    if (this.data.hasMoreUser) {
      this.setData({
        pageUser: this.data.pageUser + 1,
        hasMoreUser: false
      }), this.searchUser(this.data.pageUser);
    }
  },
  pickMusic: function (e) {
    let song = e.currentTarget.dataset.data;
    this.sendMsg("/music/pick", {
      name: song.name,
      id: song.id,
      source: this.data.source,
      sendTime: Date.now()
    });
  },
  pickMusicFromFavorite: function (e) {
    let song = e.currentTarget.dataset.data;
    this.sendMsg("/music/pick", {
      name: song.name,
      id: song.id,
      source: song.source,
      sendTime: Date.now()
    });
  },
  deletePick: function (e) {
    let song = e.currentTarget.dataset.data;
    let index = e.currentTarget.dataset.index;
    if(index == 0){
      wx.setClipboardData({
        data: song.id,
        success: function (res) {
  　　　　　//复制成功的操作
          wx.showToast({
            title: '已复制该歌曲id'
          })
        }
      });
    }else{
      console.log(song);
      wx.showModal({
        content: '删除歌曲：' + song.name,
        confirmText: '确定',
        success: (res) => {
          if (res.confirm) {
            this.sendMsg("/music/delete", {
              id: song.name,
              sendTime: Date.now()
            });
          }
        }
      })
    }

  },
  closeHouse: function () {
    if (this.data.disabled) {
      wx.showToast({
        icon: 'none',
        mask: false,
        title: '请选择房间或者创建房间',
      })
    } else {
      this.setData({
        showHouses: false
      });
    }
  },
  addHouse: function () {
    this.setData({
      showHouses: false,
      showAddHouse: true
    });
  },
  bindHouseNameInput: function (e) {
    this.data.form.inputHouseName = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  bindHouseDescInput: function (e) {
    this.data.form.inputHouseDesc = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  bindHousePwdInput: function (e) {
    this.data.form.inputHousePwd = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  bindHouseRetainInput: function (e) {
    this.data.form.inputHouseRetain = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  switchPwdChange: function (e) {
    this.data.form.needPwd = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  switchRetainChange: function (e) {
    this.data.form.retain = e.detail.value;
    this.setData({
      form: this.data.form
    });
  },
  closeHouseForm: function () {
    this.setData({
      showAddHouse: false,
      showHouses: true
    })
  },
  createHouse: function () {
    if (!this.data.form.inputHouseName) {
      wx.showToast({
        icon: 'none',
        // mask : true , 
        title: '房间名称不能为空',
      })
      return;
    }
    if (this.data.form.needPwd && !this.data.form.inputHousePwd) {
      wx.showToast({
        icon: 'none',
        // mask : true , 
        title: '密码不能为空',
      })
      return;
    }
    if (this.data.form.retain && !this.data.form.inputHouseRetain) {
      wx.showToast({
        icon: 'none',
        // mask : true , 
        title: '请输入房间永存的订单号'
      })
      return;
    }
    let that = this;

    wx.showLoading({
      title: '正在创建房间',
    })
    if (this.data.disabled) {
      origin.post(this.data.httpFirstUrl + 'house/add', {
        name: this.data.form.inputHouseName,
        desc: this.data.form.inputHouseDesc,
        needPwd: this.data.form.needPwd,
        password: this.data.form.inputHousePwd,
        enableStatus: this.data.form.retain,
        retainKey: this.data.form.inputHouseRetain
      }, function (res) {
        wx.hideLoading({
          success: (res) => {}
        })
        wx.setNavigationBarTitle({
          title: that.data.form.inputHouseName
        })
        that.setData({
          houseId: res,
          housePwd: that.data.form.inputHousePwd,
          connectType: "",
          showHouses: false,
          showAddHouse: false,
          houseName: that.data.form.inputHouseName
        });
        that.connectSocket();
      });
    } else {
      that.sendMsg("/house/add", {
        name: this.data.form.inputHouseName,
        desc: this.data.form.inputHouseDesc,
        needPwd: this.data.form.needPwd,
        password: this.data.form.inputHousePwd,
        enableStatus: this.data.form.retain,
        retainKey: this.data.form.inputHouseRetain
      });
    }
  },
  collectMusic: function (e) {
    let item = e.currentTarget.dataset.item;
    this.data.favoriteMap[item.id] = item;
    this.setData({
      favoriteMap: this.data.favoriteMap
    });
    try {
      wx.setStorageSync('collectMusic', JSON.stringify(this.data.favoriteMap))
    } catch (e) {}
  },
  removeCollect: function (e) {
    let item = e.currentTarget.dataset.item;
    delete this.data.favoriteMap[item.id];
    this.setData({
      favoriteMap: this.data.favoriteMap
    });
    try {
      wx.setStorageSync('collectMusic', JSON.stringify(this.data.favoriteMap))
    } catch (e) {}
  },
  removeAllCollect() {
    try {
      wx.removeStorageSync('collectMusic');
      this.setData({
        favoriteMap: {}
      })
      this.closeFavorite();
    } catch (e) {
      // Do something when catch error
    }

  },


  //事件处理函数

  send: function () {

    var flag = this

    if (this.data.message.trim() == "") {

      wx.showToast({

        title: '消息不能为空哦~',

        icon: "none",

        duration: 2000

      })

    } else {

      setTimeout(function () {

        flag.setData({

          increase: false

        })

      }, 300)

      this.sendSwitch();
      this.setData({
        focus: true,
        message: ''
      });
      // this.bottom();
    }

  },

  sendSwitch: function () {
    let chatMessage = this.data.message;
    let instruction = util.sendUtils.parseInstruction(chatMessage);
    let content = "";

    switch (instruction) {
      case "点歌":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入音乐关键词', chatMessage)
        } else {
          this.sendMsg('/music/pick', {
            name: content,
            source: this.data.source,
            sendTime: Date.now()
          })
        }
        break;
      case "投票切歌":
        this.next();
        break;
      case "设置昵称":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入昵称', chatMessage)
        } else {
          this.settingName(content);
        }
        break;
      case "通知":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入公告', chatMessage)
        } else {
          this.sendMsg('/chat/notice/' + content, null);
        }
        break;
      case "公告":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        this.sendMsg("/chat/announce", {
          content: content
        });
        break;
      case "root":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入 root 密码', chatMessage)
        } else {
          this.sendMsg("/auth/root", {
            password: content,
            sendTime: Date.now()
          });
        }
        break;
      case "admin":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入 admin 密码', chatMessage)
        } else {
          this.sendMsg("/auth/admin", {
            password: content,
            sendTime: Date.now()
          });
        }
        break;
      case "置顶音乐":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要置顶的音乐 id', chatMessage)
        } else {
          this.sendMsg("/music/top", {
            id: content,
            sendTime: Date.now()
          });
        }
        break;
      case "删除音乐":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要删除的音乐 id', chatMessage)
        } else {
          this.sendMsg("/music/delete", {
            id: content,
            sendTime: Date.now()
          });
        }
        break;
      case "设置默认列表":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要删除的音乐 id', chatMessage)
        } else {
          this.sendMsg("/music/setDefaultPlaylist", {
            id: content,
            source: this.data.source
          });
        }
        break;
      case "清空列表":
        this.sendMsg("/music/clear", null);
        break;
      case "清空默认列表":
        this.sendMsg("/music/clearDefaultPlayList", null);
        break;
      case "音乐黑名单":
        this.sendMsg("/music/blackmusic", null);
        break;
      case "默认列表歌曲数":
        this.sendMsg("/music/playlistSize", null);
        break;
      case "用户黑名单":
        this.sendMsg("/chat/blackuser", null);
        break;
      case "调整音量":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          content = 0;
        }
        this.sendMsg("/music/volumn/" + content, null);
        break;
      case "倒计时退出":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (!/^\d+$/.test(content)) {
          wx.showToast({
            icon: 'none',
            title: '请输入要在几分钟后退出',
          })
        } else {
          this.setTimeToClose(content);
          wx.showToast({
            icon: 'none',
            title: "设置成功，将在" + content + "分钟后退出",
          })
        }
        break;
      case "取消退出":
        this.setTimeToClose(0);
        wx.showToast({
          icon: 'none',
          title: "取消成功",
        })
        break;
      case "修改密码":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        this.sendMsg("/auth/adminpwd/" + content, null);
        break;
      case "修改root密码":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        this.sendMsg("/auth/rootpwd/" + content, null);
        break;
      case "投票切歌率":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        this.sendMsg("/music/vote/" + content, null);

        break;
      case "点赞模式":
        this.sendMsg("/music/goodmodel/true", null);
        break;
      case "退出点赞模式":
        this.sendMsg("/music/goodmodel/false", null);
        break;
      case "随机模式":
        this.sendMsg("/music/randommodel/true", null);
        break;
      case "退出随机模式":
        this.sendMsg("/music/randommodel/false", null);
        break;
      case "留存房间":
        this.sendMsg("/house/retain/true", null);
        break;
      case "不留存房间":
        this.sendMsg("/house/retain/false", null);
        break;
      case "禁止点歌":
        this.sendMsg("/music/banchoose/true", null);
        break;
      case "禁止切歌":
        this.sendMsg("/music/banswitch/true", null);
        break;
      case "启用切歌":
        this.sendMsg("/music/banswitch/false", null);
        break;
      case "启用点歌":
        this.sendMsg("/music/banchoose/false", null);
        break;
      case "拉黑用户":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的用户 session', chatMessage)
        } else {
          this.sendMsg("/chat/black", {
            sessionId: content,
            sendTime: Date.now()
          })
        }
        break;
      case "漂白用户":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要漂白的用户 session', chatMessage)
        } else {
          this.sendMsg("/chat/unblack", {
            sessionId: content,
            sendTime: Date.now()
          });

        }
        break;
      case "设置点歌人":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的用户 session', chatMessage)
        } else {
          this.sendMsg("/auth/setPicker/" + content, null);
        }
        break;
      case "取消点歌人":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的用户 session', chatMessage)
        } else {
          this.sendMsg("/auth/setNoPicker/" + content, null);
        }
        break;
      case "设置切歌人":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的用户 session', chatMessage)
        } else {
          this.sendMsg("/auth/setVoter/" + content, null);
        }
        break;
      case "取消切歌人":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的用户 session', chatMessage)
        } else {
          this.sendMsg("/auth/setNoVoter/" + content, null);

        }
        break;
      case "拉黑音乐":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {
          // console.log('请输入要拉黑的音乐 id', chatMessage);
        } else {
          this.sendMsg("/music/black", {
            id: content,
            sendTime: Date.now()
          });
        }
        break;
      case "漂白音乐":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {} else {
          // console.log('请输入要漂白的音乐 id', chatMessage);
          this.sendMsg("/music/unblack", {
            id: content,
            sendTime: Date.now()
          });

        }
        break;
      case "@管理员":
        content = util.sendUtils.parseContent(instruction, chatMessage);
        if (content === "") {} else {
          this.sendMsg("/mail/send", {
            content: content,
            sendTime: Date.now()
          });

        }
        break;
      default:
        if (
          chatMessage === null ||
          chatMessage === "" ||
          chatMessage.length === 0
        ) {
          // console.log('消息非法', chatMessage);
        } else {
          this.sendMsg('/chat', {
            content: chatMessage,
            sendTime: Date.now()
          })
        }
        break;
    }
  },
  setTimeToClose(minutes) {
    if (this.closeClock) {
      clearTimeout(this.closeClock);
    }
    if (minutes != 0) {
      this.closeClock = setTimeout(this.closePage, minutes * 60 * 1000);
    }
  },
  closePage: function () {
    origin.globalData.backgroundManage.pause();
    this.setData({
      showHouses: true,
      showSearchMusic: false,
      showAddHouse: false,
      showSearchMusicList: false,
      showSearchMusicUser: false,
      showTalkMsg: false,
      showManual:false
    });
    origin.closeSocket();
  },
  settingName: function (username) {
    this.sendMsg("/setting/name", {
      name: username,
      sendTime: Date.now()
    });
  },
  //监听input值的改变

  bindChange(res) {

    this.setData({

      message: res.detail.value

    })

  },

  cleanInput() {

    //button会自动清空，所以不能再次清空而是应该给他设置目前的input值

    this.setData({

      message: this.data.message

    })

  },

  increase() {

    this.setData({

      increase: true,

      aniStyle: true

    })

  },

  //点击空白隐藏message下选框

  outbtn() {

    this.setData({

      increase: false,

      aniStyle: true

    })

  },

  //图片预览
  previewImg(e) {

    var that = this

    //必须给对应的wxml的image标签设置data-set=“图片路径”，否则接收不到

    var res = e.target.dataset.src

    var list = this.data.previewImgList //页面的图片集合数组

    //判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在

    if (list.indexOf(res) == -1) {

      this.data.previewImgList.push(res)

    }

    wx.previewImage({

      current: res, // 当前显示图片的http链接

      urls: that.data.previewImgList // 需要预览的图片http链接列表

    })

  },

  //聊天消息始终显示最底端

  bottom: function () {
    console.log("我跳转了");
    this.setData({
      toMsgView: 'msg-' + (this.data.newslist.length - 1)
    })
    // var query = wx.createSelectorQuery()

    // query.select('#flag').boundingClientRect()

    // query.selectViewport().scrollOffset()

    // query.exec(function (res) {
    //   console.log("我执行了bottom");

    //   wx.pageScrollTo({

    //     scrollTop: res[0].bottom // #the-id节点的下边界坐标

    //   })

    //   res[1].scrollTop // 显示区域的竖直滚动位置

    // })

  },
  talk: function () {
    let that = this;
    this.setData({
      showTalkMsg: true
    })
    setTimeout(function(){
      that.bottom();
    },555);
  },
  closetalk: function () {
    this.setData({
      showTalkMsg: false
    })
  },
  clearScr: function () {
    this.setData({
      newslist: [],
      increase: false,
      aniStyle: true
    })
  },
  getHouseUser: function () {
    this.sendMsg("/house/houseuser", null);
    this.setData({
      increase: false,
      aniStyle: true
    })
  },
  secretTalk: function (e) {
    const chat = e.currentTarget.dataset.data;
    this.setData({
      message: '@' + chat.sessionId + ' '
    });
  },
  getUserInfo: function (e) {
    console.log(e)
    origin.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    if (!this.data.disabled) {
      this.settingName(this.data.userInfo.nickName);
    }
  },
  manual:function(e){
    this.setData({
      showTalkMsg:false,
      showManual:true
    })
  },
  closeManual:function(){
    this.setData({
      showTalkMsg : true,
      showManual:false
    })
    this.bottom();
  }
})