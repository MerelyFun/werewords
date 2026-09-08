# 项目进度

更新：2026-09-08。

## 当前阶段

第一版可运行，阶段 1、2 完成。阶段 3 已将用户录音裁为 13 个片段并接入网页，本轮桌面真实播放及自动化验证通过；手机试听待完成。网站未部署。

## 已有功能

- Vite + React + TypeScript 静态网页，实体卡流程、128 个自编中文词条、每阶段跳过与暂停、设置保存。
- 镇长选词、夜晚看词与遮挡、猜词、指认或讨论、人工结算。
- 静态录音预加载、切换取消旧声音、播报结束后计时，夜晚后台暂停。

## 本轮音频接入

- 用户提供 49.872 秒的 MP3，原件保存为 `assets/audio/host-source.mp3`，按 `docs/audio-cuts.json` 裁为 13 段。
- `npm run voice:cut` 重新裁剪，`npm run voice:check` 检查资源；不再依赖 API 密钥，OpenAI 生成脚本仅保留为可选工具。
- 页面使用“录音播报已就绪 / 播报音频未就绪”，清单来源为 `user-recording`，不将用户录音标为 OpenAI 生成。
- 无声浏览器测试显式模拟未就绪清单；新增 2 项真实录音测试，覆盖原生 WebAudio 解码、有效信号、试听自然结束、跳过停止旧音源。

## 本轮验证证据

- `npm run voice:check`：13 段通过。
- `npm run build`：通过。
- `npm test`：25 项通过。
- `PLAYWRIGHT_CHANNEL=chrome` 下 `npm run test:e2e`：13 项通过。新增测试验证真实 13 段音频解码与非静音 RMS、试听自然结束、跳过停止原生音源并开始下一阶段。
- 内置浏览器本轮正常，刷新页面后显示“录音播报已就绪”。
- 本地逐片语音识别辅助确认分段；短闭眼口令有识别误字，不能将识别结果当作人工试听证据。

本机浏览器验证使用已安装的 Chrome：PowerShell 设置 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后运行 `npm run test:e2e`。此前下载的 Playwright Chromium 曾启动失败，内置浏览器曾被拦截；当前内置浏览器已可访问。

## 尚未完成与下一步

- 人工试听录音切点、响度和停顿；用手机扬声器及 iOS/Android 实际走完一局。
- 获得用户目标 GitHub 仓库后关联 remote、配置 Pages 并上线验收。
