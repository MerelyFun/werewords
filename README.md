# 狼人真言网页项目

基于 Werewords（狼人真言）玩法筹备的中文网页。当前完成资料调查、Git 初始化与开发规划，尚未实现游戏或部署网站。

已确认方向：线下聚会，所有玩家共用一部手机。网页负责身份查看、出词、夜晚引导、计时与结算。

- [调查与来源](docs/RESEARCH.md)
- [开发计划及验收](docs/PLANS.md)
- [项目约定](AGENTS.md)
- [已确认事项](docs/MEMORY.md)
- [进度与下一步](docs/PROGRESS.md)

## 技术与发布方向

建议使用 Vite + TypeScript + React 构建纯静态前端，当前未安装依赖、未锁定版本。后续可以通过 GitHub Actions 发布到 GitHub Pages。

项目站点通常形如 `https://<用户名>.github.io/<仓库名>/`。目前只有本地仓库，尚未关联 GitHub remote，也没有线上地址。

本项目是独立的非官方工具；计划使用自行编写的界面、说明和中文词库。
