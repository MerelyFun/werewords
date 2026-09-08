# 项目进度

更新：2026-09-08。

## 当前阶段

第一版可运行，阶段 1、2 完成。阶段 3 完成自动化与桌面浏览器验证；真实模型录音及手机试听待办。网站未部署。

## 本轮完成

- Vite + React + TypeScript 骨架，手机优先深蓝与暖金界面，设计参考存于 docs/design/concept.png。
- 实体卡流程：开局配置、镇长选词、夜晚看词与遮挡、猜词、指认或投票、人工结算。
- 128 个自编中文词条，每阶段跳过，暂停/继续，重开确认，设置持久化。
- 13 句中文播报清单、OpenAI 一次生成脚本、静态录音播放器、播放取消与计时衔接。
- 当前音频清单 ready:false，页面明确为无声预览；用户已说密钥稍后配置。

## 验证证据

- npm run build：通过，包含 TypeScript 检查与生产打包。
- npm test：25 项通过（16 项规则与词库，9 项音频播放器）。
- npm run test:e2e：11 项通过，本机使用 PLAYWRIGHT_CHANNEL=chrome。
- 浏览器测试覆盖每阶段跳过、四种胜负、词语遮挡、设置保存、计时暂停/恢复/到期、重开，以及模拟音频下的自动夜晚。
- 内置预览返回 ERR_BLOCKED_BY_CLIENT，改用 agent-browser 与 Playwright 本地 Chrome。下载的 Playwright Chromium 启动返回 spawn UNKNOWN，安装的 Chrome 验证成功。
- 自动化音频使用测试替身，不能当成已生成或试听真实语音的证据。
- 本机浏览器截图已检查；无页面运行错误，移动端布局无横向溢出。

## 尚未完成

- 真实 OpenAI 语音生成、中文发音/响度试听、手机扬声器及 iOS/Android 自动播放验证。
- GitHub 仓库关联、Pages 工作流和上线验收。

## 下一步

用户配置好本机 OPENAI_API_KEY 后，执行 npm run voice:generate 和 npm run voice:check，试听 13 段音频并实机走完一局，再按用户提供的 GitHub 仓库发布。不要把密钥放入网页或 Git。
