# 群友派对之夜词库接入

- 来源：https://github.com/778672151/party-night/blob/main/data/draw.json
- 固定来源提交：a6b1453027cbf6acbbe9119499cd2c1ceee5e359（2026-09-08）。本地保存src/data/party-night.json，300条，保留原文、level与tag。上游未见明确LICENSE，不将素材标为本项目原创或MIT。用户本轮明确选择加入。
- 原level1/2/3对应easy/medium/hard：124/116/60词；保留原主题。未混入其他库。
- src/words.ts的wordLibraries集中定义id/name/words/difficulties。新增来源只需添加数据适配和目录项。Settings.libraryId保存来源，旧设置默认builtin；切换来源恢复第一档难度和全部主题。
- 抽词同时过滤libraryId、difficulty和category；无效来源退回原有精选，无效难度退回该来源第一档，词数不足的主题退回全部。UI只展示当前难度有词的主题。
- 浏览器不访问上游：随静态网页打包，无后端或运行时下载。
