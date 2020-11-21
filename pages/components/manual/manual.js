// pages/components/article/detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    article: {
      id: 1,
      title: '使用说明',
      author: '一起听歌吧',
      post_date: '2020-11-19',
      content: [
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'node',
            name: 'img',
            attrs: {
              class: 'img_class',
              src: 'https://alang-srt.oss-cn-beijing.aliyuncs.com/home2.jpg'
            }
          }]
        },
        {
          name: 'h3',
          attrs: {
            class: 'h3_class',
          },
          children: [{
            type: 'text',
            text: '欢迎加群1029454474交流'
          }]
        }, 
        {
          name: 'h3',
          attrs: {
            class: 'h3_class',
          },
          children: [{
            type: 'text',
            text: '用户(以下命令在聊天框输入)'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '1.输入 “点歌 歌名” 即可点歌。例如：点歌 立秋，支持输入网易云音乐ID点歌。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '2.没有想要点的音乐？请点击<点歌图标>，如果知道歌单id，还可以在歌曲窗口直接加*搜索： *歌单id'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '3.不知道歌单id?,请依次点击-->点歌图标-->右下角歌单图标，提示：歌单页面可以搜索网易歌单、网易用户id的歌单、qq歌单、qq用户id的歌单'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '4.如点错歌曲可以长按播放队列相应歌曲即可删除，管理员可以使用歌曲id删除。 '
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '5.如遇不好听的歌可以输入 “投票切歌” 或者点击 <下一首>，默认当投票人数大于在线人数 30% 时将会切歌。管理员可以设置切歌率。 '
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '6.输入 “设置昵称 名字” 可以设置自己的显示昵称，仅限当前客户端有效。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '7.私聊：点击<用户头像>即可私聊相应用户，用户id即用户ip后面那一串字母，如ju2etxv2。 不知道用户id,试着点击<同道>按钮。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '8.倒计时退出房间 输入 “倒计时退出 1” 则将在1分钟后退出房间。取消倒计时退出：取消退出” '
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '9.如果有什么好的想法、建议或问题可以单项向管理员发送消息，（＾∀＾●）ﾉｼ “ @管理员 内容”, 空格隔开哦!'
          }]
        }, 
        {
          name: 'h3',
          attrs: {
            class: 'h3_class',
          },
          children: [{
            type: 'text',
            text: '管理员(以下命令在聊天框输入)'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '1.登录： “admin 123456” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '2.修改密码： “修改密码 654321” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '3.管理员公告 “公告 请文明聊天”。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '4.点赞模式（歌曲列表按点赞数排序）： “点赞模式” 退出则 “退出点赞模式” 。 '
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '5.随机模式（歌曲列表随机播放）： “随机模式” 退出则 “退出随机模式” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '6.修改投票切歌率： “投票切歌率 1” 数值在(0,1]。如：设置成0.5则表示房间人数一半赞同即可切歌。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '7.禁止切歌：“禁止切歌” 启用则“ 启用切歌” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '8.禁止点歌：“禁止点歌” 启用则 “启用点歌” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '9.清空列表：“清空列表” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '10.清空默认播放列表：“清空默认列表” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '11.设置默认播放列表（当点歌列表为空时，默认从此加载歌曲）：“设置默认列表 24381616,1” ，其中243881616和1分别都是歌单id'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '12.默认列表歌曲数：“默认列表歌曲数” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '13.置顶音乐： “置顶音乐 音乐id” 音乐id即歌曲列表中歌曲后面那一串字母，如411214279。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '14.拉黑音乐：“拉黑音乐 音乐id” 漂白则“漂白音乐 音乐id” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '15.音乐黑名单： “音乐黑名单” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '16.拉黑用户：“拉黑用户 用户id” 漂白则“漂白用户 用户id” 用户id即用户ip后面那一串字母，如ju2etxv2。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '17.用户黑名单： “用户黑名单” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '18.设置点歌人：“设置点歌人 用户id” 用户id即用户ip后面那一串字母，如ju2etxv2。取消则“取消点歌人 用户id” 。'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '19.设置切歌人：“设置切歌人 用户id” 用户id即用户ip后面那一串字母，如ju2etxv2。取消则“取消切歌人 用户id” 。'
          }]
        }
        
      ],
      views: 1000,
      votes: 100
     },
     info: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
