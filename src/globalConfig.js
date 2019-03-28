export default {
  startZIndex: 999,
  startId: 1,
  // 默认的button样子
  btn: ['ok'],
  // 按钮retId编码方法
  getBtnRetId: function (i, n) {
    // n > 1 ? n - i - 1 : 1
    return n > 1 ? i : 1;
  }
};
