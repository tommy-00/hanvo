# Streamlit 动态导航高度补丁

适用于之前的“广东汉柏能源集团官网-Streamlit部署包”。

请用本补丁覆盖原包中的同名文件：

- `streamlit_app.py`
- `hanbo-website/index.html`
- `hanbo-website/css/style.css`
- `hanbo-website/js/main.js`
- `hanbo-website/预览版-双击即看.html`

本补丁修复：

- 实时读取当前浏览器导航栏高度
- 导航栏进入滚动态后自动重新计算
- 浏览器窗口缩放后自动重新计算
- 点击顶部导航时按当前真实高度定位
- 避免上一页底部露在下一页顶部
