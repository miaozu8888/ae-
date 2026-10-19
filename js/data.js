/* =========================================================
 * 模板数据文件：新增模板只需在 TEMPLATES 数组里加一条记录
 * （推荐用「添加模板」工具页 add.html 自动生成，再粘贴到这里）
 *
 * 字段说明：
 *   id          唯一标识（字符串，建议英文+数字）
 *   name        模板名称
 *   type        类型：AE模板 / Pr模板 / 视频素材 / C4D模型 / FCP模板 / 3dMax模型 / 其他
 *   category    分类（二级筛选用，如：标题动画/背景素材/转场/片头/片尾/文字/元素）
 *   style       风格：实拍写实 / 立体三维 / 平面二维 / 抽象光影 / 故障风 / 霓虹赛博 / 粒子光效 / 简约卡通风
 *   source      创作：真实影像 / 含AI / 不含AI
 *   tags        标签数组（用于模糊搜索）
 *   creator     作者署名（可选）
 *   description 描述
 *   previewVideo 预览视频 URL（MP4 直链；留空显示占位）
 *   coverImage   封面图 URL（可选）
 *   downloadUrl  模板文件下载直链（R2 / 网盘；留空按钮置灰）
 *   fileSize     文件大小描述，如 "约 120 MB"
 *   version      版本
 *   software     适用软件，如 "AE 2022+"
 *   resolution   分辨率：4K / 1080P / 720P
 *   ratio        宽高比：16:9 / 9:16 / 1:1 / 4:3
 *   fps          帧率：24 / 25 / 30 / 60
 *   duration     时长（秒，用于高级筛选）
 *   updatedAt    更新时间 YYYY-MM-DD
 * ========================================================= */

window.TEMPLATES = [
  {
    id: "demo-neon-title",
    name: "霓虹故障标题（示例）",
    type: "AE模板",
    category: "标题动画",
    style: "霓虹赛博",
    source: "不含AI",
    tags: ["故障", "霓虹", "赛博", "标题", "开场"],
    creator: "我的工作室",
    description: "示例模板：适合短视频开场的故障风标题动画，支持中英文字体替换，AE 2022+ 可直接使用。请将 previewVideo 和 downloadUrl 替换为您的真实文件链接。",
    previewVideo: "",
    coverImage: "",
    downloadUrl: "",
    fileSize: "约 120 MB",
    version: "v1.0",
    software: "AE 2022+",
    resolution: "1080P",
    ratio: "16:9",
    fps: 30,
    duration: 8,
    updatedAt: "2026-10-01"
  },
  {
    id: "demo-particle-bg",
    name: "粒子动态背景（示例）",
    type: "AE模板",
    category: "背景素材",
    style: "粒子光效",
    source: "不含AI",
    tags: ["粒子", "背景", "动态", "光效", "合成"],
    creator: "我的工作室",
    description: "示例模板：可自由配色的粒子流动背景，适合做舞台大屏、MV 底衬。请将 previewVideo 和 downloadUrl 替换为您的真实文件链接。",
    previewVideo: "",
    coverImage: "",
    downloadUrl: "",
    fileSize: "约 85 MB",
    version: "v2.1",
    software: "AE 2023+",
    resolution: "4K",
    ratio: "16:9",
    fps: 25,
    duration: 15,
    updatedAt: "2026-09-20"
  }
,
      {
    id: '测试-cza2',
    name: '测试',
    type: 'AE模板',
    category: '',
    style: '平面二维',
    source: '真实影像',
    tags: [],
    creator: '',
    description: '车饰',
    previewVideo: '',
    coverImage: '',
    downloadUrl: 'https://pan.baidu.com/s/1csTMUwa_F1ZPzh_uilqh1Q?pwd=8p6q',
    fileSize: '',
    version: '',
    software: '',
    resolution: '4K',
    ratio: '16:9',
    fps: 24,
    duration: 0,
    updatedAt: '2026-10-19'
  }

,
  {
    id: '测试-cza2',
    name: '测试',
    type: 'AE模板',
    category: '',
    style: '平面二维',
    source: '真实影像',
    tags: [],
    creator: '',
    description: '车饰',
    previewVideo: '',
    coverImage: '',
    downloadUrl: ': https://pan.baidu.com/s/1csTMUwa_F1ZPzh_uilqh1Q?pwd=8p6q',
    fileSize: '',
    version: '',
    software: '',
    resolution: '4K',
    ratio: '16:9',
    fps: 24,
    duration: 0,
    updatedAt: '2026-10-19'
  }
];
