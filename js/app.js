/* =========================================================
 * AE 模板库 · 主逻辑：多级筛选 / 搜索 / 排序 / 详情弹窗
 * 筛选面板标签由 js/data.js 的 FILTER_OPTIONS 动态生成
 * ========================================================= */

(function () {
  "use strict";

  var TEMPLATES = window.TEMPLATES || [];
  var FILTER_OPTIONS = window.FILTER_OPTIONS || {
    type: [],
    style: [],
    source: [],
    resolution: ["4K", "1080P", "720P"],
    ratio: ["16:9", "9:16", "1:1", "4:3"],
    fps: ["24", "25", "30", "60"]
  };

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
    filterInner: document.getElementById("filter-inner"),
    stats: document.getElementById("stats-line"),
    empty: document.getElementById("empty-state"),
    mask: document.getElementById("modal-mask"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close")
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

  /* ---------- 筛选面板动态生成 ---------- */
  var FILTER_ROWS = [
    { key: "type", label: "类型", allText: "全部类型" },
    { key: "style", label: "风格", allText: "全部风格" },
    { key: "source", label: "创作", allText: "全部创作" }
  ];

  function buildFilterPanel() {
    if (!el.filterInner) return;
    var html = "";
    FILTER_ROWS.forEach(function (row) {
      var opts = FILTER_OPTIONS[row.key] || [];
      html += '<div class="filter-row" id="row-' + row.key + '">' +
        '<span class="filter-label">' + escapeHtml(row.label) + "</span>" +
        '<div class="filter-tags">' +
        '<span class="filter-tag active" data-key="' + row.key + '" data-val="__all__">' + escapeHtml(row.allText) + "</span>";
      opts.forEach(function (v) {
        html += '<span class="filter-tag" data-key="' + row.key + '" data-val="' + escAttr(v) + '">' + escapeHtml(v) + "</span>";
      });
      html += "</div></div>";
    });

    html += '<div class="filter-row" id="row-advanced">' +
      '<span class="filter-label">高级</span>' +
      '<div class="filter-tags">' +
      '<select class="adv-select" id="adv-resolution"><option value="__all__">分辨率</option>';
    (FILTER_OPTIONS.resolution || []).forEach(function (v) {
      html += '<option value="' + escAttr(v) + '">' + escapeHtml(v) + "</option>";
    });
    html += "</select>";
    html += '<select class="adv-select" id="adv-ratio"><option value="__all__">宽高比</option>';
    (FILTER_OPTIONS.ratio || []).forEach(function (v) {
      html += '<option value="' + escAttr(v) + '">' + escapeHtml(v) + "</option>";
    });
    html += "</select>";
    html += '<select class="adv-select" id="adv-fps"><option value="__all__">帧率</option>';
    (FILTER_OPTIONS.fps || []).forEach(function (v) {
      html += '<option value="' + escAttr(v) + '">' + escapeHtml(v) + "fps</option>";
    });
    html += "</select>";
    html += '<select class="adv-select" id="adv-duration"><option value="__all__">时长</option><option value="short">10秒内</option><option value="mid">10-30秒</option><option value="long">30秒以上</option></select>';
    html += "</div>";
    html += '<div class="filter-tools">' +
      '<button class="tool-btn" id="btn-collapse" title="收起/展开筛选">收起筛选</button>' +
      '<button class="tool-btn" id="btn-reset" title="重置所有条件">条件重置</button>' +
      "</div></div>";

    el.filterInner.innerHTML = html;

    el.adv = {
      resolution: document.getElementById("adv-resolution"),
      ratio: document.getElementById("adv-ratio"),
      fps: document.getElementById("adv-fps"),
      duration: document.getElementById("adv-duration")
    };
    el.btnCollapse = document.getElementById("btn-collapse");
    el.btnReset = document.getElementById("btn-reset");
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
  var PLACEHOLDER_CLASS = 'class="media-placeholder"';
  var PLACEHOLDER_FAIL = '<div class="media-placeholder fail">预览加载失败</div>';

  function mediaHTML(t) {
    if (t.previewVideo) {
      return '<video src="' + escAttr(t.previewVideo) + '" muted loop preload="metadata" playsinline' +
        ' onerror="this.outerHTML=' + escAttr(PLACEHOLDER_FAIL) + '"></video>';
    }
    if (t.coverImage) {
      return '<img src="' + escAttr(t.coverImage) + '" alt="' + escAttr(t.name) + '" loading="lazy"' +
        ' onerror="this.outerHTML=' + escAttr(PLACEHOLDER_FAIL) + '"/>';
    }
    return '<div ' + PLACEHOLDER_CLASS + '>预览待添加</div>';
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
    var media;
    if (t.previewVideo) {
      media = '<video class="modal-video" src="' + escAttr(t.previewVideo) + '" controls playsinline' +
        ' onerror="this.outerHTML=' + escAttr('<div class="modal-placeholder fail">预览视频加载失败</div>') + '"></video>';
    } else if (t.coverImage) {
      media = '<div class="modal-cover-wrap"><img class="modal-cover" src="' + escAttr(t.coverImage) + '" alt="' + escAttr(t.name) + '"' +
        ' onerror="this.outerHTML=' + escAttr('<div class="modal-placeholder fail">预览图加载失败</div>') + '"/></div>';
    } else {
      media = '<div class="modal-placeholder">预览视频待添加</div>';
    }
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
      (hasDl ? "" : '<div class="hint">提示：在 add.html 中为该模板填写 downloadUrl 即可开启下载</div>');

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

  /* ---------- 筛选事件（委托） ---------- */
  function bindFilterEvents() {
    if (el.filterInner) {
      el.filterInner.addEventListener("click", function (e) {
        var tag = e.target.closest ? e.target.closest(".filter-tag[data-key]") : null;
        if (!tag) return;
        var key = tag.getAttribute("data-key");
        var val = tag.getAttribute("data-val");
        state.filters[key] = val;
        el.filterInner.querySelectorAll('.filter-tag[data-key="' + key + '"]').forEach(function (t) {
          t.classList.toggle("active", t === tag);
        });
        render();
      });
    }

    if (el.adv) {
      ["resolution", "ratio", "fps", "duration"].forEach(function (k) {
        el.adv[k].addEventListener("change", function () {
          state.filters[k] = el.adv[k].value;
          render();
        });
      });
    }

    if (el.btnReset) {
      el.btnReset.addEventListener("click", function () {
        state.query = "";
        el.search.value = "";
        state.filters = { type: "__all__", style: "__all__", source: "__all__", resolution: "__all__", ratio: "__all__", fps: "__all__", duration: "__all__" };
        el.filterInner.querySelectorAll(".filter-tag[data-key]").forEach(function (t) {
          t.classList.toggle("active", t.getAttribute("data-val") === "__all__");
        });
        Object.keys(el.adv).forEach(function (k) { el.adv[k].value = "__all__"; });
        render();
      });
    }

    if (el.btnCollapse) {
      el.btnCollapse.addEventListener("click", function () {
        el.panel.classList.toggle("collapsed");
        el.btnCollapse.textContent = el.panel.classList.contains("collapsed") ? "展开筛选" : "收起筛选";
      });
    }
  }

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
  buildFilterPanel();
  bindFilterEvents();
  render();
})();
