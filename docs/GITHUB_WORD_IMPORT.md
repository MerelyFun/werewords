# 汉兜与 Parti 词库接入

用户于2026-09-09明确选择加入两库。新增来源ID `github-handle` / `github-parti`，显示名“汉兜 handle”/“Parti”；仍使用现有多选、标准/挑战、刷新保存和按归一化词面去重机制，不添加主题或词数界面。

| 来源 | 固定版本 | 原文条数 | 标准 | 挑战 |
| --- | --- | ---: | ---: | ---: |
| [汉兜](https://github.com/antfu/handle) | 2003b777f507ed18c1c80304fd6894280c56ad58 | 424 | 51 | 373 |
| [Parti](https://github.com/glink25/Parti) | a4aa37c8b6e8eef66886c265df73ab8ae0bafa62 | 880 | 617 | 263 |

汉兜提取 `src/answers/list.ts` 答案数组的首字段，排除提示字、种子日期及空占位，不使用输入校验词表。Parti合并 `word-bank.ts` 基础240条与 `word-bank-extra.ts` 扩展640条，保留原始八类标签。两库内各自没有重复词面；跨库重复保留各自来源，混抽时去重。

标准/挑战为本项目编辑判断，非上游分级。汉兜将一组常见、较易拆解描述的成语列为标准，其余挑战；Parti脑洞与文化故事归挑战，其他分类以标准为主，少数专业、抽象名词归挑战。具体可复核规则见 `scripts/import-github-words.py`。保留所有词面（包括上游可能的别字），未静默改写成语。真人试玩后可调整难度。

## 来源追溯与许可

- `src/data/github-sources.json` 以稳定来源ID唯一登记仓库、revision、原文件路径、原件路径、SHA-256和许可。
- 原件及许可在 `assets/wordlists/github/handle/` 与 `assets/wordlists/github/parti/`，通过 `.gitattributes` 禁止Git转换原件换行。
- 汉兜保留 Anthony Fu 的MIT声明。Parti为PolyForm Noncommercial License 1.0.0，非MIT；当前个人非商业聚会助手按其非商业用途条款接入，不将Parti数据重新许可为MIT。
- 完整许可随发布包置于 `public/wordlist-notices.txt`，网页HTML用 `rel=license` 关联；公开网址对应 `wordlist-notices.txt`。上游版本标识也随该文件发布。
- 数据ID由来源ID和词面SHA-256前12位生成，未来重排词表不改变题目ID。重新导入写回同一来源文件，不新建重复来源。

## 重建

运行 `python scripts/import-github-words.py`，先验证存档原件哈希，再生成 `src/data/handle-words.json`、`src/data/parti-words.json` 和许可文本。脚本不联网、不执行上游TypeScript。运行时随前端打包，没有GitHub网络依赖。

验证与发布结果见 `docs/PROGRESS.md` 本轮接入记录。
