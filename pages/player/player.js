const origin = getApp();
const app = origin.globalData
const song = require('../../utils/song.js')
const Lyric = require('../../utils/lyric.js')
const util = require('../../utils/util.js')

const SEQUENCE_MODE = 1
const RANDOM_MOD = 2
const SINGLE_CYCLE_MOD = 3

Page({
  onShareAppMessage: function() {
    return {
        title: this.data.currentSong?'来和我一起听：'+this.data.currentSong.name+'-'+this.data.currentSong.artist:'选个房间一起听歌吧',
        imageUrl: this.data.currentSong?this.data.currentSong.pictureUrl:'',
        path: "/pages/player/player?houseId=" + this.data.houseId+"&housePwd="+this.data.housePwd
    };
  },
  onShareTimeline: function() {
    return {
      title: this.data.currentSong?'来和我一起听：'+this.data.currentSong.name+'-'+this.data.currentSong.artist:'来和我一起听歌吧',
      imageUrl: this.data.currentSong?this.data.currentSong.pictureUrl:'',
      path: "/pages/player/player?houseId=" + this.data.houseId+"&housePwd="+this.data.housePwd
    };
  },
  data: {
    isShowConfirm:false,
    inputPwd:'',
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
    housePwd:'',
    connectType:'enter',
    httpFirstUrl:'https://tx.alang.run/api/',//'http://www.alang.run:8080/',//
    wsFirstUrl:'wss://tx.alang.run/wss/',//'wss://www.alang.run/wss/',//
    wsLastUrl:'/websocket',
    wsurl:'',//'ws://www.alang.run/wss/433/11lyjuu3/websocket', //连接IP
    chatList: [], //聊天记录
    disabled: true,
    manage:null,
    showHouses:true,
    houseList:[],
    currentHouse:{name:'一起听歌吧'}
  },
  onLoad: function(option) {
    if(option.houseId){
      this.setData({showHouses:false,houseId:option.houseId,housePwd:option.housePwd,connectType:option.connectType});
      this.connectSocket();
    }else{
      this.getHouseList();
    }
  } , 
  getHouses(){
    this.getHouseList();
    this.setData({showHouses:true});
  },
  getHouseList:function(){
    wx.setNavigationBarTitle({
      title: '听歌房'
    })
    let that = this;
    origin.post(this.data.httpFirstUrl+'house/search' , {} , function(res){
        that.setData({houseList:res});
		});
  },
  reconnectSocket(){
		origin.openConnect(this.data.wsurl , this.data.houseId,this.data.housePwd,"enter",this.socketReceiver,this);
  },
  connectSocket(){
    let number = this.randomNumBoth(100,1000000);
    let numberWord = this.randomWord(false,8);
    this.data.wsurl = this.data.wsFirstUrl + number+"/"+numberWord+ this.data.wsLastUrl;
    console.log(this.data.wsurl);
		origin.openConnect(this.data.wsurl , this.data.houseId,this.data.housePwd,this.data.connectType,this.socketReceiver,this);
 
  },
  socketReceiver : function(e) {
   console.log("返回结果",e);
   let type;
   if (type = util.messageUtils.isKnowMessageType(e.data)) {
     let messageType = type;//messageUtils.parseMessageType(res.data);
     console.log(messageType);

     let messageContent = util.messageUtils.parseMessageContent(e.data);
     console.log(messageContent);
     switch (messageType) {
      case util.messageUtils.messageType.PICK:
        if (messageContent.message == "goodlist") {
          console.log("点赞列表");
        }
       this.setData({songslist:messageContent.data});
        break;
      case util.messageUtils.messageType.MUSIC:
          // this.lastLyric="";
          // this.$store.commit("setPlayerLyric", "");
          // this.firstLoaded = 0;
          messageContent.data.duration = messageContent.data.duration/1000;
          this.setData({currentSong:messageContent.data});
          if (
            messageContent.data.lyric === undefined ||
            typeof messageContent.data.lyric === "undefined" ||
            messageContent.data.lyric === null ||
            messageContent.data.lyric === ""
          ) {
            this.setData({currentLyric:new Lyric('')})
          } else {
            const lyric = this._normalizeLyric(messageContent.data.lyric);
            // console.log("lyric",lyric);
            const currentLyric = new Lyric(lyric)
            this.setData({currentLyric:currentLyric});
          }
          this.setData({duration:this._formatTime(this.data.currentSong.duration)});
          this._createAudio();

          break;
      case util.messageUtils.messageType.NOTICE:
            if (
              messageContent.message !== undefined &&
              typeof messageContent.message !== "undefined" &&
              messageContent.message !== null &&
              messageContent.message !== ""
            ) {
              wx.showToast({
                icon : 'none' , 
                mask : true , 
                title : messageContent.message , 
              })
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
              if (Number(messageContent.code) === 20000) {
              //  this.setData({showHouses:false});
              } else {
                this.getHouseList();
              }
              wx.showToast({
                icon : 'none' , 
                mask : true , 
                title : messageContent.message , 
              })
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

  //初始化
  _init: function () {
  },


  getUid() {
    let _uid = JSON.parse(JSON.stringify(this.data.uid))
    if (_uid) {
      return _uid
    }
    if (!_uid) {
      const t = (new Date()).getUTCMilliseconds()
      _uid = '' + Math.round(2147483647 * Math.random()) * t % 1e10
    }
    return _uid
  },
/*
** randomWord 产生任意长度随机字母数字组合
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
** xuanfeng 2014-08-28
*/
 randomWord(randomFlag, min, max){
  let str = "",
    range = min,
    pos = 0,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  // 随机产生
  if(randomFlag){
    range = Math.round(Math.random() * (max-min)) + min;
  }
  for(let i=0; i<range; i++){
    pos = Math.round(Math.random() * (arr.length-1));
    str += arr[pos];
  }
  return str;
},
 randomNumBoth(Min,Max){
  let Range = Max - Min;
  let Rand = Math.random();
  let num = Min + Math.round(Rand * Range); //四舍五入
  return num;
},
  // 创建播放器
  _createAudio: function (playUrl) {
    wx.hideLoading();
    wx.showLoading({
      title: '加载中',
    })
    console.log("封面", this.data.currentSong.pictureUrl);
    if(!this.manage){
      this.manage = wx.getBackgroundAudioManager();
    }
    this.manage.src = playUrl||this.data.currentSong.url;
    console.log("歌曲链接",playUrl||this.data.currentSong.url);
    this.manage.title = this.data.currentSong.name;
    this.manage.epname = this.data.currentSong.album.nam;
    this.manage.singer = this.data.currentSong.artist;
    this.manage.coverImgUrl = this.data.currentSong.pictureUrl;
    if(this.data.currentSong.pushTime){
      this.manage.startTime = (Date.now() - this.data.currentSong.pushTime) / 1000
    }
    this.manage.onError(() =>{
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
      console.log("错误播放");
    })
    this.manage.onCanplay((e)=>{
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
     console.log("我能播放了",e)
    });
    this.manage.onPlay(()=>{
      this.setData({
        playIcon: 'icon-pause',
        cdCls: 'play'
      })
    });
   
    this.manage.onPause(()=>{
      this.setData({
        playIcon: 'icon-play',
        cdCls: 'pause'
      })
    })

    this.manage.onStop(()=>{
      console.log("我停止了");
    })
    this.manage.onWaiting(()=>{
     console.log("等待缓存。。。");
    });
    this.manage.onSeeking(()=>{
      console.log("监听背景音频开始跳转操作事件")
    })
    this.manage.onSeeked(()=>{
      console.log("监听背景音频完成跳转操作事件")
    })
    // 监听播放拿取播放进度
    this.manage.onTimeUpdate(() => {
      const currentTime = this.manage.currentTime
      this.setData({
        currentTime: this._formatTime(currentTime),
        percent: currentTime / this.data.currentSong.duration
      })
      if (this.data.currentLyric) {
        this.handleLyric(currentTime * 1000)
      }
    })
  },
  // 去掉歌词中的转义字符
  _normalizeLyric: function (lyric) {
    return lyric.replace(/&#58;/g, ':').replace(/&#10;/g, '\n').replace(/&#46;/g, '.').replace(/&#32;/g, ' ').replace(/&#45;/g, '-').replace(/&#40;/g, '(').replace(/&#41;/g, ')').replace(/r?n\[/g,"\n[");
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
   this.sendMsg("/music/skip/vote",null);

    // app.currentIndex = this.getNextIndex(true)
    // this._init()
  },
  sendMsg:function(url,data){
    let msg = this.constructMsgData(url,data);
    console.log(msg);

    origin.sendArrayMsg(msg);
  },
  constructMsgData:function(url,data){
    let  dataStr = "[object Object]";
    if(data){
      dataStr = JSON.stringify(data);
    }
    return "SEND\ndestination:"+url+"\n\n"+dataStr+"\u0000";
  },
  getTime : function(){
		var myDate = new Date();
		return myDate.toLocaleString();
	} , 
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
    if(this.manage.paused){
      this.manage.play();
    }else{
      this.manage.pause();
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
    console.log("songlist",this.data.songslist);
    if (!this.data.songslist.length) {
      return
    }
    this.setData({
      translateCls: 'uptranslate'
    })
  },
  close: function () {
    this.setData({
      translateCls: 'downtranslate'
    })
  },
  playthis: function (e) {
    const id = e.currentTarget.dataset.id;
    this.sendMsg('/music/good/'+id,null);
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
    if(data.needPwd){
      this.setData({
        isShowConfirm: true,
        currentHouse: data
      })
    }else{
      wx.setNavigationBarTitle({
        title: data.name
      })
      this.setData({houseId:data.id,connectType:"enter",showHouses:false});

      if(!this.data.disabled){
        this.sendMsg("/house/enter",{id:data.id});
      }else{
        this.connectSocket();
      }
    }
  },
  setValue: function (e) {
    this.setData({
      inputPwd: e.detail.value
    })
  },
  cancel: function () {
    this.setData({
      isShowConfirm: false,
    })
  },
  confirmAcceptance:function(){
   if(!this.data.inputPwd){
    wx.showToast({
      icon : 'none' , 
      // mask : true , 
      title : '密码不能为空', 
    })
   }else{
     this.enterHouse();
   }
  },
  enterHouse:function(){
    let that = this;
    origin.post(this.data.httpFirstUrl+'house/enter' , {id:this.data.currentHouse.id,password:this.data.inputPwd} , function(res){
      wx.setNavigationBarTitle({
        title: that.data.currentHouse.name
      })
        that.setData({isShowConfirm:false,houseId:that.data.currentHouse.id,housePwd:that.data.inputPwd,connectType:"enter",showHouses:false});
        if(that.data.disabled){
          that.connectSocket();
        }else{
          that.sendMsg("/house/enter",{id:that.data.currentHouse.id,password:that.data.inputPwd});
        }
		});
  },
})