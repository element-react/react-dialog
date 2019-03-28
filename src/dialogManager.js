import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './dialog';
import { dialogIdReg }  from './utils';
import api from './api';
export class DialogManager extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      cache: []
    };
  }
  get cache () {
    return this.state.cache;
  }

  getDialogProps(key) {
    return this.state.cache.find(prop => prop.key === key);
  }
  // 修改dialog缓存的
  modifyCache (props) {
    const id = Dialog.genId();
    const key = props.key || id;
    const zIndex = Dialog.genZIndex();
    props = {
      key,
      zIndex,
      ...props
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
    const index = cache.findIndex(cur => cur.key === key);
    if (index) {
      this.setState(({ cache }) => {
        cache = cache.slice(0);
        cache.splice(1, index);
        return {
          cache
        };
      });
    }
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
      key = rc.mofifyCache({
        content: opt
      });
    } else if (opt.content || opt.title) {
      // 内容必须是存在的
      key = rc.modifyCache(opt);
    }
    if (key) {
      return api(rc, key); 
    }
  };
};
export default DialogManager;
