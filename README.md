# 狼人真言网页项目

基于 Werewords（狼人真言）玩法的中文聚会助手。第一版已实现完整游戏流程；现使用用户提供的录音裁剪成 13 段播报，本轮桌面真实音频验证通过，已发布到 GitHub Pages，可公开访问。

已确认方向：线下聚会，所有玩家共用一部手机。身份使用线下实体卡；网页负责出词、夜晚看词引导、计时与结算辅助。

- [调查与来源](docs/RESEARCH.md)
- [开发计划及验收](docs/PLANS.md)
- [本版规则与阶段](docs/RULES.md)
- [录音裁剪与接入](docs/VOICE.md)
- [角色配置与扩展](docs/ROLES.md)
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
- 本局角色数量配置，村民自动补位；支持先知、狼人、村民以及爪牙、观察者、共济会成员、怪物。镇长为额外职务，仍使用线下实体卡。

本轮界面调整包括圆桌正反双向提示、精简状态文案、独立的闭眼等待设置（默认 4 秒，看词仍默认 8 秒）及阶段插图；最新完成情况见进度。角色目录统一维护在 `src/roles.ts`，增删说明见角色文档。

用户已明确扩展角色配音后续再补。基础角色继续使用现有录音；选中任何缺少录音的扩展角色后，整局进入明确标注的手动预演，夜晚不会自动推进。扩展自动语音尚未完成。

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

公开网址：[狼人真言](https://merelyfun.github.io/werewords/)。仓库：[MerelyFun/werewords](https://github.com/MerelyFun/werewords)。

推送到 `main` 会由 `.github/workflows/pages.yml` 自动运行检查、构建并发布 `dist`；仅修改文档不重新部署，也可手动运行工作流。网页支持仓库子路径，无需后端或 API 密钥。已完成正式网址下的字体、图片、13 段录音与双向看词验证。

本项目是独立的非官方工具；计划使用自行编写的界面、说明和中文词库。

## Steam 扩展词库

已接入四个独立来源：你画我歪（乱七八糟啥都有）243词、阴间词汇大合集600词、笑死人不偿命329词、乱七八糟你画我歪462词。共1634条来源记录、1571个不同词面，可多选混抽，候选按词面去重。来源ID、链接、作者、更新时间与原件哈希集中记录于 [steam-sources.json](src/data/steam-sources.json)，完整导入记录见[首批](docs/STEAM_WORD_IMPORT.md)与[新增两份](docs/STEAM_IMPORT_ADDITIONS.md)；标准/挑战为本项目整理，非Steam官方分级。

## 词库来源

新增“汉兜 handle”（424条成语）与“Parti”（880条分类猜词），可单独或多选混抽；标准/挑战为本项目整理。固定版本、原件哈希、重建方法和许可见[接入记录](docs/GITHUB_WORD_IMPORT.md)。Parti词库保留非商业许可，完整声明随站点发布于[词库许可](https://merelyfun.github.io/werewords/wordlist-notices.txt)。

开局按词库名称多选，全部难度混合抽取，设置自动保存；暂不提供标准／挑战选择，旧难度设置也不限制词池。“群友派对之夜”300词也可参与混抽；界面不显示词数或主题分类。来源与扩展方式见[群友词库接入](docs/PARTY_WORD_IMPORT.md)。Steam候选榜见[订阅与最近更新前十](docs/STEAM_RANK_POPULAR.md)、[最新发布前十](docs/STEAM_RANK_NEWEST.md)。


## 2026-09-09 首页与多选词库调整

- 首页采用整幅月夜封面、香槟金主按钮、开放式设置列表；看词与闭眼时间收进“更多设置”，角色图保留。
- 词库按名称多选，不显示词数、不提供类型/主题分类；至少选一个库，混抽按词面去重。
- 难度统一标准/挑战，标准合并原简单与中等；兼容旧单库设置并忽略旧分类。
- 验证：构建、42项单元测试、20项Chrome浏览器测试通过，320px无横向溢出；390px截图已检查。内置浏览器初次连接失败，使用真实Chrome完成验证。
- 白天页面已合并，最终构建与23项浏览器测试全通过；扩展角色配音仍待补充。

## 万象趣猜

新增自编综合词库660词（标准430／挑战230），涵盖近年热词、经典梗、古今中外人物景物、生活常识与脑洞概念。可按名称独立选择或混抽；[完整词单与整理原则](docs/GENERATED_WORD_LIBRARY.md)。已发布；目前全部词条混抽，历史分级仅供编辑参考。
