import React from 'react';
import dialogManager from './dialogManager';
export default class Dialog extends React.PureComponent{
  get dialogManager () {
    return dialogManager;
  }

}
