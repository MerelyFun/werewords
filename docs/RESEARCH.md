# 狼人真言调查

调查日期：2026-09-08。优先参考出版方和 GitHub 官方资料。

## 游戏身份与定位

狼人真言对应 Werewords，设计者为 Ted Alspach，出版方为 Bézier Games。它将限时猜词与隐藏阵营结合，核心互动是玩家口头提问、镇长用标记回答。中文官方应用也定位为实体游戏的出词、夜晚引导与计时助手。

来源：[出版方产品页](https://beziergames.com/products/werewords)、[官方中文应用](https://play.google.com/store/apps/details?hl=zh_CN&id=com.beziergames.werewordscn)。

## 基础规则摘要

- 角色包含村民、狼人、先知；镇长另外持有隐藏身份。
- 夜晚镇长选词，先知和狼人获知词语。
- 白天玩家提问，镇长通过回答标记回应；时间或回答资源耗尽会结束猜词。
- 猜中后，狼人仍可通过找出先知获胜。
- 未猜中则进入讨论和投票，村民有机会通过找出狼人获胜。
- 多狼人、平票及镇长兼任特殊身份会影响结算，需要单独验收。

规则参考：[官方第二版规则](https://werewords.com/rules.php?ver=2)。版本选择入口见[官方规则页](https://werewords.com/rules.php)。传统中文版本与新版、豪华版的角色及人数范围不能混用。网页首版暂限定 4–10 人基础角色，并在编码前核对所采用版本的配置和标记数量。

中文核对材料：[中文规则书](https://www.gokids.com.tw/tsaiss/gokids/rules/WWRD%20Rules_CN_20180619.pdf)。该链接已发现，具体细节仍需在规则实现前逐项核对。

## 对网页的启发（项目建议）

首版可实现配置人数 → 私密查看身份 → 镇长选词 → 夜晚查看与遮挡 → 猜词计时 → 指认或投票 → 结算 → 再来一局。

单设备需要明确传递和遮挡提示，避免下一位看到上一位身份。前端内的隐藏只防止普通操作时误看，不能防止开发者工具读取数据。词语是否猜中应由镇长判定，不必先做语音识别。

规则说明由项目自行概括，中文词库自行整理，不把官方应用词库或美术直接作为项目资产。

## GitHub Pages 可行性

GitHub Pages 托管静态 HTML、CSS、JavaScript，因此线下辅助版可直接部署。真正的多人房间同步需要额外服务，这是由静态托管能力推导的架构结论。

项目站点默认带仓库路径，后续必须验证静态资源路径。建议使用 GitHub Actions 构建后发布 dist；发布前需要仓库权限和 Pages 配置。GitHub Free 支持公开仓库的 Pages，私有仓库须核对套餐。

来源：[Pages 介绍](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[自定义发布工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[设置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages)。
