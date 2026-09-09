# 广东汉柏能源集团 Streamlit 可编辑内部管理版

这是官网的内部内容管理和预览工具，适合公司内部修改常用文字并查看效果。

## 本地运行

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## 可以编辑

- 首页中文和英文标签、标题、简介
- 公司地址、电话、邮箱
- 6个业务板块的中文和英文名称
- 修改后立即在官网预览中查看
- 下载 `content_overrides.json`，提交到 Git 保存

## 不能直接编辑

页面布局、图片裁剪、动画、页面结构、表单功能等复杂内容，仍由项目维护人员统一修改。

## Git 和部署

重要修改请下载或保留 `content_overrides.json`，然后提交到 Git：

```bash
git add content_overrides.json
 git commit -m "update website content"
git push
```

Streamlit Cloud 的入口文件填写：

```text
streamlit_app.py
```

内部审核阶段请使用私有仓库并配置访问权限，不要直接公开公司资料和留言管理功能。
