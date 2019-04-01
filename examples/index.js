import React from 'react';
import ReactDOM from 'react-dom';
import { dialog } from '@element-react/react-dialog';
class Demo extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render () {
    return <div className="demo">
      demo
    </div>;
  }
}
window.dialog = dialog;

const res = dialog({
  title: <span>title</span>,
  content: <div>welcome<button data-action='test' data-ret='abc'>abc</button></div>,
  button: ['ok', 'cancle'],
  position: 'c',
  // closeIcon: null,
  onClose: function (...arg) {
    console.log(this);
    console.log('onClose', arg);
  },
  onHide: function () {
    console.log('onHide');
  },
  onShow: function () {
    console.log('onShow');
  },
  onBtnClick:function (btnId) {
    console.log('btnId', btnId);
  },
  onBeforeClosed: function (ret) {
    console.log('in on before close', ret);
  }
  // timeout: 3000
});
window.res = res;
res.onClose(function (ret) {
  console.log('hhh onClose', ret);
});
res.onShow(function () {
  console.log('hhh onshow');
});
res.onHide(function () {
  console.log('hhh onHide');
});
res.onBeforeClosed(function (ret) {
  console.log('hhh, onBeforeClose', ret);
  // return false;
});
res.onBtnClick(function (btnId) {
  console.log('hhh, btnId', btnId);
});
// res.title = '111';
console.log(res);


ReactDOM.render(<Demo/>, document.querySelector('#app'));
