# 外部词库候选

调查日期：2026-09-09。用户要求先调查、选择后再接入；本轮仅核对公开页面并记录少量样例，未下载、导入外部词库。以下不是 Werewords 官方词库，适玩与难度建议是本项目判断。

| 可选方向 | 来源与真实样例 | 已核对规模 | 难度与适用人群 |
| --- | --- | --- | --- |
| A 日常聚会 | [draw-guess-game 默认题库](https://github.com/THqqqqp/draw-guess-game/blob/main/server/wordBankManager.js)：热气球、程序员、榴莲、射箭 | 源码 6 类，各 24 条，共 144 条 | 原库无难度标签；具体事物居多，适合新手与混龄聚会 |
| B 动漫、游戏与老梗 | [极乐实验室二次元中文特征词库](https://github.com/jilelab/acg-chinese-words)：迪迦奥特曼、变形金刚、炉石传说、金坷垃、恋爱循环 | README 列特征词数量：游戏 25,145、动画 7,829、鬼畜 905、宅舞 438；并非可直接玩的题目数量 | 有分类、词频，无游戏难度；适合同好朋友，应精选熟悉角色、作品与梗 |
| C 成语挑战 | [idiom-database](https://github.com/crazywhalecc/idiom-database)：阿谀奉承、跋山涉水、适得其反（均来自 README 示例） | README 声明 30,000+，本轮未下载逐条复计 | 无难度标签；建议精选常见成语作为挑战包，抽象含义比具体物品更难用是非问题逼近 |

## 来源与复用条件

- A 的 [README](https://github.com/THqqqqp/draw-guess-game#许可证) 声明 MIT，但本次递归目录核对未见独立 LICENSE 文件。可作为日常主题参考；如后续整体复用，先补齐许可文本与归属记录。
- B 有完整 [MIT LICENSE](https://github.com/jilelab/acg-chinese-words/blob/main/LICENSE)，署名极乐实验室。复用应保留版权与许可。原库用于内容分类，有大量标签、缩写和长尾词，不能把全部统计词直接作为猜词题；这些样例也不代表 2026 最新热梗。
- C 有 MIT 标记，但明确来自 [chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua#copyright)，上游说明数据来自网站抓取，并非出版社官方授权数据库。适合作选词参考；不直接整包搬运释义、例句与出处。

## 推荐给用户的选择

推荐 **B 的精选动漫游戏包**，比再扩充普通名词更有新鲜感；混龄聚会可选 A，喜欢文字挑战可选 C。也可选 A+B 分成独立主题包，避免不熟悉动漫的玩家被迫抽到圈内词。

选择后再确定筛选规模，并人工标注简单、进阶、挑战；主题和难度应独立，不能把所有成语都自动判难、所有动物都自动判易。接入时保留每条来源、稳定 ID、主题与难度，按选定难度严格抽词；不足时提示调整配置，不偷偷混入其他难度。

## 未列入推荐

[Steam 你画我猜创意工坊](https://steamcommunity.com/workshop/browse/?appid=1483870&browsesort=totaluniquesubscribers&l=tchinese) 确有动物、动画名、B 站热梗等社区词库，但列表页不是可再分发的开源许可，本轮未下载订阅内容。没有把“可以订阅”当成“可以直接搬到公开网页”。
