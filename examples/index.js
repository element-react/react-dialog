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

const res = dialog({
  title: 'test',
  button: ['ok', 'cancle'],
  css: {
    a: true
  }
});
window.res = res;
// res.title = '111';
console.log(res);

ReactDom.render(<Demo/>, document.querySelector('#app'));
