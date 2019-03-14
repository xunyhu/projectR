Component({
  relations: {
    '../tab-panel/index': {
      type: 'child',
      linked(target) { },
      linkChanged(target) { },
      unlinked(target) { }
    }
  },
  properties: {
    Style: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    },
    tab: {
      type: Array,
      value: []
    }
  },
  data: {
    isLower: false,
    scrollLeft: 0,
    width: 0,
    ml: 0,
    lastLeft: 0,
    lastWidth: 0,
    initMl: 0,
    svWidth: 0,
    panelNodes: [],
    selectIndex: 0,
    tabIndex: 0
  },
  ready() {
    this.getAllPanel();
    this.initCal();
  },
  methods: {
    /**
     * @desc 获取子组件tab-panel,用来生成tab
     */
    getAllPanel() {
      const {
        value
      } = this.data;
      const ttab = [];
      const panelNodes = this.getRelationNodes('../tab-panel/index');

      this.setData({
        panelNodes
      });
      panelNodes.map((item, i) => {
        const {
          data: {
            label,
            name
          }
        } = item;
        if (value === name) this.setData({
          selectIndex: i
        });
        ttab.push({
          text: label
        });
      });
      this.setData({
        tab: ttab
      });
    },
    /**
     * @desc 初始化tab及一些元素的计算
     */
    initCal() {
      wx.createSelectorQuery()
        .in(this)
        .selectAll('.tab-item')
        .boundingClientRect(rects => {
          const {
            tab
          } = this.data;
          tab.map((item, i) => {
            if (i === tab.length - 1) {
              this.setData({
                lastLeft: rects[i].left,
                lastWidth: rects[i].width
              });
            }
            item.left = rects[i].left;
          });

          this.setData({
            tab
          });
        })
        // 设置第一个tab元素的left
        .select('.first')
        .boundingClientRect(rect => {
          this.setData({
            initMl: rect.left
          });
        })
        // 获取tab外层滚动的view的宽度
        .select('.scroll-view')
        .boundingClientRect(rect => {
          this.setData({
            svWidth: rect.width
          });
          const {
            selectIndex,
            tab
          } = this.data;
          this.changeTabFun(selectIndex, tab[selectIndex].left);
        })
        .exec();
    },
    /**
     * @desc 绑定滚动，判断是否滚动到最右侧来显示渐变蒙版
     */
    bindscroll({
      detail: {
        scrollLeft
      }
    }) {
      const {
        svWidth,
        initMl,
        lastLeft,
        lastWidth
      } = this.data;
      const l = Math.floor(lastLeft - svWidth + lastWidth - initMl);
      if (scrollLeft >= l - 1) {
        this.setData({
          isLower: true
        });
      } else {
        this.setData({
          isLower: false
        });
      }
    },
    /**
     * @desc 切换tab事件
     */
    changeTab({
      currentTarget: {
        dataset: {
          index,
          left
        }
      }
    }) {
      if (this.data.tabIndex === index) return;
      this.changeTabFun(index, left);
    },
    /**
     * @desc 切换tab事件，计算scroll-view显示位置
     */
    changeTabFun(index, left) {
      const {
        tab,
        initMl,
        svWidth,
        panelNodes
      } = this.data;
      tab.map((item, i) => (item.active = i === index));

      this.setData({
        tab,
        tabIndex: index
      });
      wx.createSelectorQuery()
        .in(this)
        .select('.active')
        .boundingClientRect(rect => {
          // 计算scrollleft
          const sc = left - (svWidth - rect.width) / 2 - initMl;
          this.setData({
            width: rect.width,
            scrollLeft: sc
          });
          // 延迟底部横线切换效果
          setTimeout(() => {
            this.setData({
              ml: left - initMl
            });
          }, 80);
        })
        .exec();

      panelNodes.map((item, i) => {
        item.setData({
          isShow: index === i
        });
      });

      this.triggerEvent('changeTab', {
        name: panelNodes[index].data.name
      });
    }
  }
})