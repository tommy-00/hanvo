/* ============================================================
   广东汉柏能源集团官网 · 轻量后端（零依赖，无需 npm install）
   ------------------------------------------------------------
   启动：node server.js   （或 npm start）
   端口：默认 8000，可用环境变量 PORT 修改

   提供的服务：
   1. 静态网站托管   —— 浏览器访问 http://localhost:8000 即打开网站
   2. POST /api/contact  —— 接收联系表单留言，存入 data/messages.json
   3. GET  /api/messages  —— 查看全部留言（admin.html 留言管理页使用）

   正式上线注意事项（详见 README）：
   - 请把留言存储换成正式的数据库 / 邮箱 / CRM 对接
   - /api/messages 当前无鉴权，上线前必须加登录认证或关闭
   ============================================================ */

var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');

var ROOT = __dirname;                       // 静态文件根目录 = 项目根
var DATA_DIR = path.join(ROOT, 'data');     // 留言存储目录
var MSG_FILE = path.join(DATA_DIR, 'messages.json');
var PORT = process.env.PORT || 8000;
var HOST = '0.0.0.0';                       // 允许局域网/预览环境访问

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.mp4':  'video/mp4',
  '.pdf':  'application/pdf'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

function sendJSON(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

/* ---------- 留言存储 ---------- */
function loadMessages() {
  try { return JSON.parse(fs.readFileSync(MSG_FILE, 'utf-8')); }
  catch (e) { return []; }
}
function saveMessages(list) {
  if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
  fs.writeFileSync(MSG_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

/* ---------- 路由 ---------- */
var server = http.createServer(function (req, res) {
  var url = req.url.split('?')[0];

  console.log(new Date().toISOString(), req.method, url);

  /* ---- API：健康检查 ---- */
  if (url === '/api/health') {
    return sendJSON(res, 200, { ok: true, service: 'hanbo-website', time: new Date().toISOString() });
  }

  /* ---- API：提交留言 ---- */
  if (url === '/api/contact' && req.method === 'POST') {
    var chunks = [];
    var size = 0;
    req.on('data', function (c) {
      size += c.length;
      if (size > 64 * 1024) { req.destroy(); return sendJSON(res, 413, { ok: false, error: 'too large' }); }
      chunks.push(c);
    });
    req.on('end', function () {
      var data;
      try { data = JSON.parse(Buffer.concat(chunks).toString('utf-8')); }
      catch (e) { return sendJSON(res, 400, { ok: false, error: 'invalid json' }); }

      var name = String(data.name || '').trim();
      var tel = String(data.tel || '').trim();
      var email = String(data.email || '').trim();
      var message = String(data.message || '').trim();
      if (!name || !tel || !message) {
        return sendJSON(res, 400, { ok: false, error: 'name/tel/message required' });
      }
      var rec = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name.slice(0, 50),
        tel: tel.slice(0, 30),
        email: email.slice(0, 100),
        message: message.slice(0, 2000),
        time: new Date().toLocaleString('zh-CN', { hour12: false })
      };
      var list = loadMessages();
      list.unshift(rec);
      saveMessages(list);
      console.log('  ✔ 收到新留言:', rec.name, rec.tel);
      return sendJSON(res, 200, { ok: true, id: rec.id });
    });
    return;
  }

  /* ---- API：查看留言（仅演示用，上线前须加鉴权） ---- */
  if (url === '/api/messages' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, count: loadMessages().length, messages: loadMessages() });
  }

  /* ---- 静态文件 ---- */
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }

  var filePath = path.normalize(path.join(ROOT, url === '/' ? 'index.html' : url));
  if (!filePath.startsWith(ROOT)) {                       // 防目录穿越
    return send(res, 403, 'Forbidden');
  }
  fs.stat(filePath, function (err, st) {
    if (err || !st.isFile()) {
      // 读不了的路径如果是个目录，尝试 index.html
      var alt = path.join(filePath, 'index.html');
      return fs.stat(alt, function (err2, st2) {
        if (err2 || !st2.isFile()) { return send(res, 404, '404 Not Found'); }
        var ext = path.extname(alt).toLowerCase();
        return fs.createReadStream(alt).pipe(res);
      });
    }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, function () {
  var ip = networkIP();
  console.log('==============================================');
  console.log('  广东汉柏能源集团官网 - 服务已启动');
  console.log('  网站首页 : http://localhost:' + PORT);
  console.log('  留言管理 : http://localhost:' + PORT + '/admin.html');
  console.log('  启动方式 : 保持本窗口开着，浏览器访问上面地址');
  console.log('  停止服务 : 按 Ctrl + C');
  console.log('==============================================');
});

function networkIP() {
  var ifaces = os.networkInterfaces();
  for (var k in ifaces) {
    for (var i = 0; i < ifaces[k].length; i++) {
      var a = ifaces[k][i];
      if (a.family === 'IPv4' && !a.internal) { return a.address; }
    }
  }
  return '127.0.0.1';
}
