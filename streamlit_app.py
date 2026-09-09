from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "hanbo-website"

st.set_page_config(
    page_title="广东汉柏能源集团官网",
    page_icon="🟩",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.title("广东汉柏能源集团官网")
st.caption("内部预览版 · 内容确认后再部署正式网站")

page = st.radio(
    "选择查看页面",
    ["官网首页", "陆上风电项目文章", "Onshore Wind Project Story"],
    horizontal=True,
)

if page == "官网首页":
    file_path = SITE / "预览版-双击即看.html"
    height = 900
elif page == "陆上风电项目文章":
    file_path = SITE / "wind-power.html"
    height = 1000
else:
    file_path = SITE / "wind-power-en.html"
    height = 1000

if not file_path.exists():
    st.error(f"找不到页面文件：{file_path}")
    st.stop()

components.html(file_path.read_text(encoding="utf-8"), height=height, scrolling=True)

st.divider()
st.caption("内部审核期间如需修改文字、图片、布局或页面功能，请直接把修改意见发给我。")
