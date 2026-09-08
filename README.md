# 狼人真言网页项目

基于 Werewords（狼人真言）玩法的中文聚会助手。第一版已实现完整游戏流程；模型音频待生成，当前提供无声预览，尚未发布网站。

已确认方向：线下聚会，所有玩家共用一部手机。身份使用线下实体卡；网页负责出词、夜晚看词引导、计时与结算辅助。

- [调查与来源](docs/RESEARCH.md)
- [开发计划及验收](docs/PLANS.md)
- [本版规则与阶段](docs/RULES.md)
- [语音生成与接入](docs/VOICE.md)
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
- 模型录音预加载、旧播报取消、播报结束后计时；夜晚进入后台暂停并遮挡答案。

语音尚未生成时，夜晚仅可手动预览；不会静默自动推进。用户已表示稍后配置生成所需的密钥。

## 验证与音频生成

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run voice:check
```

本机 Playwright 下载的浏览器启动异常，验证使用已安装的 Chrome。PowerShell 可运行 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后执行 `npm run test:e2e`。

`voice:check` 目前会准确报告 13 段音频缺失。配置本机 `OPENAI_API_KEY` 后执行 `npm run voice:generate`，再检查并试听。密钥不进入网页或 Git；正式游玩仅播放预先生成的静态音频。

项目站点通常形如 `https://<用户名>.github.io/<仓库名>/`。目前只有本地仓库，尚未关联 GitHub remote，也没有线上地址。

本项目是独立的非官方工具；计划使用自行编写的界面、说明和中文词库。
