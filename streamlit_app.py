from __future__ import annotations

import base64
import html as html_lib
import json
import mimetypes
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "hanbo-website"
SOURCE_INDEX = SITE / "index.html"
OVERRIDES_FILE = ROOT / "content_overrides.json"

DEFAULTS = {
    "hero_badge_zh": "多能互补的综合能源产业集团",
    "hero_badge_en": "Multi-Energy Complementary Energy Group",
    "hero_title_1_zh": "让每一度电，创造更多价值，",
    "hero_title_1_en": "Empowering every kilowatt-hour to create more value",
    "hero_title_2_zh": "从风、光到氢、算，",
    "hero_title_2_en": "from wind and solar to hydrogen and computing",
    "hero_sub_zh": "广东汉柏能源集团以\"风、光、煤、氢、算\"多能互补构建\"一次能源 → 二次能源 → 三次产业\"三层价值转化体系，集投资、研发、设计、建设、运营与维护于一体，助力区域能源转型与产业升级。",
    "hero_sub_en": "Guangdong Hanvo Energy Group builds a multi-energy portfolio of wind, solar, coal, hydrogen and computing, transforming primary energy into secondary energy and then tertiary industry — an integrated investment, R&D, design, construction, operation and maintenance platform.",
    "address_zh": "广东省广州市海珠区海洲路18号 TCL大厦3502室",
    "address_en": "Room 3502, TCL Tower, No. 18 Haizhou Road, Haizhu District, Guangzhou, Guangdong, China",
    "phone": "+86 400-000-0000",
    "email": "contact@hanvo-energy.com",
    "business_1_zh": "陆上风电",
    "business_1_en": "Onshore Wind",
    "business_2_zh": "光伏 · 渔光互补",
    "business_2_en": "Solar · Fishery-Solar PV",
    "business_3_zh": "漂浮式海上光伏",
    "business_3_en": "Floating Offshore Solar",
    "business_4_zh": "新型煤电",
    "business_4_en": "Advanced Coal Power",
    "business_5_zh": "绿氢",
    "business_5_en": "Green Hydrogen",
    "business_6_zh": "算电协同",
    "business_6_en": "Computing-Power",
}

FIELD_PAIRS = {
    "hero_badge": (DEFAULTS["hero_badge_zh"], DEFAULTS["hero_badge_en"]),
    "hero_title_1": (DEFAULTS["hero_title_1_zh"], DEFAULTS["hero_title_1_en"]),
    "hero_title_2": (DEFAULTS["hero_title_2_zh"], DEFAULTS["hero_title_2_en"]),
    "hero_sub": (DEFAULTS["hero_sub_zh"], DEFAULTS["hero_sub_en"]),
    "address": (DEFAULTS["address_zh"], DEFAULTS["address_en"]),
    "phone": (DEFAULTS["phone"], DEFAULTS["phone"]),
    "email": (DEFAULTS["email"], DEFAULTS["email"]),
}
for i in range(1, 7):
    FIELD_PAIRS[f"business_{i}"] = (
        DEFAULTS[f"business_{i}_zh"],
        DEFAULTS[f"business_{i}_en"],
    )


def load_overrides() -> dict[str, str]:
    try:
        data = json.loads(OVERRIDES_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_overrides(data: dict[str, str]) -> None:
    OVERRIDES_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def val(overrides: dict[str, str], key: str) -> str:
    return overrides.get(key, DEFAULTS[key])


def inline_site(source: str) -> str:
    css = (SITE / "css/style.css").read_text(encoding="utf-8")
    js = (SITE / "js/main.js").read_text(encoding="utf-8")
    result = source.replace(
        '<link rel="stylesheet" href="css/style.css">', f"<style>\n{css}\n</style>"
    )
    result = result.replace('<script src="js/main.js"></script>', f"<script>\n{js}\n</script>")
    for image in sorted((SITE / "assets/images").iterdir()):
        if image.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}:
            continue
        mime = mimetypes.guess_type(str(image))[0] or "application/octet-stream"
        encoded = base64.b64encode(image.read_bytes()).decode("ascii")
        data_url = f"data:{mime};base64,{encoded}"
        result = result.replace(f"assets/images/{image.name}", data_url)
        result = result.replace(f"../assets/images/{image.name}", data_url)
    return result


def apply_overrides(source: str, overrides: dict[str, str]) -> str:
    result = source
    for key, (old_zh, old_en) in FIELD_PAIRS.items():
        if key in {"phone", "email"}:
            new_zh = new_en = overrides.get(key, DEFAULTS[key])
        else:
            new_zh = overrides.get(f"{key}_zh", DEFAULTS.get(f"{key}_zh", old_zh))
            new_en = overrides.get(f"{key}_en", DEFAULTS.get(f"{key}_en", old_en))
        result = result.replace(old_zh, html_lib.escape(str(new_zh), quote=True))
        result = result.replace(old_en, html_lib.escape(str(new_en), quote=True))
    return result


def homepage_html(overrides: dict[str, str]) -> str:
    source = SOURCE_INDEX.read_text(encoding="utf-8")
    return inline_site(apply_overrides(source, overrides))


def article_html(name: str) -> str:
    return (SITE / name).read_text(encoding="utf-8")


st.set_page_config(
    page_title="广东汉柏能源集团 · 可编辑内部管理版",
    page_icon="🟩",
    layout="wide",
    initial_sidebar_state="expanded",
)

overrides = load_overrides()

st.title("广东汉柏能源集团 · 可编辑内部管理版")
st.caption("内部内容审核工具：修改常用文案后，可以马上预览效果。")

with st.sidebar:
    st.subheader("使用说明")
    st.markdown("1. 在“内容编辑”修改文字\n2. 点击保存\n3. 在“官网预览”检查效果\n4. 下载内容文件并提交 Git")
    st.warning("这是内部工具，不建议直接公开部署。Streamlit Cloud 上的本地保存不是永久的，重要修改请下载 JSON 后提交到 Git。")
    st.divider()
    st.write("项目目录：")
    st.code("hanbo-website", language="text")

preview_tab, edit_tab, article_tab, export_tab = st.tabs(
    ["官网预览", "内容编辑", "项目文章", "导出部署"]
)

with preview_tab:
    lang = st.radio("预览语言", ["中文", "English"], horizontal=True)
    st.info("预览区域可以正常浏览页面。切换语言也可以直接点击网站右上角按钮。")
    components.html(homepage_html(overrides), height=900, scrolling=True)

with edit_tab:
    st.subheader("首页和联系方式")
    st.caption("修改文字后点击底部的“保存修改”。布局、图片、功能等复杂调整仍建议由项目维护人员处理。")
    with st.form("main_content_editor"):
        a, b = st.columns(2)
        with a:
            st.markdown("#### 首页中文")
            hero_badge_zh = st.text_input("首页标签", val(overrides, "hero_badge_zh"))
            hero_title_1_zh = st.text_input("首页标题第一行", val(overrides, "hero_title_1_zh"))
            hero_title_2_zh = st.text_input("首页标题第二行", val(overrides, "hero_title_2_zh"))
            hero_sub_zh = st.text_area("首页简介", val(overrides, "hero_sub_zh"), height=130)
        with b:
            st.markdown("#### Home English")
            hero_badge_en = st.text_input("Home badge", val(overrides, "hero_badge_en"))
            hero_title_1_en = st.text_input("Home title line 1", val(overrides, "hero_title_1_en"))
            hero_title_2_en = st.text_input("Home title line 2", val(overrides, "hero_title_2_en"))
            hero_sub_en = st.text_area("Home introduction", val(overrides, "hero_sub_en"), height=130)
        st.markdown("#### 联系方式")
        a, b = st.columns(2)
        with a:
            address_zh = st.text_input("中文地址", val(overrides, "address_zh"))
            phone = st.text_input("联系电话", val(overrides, "phone"))
        with b:
            address_en = st.text_input("English address", val(overrides, "address_en"))
            email = st.text_input("电子邮箱", val(overrides, "email"))
        st.markdown("#### 业务板块名称")
        biz = {}
        for i in range(1, 7):
            c1, c2 = st.columns(2)
            with c1:
                biz[f"business_{i}_zh"] = st.text_input(f"业务 {i} 中文", val(overrides, f"business_{i}_zh"), key=f"biz_zh_{i}")
            with c2:
                biz[f"business_{i}_en"] = st.text_input(f"Business {i} English", val(overrides, f"business_{i}_en"), key=f"biz_en_{i}")
        submitted = st.form_submit_button("保存修改", type="primary")
    if submitted:
        new_data = {
            "hero_badge_zh": hero_badge_zh,
            "hero_badge_en": hero_badge_en,
            "hero_title_1_zh": hero_title_1_zh,
            "hero_title_1_en": hero_title_1_en,
            "hero_title_2_zh": hero_title_2_zh,
            "hero_title_2_en": hero_title_2_en,
            "hero_sub_zh": hero_sub_zh,
            "hero_sub_en": hero_sub_en,
            "address_zh": address_zh,
            "address_en": address_en,
            "phone": phone,
            "email": email,
            **biz,
        }
        save_overrides(new_data)
        st.success("修改已保存，请切换到“官网预览”查看。")
        st.rerun()

with article_tab:
    article_lang = st.radio("文章语言", ["中文文章", "English article"], horizontal=True)
    article_file = "wind-power.html" if article_lang == "中文文章" else "wind-power-en.html"
    components.html(article_html(article_file), height=1000, scrolling=True)

with export_tab:
    st.subheader("导出和部署")
    st.download_button(
        "下载当前官网预览 HTML",
        data=homepage_html(overrides).encode("utf-8"),
        file_name="广东汉柏能源集团官网-当前预览.html",
        mime="text/html",
    )
    st.download_button(
        "下载 content_overrides.json",
        data=json.dumps(overrides, ensure_ascii=False, indent=2).encode("utf-8"),
        file_name="content_overrides.json",
        mime="application/json",
    )
    st.markdown("#### 提交 Git")
    st.code(
        "git add content_overrides.json\n"
        "git commit -m \"update website content\"\n"
        "git push",
        language="bash",
    )
    st.markdown("#### 部署入口")
    st.code("streamlit_app.py", language="text")
