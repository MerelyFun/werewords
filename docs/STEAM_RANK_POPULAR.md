# Steam 中文词库：人气与维护时间前十

查询日期：2026-09-09；范围为 Steam《你画我猜》（Draw & Guess，App 1483870）中文词库。订阅数为当前订阅快照，日期统一北京时间（UTC+8）。

## 查询方法与边界

读取[工坊累计订阅排序](https://steamcommunity.com/workshop/browse/?appid=1483870&browsesort=totaluniquesubscribers&section=readytouseitems&numperpage=30&p=1)前 5 页，共 150 个唯一工坊 ID，使用官方页面 window.SSR.renderContext 的 queryData.results 字段。当前人气按 subscriptions 降序；维护榜先筛 subscriptions > 10000，再按 time_updated 降序。未把 lifetime_subscriptions（累计订阅）当作当前订阅数。

第 150 项为 2504555487，累计订阅 8,381，低于 10,000 门槛，也低于人气榜第十名的 89,749；当前订阅不高于累计，因此这次扫描覆盖两榜所需候选。检查非“中文”标签候选（简中、汉语、中国等），它们不影响以下前十。

词数仅为工坊标题宣称，并非本轮逐库下载计数。标题没有词数则保留“不详”。同一工坊 ID 在不同榜单出现是榜单交叉，不是重复导入。标记已接入的四个来源 ID：3022451195、3416324742、2660283448、2890545389；具体导入结果见 STEAM_WORD_IMPORT.md。

## 当前订阅人数前十

| 排名 | 词库（原始标题） | 当前订阅 | 最后更新 | 接入状态 |
|---|---|---:|---|---|
| 1 | [简体中文 就是多 1267](https://steamcommunity.com/sharedfiles/filedetails/?id=2499017147) | 326928 | 2021-06-09 | 未接入 |
| 2 | [中文 啥都有（245个词） 245](https://steamcommunity.com/sharedfiles/filedetails/?id=2511225319) | 195409 | 2021-08-21 | 未接入 |
| 3 | [中文 动物 126](https://steamcommunity.com/sharedfiles/filedetails/?id=2517506712) | 154892 | 2021-08-13 | 未接入 |
| 4 | [中文 英雄联盟(纯英雄名) 目前更新到影哨阿克尚](https://steamcommunity.com/sharedfiles/filedetails/?id=2525144686) | 152530 | 2021-07-25 | 未接入 |
| 5 | [简体中文 歪了就算胜利 256](https://steamcommunity.com/sharedfiles/filedetails/?id=2560911586) | 151067 | 2021-08-10 | 未接入 |
| 6 | [中文 b站热梗 156](https://steamcommunity.com/sharedfiles/filedetails/?id=2499097953) | 141253 | 2021-08-26 | 未接入 |
| 7 | [简体中文 笑死人不偿命 329](https://steamcommunity.com/sharedfiles/filedetails/?id=2660283448) | 106133 | 2024-04-13 | 已接入 |
| 8 | [中文 食物(难度略高) 179](https://steamcommunity.com/sharedfiles/filedetails/?id=2534658434) | 105463 | 2021-07-05 | 未接入 |
| 9 | [中文 5050题库之动画名 107](https://steamcommunity.com/sharedfiles/filedetails/?id=2504158465) | 102612 | 2021-06-01 | 未接入 |
| 10 | [中文 常用成词语大全 803](https://steamcommunity.com/sharedfiles/filedetails/?id=2499139069) | 89749 | 2021-05-27 | 未接入 |

## 最近更新且当前订阅人数过万前十

| 排名 | 词库（原始标题） | 当前订阅 | 最后更新 | 接入状态 |
|---|---|---:|---|---|
| 1 | [简体中文 笑死人不偿命 329](https://steamcommunity.com/sharedfiles/filedetails/?id=2660283448) | 106133 | 2024-04-13 | 已接入 |
| 2 | [中文 乱七八糟你画我歪 462](https://steamcommunity.com/sharedfiles/filedetails/?id=2890545389) | 26683 | 2024-01-28 | 已接入 |
| 3 | [中文 00后童年动画片词库（持续更新中...） 208](https://steamcommunity.com/sharedfiles/filedetails/?id=3055118418) | 14418 | 2023-10-20 | 未接入 |
| 4 | [中文 LOL全英雄及相关适用于接龙 222](https://steamcommunity.com/sharedfiles/filedetails/?id=2524932771) | 58473 | 2023-09-22 | 未接入 |
| 5 | [中文 生活常见物品 简单容易画 专心画画 650](https://steamcommunity.com/sharedfiles/filedetails/?id=3024169919) | 12910 | 2023-08-23 | 未接入 |
| 6 | [简体中文 你画我歪（乱七八糟啥都有） 243](https://steamcommunity.com/sharedfiles/filedetails/?id=3022451195) | 17670 | 2023-08-19 | 已接入 |
| 7 | [中文 你画我歪 128](https://steamcommunity.com/sharedfiles/filedetails/?id=2974829947) | 20200 | 2023-05-12 | 未接入 |
| 8 | [中文 英雄联盟 284](https://steamcommunity.com/sharedfiles/filedetails/?id=2512688294) | 37794 | 2023-04-17 | 未接入 |
| 9 | [中文 B站热梗，动漫（含童年）等等 91](https://steamcommunity.com/sharedfiles/filedetails/?id=2947932731) | 13939 | 2023-03-17 | 未接入 |
| 10 | [中文 你画我猜派对啥都有（207个东西！） 211](https://steamcommunity.com/sharedfiles/filedetails/?id=2707436991) | 28905 | 2022-12-11 | 未接入 |

“你画我猜派对啥都有”标题同时写“207个东西”与尾部“211”，保留两者，实际附件计数待下载核验。生活常见物品的更新时间为北京时间 2023-08-23；不能用此前显示的发布日期替代。

本轮此两榜仅调查，未自动导入其余候选。最近更新不等于词条全部为新梗。
