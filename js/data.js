/* =========================================================
 * 模板数据文件：新增模板只需在 TEMPLATES 数组里加一条记录
 * （推荐用「添加模板」工具页 add.html 自动生成）
 *
 * FILTER_OPTIONS：筛选面板标签（类型/风格/创作/分辨率/宽高比/帧率）
 *   可在 add.html「筛选标签管理」区块增删改，保存后自动生效
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

window.FILTER_OPTIONS = {
  type: ["AE模板", "Pr模板", "视频素材", "C4D模型", "FCP模板", "3dMax模型", "其他"],
  style: ["实拍写实", "立体三维", "平面二维", "抽象光影", "故障风", "霓虹赛博", "粒子光效", "简约卡通风"],
  source: ["真实影像", "含AI", "不含AI"],
  resolution: ["4K", "1080P", "720P"],
  ratio: ["16:9", "9:16", "1:1", "4:3"],
  fps: ["24", "25", "30", "60"]
};

window.TEMPLATES = [
      
    
  
  {
    id: '01',
    name: '江苏徐州中国世界地图',
    type: 'AE模板',
    category: '背景素材',
    style: '粒子光效',
    source: '不含AI',
    tags: ['地图', '徐州'],
    creator: '',
    description: '',
    previewVideo: 'https://cdn.jsdelivr.net/gh/miaozu8888/ae-@main/previews/XARP325H%E8%8E%B7%E5%BE%97TOP50%E5%B8%82%E5%9C%BA%E8%A1%A8%E7%8E%B0%E9%87%91%E5%A5%96.mp4',
    coverImage: 'https://pan.baidu.com/s/12XEpXu--oYP4V-w41t45jA?pwd=7jg9',
    downloadUrl: 'https://pan.baidu.com/s/1qA-40tTKueDJkG9igFTArw?pwd=w76x',
    fileSize: '约 85 MB',
    version: 'v2.1',
    software: 'AE 2023+',
    resolution: '4K',
    ratio: '16:9',
    fps: 25,
    duration: 15,
    updatedAt: '2026-09-20'
  }
,
  {
    id: '01',
    name: '江苏徐州中国世界地图',
    type: 'AE模板',
    category: '背景素材',
    style: '粒子光效',
    source: '不含AI',
    tags: ['地图', '徐州'],
    creator: '',
    description: '',
    previewVideo: 'https://cdn.jsdelivr.net/gh/miaozu8888/ae-@main/previews/XARP325H%E8%8E%B7%E5%BE%97TOP50%E5%B8%82%E5%9C%BA%E8%A1%A8%E7%8E%B0%E9%87%91%E5%A5%96.mp4',
    coverImage: 'https://pan.baidu.com/s/12XEpXu--oYP4V-w41t45jA?pwd=7jg9',
    downloadUrl: 'https://pan.baidu.com/s/1qA-40tTKueDJkG9igFTArw?pwd=w76x',
    fileSize: '约 85 MB',
    version: 'v2.1',
    software: 'AE 2023+',
    resolution: '4K',
    ratio: '16:9',
    fps: 25,
    duration: 15,
    updatedAt: '2026-09-20'
  }
];
