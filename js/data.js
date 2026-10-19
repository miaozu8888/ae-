/* =========================================================
 * 模板数据文件：新增模板只需在 TEMPLATES 数组里加一条记录
 *
 * 字段说明：
 *   id          唯一标识（字符串）
 *   name        模板名称
 *   category    分类（用于分类筛选）
 *   tags        标签数组（用于模糊搜索）
 *   description 描述（展示在详情弹窗）
 *   previewVideo 预览视频 URL（MP4 直链；留空则显示占位）
 *   coverImage   封面图 URL（可选，有封面图且无视频时显示封面）
 *   downloadUrl  模板文件下载直链（R2 直链 / 网盘分享链接；留空则按钮置灰）
 *   fileSize     文件大小描述
 *   version      模板版本
 *   software     适用软件版本，如 "AE 2022+"
 *   updatedAt    更新时间，格式 YYYY-MM-DD
 * ========================================================= */

window.TEMPLATES = [
  {
    id: "demo-neon-title",
    name: "霓虹故障标题（示例）",
    category: "标题动画",
    tags: ["故障", "霓虹", "赛博", "标题", "开场"],
    description: "示例模板：适合短视频开场的故障风标题动画，支持中英文字体替换，AE 2022+ 可直接使用。请将 previewVideo 和 downloadUrl 替换为您的真实文件链接。",
    previewVideo: "",
    coverImage: "",
    downloadUrl: "",
    fileSize: "约 120 MB",
    version: "v1.0",
    software: "AE 2022+",
    updatedAt: "2026-10-01"
  },
  {
    id: "demo-particle-bg",
    name: "粒子动态背景（示例）",
    category: "背景素材",
    tags: ["粒子", "背景", "动态", "光效", "合成"],
    description: "示例模板：可自由配色的粒子流动背景，适合做舞台大屏、MV 底衬。请将 previewVideo 和 downloadUrl 替换为您的真实文件链接。",
    previewVideo: "",
    coverImage: "",
    downloadUrl: "",
    fileSize: "约 85 MB",
    version: "v2.1",
    software: "AE 2023+",
    updatedAt: "2026-09-20"
  },
  {
    id: "demo-transition-glitch",
    name: "故障转场包（示例）",
    category: "转场",
    tags: ["转场", "故障", "卡顿", "过渡", "电音"],
    description: "示例模板：12 组故障风转场预设，拖拽即用。请将 previewVideo 和 downloadUrl 替换为您的真实文件链接。",
    previewVideo: "",
    coverImage: "",
    downloadUrl: "",
    fileSize: "约 200 MB",
    version: "v1.3",
    software: "AE 2022+ / PR 2022+",
    updatedAt: "2026-08-15"
  }
];
