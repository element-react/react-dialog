import React from 'react';
import ReactDOM from 'react-dom';
import Dialog, { dialogInstanceCache } from './dialog';
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
  setTop(key) {
    const cache =this.state.cache;
    // 只有一个的时候不能设置top
    if (cache.length <= 1) {
      return this;
    }
    key = key.replace(dialogIdReg, '$1');
    const index = cache.findIndex(cur => cur.key === key);
    if (index > -1) {
      // 已经在顶层
      if (cache.length - 1 === index) {
        return this;
      }
      this.setState(({ cache }) => {
        const cur = cache[index];
        const newCache = cache.slice(0);
        newCache.splice(index, 1);
        const modalIndex = Dialog.genZIndex();
        const zIndex = Dialog.genZIndex();
        newCache.push({
          ...cur,
          modalIndex,
          zIndex
        });
        return {
          cache: newCache
        };
      }, () => {
        const res = dialogInstanceCache.splice(index, 1);
        dialogInstanceCache.push(res[0]);

      });
    }
  }
  // 修改dialog缓存的
  modifyCache (props) {
    const id = Dialog.genId();
    const key = String(props.key || id);
    const index = this.state.cache.findIndex(cur => cur.key === key);
    props = {
      ...props,
      close: this.removeCache.bind(this, key)
    };
    // 更新弹窗
    if (index < 0) {
      // 不管是不是modle都生成这个index
      const modalIndex = Dialog.genZIndex();
      const zIndex = Dialog.genZIndex();
      Object.assign(props, {
        key,
        id: key,
        zIndex,
        modalIndex
      });
    }
    this.setState(({ cache }) => {
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
  // 删除dialog缓存
  // ret表示删除的返回值
  removeCache (key, ret) {
    key = key.replace(dialogIdReg, '$1');
    const index = this.state.cache.findIndex(cur => cur.key === key);
    const instance = dialogInstanceCache[index];
    if (ret) {
      instance.__closeRet = ret;
    }
    const props = this.state.cache[index];
    const onBeforeClosed = this.composeFun(key, 'onBeforeClosed', props.onBeforeClosed);
    if (index > -1) {
      // 调用onBereClosed，如果任意一个fun返回false，则阻止弹窗关闭
      const res = instance.__closeRet ? onBeforeClosed(instance.__closeRet) : onBeforeClosed();
      if (res && res.some(cur => cur === false)) {
        return;
      }
      const api = this.apis[key];
      // 真正开始关闭
      api.onHide(() => {
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
      });
      // 先隐藏他弹窗
      api.hidden = true;
    }
  }
  removeAll () {
    this.setState({
      cache: []
    });
  }
  renderDialog () {
    return this.state.cache.map(dialogProps => {
      const key = dialogProps.key;
      const props = {
        ...dialogProps,
        onClose: this.composeFun(key, 'onClose', dialogProps.onClose),
        onShow: this.composeFun(key, 'onShow', dialogProps.onShow),
        onHide: this.composeFun(key, 'onHide', dialogProps.onHide),
        onBtnClick: this.composeFun(key, 'onBtnClick', dialogProps.onBtnClick)
      };
      return <Dialog {...props}/>;
    });
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
    // 没有参数关闭所有
    if (!opt) {
      return rc.removeAll();
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
