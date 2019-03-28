export default function (manager, key) {
  const res = {
    manager,
    // dom已删除
    onClose () {

    },
    // dom未删除
    onBeforeClosed () {

    },
    // 内部按钮点击
    onBtnClick (btn) {

    },
    // 隐藏当前弹窗
    onHide () {

    },
    // 显示当前弹窗
    onShow () {

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
