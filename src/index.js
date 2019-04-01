import './index.less';
import DialogManager from './dialogManager';
export { default } from './dialog';

// 创建并返回dialog接口
export const dialog = DialogManager.create();

import React from 'react';
import ReactDom from 'react-dom';
