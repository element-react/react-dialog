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
    resize: PropTypes.bool
  }
  static defaultProps = {
    prefixCls: 'm-dialog',
    position: 'fixed',
    resize: true
  }
  componentDidUpdate (prevProps, prevState) {

  }
  get styles (){
    return {
      zIndex: this.props.zIndex
    };
  }
  render () {
    return <div className={`${this.props.prefixCls}-layout`} style={this.styles} ref={ele => this.overlayEle = ele}></div>;
  }
}
