// 通过esc按键关闭
import { dialogInstanceCache } from './dialog';
import { ready } from './utils';

ready(function () {
  let t = null;
  window.addEventListener('resize', () => {
    if (t) {
      clearTimeout(t);
    }
    t = window.setTimeout(() => {
      // resize 从新定位
      for (let instance of dialogInstanceCache) {
        instance.setPos();
      }
    }, 200);
  });
});
