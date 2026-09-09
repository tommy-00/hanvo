
/* ============================================================
   网站交互脚本（导航 / 双语切换 / 表单 / 动画）
   ============================================================ */
(function(){
  "use strict";

  /* ---------- 顶部导航：滚动变白底 + 动态高度 ---------- */
  var header = document.getElementById('siteHeader');
  function syncHeaderHeight(){
    if(!header){ return 0; }
    var h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-height', h + 'px');
    document.documentElement.style.scrollPaddingTop = h + 'px';
    return h;
  }
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
    syncHeaderHeight();
  }
  function goToSection(id){
    var target = document.getElementById(id);
    if(!target){ return; }
    /* 先切换导航状态，再读取真实高度，避免滚动态高度变化造成露出上一页 */
    if(id === 'home'){ header.classList.remove('scrolled'); }
    else{ header.classList.add('scrolled'); }
    var h = syncHeaderHeight();
    var top = target.getBoundingClientRect().top + window.pageYOffset - h;
    window.scrollTo({top:Math.max(0, top), behavior:'smooth'});
    try{ history.replaceState(null, '', '#' + id); }catch(e){}
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', syncHeaderHeight, {passive:true});
  if('ResizeObserver' in window && header){ new ResizeObserver(syncHeaderHeight).observe(header); }
  onScroll();
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if(!a){ return; }
    var id = a.getAttribute('href').slice(1);
    if(document.getElementById(id)){
      e.preventDefault();
      goToSection(id);
    }
  }, true);

  /* ---------- 移动端抽屉菜单 ---------- */
  var nav = document.getElementById('mainNav');
  var burger = document.getElementById('hamburger');
  burger.addEventListener('click', function(){
    nav.classList.toggle('open');
    burger.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  /* ---------- 导航高亮当前版块 ---------- */
  var sections = ['home','about','milestones','business','projects','news','contact'].map(function(id){
    return document.getElementById(id);
  }).filter(Boolean);
  var navLinks = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function(a){
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  if('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          Object.keys(navLinks).forEach(function(k){ navLinks[k].classList.remove('active'); });
          if(navLinks[e.target.id]){ navLinks[e.target.id].classList.add('active'); }
        }
      });
    }, {rootMargin:'-40% 0px -55% 0px'});
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* ---------- 中英双语切换 ---------- */
  var TITLES = {
    zh: "广东汉柏能源集团 GUANGDONG HANVO ENERGY GROUP | 风 · 光 · 煤 · 氢 · 算 多能互补",
    en: "GUANGDONG HANVO ENERGY GROUP | Wind · Solar · Coal · Hydrogen · Computing"
  };
  var DESCS = {
    zh: "广东汉柏能源集团构建“风、光、煤、氢、算”多能互补的综合能源产业格局，集投资、研发、设计、建设、运营与维护于一体。",
    en: "Guangdong Hanvo Energy Group is an innovative high-tech energy company building a multi-energy portfolio of wind, solar, coal, hydrogen and computing."
  };
  var langBtn = document.getElementById('langBtn');
  function syncLanguageLinks(lang){
    document.querySelectorAll('[data-zh-href],[data-en-href]').forEach(function(el){
      var href = (lang === 'en') ? el.getAttribute('data-en-href') : el.getAttribute('data-zh-href');
      if(href){ el.setAttribute('href', href); }
    });
    document.querySelectorAll('.card-clickable[data-href-en]').forEach(function(card){
      var href = (lang === 'en') ? card.getAttribute('data-href-en') : card.getAttribute('data-href-zh');
      if(href){ card.setAttribute('data-href', href); }
    });
  }
  function applyLang(lang){
    document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
    document.title = TITLES[lang];
    document.querySelector('meta[name="description"]').setAttribute('content', DESCS[lang]);
    langBtn.textContent = (lang === 'zh') ? 'EN' : '中文';
    document.querySelectorAll('[data-zh]').forEach(function(el){
      if(!el.dataset.zhOriginal){ el.dataset.zhOriginal = el.innerHTML; } // 首次记录中文原文
      if(lang === 'zh'){
        if(el.dataset.zhOriginal !== undefined){ el.innerHTML = el.dataset.zhOriginal; }
      } else if(el.dataset.en !== undefined){
        el.innerHTML = el.dataset.en;
      }
    });
    document.querySelectorAll('[data-zh-ph]').forEach(function(el){
      if(!el.dataset.zhPhOriginal){ el.dataset.zhPhOriginal = el.placeholder; }
      el.placeholder = (lang === 'zh') ? el.dataset.zhPhOriginal : (el.dataset.enPh || '');
    });
    syncLanguageLinks(lang);
    try{ localStorage.setItem('hb-lang', lang); }catch(e){}
  }
  langBtn.addEventListener('click', function(){
    var cur = (document.documentElement.lang === 'zh-CN') ? 'zh' : 'en';
    applyLang(cur === 'zh' ? 'en' : 'zh');
  });
  var saved = null;
  try{ saved = localStorage.getItem('hb-lang'); }catch(e){}
  applyLang(saved === 'en' ? 'en' : 'zh');

  /* ---------- 联系表单：提交到后端 /api/contact ---------- */
  var form = document.getElementById('contactForm');
  var ok = document.getElementById('formOk');
  var S = {
    ok: "<span data-zh='✓ 已收到您的留言，我们会尽快与您联系。' data-en='✓ Thank you! We will get back to you soon.'>✓ 已收到您的留言，我们会尽快与您联系。</span>",
    fail: "<span data-zh='✗ 提交失败：请用 node server.js 启动后端服务后再试（或直接电话联系我们）。' data-en='✗ Failed: please start the backend (node server.js) and try again, or call us directly.'>✗ 提交失败：请用 node server.js 启动后端服务后再试（或直接电话联系我们）。</span>"
  };
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var name = document.getElementById('fName');
    var tel  = document.getElementById('fTel');
    var mail = document.getElementById('fMail');
    var msg  = document.getElementById('fMsg');
    var valid = name.value.trim() && tel.value.trim() && msg.value.trim();
    [name, tel, msg].forEach(function(f){ f.style.borderColor = ''; });
    if(!valid){
      if(!name.value.trim()){ name.style.borderColor = '#E05B5B'; }
      if(!tel.value.trim()){ tel.style.borderColor = '#E05B5B'; }
      if(!msg.value.trim()){ msg.style.borderColor = '#E05B5B'; }
      return;
    }
    var payload = { name:name.value.trim(), tel:tel.value.trim(),
                    email:mail.value.trim(), message:msg.value.trim() };
    fetch('/api/contact', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).then(function(r){
      if(!r.ok) throw new Error('bad status');
      return r.json();
    }).then(function(){
      ok.innerHTML = S.ok; ok.classList.add('show'); form.reset();
      setTimeout(function(){ ok.classList.remove('show'); }, 7000);
    }).catch(function(){
      ok.innerHTML = S.fail; ok.classList.add('show');
      setTimeout(function(){ ok.classList.remove('show'); }, 7000);
    });
  });

  /* ---------- 滚动入场动画 ---------- */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }



  /* ---------- 品牌中英文等宽对齐（英文改字号，不横向压缩字形） ---------- */
  function measureText(text, styles, fontSize){
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:-9999px;';
    probe.style.fontFamily = styles.fontFamily;
    probe.style.fontSize = fontSize || styles.fontSize;
    probe.style.fontWeight = styles.fontWeight;
    probe.style.fontStyle = styles.fontStyle;
    probe.style.letterSpacing = styles.letterSpacing;
    probe.style.lineHeight = '1';
    probe.textContent = text;
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    return w;
  }
  function fitBrandNames(){
    document.querySelectorAll('.brand').forEach(function(b){
      var name = b.querySelector('.name');
      var en = name && name.querySelector('.name-en');
      if(!name || !en){ return; }
      var zh = '';
      Array.prototype.forEach.call(name.childNodes, function(n){
        if(n.nodeType === 3 && n.textContent.trim()){ zh = n.textContent.trim(); }
      });
      if(!zh){ return; }
      var zhStyles = getComputedStyle(name);
      var enStyles = getComputedStyle(en);
      var target = measureText(zh, zhStyles);
      var base = 8.5;
      var natural = measureText(en.textContent.trim(), enStyles, base + 'px');
      if(target > 0 && natural > 0){
        /* 只调整整体字号，保持英文笔画的宽高比例 */
        en.style.fontSize = (base * target / natural).toFixed(2) + 'px';
      }
    });
  }
  fitBrandNames();
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitBrandNames); }

  /* ---------- 响应式页面滚动 ----------
     首页保留全屏视觉，其余版块由 CSS 按内容自然撑开，
     让不同尺寸的电脑都能顺畅浏览，不再强制一屏一跳。 */
  /* ---------- 整块卡片点击跳转 ---------- */
  document.querySelectorAll('.card-clickable[data-href]').forEach(function(card){
    function go(){ window.location.href = card.getAttribute('data-href'); }
    card.addEventListener('click', function(e){
      /* 卡片内已有明确链接时，优先使用链接本身，避免重复跳转 */
      if(e.target.closest && e.target.closest('a,button,input,textarea,select')){ return; }
      go();
    });
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); }
    });
  });

  /* ---------- 页脚年份 ---------- */
  var y = document.getElementById('year');
  if(y){ y.textContent = new Date().getFullYear(); }
})();
