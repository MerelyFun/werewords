# 字体来源与使用

标题、镇长候选词和夜晚双向答案使用霞鹜文楷轻便版的字形，正文与按钮说明保持系统无衬线字体。字体随站点本地托管，无需访问外部字体 CDN。

- 官方项目：[lxgw/LxgwWenKai-Lite](https://github.com/lxgw/LxgwWenKai-Lite)。
- 采用版本：[v1.522](https://github.com/lxgw/LxgwWenKai-Lite/releases/tag/v1.522)，Regular 字重。
- 下载原件：[LXGWWenKaiLite-Regular.ttf](https://github.com/lxgw/LxgwWenKai-Lite/releases/download/v1.522/LXGWWenKaiLite-Regular.ttf)。
- 原件 SHA-256：`140c99ba4e28e817cec49bf82a0c5fcdc4fe633fb9dfda16d0ee8d59a8545f15`。
- 许可：SIL Open Font License 1.1；随字体保留完整的 [OFL.txt](../../public/fonts/OFL.txt)，含作者版权声明。

交付文件为 `public/fonts/table-wenkai-regular.woff2`。使用 FontTools 4.64.0 + Brotli 1.2.0 将完整 TTF 转为 WOFF2，未裁掉字符、未改字形。为避免使用上游保留名称，内部字体 family/full/PostScript 名称改为 `Table WenKai` / `Table WenKai Regular` / `TableWenKai-Regular`，版权与许可信息保留。此文件同样按 OFL 1.1 分发。

实现位于 `src/styles.css`：`@font-face` 使用 `font-display: swap`，加载时保持内容可见。两面答案使用相同容器字号公式，范围 76–104 px；长词可均衡换行，不以超出屏幕宽度换取字号。镇长候选词从 28 px 提升为 36 px，仍保持单向选择。
