from pathlib import Path
import re

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "hanbo-website"

st.set_page_config(
    page_title="广东汉柏能源集团",
    page_icon="🟩",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 隐藏 Streamlit 外壳，让部署后的页面只呈现官网本身。
st.markdown(
    """
    <style>
      header[data-testid="stHeader"], [data-testid="stToolbar"],
      #MainMenu, footer, [data-testid="stDecoration"] { display:none !important; }
      .stApp, [data-testid="stAppViewContainer"],
      [data-testid="stAppViewContainer"] > .main { background:#fff !important; }
      .block-container { max-width:none !important; padding:0 !important; margin:0 !important; }
      iframe { border:0 !important; display:block !important; width:100% !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

page = st.query_params.get("page", "home")
if page == "wind":
    file_name = "wind-power.html"
elif page == "wind-en":
    file_name = "wind-power-en.html"
else:
    file_name = "预览版-双击即看.html"

file_path = SITE / file_name
if not file_path.exists():
    st.error(f"页面文件不存在：{file_name}")
    st.stop()

content = file_path.read_text(encoding="utf-8")

# Streamlit 组件运行在内嵌页面中：把项目文章链接改为 Streamlit 页面路由。
if page == "home":
    content = content.replace("wind-power-en.html", "?page=wind-en")
    content = content.replace("wind-power.html", "?page=wind")
    content = re.sub(r'href="(\?page=wind(?:-en)?)"', r'href="\1" target="_top"', content)
else:
    content = content.replace("index.html#business", "?page=home#business")
    content = content.replace("index.html#contact", "?page=home#contact")
    content = content.replace('href="index.html"', 'href="?page=home"')
    content = re.sub(r'href="(\?page=home(?:#[^"]+)?)"', r'href="\1" target="_top"', content)

# 官网自己的 main.js 已经负责动态读取导航高度和锚点滚动，
# Streamlit 外层不再重复绑定滚动脚本，避免两个滚动逻辑互相叠加。

# 官网首页按整屏高度展示；文章页给更长的阅读区域。
height = 900 if page == "home" else 1100
components.html(content, height=height, scrolling=True)
