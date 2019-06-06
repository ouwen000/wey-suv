//index.js
//获取应用实例
const app = getApp();
var extra = require('extra.js');

Page({
  data: {
    scrollTop: 0,
    pageInfos: [],
    gender: [],
    provinces: [],
    citys: [],
    shops: [],
    shopsId: [],
    windowHeight: 0,
    windowWidth: 0,
    lawText: '',
    hideLawDesc: true,
    selGender: 0,
    selProv: 0,
    selCity: 0,
    selSsss: 0,

    // 下面是请求信息
    name: '',// 姓名
    phone: '',// 电话
    genderText: '请选择',// 性别
    provText: '请选择',// 省份
    cityText: '请选择',// 城市
    ssss: '请选择',// 经销商
    ssssid : "",// 经销商id
    apply: true,// 同意法律声明

    //  这个是拟滑块
    scrollindex: 0,  //当前页面的索引值
    totalnum: 4,  //总共页面数
    starty: 0,  //开始的位置x
    endy: 0, //结束的位置y
    critical: 100, //触发翻页的临界值
    margintop: 0,  //滑动下拉距离

    // 图片更新信息
    now:Date.now(),
    imgUrl:'https://wenfree.cn/api/Public/idfa_xianyu/?service=Wey.Img'
  },
  
  onLoad: function () {
    //第一时间读出图片信息
    console.log(this.data.imgUrl)
    var self = this;
    wx.request({
      url: this.data.imgUrl,
      method: 'get',
      success: function (res) {
        console.log("取到图片数据",res.data.data)
        self.setData({ pageInfos: res.data.data });
      },
      fail: function (err) {
        self.setData({ 
          pageInfos: extra.dataInfos,
        })
      }
    }),

    console.log('onload');
    var self = this;
    var sysInfo = wx.getSystemInfoSync();
    console.log(sysInfo);
    this.setData({ 
      gender: extra.gender, 
      windowHeight: sysInfo.windowHeight,
      windowWidth: sysInfo.windowWidth,
      lawText: extra.lawDesc
    });

    wx.request({
      url: extra.apiUrls[0],
      method: 'get',
      success: function(res){
        console.log("省", res);
        var provinces = [];
        for (var i in res.data) {
          provinces.push(res.data[i].sh_province);
        }
        self.setData({ provinces: provinces});
        wx.request({
          url: extra.apiUrls[1] + provinces[0],
          method: 'get',
          success: function(res){
            console.log("城市",res);
            var citys = [];
            for(var i in res.data){
              citys.push(res.data[i].sh_city);
            }
            self.setData({citys: citys});
            wx.request({
              url: extra.apiUrls[2] + citys[0],
              method: 'get',
              success: function(res){
                console.log("经销商",res);
                var shops = [];
                var shopsId = [];
                for (var i in res.data) {
                  shops.push(res.data[i].sh_serviceStoreName);
                  shopsId.push(res.data[i].sh_number);
                }
                self.setData({shops: shops});
                self.setData({shopsId: shopsId});
              },
              fail: function(err){
                wx.showToast({
                  title: '获取经销商信息失败！',
                  icon: 'none'
                });
              }
            });
          },
          fail: function(err){
            wx.showToast({
              title: '获取城市信息失败！',
              icon: 'none'
            });
          }
        });
      },
      fail: function(err){
        wx.showToast({
          title: '获取省份信息失败！',
          icon: 'none'
        });
      },
    });
    // 查询用ip
  },
  OnShowLawDesc: function(e){
    this.setData({ hideLawDesc: !this.data.hideLawDesc});
  },
  onInput: function(e){
    var name = e.target.dataset.name;
    var value = e.detail.value;
    this.setData({[name]: value});
    console.log(name, value);
  },
  onPick: function(e){
    var self = this;
    var name = e.target.dataset.name;
    var value = parseInt(e.detail.value);
    this.setData({ [name]: value });
    if(name=='selProv'){
      var key = this.data.provinces[value];
      this.setData({ selProv: value, provText: key});
      wx.request({
        url: extra.apiUrls[1] + key,
        method: 'get',
        success: function (res) {
          console.log(res);
          var citys = [];
          for (var i in res.data) {
            citys.push(res.data[i].sh_city);
          }
          self.setData({ citys: citys });
          wx.request({
            url: extra.apiUrls[2] + citys[0],
            method: 'get',
            success: function (res) {
              console.log(res);
              var shops = [];
              var shopsId = [];
              for (var i in res.data) {
                shops.push(res.data[i].sh_serviceStoreName);
                shopsId.push(res.data[i].sh_number);
              }
              self.setData({ shops: shops });
              self.setData({ shopsId: shopsId });
            },
            fail: function (err) {
              wx.showToast({
                title: '获取经销商信息失败！',
                icon: 'none'
              });
            }
          });
        },
        fail: function (err) {
          wx.showToast({
            title: '获取城市信息失败！',
            icon: 'none'
          });
        }
      });
    }
    if(name=='selCity'){
      this.setData({cityText: this.data.citys[value]});
      wx.request({
        url: extra.apiUrls[2] + this.data.citys[value],
        method: 'get',
        success: function (res) {
          console.log(res);
          var shops = [];
          var shopsId = [];
          for (var i in res.data) {
            shops.push(res.data[i].sh_serviceStoreName);
            shopsId.push(res.data[i].sh_number);
          }
          self.setData({ shops: shops });
          self.setData({ shopsId: shopsId });
        },
        fail: function (err) {
          wx.showToast({
            title: '获取经销商信息失败！',
            icon: 'none'
          });
        }
      });
    }
    if(name == 'selGender'){
      this.setData({ genderText: this.data.gender[value] });
    }
    if (name == 'selSsss') {
      console.log("--------------------------");
      console.log(value);
      this.setData({ ssss: this.data.shops[value] });
      this.setData({ ssssid: this.data.shopsId[value] });
    }
    console.log("c", e, name, value, this.data.ssssid);
  },
  onCheck: function(e){
    this.setData({apply: !this.data.apply});
    console.log('apply', this.data.apply);
  },
  onSubmit: function(e){
    var params = {
      ssss: this.data.ssssid,
      ssssname: this.data.ssss,
      name: this.data.name,
      phone: this.data.phone,
      gender: this.data.genderText,
      province: this.data.provText,
      city: this.data.cityText,
    };
    if(!this.data.apply){
      wx.showToast({
        title: '请您阅读并接受个人信息保护法律声明',
        icon: 'none',
        mask: true,
        duration: 2000,
      });
      return;
    }
    console.log(params);
    wx.request({
      url: 'https://wenfree.cn/api/Public/idfa_xianyu/?service=Wey.crm',// 请求的URL
      method: 'get',
      data: params,
      success: function(res){
        console.log("success",res);
        if (res.data.ret == 200 ){
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            mask: true,
            duration: 2000,
          });
        }else{
          console.log("success", "fail");
        }
      },
      fail: function(err){
        console.log("fail",err);
        wx.showToast({
          title: '提交失败',
          icon: 'fail',
          mask: true,
          duration: 2000,
        });
      },
      complete: function (res) {
        console.log("complete",res);
      },
    });
  },
 
  // 滚动到顶部
  onTop: function () {
    // 控制滚动
    wx.pageScrollTo({
      scrollTop: wx.getSystemInfoSync().windowHeight*2*0
    })
  },

  // 转发
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'WEYSUV预约试驾',
      path: '/pages/index/index',
      imageUrl: 'https://img.wenfree.cn/wey/share_img.jpg'
    }
  },

  // 初始位置
  scrollTouchstart: function (e) {
    console.log("scrollTouchstart")
    let py = e.touches[0].pageY;
    this.setData({
      starty: py
    })
  },
  // 滑动过程中
  scrollTouchmove: function (e) {
    console.log("scrollTouchmove")
    console.log("计算滑动")
    let py = e.touches[0].pageY;
    let d = this.data;
    console.log("py", py, "d", d);
    this.setData({
      endy: py,
    })
    if (py - d.starty < this.data.critical && py - d.starty > -this.data.critical) {
      this.setData({
        margintop: py - d.starty
      })
    }
  },
  // 滑动结束
  scrollTouchend: function (e) {
    console.log("scrollTouchend");
    let d = this.data;
    if (d.endy - d.starty > this.data.critical && d.scrollindex > 0) {
      console.log("向下翻页");
      this.setData({
        scrollindex: d.scrollindex - 1
      })
    } else if (d.endy - d.starty < -this.data.critical && d.scrollindex < this.data.totalnum - 1) {
      console.log("向上翻页");
      this.setData({
        scrollindex: d.scrollindex + 1
      })
    }
    this.setData({
      starty: 0,
      endy: 0,
      margintop: 0
    })
  },
  EventHandles : function(e){
    // console.log(e)
    if (e.detail.fullScreen == false){
      console.log("取消全屏");
      // 控制滚动
      wx.pageScrollTo({
        scrollTop: wx.getSystemInfoSync().windowHeight + 3
      })
    }
  },
  /**播放视屏 */
  play(e) {
    //执行全屏方法  
    var videoContext = wx.createVideoContext('myvideo', this);
    videoContext.requestFullScreen();
    this.setData({
      fullScreen: true
    })
  },
  /**关闭视屏 */
  closeVideo() {
    //执行退出全屏方法
    var videoContext = wx.createVideoContext('myvideo', this);
    videoContext.exitFullScreen();
  },
  /**视屏进入、退出全屏 */
  fullScreen(e) {
    var isFull = e.detail.fullScreen;
    //视屏全屏时显示加载video，非全屏时，不显示加载video
    this.setData({
      fullScreen: isFull
    })
  }

})
