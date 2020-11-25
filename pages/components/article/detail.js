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
      title: '我的灵魂自习室之青山湾',
      author: '灵魂自习室',
      post_date: '2019-01-10',
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
              src: 'https://alang-srt.oss-cn-beijing.aliyuncs.com/home3.jpg'
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
            text: '青山湾的声音'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '记得学生时代,每一次难过的时候,都会独自一人,跑到家附近的青山湾闲逛,听听大海的声音,此音乐背景就是我录制青山湾海浪的声音.'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '青山湾有时有种莫名的神秘感,感觉她深邃的内心藏着无数的秘密.有时又感觉她是个胸怀宽广的人,静静的倾听着每个人的心声.青山湾于我,就是灵魂的自习室.在这边我听了一遍又一遍:爱的代价,在这边我为成功笑过,为失败哭过.之前看过王小波的文集,灵魂只能独行,也许每个人就是在世间寻找着另一颗孤独的心.'
          }]
        }, 
        {
          name: 'p',
          attrs: {
            class: 'p_class'
          },
          children: [{
            type: 'text',
            text: '在我未找到之前,我需要为自己创建一个灵魂的自习室.我可以在这里三省吾身,畅想未来.听着青山湾的声音,心中的信念,此前的种种,一一浮现.余生还很长,让我在这灵魂自习室,每天进步一点，水滴石穿，成为有趣的灵魂,永远年轻!永远热泪盈眶!'
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
