// 通过esc按键关闭
import { dialogInstanceCache } from './dialog';
import { ready } from './utils';

ready(function () {
  document.body.addEventListener('keydown', function (event) {
    if (event.keyCode === 27 && dialogInstanceCache && dialogInstanceCache.length) {
      // 取最后一个弹窗
      const instance = dialogInstanceCache[dialogInstanceCache.length - 1] || {};
      const { props } = instance;
      // 必须有关闭按钮
      if (props && props.closeIcon && props.title !== null && props.title !== undefined) {
        props.close();
      }
    }
  });
});
