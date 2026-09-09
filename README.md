# 广东汉柏能源集团 Streamlit 正式预览部署包

这是一个“正常官网展示版” Streamlit 包，部署后只显示官网本身，不显示额外的编辑器、标题栏或 Streamlit 操作面板。

## 本地运行

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## 页面入口

- 官网首页：默认打开
- 陆上风电文章：从首页点击“陆上风电”进入
- 中英文：使用官网右上角语言按钮切换

## 部署

上传整个文件夹到 GitHub 私有仓库，在 Streamlit Community Cloud 中选择：

```text
streamlit_app.py
```

内部审核阶段建议使用私有仓库和访问权限。内容成熟后，再把 `hanbo-website` 部署到正式服务器。
