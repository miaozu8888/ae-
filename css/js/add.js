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

  /* ---------- 启动 ---------- */
  loadConfig();
  renderCode();
})();
