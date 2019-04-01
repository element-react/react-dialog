import './index.less';
import DialogManager from './dialogManager';
export { default } from './dialog';

// 创建并返回dialog接口
export const dialog = DialogManager.create();
dialog.alert = (content, btn) => {
  return dialog({
    title: null,
    content,
    button: btn && btn.length ? btn : ['ok']
  });
};

dialog.toast = (content, timeout) => {
  return dialog({
    title: null,
    content,
    timeout: timeout || 2000,
    button: null
  });
};

dialog.confirm = (content, btn) => {
  return dialog({
    title: null,
    content,
    button: btn && btn.length ? btn : ['ok', 'cancel']
  });
};
