/* =========================================================
 * AE 模板库 · 主逻辑：多级筛选 / 搜索 / 排序 / 详情弹窗
 * ========================================================= */

(function () {
  "use strict";

  var TEMPLATES = window.TEMPLATES || [];

  var state = {
    query: "",
    sort: "updated",
    filters: { type: "__all__", style: "__all__", source: "__all__", resolution: "__all__", ratio: "__all__", fps: "__all__", duration: "__all__" }
  };

  var el = {
    grid: document.getElementById("grid"),
    search: document.getElementById("search-input"),
    sort: document.getElementById("sort-select"),
    panel: document.getElementById("filter-panel"),
    btnCollapse: document.getElementById("btn-collapse"),
    btnReset: document.getElementById("btn-reset"),
    stats: document.getElementById("stats-line"),
    empty: document.getElementById("empty-state"),
    mask: document.getElementById("modal-mask"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close"),
    adv: {
      resolution: document.getElementById("adv-resolution"),
      ratio: document.getElementById("adv-ratio"),
      fps: document.getElementById("adv-fps"),
      duration: document.getElementById("adv-duration")
    }
  };

  /* ---------- 工具 ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escAttr(s) { return escapeHtml(s); }

  function parseSizeMB(s) {
    var m = String(s || "").match(/([\d.]+)\s*(MB|GB)/i);
    if (!m) return 0;
    return parseFloat(m[1]) * (m[2].toUpperCase() === "GB" ? 1024 : 1);
  }

  /* ---------- 筛选 ---------- */
  function passFilters(t) {
    var f = state.filters;
    if (f.type !== "__all__" && (t.type || "") !== f.type) return false;
    if (f.style !== "__all__" && (t.style || "") !== f.style) return false;
    if (f.source !== "__all__" && (t.source || "") !== f.source) return false;
    if (f.resolution !== "__all__" && (t.resolution || "") !== f.resolution) return false;
    if (f.ratio !== "__all__" && (t.ratio || "") !== f.ratio) return false;
    if (f.fps !== "__all__" && String(t.fps || "") !== f.fps) return false;
    if (f.duration !== "__all__") {
      var d = Number(t.duration || 0);
      if (f.duration === "short" && (d > 10 || !d)) return false;
      if (f.duration === "mid" && (d <= 10 || d > 30)) return false;
      if (f.duration === "long" && d <= 30) return false;
    }
    return true;
  }

  /* ---------- 排序 ---------- */
  function sortList(list) {
    var copy = list.slice();
    if (state.sort === "name") {
      copy.sort(function (a, b) { return (a.name || "").localeCompare(b.name || "", "zh-CN"); });
    } else if (state.sort === "size") {
      copy.sort(function (a, b) { return parseSizeMB(b.fileSize) - parseSizeMB(a.fileSize); });
    } else {
      copy.sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
    }
    return copy;
  }

  /* ---------- 卡片渲染 ---------- */
  function mediaHTML(t) {
    if (t.previewVideo) {
      return '<video src="' + escAttr(t.previewVideo) + '" muted loop preload="metadata" playsinline></video>';
    }
    if (t.coverImage) {
      return '<img src="' + escAttr(t.coverImage) + '" alt="' + escAttr(t.name) + '" loading="lazy" />';
    }
    return '<div class="media-placeholder">预览待添加</div>';
  }

  function cornerInfo(t) {
    var parts = [];
    if (t.duration) {
      var d = Number(t.duration);
      if (d > 0) parts.push(d >= 60 ? Math.floor(d / 60) + ":" + ("0" + (d % 60)).slice(-2) : d + "s");
    }
    if (t.resolution) parts.push(t.resolution);
    if (t.fps) parts.push(t.fps + "fps");
    return parts.join(" · ");
  }

  function cardHTML(t) {
    var hasDl = !!(t.downloadUrl && String(t.downloadUrl).length > 4);
    var badge = hasDl
      ? '<span class="media-badge">可下载</span>'
      : '<span class="media-badge nodl">待配置下载</span>';
    var corner = cornerInfo(t);
    var tags = (t.tags || []).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + "</span>";
    }).join("");
    var creator = t.creator ? " · " + escapeHtml(t.creator) : "";
    return (
      '<div class="card" data-id="' + escAttr(t.id) + '">' +
        '<div class="card-media">' + mediaHTML(t) + badge + (corner ? '<span class="corner-badge">' + corner + "</span>" : "") + "</div>" +
        '<div class="card-body">' +
          '<div class="card-title">' + escapeHtml(t.name) + "</div>" +
          '<div class="card-meta"><span class="type-tag">' + escapeHtml(t.type || "其他") + "</span>" + creator + "</div>" +
          '<div class="card-tags">' + tags + "</div>" +
          '<div class="card-footer">' +
            '<span style="font-size:12px;color:var(--text-dim)">' + escapeHtml(t.updatedAt || "") + "</span>" +
            '<a class="download-btn' + (hasDl ? "" : " disabled") + '" href="' + escAttr(t.downloadUrl || "#") + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">下载</a>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function render() {
    var filtered = TEMPLATES.filter(passFilters);
    if (state.query) {
      filtered = filtered.filter(function (t) {
        var haystack = [t.name, t.type, t.category, t.style, t.source, t.creator].concat(t.tags || []).concat(t.description || "").join(" ");
        return fuzzyMatchScore(state.query, haystack) >= 0;
      });
    }
    filtered = sortList(filtered);

    el.stats.textContent = "共 " + filtered.length + " 个模板" + (state.query ? "（搜索: " + state.query + "）" : "");
    el.empty.hidden = filtered.length > 0;

    el.grid.innerHTML = filtered.map(cardHTML).join("");

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
        '<div>类型：<b>' + escapeHtml(t.type || "-") + "</b></div>" +
        '<div>分类：<b>' + escapeHtml(t.category || "-") + "</b></div>" +
        '<div>风格：<b>' + escapeHtml(t.style || "-") + "</b></div>" +
        '<div>创作：<b>' + escapeHtml(t.source || "-") + "</b></div>" +
        '<div>版本：<b>' + escapeHtml(t.version || "-") + "</b></div>" +
        '<div>软件：<b>' + escapeHtml(t.software || "-") + "</b></div>" +
        '<div>分辨率：<b>' + escapeHtml(t.resolution || "-") + "</b></div>" +
        '<div>宽高比：<b>' + escapeHtml(t.ratio || "-") + "</b></div>" +
        '<div>帧率：<b>' + escapeHtml(t.fps || "-") + "</b></div>" +
        '<div>时长：<b>' + cornerInfo(t) + "</b></div>" +
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

  /* ---------- 筛选事件 ---------- */
  document.querySelectorAll(".filter-tag[data-key]").forEach(function (tag) {
    tag.addEventListener("click", function () {
      var key = tag.getAttribute("data-key");
      var val = tag.getAttribute("data-val");
      state.filters[key] = val;
      document.querySelectorAll('.filter-tag[data-key="' + key + '"]').forEach(function (t) {
        t.classList.toggle("active", t === tag);
      });
      render();
    });
  });

  ["resolution", "ratio", "fps", "duration"].forEach(function (k) {
    el.adv[k].addEventListener("change", function () {
      state.filters[k] = el.adv[k].value;
      render();
    });
  });

  el.btnReset.addEventListener("click", function () {
    state.query = "";
    el.search.value = "";
    state.filters = { type: "__all__", style: "__all__", source: "__all__", resolution: "__all__", ratio: "__all__", fps: "__all__", duration: "__all__" };
    document.querySelectorAll(".filter-tag[data-key]").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-val") === "__all__");
    });
    Object.keys(el.adv).forEach(function (k) { el.adv[k].value = "__all__"; });
    render();
  });

  el.btnCollapse.addEventListener("click", function () {
    el.panel.classList.toggle("collapsed");
    el.btnCollapse.textContent = el.panel.classList.contains("collapsed") ? "展开筛选" : "收起筛选";
  });

  /* ---------- 搜索与排序 ---------- */
  el.search.addEventListener("input", function () {
    state.query = el.search.value;
    render();
  });

  el.sort.addEventListener("change", function () {
    state.sort = el.sort.value;
    render();
  });

  /* ---------- 启动 ---------- */
  render();
})();
