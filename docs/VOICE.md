# 中文夜晚播报

更新：2026-09-08。

## 当前状态

已完成 13 句原创中文主持词和 OpenAI 语音生成脚本。**尚未生成实际 MP3**：当前会话没有可调用的 OpenAI Speech 工具，当前环境也没有 `OPENAI_API_KEY`。不得把设备系统语音、第三方语音或空文件描述成 OpenAI 模型生成的录音。

播报文本与相对音频路径在 [narration.json](../src/narration.json)，生成器在 [generate-voice.mjs](../scripts/generate-voice.mjs)。词语本身不会进入播报，避免泄露秘密。

[音频就绪清单](../public/audio/manifest.json) 初始为 `ready: false`；只有生成脚本确认全套片段成功后才写入 `ready: true` 和全部片段 ID。网页可据此避免请求尚不存在的 MP3。文件路径格式为 `audio/nightIntro.mp3`（无前导斜线或空格）。

## 一次生成，静态播放

本地使用 Node.js 22 或更高版本，安全设置环境变量 `OPENAI_API_KEY` 后运行：

```sh
node scripts/generate-voice.mjs
node scripts/generate-voice.mjs --check
```

脚本请求 OpenAI 的 `POST https://api.openai.com/v1/audio/speech`，固定模型 `gpt-4o-mini-tts-2025-12-15`、内置声音 `marin`，输出 `public/audio/*.mp3`。仅生成缺失或文案配置变化的片段；`--force` 会重新生成并产生新的 API 用量。`--check` 不访问网络，只验证所有文件与生成记录是否匹配。失败立即停止，不自动重试产生重复请求。生成后应人工试听中文发音、音量与停顿，再提交静态音频和生成记录。

GitHub Pages 只播放这些静态文件，游戏运行时不请求语音模型。API 密钥不得放入客户端、仓库、截图或日志；发布产物不需要密钥。浏览器资源路径必须基于 Vite 的 `BASE_URL`，以兼容 GitHub Pages 仓库子路径。

## 播放约定

- 开局先由用户点击试听，确认设备可以播放声音后再闭眼；页面应清楚说明 AI 合成语音。
- 每段播放结束后再开始对应行动时间，防止尚未听完就收回词语。
- 切换、跳过、重开时中止当前声音，清理旧的播放回调，避免不同角色提示重叠。
- 夜晚自动推进不依赖全体闭眼后的触屏。镇长选词需要人工确认，其余阶段使用行动时间自动推进。
- 音频缺失或播放失败时不能静默继续夜晚；先暂停并显示恢复操作。系统语音仅能作为明确标识的临时模式，不能冒充 OpenAI 录音。
- 指认默认十五秒，讨论默认六十秒；若允许修改这些时长，需要同步改文案重新生成，或改为不读具体时长。

## 官方依据

- [OpenAI Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)：中文支持、声音和语气指令、AI 语音披露要求。
- [OpenAI Audio API](https://developers.openai.com/api/reference/resources/audio)：语音接口参数、MP3 输出。
- [GPT-4o Mini TTS 模型](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)：模型快照和语音输出能力。

以上接口已按官方文档核实，但当前未完成实际调用、录音试听或手机扬声器验证。
