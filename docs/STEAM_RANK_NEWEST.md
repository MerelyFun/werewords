# Steam 中文词库：最新发布且当前订阅人数大于 100 的前 10

查询日期：2026-09-09。范围：Steam《Draw & Guess／你画我猜》（App ID `1483870`）公开工坊中文词库。订阅数是本次查询快照，日期为北京时间（UTC+8）。本表仅调查，未下载或导入这十份词库。

| 排名 | 词库 | 标题词数 | 当前订阅人数 | 发布时间（北京时间） |
|---|---|---:|---:|---|
| 1 | [折棒新三国梗百科](https://steamcommunity.com/sharedfiles/filedetails/?id=3657075067) | 138 | 495 | 2026-01-31 13:02:22 |
| 2 | [黑夜君临](https://steamcommunity.com/sharedfiles/filedetails/?id=3620710861) | 96 | 185 | 2025-12-09 20:22:49 |
| 3 | [燕云十六声](https://steamcommunity.com/sharedfiles/filedetails/?id=3602553865) | 123 | 128 | 2025-11-09 19:29:16 |
| 4 | [魔法少女的魔女审判](https://steamcommunity.com/sharedfiles/filedetails/?id=3594556473) | 80 | 111 | 2025-10-27 19:10:19 |
| 5 | [明日方舟（更新至无忧梦呓](https://steamcommunity.com/sharedfiles/filedetails/?id=3566860359) | 374 | 467 | 2025-09-13 01:16:42 |
| 6 | [galgame角色](https://steamcommunity.com/sharedfiles/filedetails/?id=3538731477) | 109 | 499 | 2025-07-31 20:44:42 |
| 7 | [第五自用版](https://steamcommunity.com/sharedfiles/filedetails/?id=3536485969) | 602 | 143 | 2025-07-28 17:15:34 |
| 8 | [邦邦游戏声优动画梗整合包](https://steamcommunity.com/sharedfiles/filedetails/?id=3521723569) | 254 | 328 | 2025-07-10 16:12:47 |
| 9 | [不可名状の词库](https://steamcommunity.com/sharedfiles/filedetails/?id=3485719420) | 886 | 123 | 2025-05-22 19:52:07 |
| 10 | [明日方舟](https://steamcommunity.com/sharedfiles/filedetails/?id=3475034998) | 1,090 | 122 | 2025-05-03 20:14:07 |

## 来源、口径与扫描边界

- 从官方工坊的 `mostrecent`（最近发行）排序页连续抓取前 3 页、每页 30 项，共 90 个不重复 publishedfileid：[第 1 页](https://steamcommunity.com/workshop/browse/?appid=1483870&browsesort=mostrecent&actualsort=mostrecent&numperpage=30&p=1&section=readytouseitems)、[第 2 页](https://steamcommunity.com/workshop/browse/?appid=1483870&browsesort=mostrecent&actualsort=mostrecent&numperpage=30&p=2&section=readytouseitems)、[第 3 页](https://steamcommunity.com/workshop/browse/?appid=1483870&browsesort=mostrecent&actualsort=mostrecent&numperpage=30&p=3&section=readytouseitems)。网页参数 `numperpage=100` 实际也只返回 30 项，因此按实际项目数计算覆盖范围。
- 通过官方 [GetPublishedFileDetails API](https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/) POST 批量查询这 90 个 ID，使用 `subscriptions`（当前订阅）严格大于 100，按 `time_created`（首次发布）降序取前十；未使用 `lifetime_subscriptions`，也未把 `time_updated` 混作发布日期。
- 中文判定以作者标题语言标记和简介为依据，包括 `[中文]`、`[简体中文]`、`[chinese]`；本轮符合阈值的前十全部属于这些标记。标题里的词数仅是作者声明，尚未下载复核。
- 扫描最新端为 `3792839159`（2026-08-30 22:46:55），最旧端为 `3469635714`（2025-04-24 22:02:36）。前 90 项中共有 11 项当前订阅大于 100；第 11 项是 [三角洲行动s1-s6烽火+战场](https://steamcommunity.com/sharedfiles/filedetails/?id=3469958963)（1,626 订阅，2025-04-25 09:57:36），比第十项早，故已跨过前十截断边界。
- 结论范围限于本次可公开浏览且出现在默认 `readytouseitems` 列表中的条目；不包含私有、隐藏、删除或默认列表不展示的项目。网站动态变化后需重新查询。
- 同名词库以 Steam `publishedfileid` 区分。例如本榜两份“明日方舟”的 ID 分别为 `3566860359`、`3475034998`，不能仅按简称去重。

## 内容方向

这份榜单大多是特定游戏、动画或圈子的专题库。“不可名状の词库”的作者简介覆盖英雄联盟、网络热梗、热门二次元番、主机游戏、童年动画，相对综合，可作为后续审阅候选；本次未对完整词条质量作结论。
