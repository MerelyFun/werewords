# 封面与扩展角色插图

日期：2026-09-09。使用内置 image_gen 工具生成原创位图，并保存到项目；未使用外部游戏美术、商标或第三方角色。

- `public/images/cover.png`：1536 × 1024 月夜森林村落主视觉。上部月亮、中部村落灯光和左侧狼剪影，下部暗色留白适合叠加页面标题。
- `public/images/extra-roles.png`：正方形四格角色图集。左上爪牙、右上观察者、左下两位共济会成员、右下友善怪物。使用 CSS 四象限定位展示。

已目视确认两图无文字、无水印；封面月亮与村落清楚，角色四格顺序正确。深蓝、灰蓝、香槟金纸雕插画风与现有 `roles.png` 协调。使用端仍须验证手机裁切和文案对比度。

## 最终生成提示词

封面：

> Use case: stylized-concept. Create an ORIGINAL premium mobile boardgame website cover artwork, landscape 1536x1024. A mysterious moonlit forest surrounding a tiny medieval village, warm amber window lights, layered distant mountains, a subtle lone wolf silhouette perched on a forest ridge. Exquisite handcrafted layered paper-cut editorial illustration, tangible paper grain, sophisticated quiet atmosphere, deep midnight navy and slate blue with restrained champagne gold moonlight. Moon near upper center, forest frames the village. Image must feel like collectible art for an elegant Werewords party game, not horror. Lower quarter mostly calm dark navy forest shadows, usable negative space for HTML title overlay. Keep main narrative recognizable when cropped to a 440x240 wide mobile hero. No lettering, text, logo, border, watermark, UI, blood, or scary violence. Output image only.

扩展角色：

> Use case: stylized-concept. Generate an ORIGINAL square 2x2 character sprite sheet for a premium Werewords boardgame companion website. Four equal quadrants, one fully contained bust portrait per quadrant, no overlap or dividers. Top left: mysterious hooded minion, human shadowed face, dark navy cloak. Top right: perceptive female observer holding a small monocular telescope, refined fantasy village clothing. Bottom left: TWO friendly secret society mason members together, matching small gold triangle brooches, shown shoulder to shoulder. Bottom right: benevolent charming small monster, muted slate fur and little horns, extending one hand sideways; friendly not scary. Style: exquisite layered cut-paper editorial illustration, tangible paper grain, blue-grey and midnight navy clothing, restrained champagne gold accents and warm natural skin. Chest-up portraits visually readable small. Consistent scale and lighting in all quadrants. Background solid midnight navy #101c2c, softly blends into cloak edges. No text, labels, logo, lettering, frames, watermark, blood or violence. 1024x1024 square.
