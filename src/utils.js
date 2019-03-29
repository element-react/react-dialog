import React from 'react';
export const dialogIdReg = /^dialog([0-9]+)$/;

export const closeSvg = <svg
  viewBox="0 0 1024 1024"
  fill="currentColor">
  <path d="M507.168 473.232L716.48 263.936a16 16 0 0 1 22.624 0l11.312 11.312a16 16 0 0 1 0 22.624L541.12 507.168 750.4 716.48a16 16 0 0 1 0 22.624l-11.312 11.312a16 16 0 0 1-22.624 0L507.168 541.12 297.872 750.4a16 16 0 0 1-22.624 0l-11.312-11.312a16 16 0 0 1 0-22.624l209.296-209.312-209.296-209.296a16 16 0 0 1 0-22.624l11.312-11.312a16 16 0 0 1 22.624 0l209.296 209.296z"></path>
</svg>;

const OBJECT_STRING = '[object Object]';
export function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING;
};

export const isNumber = /^\d+$/;

export const noop = () => {};

const eleProto = typeof Element !== 'undefined' ? Element.prototype : {};
const vendor = eleProto.matches ||
eleProto.matchesSelector ||
eleProto.webkitMatchesSelector ||
eleProto.mozMatchesSelector ||
eleProto.msMatchesSelector ||
eleProto.oMatchesSelector;


// 根据给定元素查找该select是否匹配
export const matches = (el, selector) => {
  if (!el || el.nodeType !== 1) {
    return false;
  }
  if (vendor) {
    return vendor.call(el, selector);
  }
  // 不支持原生的match，则修复下
  // 注意修复的性能比较低
  const nodes = el.parentNode.querySelectorAll(selector);
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === el) return true;
  }
  return false;
};
export const closest = (element, selector, checkYoSelf) => {
  let parent = checkYoSelf ? element : element.parentNode;
  while (parent && parent !== document) {
    if (matches(parent, selector)) {
      return parent;
    }
    parent = parent.parentNode;
  }
};
