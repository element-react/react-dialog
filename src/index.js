import './index.less';
import DialogManager from './dialogManager';
export { default } from './dialog';
import './closeByEsc';
import './resize';

// 创建并返回dialog接口
export const dialog = DialogManager.create();
dialog.alert = (content, btn) => {
  return dialog({
    className: 'm-dialog-alert',
    title: null,
    content,
    button: btn && btn.length ? btn : ['ok']
  });
};

dialog.toast = (content, timeout) => {
  return dialog({
    title: null,
    className: 'm-dialog-toast',
    content,
    timeout: timeout || 3000,
    button: null
  });
};

dialog.confirm = (content, btn) => {
  return dialog({
    className: 'm-dialog-confirm',
    title: null,
    content,
    button: btn && btn.length ? btn : ['ok', 'cancel']
  });
};
export const alert = dialog.alert;
export const toast = dialog.toast;
export const confirm = dialog.confirm;
