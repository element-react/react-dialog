export default function (manager, key) {
  const res = {
    manager,
    close () {
      manager.removeCache(key);
    },
    closeAll () {
      manager.removeAll();
    },
    setTop () {

    },
    toString () {
      return key;
    },
    get id () {
      return key;
    }
  };

  // 各种事件的添加
  ['onClose', 'onBeforeClosed', 'onBtnClick',
    'onHide', 'onShow'].forEach(one => {
    res[one] = function (fun) {
      if (typeof fun === 'function') {
        const listeners = manager.listeners;
        listeners[key] = listeners[key] || {};
        listeners[key][one] = listeners[key][one] || [];
        listeners[key][one].push(fun);
      }
    };
  });

  // 不提供zIndex的修改方法
  ['width', 'height', 'position',
    'hidden', 'button', 'title',
    'content', 'prefixCls', 'className',
    'css', 'timeout'].forEach(one => {
    Object.defineProperty(res, one, {
      enumerable: true,
      set (val) {
        const props = manager.getDialogProps(key);
        manager.modifyCache({
          ...props,
          [one]: val
        });
      },
      get () {
        const props = manager.getDialogProps(key);
        return props[one];
      }
    });
  });

  return res;
}
