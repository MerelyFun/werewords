# 狼人真言网页项目

基于 Werewords（狼人真言）玩法的中文聚会助手。第一版已实现完整游戏流程；现使用用户提供的录音裁剪成 13 段播报，本轮桌面真实音频验证通过，尚未发布网站。

已确认方向：线下聚会，所有玩家共用一部手机。身份使用线下实体卡；网页负责出词、夜晚看词引导、计时与结算辅助。

- [调查与来源](docs/RESEARCH.md)
- [开发计划及验收](docs/PLANS.md)
- [本版规则与阶段](docs/RULES.md)
- [录音裁剪与接入](docs/VOICE.md)
- [项目约定](AGENTS.md)
- [已确认事项](docs/MEMORY.md)
- [进度与下一步](docs/PROGRESS.md)

## 技术与发布方向

已使用 Vite + TypeScript + React 构建纯静态前端，依赖由 package-lock.json 锁定。后续可以通过 GitHub Actions 发布到 GitHub Pages。静态资源使用相对路径，游戏无需后端、账号或玩家身份数据库。

## 本地运行

需要 Node.js 22.12+。

```sh
npm ci
npm run dev
```

打开终端显示的本地网址（默认 http://127.0.0.1:5173）。手机实际访问需要同一局域网的开发服务器地址，或后续发布的 Pages 地址；手机上的 localhost 不是电脑。

## 已实现

- 4–10 人设置，猜词与看词时长，4 类、2 种难度，共 128 个自编中文词条。
- 镇长选词确认、夜晚分阶段看词与遮挡、白天回答展示、指认与投票计时、人工结算。
- 每阶段跳过、暂停、重播入口、重开确认、设置本地保存。
- 静态录音预加载、旧播报取消、播报结束后计时；夜晚进入后台暂停并遮挡答案。

当前播报来自用户提供的 49.872 秒 MP3，运行和裁剪均无需 API 密钥。音频不可用时，夜晚仅可手动无声预览，不会静默自动推进。

## 验证与音频裁剪

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run voice:check
```

本机 Playwright 下载的浏览器启动异常，验证使用已安装的 Chrome。PowerShell 可运行 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后执行 `npm run test:e2e`。

原录音保存在 [assets/audio/host-source.mp3](assets/audio/host-source.mp3)，切点记录在 [docs/audio-cuts.json](docs/audio-cuts.json)。运行 `npm run voice:cut` 可重新裁剪，再用 `npm run voice:check` 检查静态资源。裁剪需要 Python、ffmpeg 和 ffprobe。本轮验证结果见 [进度](docs/PROGRESS.md)。OpenAI 生成脚本仅保留为可选工具，当前无需配置密钥。

项目站点通常形如 `https://<用户名>.github.io/<仓库名>/`。目前只有本地仓库，尚未关联 GitHub remote，也没有线上地址。

本项目是独立的非官方工具；计划使用自行编写的界面、说明和中文词库。
