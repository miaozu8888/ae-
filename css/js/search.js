/* =========================================================
 * 轻量模糊搜索（零依赖，支持中英文）
 * - 支持空格/逗号分隔多关键词
 * - 子串命中得分最高
 * - 字符顺序模糊匹配（如输入"gzzz"可命中"故障-震字"）
 * - 得分 < 0 表示不匹配
 * ========================================================= */

function fuzzyMatchScore(query, text) {
  var q = String(query || "").toLowerCase();
  var t = String(text || "").toLowerCase();
  if (!q) return 0;

  // 子串直接命中：高分
  if (t.indexOf(q) !== -1) return 100;

  // 多关键词：每个词独立匹配，取最低得分
  var parts = q.split(/[\s,，、]+/).filter(function (p) { return p; });
  if (parts.length === 0) return 0;
  if (parts.length > 1) {
    var scores = parts.map(function (p) { return charSeqScore(p, t); });
    if (scores.indexOf(-1) !== -1) return -1;
    return Math.min.apply(null, scores);
  }
  return charSeqScore(parts[0], t);
}

function charSeqScore(q, t) {
  var ti = 0;
  var total = 0;
  var consecutive = 0;
  for (var i = 0; i < q.length; i++) {
    var ch = q[i];
    if (ch === " ") continue;
    var found = t.indexOf(ch, ti);
    if (found === -1) {
      // 尝试从开头再找一次（支持乱序）
      found = t.indexOf(ch, 0);
      if (found === -1) return -1;
    }
    if (found === ti) {
      consecutive += 1;
      total += 2 + consecutive;
    } else {
      consecutive = 0;
      total += 1;
    }
    ti = found + 1;
  }
  return total;
}

/* 对模板计算综合搜索得分 */
function searchTemplates(list, query, category) {
  var q = String(query || "").trim();
  return list
    .filter(function (t) {
      if (category && category !== "__all__" && t.category !== category) return false;
      if (!q) return true;
      var haystack = [t.name, t.category].concat(t.tags || []).concat(t.description || "").join(" ");
      return fuzzyMatchScore(q, haystack) >= 0;
    })
    .map(function (t) {
      var score = q ? fuzzyMatchScore(q, [t.name, t.category].concat(t.tags || []).join(" ")) : 0;
      return { t: t, score: score };
    })
    .sort(function (a, b) {
      // 有搜索词时按匹配得分降序，无搜索词保持数据顺序
      if (q) {
        if (b.score !== a.score) return b.score - a.score;
      }
      return 0;
    })
    .map(function (x) { return x.t; });
}
