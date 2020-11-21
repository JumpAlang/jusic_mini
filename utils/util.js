const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
export let randomUtils = {
  randomWord: {},
  randomNumBoth: {}
};

  /*
   ** randomWord 产生任意长度随机字母数字组合
   ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
   ** xuanfeng 2014-08-28
   */
  randomUtils.randomWord=function(randomFlag, min, max) {
    let str = "",
      range = min,
      pos = 0,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < range; i++) {
      pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  };
  randomUtils.randomNumBoth=function(Min, Max) {
    let Range = Max - Min;
    let Rand = Math.random();
    let num = Min + Math.round(Rand * Range); //四舍五入
    return num;
  };

/**
 * 发送消息工具集
 *
 * @type {{parseInstruction: {}, parseContent: {}}}
 */
export let sendUtils = {
  parseInstruction: {},
  parseContent: {}
};

/**
 * 解析指令
 *
 * @param message 准备发送的消息
 * @returns {String} instruction
 */
sendUtils.parseInstruction = function (message) {
  if (message === null || message === '' || message.length === 0) {
    return ''
  }
  let strings = message.trim().split(/\s+/);
  return strings.length > 0 ? strings[0] : ''
};

/**
 * 解析内容
 *
 * @param instruction
 * @param message
 * @returns {string}
 */
sendUtils.parseContent = function (instruction, message) {
  if (message === null || message === '' || message.length === 0) {
    return ''
  }
  let replace = message.replace(instruction, '');
  return replace.length > 0 ?
    replace.replace(/(^\s*)/g, '') : '';
};

/**
 * 解析来自服务端的消息
 *
 * @type {{messageType: {MUSIC: string, NOTICE: string, PICK: string, AUTH: string, CHAT: string, SETTING_NAME: string}, parseMessageType: {}}}
 */
export let messageUtils = {
  messageType: {
    NOTICE: 'NOTICE',
    ONLINE: 'ONLINE',
    CHAT: 'CHAT',
    PICK: 'PICK',
    MUSIC: 'MUSIC',
    SETTING_NAME: 'SETTING_NAME',
    AUTH: 'AUTH',
    AUTH_ROOT: 'AUTH_ROOT',
    AUTH_ADMIN: 'AUTH_ADMIN',
    SEARCH: 'SEARCH',
    SEARCH_PICTURE: 'SEARCH_PICTURE',
    VOLUMN: 'VOLUMN',
    GOODMODEL: 'GOODMODEL',
    SEARCH_HOUSE: 'SEARCH_HOUSE',
    ENTER_HOUSE: "ENTER_HOUSE",
    ENTER_HOUSE_START: "ENTER_HOUSE_START",
    ADD_HOUSE: "ADD_HOUSE",
    ADD_HOUSE_START: "ADD_HOUSE_START",
    SEARCH_SONGLIST: "SEARCH_SONGLIST",
    SEARCH_USER: "SEARCH_USER",
    ANNOUNCEMENT: "ANNOUNCEMENT",
    HOUSE_USER: "HOUSE_USER"

  },
  isKnowMessageType: {},
  parseMessageType: {},
  parseMessageContent: {}
};

/**
 * 解析消息类型
 *
 * @param source 消息源串
 * @returns {string|any}
 */
messageUtils.parseMessageType = function (source) {
  if (source === null || source === '' || source.length === 0) {
    return ''
  }
  source = source.substring(3, source.length - 2);
  // console.log("typeparse", source);
  let strings = source.split('\\n');
  return strings.length > 0 ? strings[0] : ''
};

/**
 * 是否已知类型消息
 *
 * @returns {string|boolean}
 */
messageUtils.isKnowMessageType = function (source) {
  try {
    if (source === null || source === '' || source.length === 0) {
      return ''
    }
    source = source.substring(3, source.length - 2);
    let strings = source.split('\\n'),
      type = strings.length > 0 ? strings[0] : '';
    console.log("type", type);
    return type === '' ? '' : Object.keys(messageUtils.messageType).includes(type) ? type : ''
  } catch (err) {
    return ''
  }

};

/**
 * 解析消息内容
 *
 * @param source 消息源串
 * @returns {string} json
 */
messageUtils.parseMessageContent = function (source) {
  if (source === null || source === '' || source.length === 0) {
    return ''
  }
  let index = source.indexOf("{\\\"code");
  if (index == -1) {
    return '';
  }
  source = source.substring(index, source.length - 2);
  // console.log(source);
  // console.log("json",source);
  // let strings = source.split('\n');
  // console.log("content-1",strings);

  // console.log("content0",strings[strings.length-1]);
  source = source.replace(/\\\\\\"/g, '');
  source = source.replace(/\\\\n/g, '\\n');
  source = source.replace(/\\"/g, '"');
  console.log("content", source);
  let json = JSON.parse(source);
  // console.log("json",json);
  return json; //strings.length > 0 ? JSON.parse(strings[strings.length - 1].replace(/\\/g,'')) : '';
};

/**
 * 时间工具
 *
 * @type {{secondsToHH_mm_ss: {}}}
 */
export let timeUtils = {
  secondsToHH_mm_ss: {},
  secondsToHH_mm_ss_cs: {},
  secondsToYYYY_HH_mm_ss: {}
};

/**
 * 秒钟转时分秒
 * 60 -> 00:01:00
 *
 * @param seconds 要转换的秒数
 * @returns {string} 字符串类型的时间 HH:mm:ss
 */
timeUtils.secondsToHH_mm_ss = function (seconds) {
  let timeStr = '';
  let stringFormat = (i) => {
    return i < 10 ? `0${parseInt(i)}` : `${parseInt(i)}`;
  };
  let minuteTime = 0;
  let secondTime = 0;
  let hourTime = 0;
  if (seconds < 60) {
    timeStr = `00:${stringFormat(seconds)}`
  } else if (seconds >= 60 && seconds < 3600) {
    minuteTime = parseInt(seconds / 60);
    secondTime = seconds % 60;
    timeStr = `${stringFormat(minuteTime)}:${stringFormat(secondTime)}`;
  } else if (seconds >= 3600) {
    let _t = parseInt(seconds % 3600);
    hourTime = parseInt(seconds / 3600);
    minuteTime = parseInt(_t / 60);
    secondTime = parseInt(_t % 60);
    timeStr = `${stringFormat(hourTime)}:${stringFormat(minuteTime)}:${stringFormat(secondTime)}`
  }
  return timeStr;
};

timeUtils.secondsToYYYY_HH_mm_ss = function (seconds) {
  let date;
  if(seconds){
    date = new Date(seconds);
  }else{
    date  = new Date();
  }
  return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

};

/**
 * 时分秒厘秒
 * 00:06.45 / 02:54.41
 *
 * @param seconds
 * @returns {string}
 */
timeUtils.secondsToHH_mm_ss_cs = function (seconds) {
  let timeStr = '';
  let stringFormat = (i) => {
    return i < 10 ? `0${parseInt(i)}` : `${parseInt(i)}`;
  };
  let minuteTime = 0;
  let secondTime = 0;
  let centisecond = 0;
  let hourTime = 0;
  if (seconds < 60) {
    centisecond = Number(String(Math.floor(seconds * 100) / 100).replace(/\d+\./, ''));
    timeStr = `00:${stringFormat(seconds)}.${centisecond}`
  } else if (seconds >= 60 && seconds < 3600) {
    minuteTime = parseInt(seconds / 60);
    centisecond = Number(String(Math.floor(seconds * 100) / 100).replace(/\d+\./, ''));
    secondTime = parseInt(seconds % 60);
    timeStr = `${stringFormat(minuteTime)}:${stringFormat(secondTime)}.${centisecond}`;
  } else if (seconds >= 3600) {
    let _t = parseInt(seconds % 3600);
    hourTime = parseInt(seconds / 3600);
    minuteTime = parseInt(_t / 60);
    centisecond = Number(String(Math.floor(seconds * 100) / 100).replace(/\d+\./, ''));
    secondTime = parseInt(_t % 60);
    timeStr = `${stringFormat(hourTime)}:${stringFormat(minuteTime)}:${stringFormat(secondTime)}.${centisecond}`
  }
  return timeStr;
};


export let musicUtils = {
  parseLyric: {}
};

/**
 * 歌词参考 Akkariin Meiko
 *
 * @param text
 */
musicUtils.parseLyric = function (text) {
  let lyrics = text.split("\n");
  let result = {};
  for (let i = 0; i < lyrics.length; i++) {
    let lyric = decodeURIComponent(lyrics[i]);
    let timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
    let timeRegExpArr = lyric.match(timeReg);
    if (!timeRegExpArr) continue;
    let clause = lyric.replace(timeReg, '');
    for (let k = 0, h = timeRegExpArr.length; k < h; k++) {
      let t = timeRegExpArr[k];
      let min = Number(String(t.match(/\[\d*/i)).slice(1)),
        sec = Number(String(t.match(/\:\d*/i)).slice(1));
      let time = min * 60 + sec;
      result[time] = clause;
    }
  }
  let i;
  for (i = 0; i < result.length; i++) {
    if (result[i] === '') {
      result.splice(i, 1);
    }
  }
  return result;
};

module.exports = {
  formatTime: formatTime,
  randomNum: randomNum,
  sendUtils: sendUtils,
  messageUtils: messageUtils,
  timeUtils: timeUtils,
  musicUtils: musicUtils,
  randomUtils:randomUtils
}