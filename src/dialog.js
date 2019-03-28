import React from 'react';
import globalConfig from './globalConfig';
import PropTypes from 'prop-types';
import './index.less';
import { closeSvg } from './utils';
import classnames from 'classnames';
export default class Dialog extends React.PureComponent {
  static propTypes = {
    timeout: PropTypes.number,
    title: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.element)
    ]),
    content: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
      PropTypes.array
    ]),
    hidden: PropTypes.bool,
    button: PropTypes.arrayOf(PropTypes.string),
    prefixCls: PropTypes.string,
    // 遵循classnames方法的定义
    css: PropTypes.any
  }
  static defaultProps = {
    timeout: 0,
    button: ['ok'],
    hidden: false,
    prefixCls: 'm-dialog'
  }

  componentDidUpdated (preProps, preState) {
    if (this.props.timeout !== preProps.timeout) {
      this.endTimer();
      this.startTimer();
    }
  }

  componentDidMount () {
    this.startTimer();
  }

  componentWillUnmount () {
    this.endTimer();
  }
  startTimer () {
    if (this.props.timeout) {
      this._timer = setTimeout(() => {}, this.props.timeout);
    }
  }
  endTimer () {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  renderHeader () {
    const title = this.props.title;
    const prefixCls = this.props.prefixCls;
    if (title !== null && title!== undefined) {
      return <div className={`${prefixCls}-header`}>
        <div>{title || ''}</div>
        <div className={`${prefixCls}-close`}><em>{closeSvg}</em></div>
      </div>;
    }
  }
  renderFooter () {
    const button = this.props.button;
    const getBtnRetId = Dialog.globalConfig.getBtnRetId;
    const prefixCls = this.props.prefixCls;
    if (button && button.length) {
      const size = button.length;
      return <div className={`${prefixCls}-footer`}> {
        button.map((cur, index) => <a className={`${prefixCls}-btn`} key={index} data-action={getBtnRetId(index, size)}><span>{cur}</span></a>)
      }
      </div>;
    }
  }
  renderContent () {
    const content = this.props.content;
    const prefixCls = this.props.prefixCls;
    if (content) {
      return <div className={`${prefixCls}-body`}>
        <div className={`${prefixCls}-main`}>{content}</div>
      </div>;
    }
  }

  render() {
    const styles = {
      display: this.props.hidden ? 'none' : 'block'
    };
    const className = classnames(this.props.className, this.props.css, this.props.prefixCls);
    return <div className={className} style={styles}>
      {this.renderHeader()}
      {this.renderContent()}
      {this.renderFooter()}
    </div>;
  }
}
// 挂载在dialog组件上，可以方便修改
Dialog.globalConfig = globalConfig;

// 产生2个id的自增
['startZIndex', 'startId'].forEach(name => {
  Dialog[name.replace('start', 'gen')] = () => Dialog.globalConfig[name]++;
});
