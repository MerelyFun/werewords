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

## 2026-09-09：用户要求知名平台与人气证据

用户要求多列有趣候选，并优先权威网站或认可度高的来源。已调查 Werewords 官方规则页（https://werewords.com/rules.php?ver=2）与 Steam Draw & Guess 最多人订阅榜。官方确认有电影、食物、体育及社区词库，但不将社区词库称为官方精选。以下订阅量为读取到的网页快照，非实时统计或好评率：

- 笑死人不偿命：https://steamcommunity.com/sharedfiles/filedetails/?id=2660283448 ，105584 订阅，349 个评价；无公开例词。
- 奇葩词语，人人都会：https://steamcommunity.com/sharedfiles/filedetails/?id=2836911295 ，40936 订阅，187 个评价；无公开例词。
- 不存在的正解（阴间词库）：https://steamcommunity.com/sharedfiles/filedetails/?id=2505930928 ，27492 订阅，64 个评价；公开例词为“五彩斑斓的黑、活在裆下、大意灭亲”，偏歪楼接龙，直接适配是非问答较差。
- 乱七八糟你画我歪：https://steamcommunity.com/sharedfiles/filedetails/?id=2890545389 ，26682 订阅，77 个评价；无公开例词。
- 流行梗＋二次元＋日常生活：https://steamcommunity.com/sharedfiles/filedetails/?id=2503106933 ，24848 订阅，评价数不足；作者称全中文、1～6 字。
- 童年动画片：https://steamcommunity.com/sharedfiles/filedetails/?id=2504322174 ，87979 订阅，88 个评价；评论反映混有人物名，尚未读取完整词库。
- 周杰伦（猜歌名）：https://steamcommunity.com/sharedfiles/filedetails/?id=2557994820 ，83073 订阅，412 个评价；作者描述为歌曲名主题。
- 食物（难度略高）：https://steamcommunity.com/sharedfiles/filedetails/?id=2534658434 ，在最多订阅榜首页，合集介绍涉及各地小吃；详情页限流，未核验具体订阅量。

Steam 网页提取含通用 removed/incompatible 提示，本轮不保证订阅可用性；尚未下载全文、核验再分发许可或导入任何外部词库。下一步等待用户选方向，再精选可用词条并分难度。原创建议例词必须与来源实际例词区分。

## 2026-09-09：扩大到非 Steam 来源并优先近期内容

用户要求 GitHub 和更多网站，优先较新内容。区分网页标注日期、仓库提交日期、词库文件更新日期，以及词语实际流行时期；不能把抓取日期当更新时间，也不能把 GitHub 托管等同高认可。

- 人民网《从热词之变看家国万象新》，2025-12-25：https://kpzg.people.com.cn/n1/2025/1225/c404214-40631645.html 。检索正文提及拉布布、情绪价值、敬自己一杯等年度词语；属于权威媒体报道的词语素材，不是现成猜词库。
- 央视网转载《咬文嚼字》年度流行语报道，2025-12-02：https://news.cctv.cn/2025/12/02/ARTId5MiVeNK9e2jkzbKLxIZ251202.shtml 。正文核验谷子、活人感、赛博对账；丝瓜汤文学、邪修属于备选条目，不可称十大入选词。
- Pictionary Word Generator 中文词库页，页面日期 2026-04-13：https://pictionary-word-generator.net/zh/posts/chinese-pictionary-words 。核验跪地求饶、结婚证、暗送秋波等，按分类/难度列词，但内容多为传统词，不是新梗库；独立工具站，未核验用户规模。
- MiniWebtool 你画我猜生成器：https://miniwebtool.com/zh-tw/你畫我猜詞語產生器/ 。检索摘录标注更新2026-07-13；分四档难度、多类别。日期为页面标注，不证明词条2026新增；不能称官方题库。
- 心有灵犀500题页：https://ishindenshin.app/zh-tw/guide/pictionary-word-list/ 。此前检索正文标注2026-08-28，含班味、硬控、电子榨菜等，也混合旧梗。独立工具站，未核验用户规模；本次直接打开失败，检索可读。

所有来源只作候选参考，未导入。

GitHub 子调查核对词库文件提交（星数为本次快照）：
- 群友派对之夜：https://github.com/778672151/party-night/blob/main/data/draw.json ，300词，难度level1–3，真实例词社死/摸鱼/卷王。文件2026-09-08更新：https://github.com/778672151/party-night/commit/a6b1453027cbf6acbbe9119499cd2c1ceee5e359 ，0星。文件新不等于梗新。
- Galgamer：https://github.com/Galgamer-org/Draw-Guess-Keywords ，11星。词文件2026-02-08更新：https://github.com/Galgamer-org/Draw-Guess-Keywords/commit/59bc7d1148eeef1fe9da11f7a94d2b6c42b8b220 ，条目有魔法少女的魔女裁判、超时空辉夜姬、鸣潮、绝区零，偏游戏动画圈。
- THqqqqp：https://github.com/THqqqqp/draw-guess-game/blob/main/server/wordBankManager.js ，1星。词文件2025-08-31：https://github.com/THqqqqp/draw-guess-game/commit/e6f78987b6de7c78b7566e80b321c2079c3f1c16 ，日常基础词。
- 三库API license为null；THqqqqp README曾自称MIT但无独立许可文件，前两者未见LICENSE。未找到同时较新且明显高星的中文聚会词库，不把这些项目表述成高认可度现成可再分发素材。

## 2026-09-09：按人气重新排序

本轮用户要求 Steam 与 GitHub 分别按人气找前几个。Steam 使用 Draw & Guess 工坊“不重复总订阅人数”排序：https://steamcommunity.com/workshop/browse/?actualsort=totaluniquesubscribers&appid=1483870&browsesort=totaluniquesubscribers&l=tchinese&numperpage=18&p=1&section=readytouseitems 。详情页数字为 Current Subscribers 快照，与累计排序指标有区别。

榜单前五（本轮读取顺序）：
1. 就是多 [1267] https://steamcommunity.com/sharedfiles/filedetails/?id=2499017147 ：当前订阅326928，更新2021-06-09，日常综合。
2. 啥都有 [245] https://steamcommunity.com/sharedfiles/filedetails/?id=2511225319 ：195409，更新2021-08-20，电影/动漫/美食/人物/游戏混合。
3. 动物 [126] https://steamcommunity.com/sharedfiles/filedetails/?id=2517506712 ：154892，更新2021-08-13。
4. 英雄联盟纯英雄名 https://steamcommunity.com/sharedfiles/filedetails/?id=2525144686 ：152530，更新2021-07-24，截止阿克尚。
5. 歪了就算胜利 [256] https://steamcommunity.com/sharedfiles/filedetails/?id=2560911586 ：151065，更新2021-08-09，跨作品名场面/句子/梗。

头部订阅词库均较老，这是人气排序结果，不能描述成近期词库。括号词数来自标题，未下载逐条计数。未导入。

GitHub本次按Star检索并核验的相关项目（不是全站绝对前五）：
- buppt/vue-canvas-websocket 30星，https://github.com/buppt/vue-canvas-websocket/blob/master/app.js ，仅12生肖词，文件提交2019-04-09。
- potato47/nhwc-server 29星，https://github.com/potato47/nhwc-server/blob/master/data/words.go ，20中文词（臭豆腐/屠龙刀/狗急跳墙/周杰伦），文件提交2018-06-06。
- jilelab/acg-chinese-words 24星，https://github.com/jilelab/acg-chinese-words ，分类特征词频库而非现成聚会库，游戏.txt提交2021-05-19。
- wangzhaode/DrawSomething 21星，https://github.com/wangzhaode/DrawSomething ，存在src/词库/词库.mdb但未解析；文件提交2016-08-16，不声称词条质量已核验。
- Galgamer-org/Draw-Guess-Keywords 11星，https://github.com/Galgamer-org/Draw-Guess-Keywords ，作品名猜词库提交2026-02-08。
排除Wscats/socket.io(314星，无内置题库)、jrainlau/draw-something(269星，仅5英文词)、diamondfsd/you-draw-i-guess(90星，前端无词库)。ifavcode/nihuawocai仅5星。数据为2026-09-09 API读取快照。纯人气排序不能视作好玩程度排序。

## 2026-09-09：纠正高 Star 检索范围

此前仅限猜词游戏仓库，遗漏可筛选为题目的通用中文词库。扩大范围后API核验：
- fighting41love/funNLP 82957星：https://github.com/fighting41love/funNLP ，NLP合集；data/食物词库/THUOCL_food.txt提交2018-10-22，食物动物等收录THUOCL，非独立新题库。
- iDvel/rime-ice 19241星：https://github.com/iDvel/rime-ice/blob/main/cn_dicts/ext.dict.yaml ，扩展文件2026-08-31更新，输入法词库，可筛口语及生活词，不保证每条是新梗。
- pwxcoo/chinese-xinhua 11675星：https://github.com/pwxcoo/chinese-xinhua ，data/idiom.json提交2018-12-16，成语词语字典数据，非新华字典官方。
- thunlp/THUOCL 1125星：https://github.com/thunlp/THUOCL ，清华分类词频库；data/THUOCL_food.txt提交2018-11-21，食物动物历史名人成语等。

Star为整个项目关注度，不代表游戏题库质量。以上未导入，仍需选词和难度处理。

## 2026-09-09：纠正搜索范围为猜词游戏项目

用户强调查高Star的猜词游戏，而不限自带中文词库。此前低Star清单不能代表该游戏品类，检索范围过窄。本轮扩大Wordle、汉字猜词、多人你画我猜及角色猜测，排除自动解题工具。

- antfu/handle：https://github.com/antfu/handle ，API核验1438 Star；汉字/成语Wordle。README明确答案库2023-02-28停止新增，后续随机旧题，不能把仓库较新推送视作词库更新。
- scribble-rs/scribble.rs：https://github.com/scribble-rs/scribble.rs ，API核验658 Star；多人绘图猜词。当前master有多语种词文件，未见中文词文件，不能称自带中文词库。
- cwackerfuss/react-wordle当前无法解析，不沿用旧印象或历史Star数。

本轮仅调查，未导入词库或改变游戏玩法。

同轮API核验其他猜词项目（2026-09-09）：ajeetdsouza/clidle633星、yyx990803/vue-wordle600星、octokatherine/word-master397星、lynn/hello383星、kennylimz/anime-character-guessr355星、MikhaD/wordle284星。仓库链接均为https://github.com/加完整项目名。前四为英文猜单词；anime-character-guessr是中文动漫角色属性反馈猜测（Bangumi数据），仓库最近推送2026-09-02，并非已核验词库更新时间。列表为本次找到的人气较高项目，不是官方全站完整排名。

## 2026-09-09：纠正高 Star 猜词游戏漏检

前轮主要中文关键词搜索遗漏了汉兜等项目，不能把30星以下候选当作热门项目全貌。用户强调只要实际猜词游戏词库，已扩大到Wordle、Pictionary、Skribbl、Charades等并核验实际运行引用/数据文件。

- antfu/handle：1438星，中文猜成语。https://github.com/antfu/handle 。游戏实际答案为src/answers/list.ts（路不拾遗、恬不知耻、货真价实、彬彬有礼），由src/answers/index.ts读取；区别于用于验证输入的src/data/idioms.txt。答案文件最后提交2023-01-18，README明确2023-02-28后不新增答案、从过往题目抽取。可作中文成语挑战来源，非新梗库。
- scribble-rs/scribble.rs：658星，画图猜词。https://github.com/scribble-rs/scribble.rs/blob/master/internal/game/words/en_us 。读取统计4999非空行，英语词表最后提交2023-08-13；多语种目录未见中文，中文使用需要翻译筛选。
- vintage/party_flutter：210星，聚会猜词。https://github.com/vintage/party_flutter/blob/master/assets/data/categories_en.json 。15个非空主题、2024条题词（另Mix-Up），含动物、食品、影视、游戏、漫威、宝可梦等；原文例词Alligator/Bear/Aladdin/3D printer/Airport。仅英/波文，文件最后提交2019-09-03。仓库Apache-2.0。

Stars为本次API快照，是游戏项目认可而非单独词库评价。未导入，未以词典/分类词频库充当游戏题库。前轮候选表保留为历史，以上纠正覆盖其“不存在高星”暗示。

## 2026-09-09：Steam 过万订阅且相对较新词库

用户本轮限定猜词词库、当前订阅超过10000，并希望比此前2021年头部词库更新。并行核验 Draw & Guess 工坊详情；订阅量为本轮页面快照，会变化，不是词条数、累计访问量或评分。以下按发布时间由新到旧：

| 词库 | 当前订阅快照 | 发布 | 更新 | 来源 |
| --- | ---: | --- | --- | --- |
| 00后童年动画片词库 [208] | 14418（另一次读取14422） | 2023-10-19 | 2023-10-20 | https://steamcommunity.com/sharedfiles/filedetails/?id=3055118418 |
| 生活常见物品 简单容易画 专心画画 [650] | 12910 | 2023-08-22 | 未单列 | https://steamcommunity.com/sharedfiles/filedetails/?id=3024169919 |
| 你画我歪（乱七八糟啥都有）[243] | 17670 | 2023-08-19 | 未单列 | https://steamcommunity.com/sharedfiles/filedetails/?id=3022451195 |
| 你画我歪 [128] | 20200 | 2023-05-12 | 2023-05-12 | https://steamcommunity.com/sharedfiles/filedetails/?id=2974829947 |

这些是相对2021年较新，不能称2025–2026新梗库。标题词数未下载逐条核验。对狼人真言的适用性属于判断：日常物品和动画主题可优先审阅；画歪主题需检查是否有长句、抽象梗。

近期但未达门槛的例子：阴间词汇大合集（3416324742），2025-08-25更新，1483订阅；明日方舟全词条（3366639606），2025-09-14更新，1854订阅；原神更新至5.3（2981363563），2024-12-22更新，8759订阅。本轮未核验到2025–2026发布且过万的中文候选，不作全工坊不存在的结论。

仍仅调查，未下载、导入或部署。详情抓取含通用removed/incompatible模板，不能单凭该文本判定下架；订阅可用性未实测。

## 2026-09-09：扩大搜索，仅保留猜词游戏实际题库

纠正前轮范围：acg-chinese-words是词频素材，不符合用户此次“只要猜词游戏词库”，不再列入候选。搜索扩展skribbl/pictionary/charades/undercover/codenames及中文，API按Star，检查真实文件。

- scribble-rs/scribble.rs：658星，真实你画我猜；英文 https://github.com/scribble-rs/scribble.rs/blob/master/internal/game/words/en_us ，实际4999非空行，banana/spaceship/time machine/toilet/unicorn/yeti/zombie。词文件2023-08-13（bc1246727eaa9b9f122b9562f2047f90dd9e8030）；仓库推送2026-09-06不等于词库更新。没有中文，需翻译筛选。仓库BSD-3-Clause，具体来源仍需核查。
- vintage/party_flutter：210星，真实Charades；https://github.com/vintage/party_flutter/blob/master/assets/data/categories_en.json ，实际16分类2024条，可能跨分类重复；Alligator/Clownfish/Platypus/Chewing gum/Jurassic Park。词库2019-09-03，英语/波兰语，无中文。
- Hanserprpr/nonebot-plugin-who-is-spy：6星，https://github.com/Hanserprpr/nonebot-plugin-who-is-spy/blob/main/template/undercover_words.json ，2025-08-13，真实中文词对可乐/雪碧、拿铁/美式、奶茶/果茶。
- zhlcbri/codenames-word-list-chinese：1星，https://github.com/zhlcbri/codenames-word-list-chinese/blob/main/word_list.txt ，877非空行、32主题文件，2021-04-16；确实游戏选词库，较老。
- party-night再次验证300词，0星，2026-09-08词文件更新，三级难度。
- ifavcode的sql/draw-guess.sql为71条INSERT，5星，2025-05-12；非2026词库。
- lsongdev/nibiwocai仓库2026push，但实际data/wangluo.json最后2024-07-08，接化发/耗子尾汁/九转大肠等旧梗，不能当新库。

未找到同时高Star、原生中文、近期大规模题库；已找到较高Star的实际外文游戏词库及低Star的近期中文游戏库。仍未导入、翻译或部署。

## 2026-09-09：两份 Steam 词库实际导入

用户选定3022451195与3416324742后，官方SteamCMD匿名下载成功（详情API的file_url为空，但SteamCMD取得完整附件）。原件分别2682与7343字节，接口visibility=0、banned=0；此前网页提取的通用removed提示不能视为实际封禁。

已按原文导入两个独立来源：乱七八糟243词（标准158/挑战85）、阴间词汇600词（标准271/挑战329）。源内无重复；跨库25个同词面保留各自来源，因抽词只使用选中库，不造成同轮重复候选。分类是本项目编辑判断。原件、哈希、分级及来源说明见[导入记录](STEAM_WORD_IMPORT.md)。

新增来源目录项、原文一致性与抽词测试；39项单元测试通过、构建通过，Chrome两项专用E2E通过。未将下载成功表述为已取得再分发许可。

## 2026-09-09：Steam 三组前三复核

范围为 Draw & Guess（1483870）工坊中文词库，数字取 Steam 官方 GetPublishedFileDetails 当前 subscriptions；日期统一北京时间。标题词数仅为标题标注，本轮未下载。只调查，未追加导入。

### 订阅人数前三

从totaluniquesubscribers首页30项批量API核验，前三同时为累计榜与当前订阅排序前三：
- 就是多[1267]：326928订阅，更新2021-06-09，https://steamcommunity.com/sharedfiles/filedetails/?id=2499017147
- 啥都有[245]：195409订阅，更新2021-08-21（此前网页不同时区日期为08-20），https://steamcommunity.com/sharedfiles/filedetails/?id=2511225319
- 动物[126]：154892订阅，更新2021-08-13，https://steamcommunity.com/sharedfiles/filedetails/?id=2517506712

### 最新发布且当前订阅超过100

扫描mostrecent前5页150项并批量API核验。第1页30项均不达标；前三分别位于第2页第1/13/16项，扫描到第46项即覆盖前三。排序字段time_created，不用time_updated替代。
- 折棒新三国梗百科[138]：495订阅，2026-01-31 13:02发布，https://steamcommunity.com/sharedfiles/filedetails/?id=3657075067
- 黑夜君临[96]：185订阅，2025-12-09 20:22发布，https://steamcommunity.com/sharedfiles/filedetails/?id=3620710861
- 燕云十六声[123]：128订阅，2025-11-09 19:29发布，https://steamcommunity.com/sharedfiles/filedetails/?id=3602553865

三者本次time_updated与time_created相同，分别为新三国梗、黑夜君临游戏、燕云团建自用专题，不能称通用日常词库。

### 最近更新且当前订阅超过10000

额外维度兼顾维护时间和人气。扫描累计订阅榜前5页150项，末项累计订阅8381，已低于门槛；当前订阅不高于累计值，故覆盖当前过万候选。读取官方SSR字段后按time_updated排序，前三另经API交叉核验：
- 笑死人不偿命[329]：106133订阅，2024-04-13更新，https://steamcommunity.com/sharedfiles/filedetails/?id=2660283448
- 乱七八糟你画我歪[462]：26683订阅，2024-01-28更新，https://steamcommunity.com/sharedfiles/filedetails/?id=2890545389
- 00后童年动画片词库[208]：14418订阅，2023-10-20更新，https://steamcommunity.com/sharedfiles/filedetails/?id=3055118418

注意第二项462词与已导入的3022451195（243词）不是同一份。第三组找到2024更新条目，补充此前未充分核验的近期过万候选。以上为本轮列表与API快照，非Steam官方质量榜。

## 2026-09-09 前十扩展

三组榜单现已扩为前十，最新口径与链接见 [订阅与最近更新前十](STEAM_RANK_POPULAR.md)、[最新发布且订阅超过100前十](STEAM_RANK_NEWEST.md)。上文前三保留历史记录。用户指定新增的329词与462词已接入，统一来源表为 src/data/steam-sources.json，以工坊ID避免重复登记；其余榜单候选未导入。
