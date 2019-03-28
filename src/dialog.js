import React from 'react';
import globalConfig from './globalConfig';
import PropTypes from 'prop-types';
import './index.less';
import { closeSvg, isPlainObject } from './utils';
import classnames from 'classnames';
export default class Dialog extends React.PureComponent {
  constructor (props) {
    super(props);
    this.dialogRef = null;
  }
  static propTypes = {
    timeout: PropTypes.number,
    title: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.element)
    ]),
    content: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
      PropTypes.array
    ]),
    hidden: PropTypes.bool,
    button: PropTypes.arrayOf(PropTypes.string),
    prefixCls: PropTypes.string,
    zIndex: PropTypes.number,
    // 遵循classnames方法的定义
    css: PropTypes.any,
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
    width: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  }
  static defaultProps = {
    timeout: 0,
    button: ['ok'],
    hidden: false,
    prefixCls: 'm-dialog',
    position: 'c'
  }

  componentDidMount () {
    this.startTimer();
    // 组件挂载后调用直接重新计算位置 -- 因为首次获取styles的时候组件并没有挂载，所以必须要在组件挂载后强制更新一次
    this.forceUpdate();
  }

  componentWillUnmount () {
    this.endTimer();
  }
  startTimer () {
    if (this.props.timeout) {
      this._timer = setTimeout(() => {}, this.props.timeout);
    }
  }
  endTimer () {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  callPos () {
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
    return position;
  }
  get styles () {
    let styles = {};
    if (this.props.hidden) {
      styles = {
        ...styles,
        left: '-9999px',
        top: '-9999px',
        visibility: 'hidden'
      };
    }
    const pos = this.callPos();
    styles = {
      ...styles,
      ...pos,
      zIndex: this.props.zIndex
    };
    return styles;
  }
  renderHeader () {
    const title = this.props.title;
    const prefixCls = this.props.prefixCls;
    if (title !== null && title!== undefined) {
      return <div className={`${prefixCls}-header`}>
        <div>{title || ''}</div>
        <div className={`${prefixCls}-close`}><em>{closeSvg}</em></div>
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
      return <div className={`${prefixCls}-body`}>
        <div className={`${prefixCls}-main`}>{content}</div>
      </div>;
    }
  }
  render() {
    const className = classnames(this.props.className, this.props.css, this.props.prefixCls);
    return <div className={className} style={this.styles} ref={ele => this.dialogRef = ele}>
      {this.renderHeader()}
      {this.renderContent()}
      {this.renderFooter()}
    </div>;
  }
}
// 挂载在dialog组件上，可以方便修改
Dialog.globalConfig = globalConfig;

// 产生2个id的自增
['startZIndex', 'startId'].forEach(name => {
  Dialog[name.replace('start', 'gen')] = () => Dialog.globalConfig[name]++;
});
