import React from 'react';
import ReactDom from 'react-dom';
import Dialog, { dialog } from '../src/index';
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
  title: 'test',
  content: 'welcome',
  button: ['ok', 'cancle'],
  position: 'c'
});
window.res = res;
// res.title = '111';
console.log(res);

ReactDom.render(<Demo/>, document.querySelector('#app'));
