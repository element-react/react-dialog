import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './dialog';
import { dialogIdReg, noop }  from './utils';
import api from './api';
export class DialogManager extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      cache: []
    };
    // 所有的事件对象
    this.listeners = {};
    // 所有的api对象
    this.apis = {};
  }
  get cache () {
    return this.state.cache;
  }

  getDialogProps(key) {
    return this.state.cache.find(prop => prop.key === key);
  }
  composeFun (key, listenerName, start) {
    return (...params) => {
      const api = this.apis[key];
      let funs = this.listeners[key] || {};
      funs = funs[listenerName];
      const res = [];
      if (typeof start === 'function') {
        res.push(start.call(api, ...params));
      }
      if (funs && funs.length) {
        return funs.reduce((res, fn) => {
          if (typeof fn === 'function') {
            const val = fn.call(api, ...params);
            res.push(val);
          } else {
            res.push(undefined);
          }
          return res;
        }, res);
      }
      return res.length ? res : undefined;
    };
  }
  // 修改dialog缓存的
  modifyCache (props) {
    const id = Dialog.genId();
    const key = String(props.key || id);
    const zIndex = Dialog.genZIndex();
    props = {
      key,
      id: key,
      zIndex,
      ...props,
      close: this.removeCache.bind(this, key),
      onClose: this.composeFun(key, 'onClose', props.onClose),
      onShow: this.composeFun(key, 'onShow', props.onShow),
      onHide: this.composeFun(key, 'onHide', props.onHide),
      onBtnClick: this.composeFun(key, 'onBtnClick', props.onBtnClick)
    };
    this.setState(({ cache }) => {
      const index = cache.findIndex(cur => cur.key === key);
      const newCache = cache.slice(0);
      if (index > -1) {
        newCache.splice(index, 1, props);
      } else {
        newCache.push(props);
      }
      return {
        cache: newCache
      };
    });
    return key;
  }
  removeCache (key) {
    key = key.replace(dialogIdReg, '$1');
    const index = this.state.cache.findIndex(cur => cur.key === key);
    const props = this.state.cache[index];
    const onBeforeClosed = this.composeFun(key, 'onBeforeClosed', props.onBeforeClosed);
    if (index > -1) {
      const res = onBeforeClosed();
      if (res.some(cur => cur === false)) {
        return;
      }
      // 调用onBereClosed，如果任意一个fun返回false，则阻止弹窗关闭
      this.setState(({ cache }) => {
        cache = cache.slice(0);
        cache.splice(index, 1);
        return {
          cache
        };
      },  () => {
        // 延迟删除api等，因为在回调中可能用到，在删除进行中的时候
        setTimeout(() => {
          // 删除api
          delete this.apis[key];
          // 删除key
          delete this.listeners[key];
        });
      });
    }
  }
  removeAll () {
    this.setState({
      cache: []
    });
  }
  renderDialog () {
    return this.state.cache.map(dialogProps => <Dialog {...dialogProps}/>);
  }
  render () {
    return <div className="m-dialog-wrap">
      {this.renderDialog()}
    </div>;
  }
}
/**
  * dialog接口
  * @param {obj} opt
  * {
  *  title: React.element|sring 
  *  content: React.element|sring
  *  position: 0,
  *  width 0,
  *  height: 0,
  *  css: 0,
  *  modal: false,
  *  timeout: 0,
  *  animate: 0
  * }
  * 
 */
/**
 * @param {object} cfg
 * {
 *   startIndex: 999 index的开始值
 * }
 */
DialogManager.create = function (cfg = {}) {
  const opt = Object.assign(cfg, DialogManager.globalConfig);
  const ele = document.createElement('div');
  ele.id = 'dialogReact';
  document.body.appendChild(ele);
  const rc = ReactDOM.render(<DialogManager {...opt}/>, ele);
  return function (opt) {
    if (!opt) {
      return null;
    }
    let key = null;
    if (typeof opt === 'string') {
      if (dialogIdReg.test(opt)) {
        rc.removeCache(opt);
        return opt;
      }
      opt = {
        content: opt
      };
    }
    if (opt.content || opt.title) {
      // 内容必须是存在的
      key = rc.modifyCache(opt);
    }
    if (key) {
      // 已经存在这个key的api直接返回
      if (rc.apis[key]) {
        return rc.apis[key];
      }
      const res = api(rc, key);
      rc.apis[key] = res;
      return res; 
    }
  };
};
export default DialogManager;
