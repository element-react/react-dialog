import React from 'react';
import PropTypes from 'prop-types';

export default class Overlay extends React.Component{
  constructor (props) {
    super(props);
    this.overlayEle = null;
  }
  static propTypes = {
    zIndex: PropTypes.number.isRequired,
    position: PropTypes.string,
    resize: PropTypes.bool,
    zeroOpacity: PropTypes.bool
  }
  static defaultProps = {
    prefixCls: 'm-dialog',
    position: 'fixed',
    resize: true,
    zeroOpacity: false
  }
  componentDidUpdate (prevProps, prevState) {

  }
  get styles (){
    const res = {
      zIndex: this.props.zIndex
    };
    // 强制透明
    if (this.props.zeroOpacity) {
      res.opacity = 0;
    }
    return res;
  }
  render () {
    return <div className={`${this.props.prefixCls}-layout`} style={this.styles} ref={ele => this.overlayEle = ele}></div>;
  }
}
