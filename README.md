---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 447a2253a1e0ab81fb1308d95a4b19e7_940d41f1cb6111f18e0e52540064ee0f
    ReservedCode1: rSmNEP5LYijMvkGCY1yAwulA8GQdrG6T2dDcwiGc/CkQTtXDfe76r47P7xmvgbfCPrq4tdUciX6jQKiUVmUbU9ht8RX54qyJtOUatd8Ym7Cuu+ThRqos4mVJKBptmy/Oj8QRAT2MGqRup3+Zd4lRvmciBRv3ntLe2PyIWR9KQ8w23xOf5lAfBJW8CFU=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 447a2253a1e0ab81fb1308d95a4b19e7_940d41f1cb6111f18e0e52540064ee0f
    ReservedCode2: rSmNEP5LYijMvkGCY1yAwulA8GQdrG6T2dDcwiGc/CkQTtXDfe76r47P7xmvgbfCPrq4tdUciX6jQKiUVmUbU9ht8RX54qyJtOUatd8Ym7Cuu+ThRqos4mVJKBptmy/Oj8QRAT2MGqRup3+Zd4lRvmciBRv3ntLe2PyIWR9KQ8w23xOf5lAfBJW8CFU=
---

# AE 模板库（VJ Vault）

个人 AE 模板管理网站：支持预览视频、模糊搜索、分类筛选、远程下载。纯静态站点，零后端零费用。

## 目录结构

```
ae-template-vault/
├── index.html        # 页面入口（浏览/筛选/搜索/详情）
├── add.html          # ★ 添加模板工具页（填表自动生成代码）
├── css/
│   ├── style.css     # 主样式（素材平台风格：白底黑高亮）
│   └── add.css       # 工具页样式
├── js/
│   ├── data.js       # ★ 模板数据（新增模板改这里）
│   ├── search.js     # 模糊搜索算法（零依赖）
│   ├── app.js        # 多级筛选/排序/渲染/详情逻辑
│   └── add.js        # 工具页表单生成逻辑
└── README.md
```

## 本地预览

- 方式一：直接双击 `index.html`（数据内嵌在 JS 中，file:// 可正常使用）
- 方式二（推荐）：在项目目录执行 `python -m http.server 8000`，浏览器打开 `http://localhost:8000`

## 如何新增模板（推荐：工具页）

打开工具页 `add.html`（站点顶栏点「＋ 添加模板」），填写模板名称、预览/下载链接、技术参数等，右侧自动生成代码。工具页还支持：**点「上传文件」直接把本地文件传到免费匿名托管并自动回填链接**；填好 GitHub 用户名/仓库名/Token 后点**「直接入库」**，自动把记录写进仓库 `js/data.js`，免手动改代码。也可以点「复制代码」后到 GitHub 的 `js/data.js` 里，在 `TEMPLATES` 数组末尾（`];` 前）粘贴即可，注意前一条记录末尾补逗号。

也可以手动在 `js/data.js` 的 `TEMPLATES` 数组中新增一条记录：

```js
{
  id: "my-template-001",          // 唯一 ID
  name: "模板名称",                // 用于搜索
  type: "AE模板",                 // 类型：AE模板/Pr模板/视频素材/...
  category: "标题动画",            // 分类（二级）
  style: "故障风",                // 风格：实拍写实/立体三维/.../霓虹赛博
  source: "不含AI",               // 创作：真实影像/含AI/不含AI
  tags: ["标题", "故障", "开场"],   // 标签，用于模糊搜索
  creator: "我的工作室",           // 作者署名（可选）
  description: "一句话描述……",
  previewVideo: "https://.../preview.mp4",  // 预览视频直链（MP4）
  coverImage: "",                 // 封面图（可选）
  downloadUrl: "https://.../template.zip",  // 模板文件下载直链
  fileSize: "约 200 MB",
  version: "v1.0",
  software: "AE 2022+",
  resolution: "1080P",            // 4K / 1080P / 720P
  ratio: "16:9",                  // 16:9 / 9:16 / 1:1 / 4:3
  fps: 30,                        // 24 / 25 / 30 / 60
  duration: 12,                   // 时长（秒，用于高级筛选）
  updatedAt: "2026-10-19"
}
```

保存后在浏览器刷新即可。**预览视频建议压缩到 720p、10~30MB**，模板本体（zip）放对象存储或网盘拿直链。

## 远程下载两种方案

| 方案 | 费用 | 优点 | 缺点 |
|---|---|---|---|
| Cloudflare R2 公开桶 | 免费 10GB + 零出站流量 | 直链不限速、体验好 | 注册需信用卡验证（不扣费） |
| 网盘分享链接 | 免费 | 容量大、无需信用卡 | 限速、要客户端、链接易失效 |

R2 拿直链步骤：控制台 → R2 → 创建存储桶 → 上传文件 → 设置公开访问 → 复制公开 URL 填入 `downloadUrl`。

## 部署上线（二选一，均免费）

### 方案 A：GitHub Pages（推荐，5 分钟）

1. 注册/登录 GitHub（https://github.com）
2. 新建仓库（New repository），名字随意，**选 Public**，不要勾选 README
3. 网页端点 `uploading an existing file`，把 `index.html`、`css/`、`js/` 全部拖进去提交
4. 仓库页 → Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / root → Save
5. 等 1~2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`

### 方案 B：Cloudflare Pages（免费私有仓库也可用）

1. 注册/登录 Cloudflare（需信用卡验证，不扣费）
2. Workers & Pages → Create → Pages → Connect to Git（可连 GitHub 私有仓库）
3. 选择仓库，Build command 留空，Framework preset 选 None，Deploy
4. 部署完成后自动生成 `https://<项目名>.pages.dev` 链接

## 注意事项

- GitHub Pages 单站上限 1GB、月带宽软限 100GB：**大模板文件绝不进仓库**，只放 R2 或网盘
- 站点内容公开可见：介意隐私请用 Cloudflare Pages + 私有仓库（URL 仍公开，但源码不可见）
- 预览视频和下载链接为空时，页面会自动显示"待添加/待配置"占位，不影响浏览
*（内容由AI生成，仅供参考）*
