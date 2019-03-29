import React from 'react';
import ReactDom from 'react-dom';
import { dialog } from '../src/index';
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
  content: 'welcome',
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
  onBeforeClosed: function () {
    console.log('in on before close');
  }
  // timeout: 3000
});
window.res = res;
res.onClose(function () {
  console.log('hhh onClose');
});
res.onShow(function () {
  console.log('hhh onshow');
});
res.onHide(function () {
  console.log('hhh onHide');
});
res.onBeforeClosed(function () {
  console.log('hhh, onBeforeClose');
  // return false;
});
res.onBtnClick(function (btnId) {
  console.log('hhh, btnId', btnId);
});
// res.title = '111';
console.log(res);


ReactDom.render(<Demo/>, document.querySelector('#app'));
