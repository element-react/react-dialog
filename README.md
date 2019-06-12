# react-dialog

## 基本API

### dialog(options\_or\_content )
按照配置打开一个对话框，@return  [dialog控制对象](#dialog实例对象)。

#### 使用方法-直接调用全局api
``` js
  // 引入dialog
	import dialog from '@element-react/react-dialog';
	var d = dialog({
		title: "hi",
		content: 'hi word',
    button: ["hello", "bye"]
	});
	//修改弹窗内容是一个 reactElement
	d.content = "<span>你好，网易</span>";
	d.onClose(function(ret){
	    alert("dialog destoried!");
	});
	//关闭弹窗事件
	window.setTimeout(function(){
	    d.close();
	}, 3000);
```

### $.dialog([dialogID\_or\_dialogInstance [,returnValue]])
关闭指定的对话框
 - 如果不提供参数，则关闭所有的对话框
 - dialogID: 关闭指定id的对话框
 - dialog实例: 关闭当前对话框

```js
//关闭上面demo中的hi对话框，等同
d.close();
//通过id关闭弹窗
dialog(d.toSting() || d.id);
// 关闭所有弹窗
dialog()
```

### options说明
- **title** : `null`,	可选，`string`、 `null`、 `reactEelent`<br>
	对话框标题，若标题为空字符，则不显示标题栏（仍显示关闭按钮）；如果为null，则不显示标题栏也不显示关闭按钮；

- **content** : `""`,	必选，`string`、 `null`、 `reactElement` 对话框内容

- **width** : `0`,	可选，`number、string`<br>
	对话框宽度，若为0，则跟随内容宽度自适应，无最小宽度限制。

- **height** : `0`,	可选，`number、string` <br>
	对话框高度，若为0，则跟随内容高度自适应，无最小高度限制，否则主体部分保持最小高度
	
- **button** : `["确定"]`,	可选，`<string>array`<br>
	对话框按钮，若为空数组，则不显示按钮栏；如果按钮字符以 \*开头，则表示是默认按钮(追加 focusBtn 样式)，但 \* 不显示，默认按钮在打开时会被聚焦选中。更多单字符按钮样式，参考高级API设置。

- **css,classnames** : `""`,	可选[classnames](https://github.com/JedWatson/classnames)所认的格式
	对话框附加样式，该样式被添加到对框框最外层元素上。

- **position** : `"c"`,	可选，`数字0~8`、`整数数组`、`坐标对象`、`字符示位`、`自定义方法`<br>
	定位对话框的位置，默认居中
	- 0 可用屏幕中央 1-8分别从屏幕左上角顺时针对应八个位置
	- 若为数组，则以该数组给定的xy坐标显示
	- 若为对象则当作定位样式处理，支持left、right、top、bottom属性，如果值是 auto/c/center 则居中显示，比如 left:"auto" 则左右居中
	- 若为字符，则可以处理 t l r b c 字符的任何合理组合
	- 若是自定义方法，则必须返回 `object`， `oject`必须有 `left，top， bottom，right`的属性

- **modal** : `true`,	可选，`boolean`
- **closeIcon**: ReactElment 可选如果为null，则不显示关闭按钮
- **timeout** : `0`,	可选, `number`<br>
  是否自动关闭对话框，为0则不自动关闭，单位ms

- **animate** : 动画0-7动画 <br>
  可以自定义动画
  传入 字符串时为class名称动画准备的名称
  如 animate=“test”,则表示test-leave(动画离开), test-enter(动画进入)的class为动画执行准备， test-leave-active(动画离开执行), test-enter-active(动画进入执行)

### dialog方法返回对象

#### 对象属性
- id: string 只读属性，获取dialog的id
- width string, number 控制宽度
- height: string, number 控制高度
- hidden: boolean 控制显示隐藏
- button: array 控制按钮
- position string, object, array 控制位置
- modal number, boolean控制蒙层
- timeout nummber 控制超时
- css,classnames class名称
- title 标题
- content 内容

> 属性改变即时生效


#### 对象方法
- setTop 设置当前dialog在最顶层(如果页面正在有dialog挂在中，调用该方法无效)
- close() 关闭当前dialog
- toString 返回id


#### 对象事件名称

- show 显示dialog，动画完成后显示后调用
- hide 隐藏dialog，动画完成后隐藏调用
- btnClick 带有`data-action="btn"`的按钮被点击时候的触发，会返回传入的returnValue或者，按钮上的 `data-ret` 属性的值
- beforeClose 弹窗关闭前,返回false则取消关闭，方法参数是returnValue
- close 关闭弹窗，dom未删除，方法参数是 returnValue

#### 对象事件

- onShow(fun) dialog显示方法
- onHide(fun) dialog隐藏方法
- onBtnClick(fun) 点击按钮
- onBeforeClose(fun) dialog关闭前事件， 返回false阻止关闭
- onClose(fun) 关闭事件，dom还在
> 通过以下method绑定

``` js
	var d = dialog({
		title: "hi",
    content: "hello 程序猿~",
    button: ["*hello", "bye"]
	});
	d.onClose(function () {
		console.log('close');
	});

```


## 快捷API
dialog组件提供了一些包装接口，用于快速创建一定格式的对话框。

 - **dialog.confirm(content [,btn])**
 - **dialog.alert(content [,btn])**
 - **dialog.error(content [,btn])**
 - **dialog.info(content [,btn])**
 - **dialog.toast(content [,timeout])**


## 高级API

```js
//修改dialog全局配置
dialog.globalConfig({
	startZIndex: 999,
  startId: 1,
  // 默认的button样子
  btn: ['ok'],
  // 按钮retId编码方法
  getBtnRetId: function (i, n) {
    // n > 1 ? n - i - 1 : 1
    return n > 1 ? i : 1;
  }
});
```
## 构建功能

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run start

# build for production with minification
npm run build

```
