# 广东汉柏能源集团 Streamlit 官网预览包

这是一个用于公司内部查阅官网的 Streamlit 包。内容和页面修改由项目维护人员统一处理，内部人员只需要运行或部署即可查看。

## 本地运行

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## 页面

- 官网首页
- 陆上风电项目文章
- Onshore Wind Project Story

## 部署到 Streamlit Community Cloud

1. 把整个文件夹上传到 GitHub 私有仓库。
2. 在 Streamlit Community Cloud 新建 App。
3. 选择对应仓库和分支。
4. Main file path 填写：

```text
streamlit_app.py
```

5. 点击 Deploy。

## 注意

- 该包适合内部预览，不等于正式官网服务器。
- Streamlit Community Cloud 默认可能是公开访问，内部审核阶段请使用私有仓库并设置访问权限。
- 确定内容后，再把官网静态文件部署到正式服务器。
