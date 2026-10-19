/* =========================================================
 * AE 模板库 · 主逻辑：渲染 / 分类 / 搜索 / 排序 / 详情弹窗
 * ========================================================= */

(function () {
  "use strict";

  var TEMPLATES = window.TEMPLATES || [];

  var state = {
    query: "",
    category: "__all__",
    sort: "updated"
  };

  var el = {
    grid: document.getElementById("grid"),
    search: document.getElementById("search-input"),
    sort: document.getElementById("sort-select"),
    categoryBar: document.getElementById("category-bar"),
    stats: document.getElementById("stats-line"),
    empty: document.getElementById("empty-state"),
    mask: document.getElementById("modal-mask"),
    modal: document.getElementById("modal"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close")
  };

  /* ---------- 工具 ---------- */
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escAttr(s) { return escapeHtml(s); }

  function parseSizeMB(s) {
    var m = String(s || "").match(/([\d.]+)\s*(MB|GB)/i);
    if (!m) return 0;
    return parseFloat(m[1]) * (m[2].toUpperCase() === "GB" ? 1024 : 1);
  }

  /* ---------- 分类聚合 ---------- */
  function buildCategories() {
    var cats = [];
    var seen = {};
    TEMPLATES.forEach(function (t) {
      if (t.category && !seen[t.category]) {
        seen[t.category] = true;
        cats.push(t.category);
      }
    });
    return cats;
  }

  function renderCategories() {
    var cats = buildCategories();
    var html = '<span class="category-chip active" data-cat="__all__">全部</span>';
    cats.forEach(function (c) {
      var count = TEMPLATES.filter(function (t) { return t.category === c; }).length;
      html += '<span class="category-chip" data-cat="' + escAttr(c) + '">' + escapeHtml(c) + ' <em style="font-style:normal;opacity:.6">' + count + "</em></span>";
    });
    el.categoryBar.innerHTML = html;
    el.categoryBar.querySelectorAll(".category-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.getAttribute("data-cat");
        el.categoryBar.querySelectorAll(".category-chip").forEach(function (c) {
          c.classList.toggle("active", c === chip);
        });
        render();
      });
    });
  }

  /* ---------- 排序 ---------- */
  function sortList(list) {
    var s = state.sort;
    var copy = list.slice();
    if (s === "name") {
      copy.sort(function (a, b) { return a.name.localeCompare(b.name, "zh-CN"); });
    } else if (s === "size") {
      copy.sort(function (a, b) { return parseSizeMB(b.fileSize) - parseSizeMB(a.fileSize); });
    } else {
      copy.sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
    }
    return copy;
  }

  /* ---------- 卡片渲染 ---------- */
  function mediaHTML(t) {
    if (t.previewVideo) {
      return '<video class="card-media-video" src="' + escAttr(t.previewVideo) + '" muted loop preload="metadata" playsinline></video>';
    }
    if (t.coverImage) {
      return '<img src="' + escAttr(t.coverImage) + '" alt="' + escAttr(t.name) + '" loading="lazy" />';
    }
    return '<div class="media-placeholder">预览待添加</div>';
  }

  function cardHTML(t) {
    var hasDl = !!(t.downloadUrl && String(t.downloadUrl).length > 4);
    var badge = hasDl
      ? '<span class="media-badge dl">可下载</span>'
      : '<span class="media-badge nodl">待配置下载</span>';
    var tags = (t.tags || []).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + "</span>";
    }).join("");
    return (
      '<div class="card" data-id="' + escAttr(t.id) + '">' +
        '<div class="card-media">' + mediaHTML(t) + badge + "</div>" +
        '<div class="card-body">' +
          '<div class="card-title">' + escapeHtml(t.name) + "</div>" +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(t.software || "-") + "</span>" +
            '<span>·</span><span>' + escapeHtml(t.fileSize || "-") + "</span>" +
            '<span>·</span><span>' + escapeHtml(t.updatedAt || "") + "</span>" +
          "</div>" +
          '<div class="card-tags">' + tags + "</div>" +
          '<div class="card-footer">' +
            '<span class="card-category">' + escapeHtml(t.category || "") + "</span>" +
            '<a class="download-btn' + (hasDl ? "" : " disabled") + '" href="' + escAttr(t.downloadUrl || "#") + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">下载</a>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function render() {
    var filtered = searchTemplates(TEMPLATES, state.query, state.category);
    filtered = sortList(filtered);

    el.stats.textContent = "共 " + filtered.length + " 个模板" + (state.query ? "（搜索: " + state.query + "）" : "");
    el.empty.hidden = filtered.length > 0;

    var html = filtered.map(cardHTML).join("");
    el.grid.innerHTML = html;

    el.grid.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-id");
        var t = TEMPLATES.find(function (x) { return x.id === id; });
        if (t) openModal(t);
      });
      var video = card.querySelector("video");
      if (video) {
        card.addEventListener("mouseenter", function () { try { video.play(); } catch (e) {} });
        card.addEventListener("mouseleave", function () { try { video.pause(); } catch (e) {} });
      }
    });
  }

  /* ---------- 详情弹窗 ---------- */
  function openModal(t) {
    var hasDl = !!(t.downloadUrl && String(t.downloadUrl).length > 4);
    var media = t.previewVideo
      ? '<video class="modal-video" src="' + escAttr(t.previewVideo) + '" controls playsinline></video>'
      : '<div class="modal-placeholder">预览视频待添加</div>';
    var tags = (t.tags || []).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + "</span>";
    }).join("");

    el.modalBody.innerHTML =
      media +
      '<h2 class="modal-title">' + escapeHtml(t.name) + "</h2>" +
      '<div class="modal-desc">' + escapeHtml(t.description || "暂无描述") + "</div>" +
      '<div class="modal-info">' +
        '<div>分类：<b>' + escapeHtml(t.category || "-") + "</b></div>" +
        '<div>版本：<b>' + escapeHtml(t.version || "-") + "</b></div>" +
        '<div>软件：<b>' + escapeHtml(t.software || "-") + "</b></div>" +
        '<div>大小：<b>' + escapeHtml(t.fileSize || "-") + "</b></div>" +
        '<div>更新：<b>' + escapeHtml(t.updatedAt || "-") + "</b></div>" +
      "</div>" +
      '<div class="card-tags" style="margin-top:12px">' + tags + "</div>" +
      (hasDl
        ? '<a class="modal-download" href="' + escAttr(t.downloadUrl) + '" target="_blank" rel="noopener">下载模板文件</a>'
        : '<span class="modal-download disabled">下载链接未配置</span>') +
      (hasDl ? "" : '<div class="hint">提示：在 js/data.js 中为该模板填写 downloadUrl 即可开启下载</div>');

    el.mask.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    el.mask.hidden = true;
    document.body.style.overflow = "";
    el.modalBody.innerHTML = "";
  }

  el.modalClose.addEventListener("click", closeModal);
  el.mask.addEventListener("click", function (e) {
    if (e.target === el.mask) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- 事件绑定 ---------- */
  el.search.addEventListener("input", function () {
    state.query = el.search.value;
    render();
  });

  el.sort.addEventListener("change", function () {
    state.sort = el.sort.value;
    render();
  });

  /* ---------- 启动 ---------- */
  renderCategories();
  render();
})();
