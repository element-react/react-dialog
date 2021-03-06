import React from 'react';
import anim from 'css-animation';
import globalConfig from './globalConfig';
import PropTypes from 'prop-types';
import Overlay from './overlay';
import './index.less';
import { closeSvg, isPlainObject, isNumber, noop, closest } from './utils';
import classnames from 'classnames';

// 是个缓存，缓存所有dialog的instance
export const dialogInstanceCache = [];
// window.dialogInstanceCache = dialogInstanceCache;
export default class Dialog extends React.PureComponent {
  constructor (props) {
    super(props);
    this.dialogRef = null;
    this.dialogMainRef = null;
    dialogInstanceCache.push(this);
    this.handleClickDialog = this.handleClickDialog.bind(this);
    this.state = {
      zeroOpacity: false
    };
  }
  
  get dialogPos () {
    if (this.dialogRef) {
      const rect = window.getComputedStyle(this.dialogRef);
      return rect.position;
    }
  }


  componentDidMount () {
    this.startTimer();
    this.initZeroOpacity();
    // 组件挂载后调用直接重新计算位置 -- 因为首次获取styles的时候组件并没有挂载，所以必须要在组件挂载后强制更新一次
    this.setMainStyles();
    this.setPos();
    setTimeout(() => {
      this.initAni().then(() => {
        if (this.props.hidden) {
          this.props.onHide();
        } else {
          this.props.onShow();
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    const { hidden } = this.props;
    if (prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.position !== this.props.position ) {
      this.setMainStyles();
      this.setPos();
    }

    if (prevProps.hidden !== hidden) {
      if (!hidden) {
        this.setMainStyles();
        this.setPos();
      }
      this.initAni()
        .then(() => {
          if (hidden) {
            this.props.onHide();
          } else {
            this.props.onShow();
          }
        });
    }
    // 模态属性改变，或者显示隐藏改变则需要修改zeroOpacity
    if (prevProps.hidden !== hidden || prevProps.modal !== this.props.modal ||
      prevProps.zIndex !== this.props.zIndex || prevProps.modalIndex !== this.props.zIndex) {
      this.initZeroOpacity();
    }
  }

  initAni () {
    return new Promise((resolve, reject) => {
      const { animate, hidden } = this.props;
      if (!this.dialogHiddenRef) {
        return resolve();
      }
      if (!hidden) {
        Object.assign(this.dialogHiddenRef.style, this.hiddenStyles);
      }
      if (animate) {
        let cls = '';
        if (typeof animate === 'string') {
          cls = `${animate}-${hidden ? 'leave' : 'enter'}`; 
        } else {
          cls = `m-dialog-ani-${hidden ? 'leave' : 'enter'}-${animate}`;
        }
        return anim(this.dialogRef, cls, () => {
          if (this.dialogHiddenRef && hidden) {
            Object.assign(this.dialogHiddenRef.style, this.hiddenStyles);
          }
          resolve();
        });
      }
      resolve();
    });
  }

  componentWillUnmount () {
    this.endTimer();
    // 下一个时间片段
    setTimeout(() => {
      if (this.__closeRet) {
        this.props.onClose(this.__closeRet);
      } else {
        this.props.onClose();
      }
      const index = dialogInstanceCache.findIndex(cur => cur.props.id === this.props.id);
      if (index > -1) {
        dialogInstanceCache.splice(index, 1);
      }
      this.initZeroOpacity();
    });
  }
  startTimer () {
    if (this.props.timeout) {
      this._timer = setTimeout(() => {
        this.props.close();
      }, this.props.timeout);
    }
  }
  endTimer () {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  // mount之后再调用
  setPos () {
    // 根据宽高计算对话框坐标
    const	posReg = {
      l: /l/i,
      t: /t/i,
      r: /r/i,
      b: /b/i,
      c: /c/i
    };
    const blank = {
      left: '',
      top: '',
      bottom: '',
      right: '',
      marginTop: '',
      marginLeft: ''
    };
    // 当前是隐藏状态，不显示
    let pos = this.props.position;
    let dialogDom = this.dialogRef;
    if (!dialogDom) {
      return {};
    }
    let position = {};
    if (typeof pos === 'function') {
      position = pos.call(this);
      if (isPlainObject(position)) {
        position = {
          ...blank,
          ...position
        };
      }
      Object.assign(dialogDom.style, position);
      return position;
    }
    let rect = dialogDom.getBoundingClientRect();
    // 没有宽度就不定位
    if (rect.width === 0) {
      return {};
    }
    let width = rect.width;
    let height = rect.height;
    let fixed = this.dialogPos === 'fixed';
    let	win = window;
    let	scrollFix = [
      Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
      Math.max(document.documentElement.scrollTop, document.body.scrollTop)];
    // left,top,right,bottom
    let	workArea = [0, 0, win.innerWidth, win.innerHeight];
    // 计算预置的X、Y坐标
    let	X = {
      left: (function () { /* 左 */
        return fixed ? {
          left: 0
        } : {
          left: workArea[0] + scrollFix[0] + 'px'
        };
      })(),
      center: (function () { /* 中 */
        return fixed ? {
          left: '50%',
          marginLeft: '-' + width / 2 + 'px'
        } : {
          left: Math.floor((workArea[2] + workArea[0] - width) / 2) + scrollFix[0] + 'px'
        };
      })(),
      right: (function () { /* 右 */
        return fixed ? {
          right: 0
        } : {
          left: (workArea[2] - width + scrollFix[0]) + 'px'
        };
      })()
    };
    let	Y = {
      top: (function () { /* 上 */
        return fixed ? {
          top: 0
        } : {
          top: workArea[1] + scrollFix[1] + 'px'
        };
      })(),
      center: (function () { /* 中 */
        let top = Math.floor((workArea[3] + workArea[1] - height) / 2) + scrollFix[1];
        // 溢出屏幕的距离
        let	overflowH = top < 0 ? Math.abs(top) : 0;
        return fixed ? {
          top: '50%',
          marginTop: '-' + (height / 2 - overflowH) + 'px'
        } : {
          top: overflowH ? 0 : top + 'px'
        };
      })(),
      bottom: (function () { /* 下 */
        return fixed ? {
          bottom: 0
        } : {
          top: Math.max(0, workArea[3] - height + scrollFix[1]) + 'px'
        };
      })()
    };
    // 按照配置类型进行分别计算
    switch (pos.constructor) {
    case String: // 检测配置，转化为数字类型处理
      var r = posReg;
      pos = pos.length === 1 ? pos + 'c' : pos;
      pos = r.t.test(pos) ? r.l.test(pos) ? 1 : r.r.test(pos) ? 3 : 2 :
        r.b.test(pos) ? r.l.test(pos) ? 7 : r.r.test(pos) ? 5 : 6 :
          r.c.test(pos) ? r.l.test(pos) ? 8 : r.r.test(pos) ? 4 : 0 : 0;
      // 没有break，为的是进入下个流程当作数字处理
    case Number:
      if (pos < 0 || pos > 8) {
        break;
      }
      // 计算预设的九个点
      var arr = [
        [X.center, Y.center],
        [X.left, Y.top],
        [X.center, Y.top],
        [X.right, Y.top],
        [X.right, Y.center],
        [X.right, Y.bottom],
        [X.center, Y.bottom],
        [X.left, Y.bottom],
        [X.left, Y.center]
      ];
      // 将CSS配置扩展到一起
      position = Object.assign(position, arr[pos][0], arr[pos][1]);
      break;
    case Array:
      position.left = pos[0] === 0 ? 0 : (pos[0] || '');
      position.top = pos[1] === 0 ? 0 : (pos[1] || '');
      break;
    default: // 否则认为是自定义CSS对象
      position = Object.assign({}, pos || {});
      break;
    }
    // 删除无效的设置或默认的保留字
    ['left', 'right', 'top', 'bottom'].forEach(function (key, i) {
      let val = position[key];
      let	keepValue = ['auto', 'c', 'center'];
      if (key in position && (val ? keepValue.indexOf(val) >= 0 : val !== 0)) {
        delete position[key];
      }
    });
    // 没有提供的位置信息，默认都居中处理
    if (!('left' in position) && !('right' in position)) {
      Object.assign(position, X.center);
    }
    if (!('top' in position) && !('bottom' in position)) {
      Object.assign(position, Y.center);
    }
    position = {
      ...blank,
      ...position
    };
    Object.assign(dialogDom.style, position);
    return position;
  }
  setMainStyles () {
    const res = {
      width: this.convertSize(this.props.width),
      height: this.convertSize(this.props.height)
    };
    if (this.dialogMainRef) {
      this.dialogMainRef.style.width = res.width;
      this.dialogMainRef.style.height = res.height;
    }
  }
  // 获取dialog的样式
  get dialogstyles () {
    let styles = {};
    styles = {
      ...styles,
      zIndex: this.props.zIndex
    };
    return styles;
  }
  get hiddenStyles () {
    if (this.props.hidden) {
      return {
        position: 'relative',
        left: '-9999px',
        top: '-9999px',
        visibility: 'hidden'
      };
    }
    return {
      position: 'static',
      left: 'auto',
      top: 'auto',
      visibility: 'visible'
    };
  }
  convertSize (size) {
    let res;
    // 整数的情况下认为是px为单位，如果是个字符串就认为是别的单位
    if (isNumber.test(size)) {
      let w = parseInt(size, 10);
      if (w === 0) {
        res = 'auto';
      } else if (w > 0) {
        res = w + 'px';
      }
    } else {
      res = this.height;
    }
    return res;
  }
  renderHeader () {
    const title = this.props.title;
    const prefixCls = this.props.prefixCls;
    if (title !== null && title!== undefined) {
      return <div className={`${prefixCls}-header`}>
        <div>{title || ''}</div>
        {this.props.closeIcon ? <div className={`${prefixCls}-close`} onClick={this.props.close}><em>{this.props.closeIcon}</em></div> : null}
      </div>;
    }
  }
  renderFooter () {
    const button = this.props.button;
    const getBtnRetId = Dialog.globalConfig.getBtnRetId;
    const prefixCls = this.props.prefixCls;
    if (button && button.length) {
      const size = button.length;
      return <div className={`${prefixCls}-footer`}> {
        button.map((cur, index) => <a className={`${prefixCls}-btn`} key={index} data-action={getBtnRetId(index, size)}><span>{cur}</span></a>)
      }
      </div>;
    }
  }
  renderContent () {
    const content = this.props.content;
    const prefixCls = this.props.prefixCls;
    if (content) {
      return <div className={`${prefixCls}-body`} ref={ele => this.dialogMainRef = ele}>
        <div className={`${prefixCls}-main`}>{content}{this.props.children}</div>
      </div>;
    }
  }
  handleClickDialog (e) {
    const res = closest(e.target, '[data-action]', true);
    if (res) {
      const action = res.getAttribute('data-action');
      const ret = res.getAttribute('data-ret');
      const clickRes = this.props.onBtnClick(action);
      if (!clickRes || clickRes.every(cur => cur !== false)) {
        if (ret) {
          this.__closeRet = ret;
        }
        this.props.close();
      }
    }
  }
  initZeroOpacity () {
    const l = dialogInstanceCache.length;
    let isHaveOverlay = false;
    // 倒序循环
    for (let i = l - 1; i >=0; i-- ) {
      const instance = dialogInstanceCache[i];
      const { hidden, modal} = instance.props;
      if (!hidden && modal) {
        if (!isHaveOverlay) {
          isHaveOverlay = true;
          if (instance.state.zeroOpacity) {
            instance.setState({
              zeroOpacity: false
            });
          }
        } else {
          if (!instance.state.zeroOpacity) {
            instance.setState({
              zeroOpacity: true
            });
          }
        }
      }
    }
    return false;
  }
  render() {
    const className = classnames(this.props.className, this.props.css, this.props.prefixCls);
    return <div ref={ele => this.dialogHiddenRef = ele}>
      <div className={className} style={this.dialogstyles}
        ref={ele => this.dialogRef = ele}  id={`dialog${this.props.id}`}
        onClick={this.handleClickDialog}
      >
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </div>
      { this.props.modal ? <Overlay zIndex={this.props.modalIndex} zeroOpacity={this.state.zeroOpacity}/> : null}
    </div>;
  }
}

Dialog.propTypes = {
  // 超时自动关闭
  timeout: PropTypes.number,
  // 关闭按钮 -设置空就没有关闭按钮
  closeIcon:  PropTypes.element,
  // 标题，可以是一个element或者string
  title: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  // 内容可以是一个element或者string
  content: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.array
  ]),
  //  当前是显示还是隐藏
  hidden: PropTypes.bool,
  // 按钮如['ok', 'cancle'] 或者标签中代理data-action的会被自动代理成onBtnClick时间
  button: PropTypes.arrayOf(PropTypes.string),
  // classname的前缀
  prefixCls: PropTypes.string,
  // zIndex值
  zIndex: PropTypes.number,
  // 遵循classnames方法的定义
  css: PropTypes.any,
  id: PropTypes.string,
  // 粗略的检查postion字段
  position: function(props, propName, componentName) {
    const checkPos = /(^[lcr][tcb]$)|(^[tcb][lcr]$)|(^[tcblr]$)/;
    const posKeys = ['left', 'top', 'bottom', 'right', 'marginTop', 'marginLeft'];
    const val = props[propName];
    const t = typeof val;
    let res = true;
    if (isPlainObject(val)) {
      res = posKeys.some(cur => cur !== undefined && cur !== null);
    } else if (Array.isArray(val)) {
      res = val.length === 2 && val[0] !== undefined && val[1] !== undefined;
    } else if (t === 'number') {
      res = val >= 0 && val <= 8;
    } else if (t === 'string') {
      res = checkPos.test(val);
    }
    if (!res) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },
  // 宽度，未设置则是auto
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  // 高度，未设置则是auto
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  modal: PropTypes.bool.isRequired,
  modalIndex: PropTypes.number.isRequired,
  // 动画效果
  animate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  // 关闭方法
  close: PropTypes.func.isRequired,
  // 弹窗关闭后
  onClose: PropTypes.func,
  // 按钮点击事件，每个按钮会有固定的id做区分
  onBtnClick: PropTypes.func,
  // 弹窗隐藏事件
  onHide: PropTypes.func,
  // 弹窗显示事件
  onShow: PropTypes.func
};
Dialog.defaultProps = {
  timeout: 0,
  closeIcon: closeSvg,
  button: ['ok'],
  hidden: false,
  prefixCls: 'm-dialog',
  position: 'c',
  modal: true,
  modalIndex: 0,
  // 动画效果
  animate: '',
  onClose: noop,
  onBtnClick: noop,
  onHide: noop,
  onShow: noop
};


// 挂载在dialog组件上，可以方便修改
Dialog.globalConfig = globalConfig;

// 产生2个id的自增
['startZIndex', 'startId'].forEach(name => {
  Dialog[name.replace('start', 'gen')] = () => Dialog.globalConfig[name]++;
});

