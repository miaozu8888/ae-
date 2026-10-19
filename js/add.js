/* =========================================================
 * 添加模板工具页逻辑：表单 → 生成 data.js 代码 → 复制
 * ========================================================= */

(function () {
  "use strict";

  var FIELDS = [
    "id", "name", "type", "category", "style", "source", "tags", "creator",
    "previewVideo", "coverImage", "downloadUrl",
    "resolution", "ratio", "fps", "duration", "fileSize", "version", "software", "updatedAt",
    "description"
  ];

  function $(id) { return document.getElementById(id); }

  function escCode(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n");
  }

  function safeStr(val) {
    var s = String(val == null ? "" : val).trim();
    return s ? "'" + escCode(s) + "'" : "''";
  }

  function safeNum(val) {
    var n = Number(val);
    return isNaN(n) || val === "" || val == null ? 0 : n;
  }

  function genId(name) {
    var s = String(name || "template").trim().toLowerCase();
    s = s.replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "");
    if (!s) s = "template";
    var rand = Math.random().toString(36).slice(2, 6);
    return s + "-" + rand;
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  function collect() {
    var data = {};
    FIELDS.forEach(function (k) {
      var el = $(k === "id" ? "f-id" : "f-" + k);
      data[k] = el ? el.value : "";
    });
    return data;
  }

  function buildCode(d) {
    var name = d.name.trim();
    var id = d.id.trim() || genId(name);

    var tags = String(d.tags || "").split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
    var tagCode = tags.length
      ? "[" + tags.map(function (t) { return "'" + escCode(t) + "'"; }).join(", ") + "]"
      : "[]";

    var lines = [];
    lines.push("  {");
    lines.push('    id: ' + safeStr(id) + ",");
    lines.push('    name: ' + safeStr(name) + ",");
    lines.push('    type: ' + safeStr(d.type) + ",");
    lines.push('    category: ' + safeStr(d.category) + ",");
    lines.push('    style: ' + safeStr(d.style) + ",");
    lines.push('    source: ' + safeStr(d.source) + ",");
    lines.push("    tags: " + tagCode + ",");
    lines.push('    creator: ' + safeStr(d.creator) + ",");
    lines.push('    description: ' + safeStr(d.description) + ",");
    lines.push('    previewVideo: ' + safeStr(d.previewVideo) + ",");
    lines.push('    coverImage: ' + safeStr(d.coverImage) + ",");
    lines.push('    downloadUrl: ' + safeStr(d.downloadUrl) + ",");
    lines.push('    fileSize: ' + safeStr(d.fileSize) + ",");
    lines.push('    version: ' + safeStr(d.version) + ",");
    lines.push('    software: ' + safeStr(d.software) + ",");
    lines.push('    resolution: ' + safeStr(d.resolution) + ",");
    lines.push('    ratio: ' + safeStr(d.ratio) + ",");
    lines.push("    fps: " + safeNum(d.fps) + ",");
    lines.push("    duration: " + safeNum(d.duration) + ",");
    lines.push('    updatedAt: ' + safeStr(d.updatedAt) + "");
    lines.push("  }");

    var head = "// 在 js/data.js 的 TEMPLATES 数组末尾（]; 前）粘贴以下代码：\n";
    return head + lines.join("\n");
  }

  /* ---------- 渲染（带简单高亮） ---------- */
  var out = $("code-output");
  var status = $("code-status");
  var lastCode = "";

  function renderCode() {
    var d = collect();
    if (!d.updatedAt.trim()) d.updatedAt = today();
    var code = buildCode(d);
    lastCode = code;
    out.textContent = code;
    status.textContent = d.name.trim() ? "自动生成中…" : "填写表单后自动生成";
  }

  function highlight() {
    // 简单关键词着色（仅视觉辅助，不影响复制内容）
    var code = lastCode;
    var html = escCode(code)
      .replace(/(^\s*[a-zA-Z]+:\s*)/gm, '<span class="hl-key">$1</span>')
      .replace(/'[^'\n]*'/g, function (m) { return '<span class="hl-str">' + m + "</span>"; });
    out.innerHTML = html.replace(/\n/g, "<br>");
  }

  FIELDS.forEach(function (k) {
    var el = $(k === "id" ? "f-id" : "f-" + k);
    if (el) el.addEventListener("input", renderCode);
  });

  // ID 自动生成：名称变化但 ID 为空时同步
  $("f-name").addEventListener("input", function () {
    if (!$("f-id").value.trim()) renderCode();
  });

  /* ---------- 复制 ---------- */
  function copyText(text) {
    return new Promise(function (resolve) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { resolve(true); }, function () { fallbackCopy(text, resolve); });
      } else {
        fallbackCopy(text, resolve);
      }
    });
  }

  function fallbackCopy(text, cb) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      cb(ok);
    } catch (e) { cb(false); }
  }

  $("btn-copy").addEventListener("click", function () {
    copyText(lastCode).then(function (ok) {
      status.textContent = ok ? "✓ 已复制，去 GitHub 粘贴吧" : "复制失败，请手动选中代码复制";
      if (ok) {
        var btn = $("btn-copy");
        btn.textContent = "已复制 ✓";
        setTimeout(function () { btn.textContent = "复制代码"; }, 2000);
      }
    });
  });

  $("btn-clear").addEventListener("click", function () {
    FIELDS.forEach(function (k) {
      var el = $(k === "id" ? "f-id" : "f-" + k);
      if (el) {
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      }
    });
    renderCode();
  });

  /* ---------- 文件上传（匿名托管，自动回填直链） ---------- */
  var UPLOAD_SERVICES = [
    { name: "0x0.st", url: "https://0x0.st", field: "file" },
    { name: "catbox.moe", url: "https://catbox.moe/user/api.php", field: "reqtype=fileupload" }
  ];

  function uploadFile(file) {
    var data = new FormData();
    data.append("file", file);
    return fetch(UPLOAD_SERVICES[0].url, { method: "POST", body: data })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (text) {
        var url = String(text || "").trim();
        if (!/^https?:\/\//.test(url)) throw new Error("响应不是直链");
        return url;
      })
      .catch(function (e) {
        // 备用：catbox
        var fd = new FormData();
        fd.append("reqtype", "fileupload");
        fd.append("fileToUpload", file);
        return fetch(UPLOAD_SERVICES[1].url, { method: "POST", body: fd })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
          .then(function (text) {
            var url = String(text || "").trim();
            if (!/^https?:\/\//.test(url)) throw new Error("响应不是直链");
            return url;
          });
      });
  }

  document.querySelectorAll(".upload-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-target");
      var accept = btn.getAttribute("data-accept") || "";
      var input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var oldText = btn.textContent;
        btn.classList.add("uploading");
        btn.textContent = "上传中…";
        uploadFile(file).then(function (url) {
          var field = $(target);
          field.value = url;
          btn.textContent = "✓ 已上传";
          renderCode();
          setTimeout(function () { btn.textContent = "上传文件"; btn.classList.remove("uploading"); }, 2000);
        }).catch(function () {
          btn.textContent = "上传失败";
          btn.classList.remove("uploading");
          setTimeout(function () { btn.textContent = "上传文件"; }, 2000);
          status.textContent = "上传失败，请手动填写链接或改用 R2/网盘";
        });
      });
      input.click();
    });
  });

  /* ---------- GitHub 一键入库 ---------- */
  var CFG_KEY = "ae_vault_gh_config";

  function b64encodeUtf8(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function b64decodeUtf8(b64) {
    var bin = atob(b64);
    var bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
    return new TextDecoder("utf-8").decode(bytes);
  }

  function ghHeaders(token) {
    return {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  function loadConfig() {
    try {
      var cfg = JSON.parse(localStorage.getItem(CFG_KEY) || "{}");
      $("gh-owner").value = cfg.owner || "";
      $("gh-repo").value = cfg.repo || "";
      $("gh-token").value = cfg.token || "";
    } catch (e) {}
  }

  function saveConfig() {
    localStorage.setItem(CFG_KEY, JSON.stringify({
      owner: $("gh-owner").value.trim(),
      repo: $("gh-repo").value.trim(),
      token: $("gh-token").value.trim()
    }));
  }

  function stripHead(code) {
    // 去掉生成代码顶部的注释说明行
    return code.replace(/^\/\/[^\n]*\n/, "");
  }

  function appendRecord(existing, record) {
    // 在最后一个 ]; 前插入新记录（自动补逗号）
    var idx = existing.lastIndexOf("];");
    if (idx === -1) return null;
    var rec = stripHead(record);
    return existing.slice(0, idx) + ",\n" + rec + "\n" + existing.slice(idx);
  }

  $("btn-save-config").addEventListener("click", function () {
    saveConfig();
    showSaveStatus("配置已保存到本机浏览器", "ok");
  });

  $("btn-save-github").addEventListener("click", function () {
    var owner = $("gh-owner").value.trim();
    var repo = $("gh-repo").value.trim();
    var token = $("gh-token").value.trim();
    if (!owner || !repo || !token) {
      showSaveStatus("请填写 GitHub 用户名、仓库名和 Token（点「保存配置」可记住）", "err");
      return;
    }
    var name = $("f-name").value.trim();
    if (!name) { showSaveStatus("请先填写模板名称", "err"); return; }

    var d = collect();
    if (!d.updatedAt.trim()) d.updatedAt = today();
    var record = buildCode(d);

    saveConfig();
    var btn = $("btn-save-github");
    btn.classList.add("uploading");
    btn.textContent = "入库中…";

    var api = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo) + "/contents/js/data.js";
    fetch(api, { headers: ghHeaders(token) })
      .then(function (r) {
        if (!r.ok) throw new Error("读取仓库文件失败（HTTP " + r.status + "），请检查用户名/仓库名/Token 权限");
        return r.json();
      })
      .then(function (meta) {
        var current = b64decodeUtf8(meta.content);
        var next = appendRecord(current, record);
        if (next === null) throw new Error("data.js 结构异常，未找到 TEMPLATES 数组结尾");
        return fetch(api, {
          method: "PUT",
          headers: ghHeaders(token),
          body: JSON.stringify({
            message: "add template: " + name,
            content: b64encodeUtf8(next),
            sha: meta.sha
          })
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error("写入失败（HTTP " + r.status + "）");
        return r.json();
      })
      .then(function () {
        btn.classList.remove("uploading");
        btn.textContent = "直接入库";
        showSaveStatus("已写入仓库 js/data.js，GitHub Pages 约 1~2 分钟后自动生效", "ok");
      })
      .catch(function (e) {
        btn.classList.remove("uploading");
        btn.textContent = "直接入库";
        showSaveStatus(e.message || "入库失败，请重试", "err");
      });
  });

  function showSaveStatus(msg, cls) {
    var el = $("save-status");
    el.textContent = msg;
    el.className = "save-status" + (cls ? " " + cls : "");
  }

  /* =========================================================
   * 后台管理：加载 / 编辑 / 删除已有模板（直接写回 GitHub 仓库）
   * ========================================================= */
  var MANAGE_STATE = { id: null, name: "", raw: "", blocks: [] };

  function manageStatus(msg, cls) {
    var el = $("manage-status");
    if (!el) return;
    el.textContent = msg;
    el.className = "save-status" + (cls ? " " + cls : "");
  }

  function getRepoConfig() {
    return {
      owner: $("gh-owner").value.trim(),
      repo: $("gh-repo").value.trim(),
      token: $("gh-token").value.trim()
    };
  }

  function requireRepoConfig() {
    var cfg = getRepoConfig();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      manageStatus("请先在上方 GitHub 配置区填写用户名、仓库名和 Token（点「保存配置」可记住）", "err");
      return null;
    }
    return cfg;
  }

  function dataJsApi(cfg) {
    return "https://api.github.com/repos/" + encodeURIComponent(cfg.owner) + "/" + encodeURIComponent(cfg.repo) + "/contents/js/data.js";
  }

  /* 文本级解析：定位 data.js 中每条模板记录 { ... } 块（start/end 为文本偏移） */
  function parseTemplateBlocks(text) {
    var blocks = [];
    var i = 0, len = text.length;
    var inStr = null, esc = false, depth = 0, blockStart = -1;
    for (; i < len; i++) {
      var ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'") { inStr = ch; continue; }
      if (ch === "{") {
        if (depth === 0) blockStart = i;
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0 && blockStart !== -1) {
          blocks.push({ start: blockStart, end: i + 1 });
          blockStart = -1;
        }
      }
    }
    return blocks;
  }

  function unquoteJs(s) {
    if (!s) return "";
    if ((s[0] === "'" && s[s.length - 1] === "'") || (s[0] === '"' && s[s.length - 1] === '"')) {
      s = s.slice(1, -1);
    }
    return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
  }

  function parseRecordData(blockText) {
    var data = {};
    var lines = blockText.split("\n");
    for (var n = 0; n < lines.length; n++) {
      var m = lines[n].match(/^\s*([A-Za-z_$][\w$]*)\s*:\s*(.*?),?\s*$/);
      if (!m) continue;
      var raw = m[2].trim();
      if (raw === "") { data[m[1]] = ""; continue; }
      if (raw.charAt(0) === "[") {
        var arr = [];
        var re = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g;
        var mm;
        while ((mm = re.exec(raw)) !== null) {
          arr.push(unquoteJs(mm[1] != null ? mm[1] : mm[2]));
        }
        data[m[1]] = arr;
      } else if (/^-?\d+(\.\d+)?$/.test(raw)) {
        data[m[1]] = Number(raw);
      } else {
        data[m[1]] = unquoteJs(raw);
      }
    }
    return data;
  }

  /* 回填表单（左侧所有字段） */
  function fillForm(data) {
    FIELDS.forEach(function (k) {
      var el = $(k === "id" ? "f-id" : "f-" + k);
      if (!el) return;
      var v = data[k] != null ? data[k] : "";
      if (k === "tags" && Array.isArray(v)) v = v.join(", ");
      if (el.tagName === "SELECT") {
        var exists = false;
        for (var i = 0; i < el.options.length; i++) {
          if (el.options[i].value === v) { exists = true; break; }
        }
        if (!exists) {
          var opt = document.createElement("option");
          opt.value = v;
          opt.textContent = v || "(空)";
          el.appendChild(opt);
        }
        el.value = v;
      } else {
        el.value = v;
      }
    });
    renderCode();
  }

  /* 在最新文本中按 id 定位并替换 / 删除记录块，返回新文本（未找到返回 null） */
  function replaceRecordById(text, id, newBlock) {
    var blocks = parseTemplateBlocks(text);
    for (var i = 0; i < blocks.length; i++) {
      var data = parseRecordData(text.slice(blocks[i].start, blocks[i].end));
      if (data.id === id) {
        return text.slice(0, blocks[i].start) + newBlock + text.slice(blocks[i].end);
      }
    }
    return null;
  }

  function removeRecordById(text, id) {
    var blocks = parseTemplateBlocks(text);
    for (var i = 0; i < blocks.length; i++) {
      var data = parseRecordData(text.slice(blocks[i].start, blocks[i].end));
      if (data.id !== id) continue;
      var start = blocks[i].start;
      var end = blocks[i].end;
      var before = text.slice(0, start);
      var commaIdx = before.lastIndexOf(",");
      if (commaIdx !== -1 && /^\s*$/.test(before.slice(commaIdx + 1))) {
        start = commaIdx; // 删除前一条记录后的逗号分隔符
      } else {
        var after = text.slice(end);
        var lead = after.match(/^\s*,/);
        if (lead) end = end + lead[0].length; // 第一条记录：删除其后的逗号
      }
      return text.slice(0, start) + text.slice(end);
    }
    return null;
  }

  /* 通用 PUT：先 GET 最新内容拿 sha，再以 nextMaker 生成新文本并覆盖写入 */
  function putDataJs(cfg, message, nextMaker, btn, okText) {
    var api = dataJsApi(cfg);
    fetch(api, { headers: ghHeaders(cfg.token) })
      .then(function (r) {
        if (!r.ok) throw new Error("读取最新 js/data.js 失败（HTTP " + r.status + "），请检查仓库名与 Token 权限");
        return r.json();
      })
      .then(function (meta) {
        var latest = b64decodeUtf8(meta.content);
        var next = nextMaker(latest);
        if (next === null || next === undefined) throw new Error("未在最新 js/data.js 中找到目标模板，可能已被他人修改，请重新加载列表");
        return fetch(api, {
          method: "PUT",
          headers: ghHeaders(cfg.token),
          body: JSON.stringify({
            message: message,
            content: b64encodeUtf8(next),
            sha: meta.sha
          })
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error("写入失败（HTTP " + r.status + "），GitHub 可能已拒绝提交");
        return r.json();
      })
      .then(function () {
        btn.classList.remove("uploading");
        btn.textContent = okText;
        return true;
      })
      .catch(function (e) {
        btn.classList.remove("uploading");
        btn.textContent = okText;
        manageStatus(e.message || "操作失败，请重试", "err");
        return false;
      });
  }

  function resetManageSelection() {
    MANAGE_STATE.id = null;
    MANAGE_STATE.name = "";
    $("tmpl-list").selectedIndex = 0;
  }

  /* ① 一键加载模板列表 */
  $("btn-load-templates").addEventListener("click", function () {
    var cfg = requireRepoConfig();
    if (!cfg) return;
    saveConfig();
    var btn = $("btn-load-templates");
    var sel = $("tmpl-list");
    btn.classList.add("uploading");
    btn.textContent = "加载中…";
    fetch(dataJsApi(cfg), { headers: ghHeaders(cfg.token) })
      .then(function (r) {
        if (!r.ok) throw new Error("读取 js/data.js 失败（HTTP " + r.status + "），请检查仓库名与 Token 权限");
        return r.json();
      })
      .then(function (meta) {
        var text = b64decodeUtf8(meta.content);
        var blocks = parseTemplateBlocks(text);
        if (!blocks.length) throw new Error("js/data.js 中未解析到任何模板记录");
        sel.innerHTML = "";
        var count = 0;
        blocks.forEach(function (b) {
          var data = parseRecordData(text.slice(b.start, b.end));
          var id = data.id || "";
          if (!id) return;
          var opt = document.createElement("option");
          opt.value = String(count);
          opt.textContent = (data.name || "(未命名)") + " ｜ " + id;
          sel.appendChild(opt);
          count++;
        });
        if (!count) throw new Error("模板记录均缺少 id 字段，无法管理");
        MANAGE_STATE.raw = text;
        MANAGE_STATE.blocks = blocks;
        sel.selectedIndex = 0;
        btn.classList.remove("uploading");
        btn.textContent = "加载模板列表";
        manageStatus("已加载 " + count + " 条模板，选择一条后自动回填表单", "ok");
      })
      .catch(function (e) {
        btn.classList.remove("uploading");
        btn.textContent = "加载模板列表";
        manageStatus(e.message || "加载失败，请重试", "err");
      });
  });

  /* ② 选中模板 → 回填左侧表单 */
  $("tmpl-list").addEventListener("change", function () {
    var idx = Number(this.value);
    if (!(idx >= 0) || !MANAGE_STATE.blocks.length) {
      manageStatus("请先点击「加载模板列表」", "err");
      return;
    }
    var block = MANAGE_STATE.blocks[idx];
    var data = parseRecordData(MANAGE_STATE.raw.slice(block.start, block.end));
    MANAGE_STATE.id = data.id;
    MANAGE_STATE.name = data.name || "";
    fillForm(data);
    manageStatus("已载入「" + MANAGE_STATE.name + "」，修改字段后点「保存修改」", "ok");
  });

  /* ③ 保存修改：拿最新 sha → 替换对应记录 → PUT 覆盖整份 data.js */
  $("btn-save-edit").addEventListener("click", function () {
    var cfg = requireRepoConfig();
    if (!cfg) return;
    if (!MANAGE_STATE.id) { manageStatus("请先加载列表并选择一条模板", "err"); return; }
    var name = $("f-name").value.trim();
    if (!name) { manageStatus("模板名称不能为空", "err"); return; }

    var d = collect();
    if (!d.updatedAt.trim()) d.updatedAt = today();
    var newBlock = stripHead(buildCode(d));
    var btn = $("btn-save-edit");
    btn.classList.add("uploading");
    btn.textContent = "保存中…";

    putDataJs(cfg, "update template: " + name, function (latest) {
      return replaceRecordById(latest, MANAGE_STATE.id, newBlock);
    }, btn, "保存修改").then(function (ok) {
      if (!ok) return;
      MANAGE_STATE.name = name;
      manageStatus("已更新「" + name + "」并写入仓库 js/data.js，GitHub Pages 约 1~2 分钟后生效", "ok");
    });
  });

  /* ④ 删除该模板：拿最新 sha → 移除对应记录 → PUT 覆盖整份 data.js */
  $("btn-delete-tmpl").addEventListener("click", function () {
    var cfg = requireRepoConfig();
    if (!cfg) return;
    if (!MANAGE_STATE.id) { manageStatus("请先加载列表并选择一条模板", "err"); return; }
    var target = MANAGE_STATE.name || MANAGE_STATE.id;
    if (!window.confirm("确认删除模板「" + target + "」吗？删除将立即写入 GitHub 仓库 js/data.js，页面上无法恢复。")) return;

    var btn = $("btn-delete-tmpl");
    btn.classList.add("uploading");
    btn.textContent = "删除中…";
    putDataJs(cfg, "delete template: " + target, function (latest) {
      return removeRecordById(latest, MANAGE_STATE.id);
    }, btn, "删除该模板").then(function (ok) {
      if (!ok) return;
      manageStatus("已删除「" + target + "」并写入仓库 js/data.js，GitHub Pages 约 1~2 分钟后生效", "ok");
      resetManageSelection();
      $("btn-clear").click(); // 清空表单，避免误改残留数据
    });
  });

  /* ---------- 启动 ---------- */
  loadConfig();
  renderCode();
})();
