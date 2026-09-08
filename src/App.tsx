import { useEffect, useReducer, useRef, useState, type SVGProps } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  EyeOff,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  X,
} from "lucide-react";
import {
  initialState,
  reducer,
  getStageDuration,
  type Settings,
  type Stage,
  type Action,
} from "./game";
import { Narrator, type ClipId } from "./audio";
import narration from "./narration.json";
import { RoleArt, type ArtKind } from "./RoleArt";
import { TablePrompt } from "./TablePrompt";
import { findNightStep, getNightSteps } from "./roles";
import { RoleSettings } from "./RoleSettings";

const narrator = new Narrator();
const storedSettings = (): Settings => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("werewords-settings-v1") || "{}",
    );
    return reducer(initialState, { type: "SETTINGS", settings: saved })
      .settings;
  } catch {
    return initialState.settings;
  }
};
const titles: Partial<Record<Stage, string>> = {
  setup: "今夜，谁在说谎？",
  nightIntro: "天黑，请闭眼",
  mayor: "镇长，请睁眼",
  mayorClose: "镇长，请闭眼",
  seer: "先知，请睁眼",
  seerClose: "先知，请闭眼",
  werewolf: "狼人，请睁眼",
  werewolfClose: "狼人，请闭眼",
  dayIntro: "天亮了",
  day: "真言，藏在问题里",
  accusation: "谁是先知？",
  discussion: "谁是狼人？",
  verdict: "揭晓这一局",
  result: "今夜，已有答案",
};
const descriptions: Partial<Record<Stage, string>> = {
  setup: "",
  nightIntro: "把手机放在桌上，跟随声音进入夜晚。",
  mayor: "请从三个候选中选出本局真言。",
  mayorClose: "真言已经藏好，请等待下一声提示。",
  seer: "请记住屏幕上的真言，白天悄悄帮助大家。",
  seerClose: "请隐藏你的秘密，保持安静。",
  werewolf: "辨认你的同伴，并记住这个真言。",
  werewolfClose: "请隐藏你的身份，等待天亮。",
  dayIntro: "所有人请睁眼，准备向镇长提问。",
  day: "用是非问题寻找答案。镇长请用标记回应。",
  accusation: "狼人有 15 秒指认先知，仍有机会翻盘。",
  discussion: "大家有 60 秒讨论，然后同时指认狼人。",
  verdict: "在线下指认并翻开身份卡，再确认结果。",
  result: "收好秘密，下一局再见。",
};

function Crescent({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M43 12a23 23 0 1 0 9 36A24 24 0 0 1 43 12Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  min,
  max,
  count,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  min: number;
  max: number;
  count: number;
}) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <div className="stepper">
        <button
          aria-label={`减少${label}`}
          disabled={count <= min}
          onClick={onMinus}
        >
          <Minus size={16} />
        </button>
        <output>{value}</output>
        <button
          aria-label={`增加${label}`}
          disabled={count >= max}
          onClick={onPlus}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...initialState,
    settings: storedSettings(),
  }));
  const [voiceReady, setVoiceReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [replay, setReplay] = useState(0);
  const [response, setResponse] = useState("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const remaining = useRef(state.remaining);
  const deadline = useRef<number | null>(null);
  const stage = state.stage;
  const missingRoleAudio = getNightSteps(state.settings.roles).some(step => !(step.id in narration));
  const roundVoiceReady = voiceReady && !missingRoleAudio;
  const isNight = ![
    "setup",
    "day",
    "accusation",
    "discussion",
    "verdict",
    "result",
  ].includes(stage);
  const nightStep = findNightStep(stage);
  const active = stage !== "setup";
  remaining.current = state.remaining;

  useEffect(() => {
    let alive = true;
    void narrator.status().then((ready) => {
      if (alive) setVoiceReady(ready);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "werewords-settings-v1",
        JSON.stringify(state.settings),
      );
    } catch {
      /* Private mode may disallow storage. */
    }
  }, [state.settings]);

  useEffect(() => {
    if (!help && !confirmReset) return;
    const previous = document.activeElement as HTMLElement | null;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelp(false);
        setConfirmReset(false);
      }
      if (event.key !== "Tab") return;
      const controls = [
        ...document.querySelectorAll<HTMLElement>(
          '[role="dialog"] button:not(:disabled), [role="dialog"] a[href]',
        ),
      ];
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [help, confirmReset]);

  // Night narration finishes before the viewing timer starts. Cleanup invalidates stale playback.
  useEffect(() => {
    let cancelled = false;
    deadline.current = null;
    setSpeaking(false);
    if (!active || paused || help || confirmReset) return;
    const duration = getStageDuration(stage, state.settings);
    const beginTimer = () => {
      if (cancelled) return;
      setSpeaking(false);
      if (duration > 0 && (!isNight || roundVoiceReady))
        deadline.current = Date.now() + remaining.current * 1000;
    };
    if (roundVoiceReady && stage in narration) {
      setSpeaking(true);
      void narrator
        .play(stage as ClipId)
        .then(beginTimer)
        .catch((e: Error) => {
          if (!cancelled) {
            setSpeaking(false);
            setError(e.message);
            setPaused(true);
          }
        });
    } else beginTimer();
    return () => {
      cancelled = true;
      narrator.stop();
    };
  }, [
    stage,
    paused,
    help,
    confirmReset,
    replay,
    roundVoiceReady,
    active,
    isNight,
    state.settings,
  ]);

  useEffect(() => {
    const tick = () => {
      if (deadline.current === null) return;
      const seconds = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      dispatch({ type: "TICK", seconds });
      if (seconds === 0) {
        deadline.current = null;
        dispatch({ type: "EXPIRE" });
      }
    };
    const handleVisibility = () => {
      if (document.hidden && active && isNight) {
        narrator.stop();
        deadline.current = null;
        setPaused(true);
      } else tick();
    };
    const interval = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [active, isNight]);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    let disposed = false;
    const acquire = () => {
      if (document.visibilityState === "visible")
        void navigator.wakeLock
          .request("screen")
          .then((value) => {
            if (disposed) void value.release();
            else lock = value;
          })
          .catch(() => {});
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      void lock?.release();
    };
  }, [active]);

  const act = (action: Action) => {
    narrator.stop();
    deadline.current = null;
    setPaused(false);
    setError("");
    setResponse("");
    dispatch(action);
  };
  const setting = (value: Partial<Settings>) =>
    dispatch({ type: "SETTINGS", settings: value });
  const start = async () => {
    setError("");
    setLoading(true);
    try {
      if (roundVoiceReady) await narrator.prepare();
      setSelectedWord(null);
      act({ type: "START" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const testVoice = async () => {
    setLoading(true);
    setError("");
    try {
      const ready = await narrator.status();
      setVoiceReady(ready);
      if (!ready) {
        setError(
          "播报音频未就绪。现在可无声预览流程，正式游戏请等音频就绪。",
        );
        return;
      }
      await narrator.prepare();
      setSpeaking(true);
      await narrator.play("test");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSpeaking(false);
      setLoading(false);
    }
  };
  const togglePause = async () => {
    narrator.stop();
    deadline.current = null;
    if (paused && roundVoiceReady) {
      try {
        await narrator.prepare();
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    }
    setPaused(!paused);
  };
  const skip = () => {
    if (stage === "result") {
      setSelectedWord(null);
      act({ type: "RESET" });
    } else act({ type: "SKIP" });
  };
  const timeText = `${Math.floor(state.remaining / 60)
    .toString()
    .padStart(2, "0")}:${(state.remaining % 60).toString().padStart(2, "0")}`;
  const revealsWord = nightStep?.revealSecret ?? false;
  const concealed = paused || help || confirmReset;
  const resultTitle =
    state.winner === "villagers"
      ? "村民阵营获胜"
      : state.winner === "werewolves"
        ? "狼人阵营获胜"
        : "本局已结束";

  const title = stage === "result" ? resultTitle : nightStep?.title ?? titles[stage] ?? "夜晚";
  const description = nightStep?.description ?? descriptions[stage] ?? "";
  const art: ArtKind = stage.startsWith("mayor") ? "mayor"
    : stage.startsWith("seer") || nightStep?.roleId === "beholder" ? "seer"
    : stage.startsWith("werewolf") || nightStep?.roleId === "minion" || stage === "discussion" || state.winner === "werewolves" ? "werewolf" : "villager";
  const shownWord = revealsWord ? (concealed ? "已遮挡" : state.secret?.text) : stage === "result" ? state.secret?.text : undefined;
  return (
    <div className={`app-shell ${active ? "is-playing" : ""} ${revealsWord ? "is-reading" : ""} ${stage === "mayor" ? "is-choosing" : ""}`}>
      {!revealsWord && <header>
        <a
          href="./"
          onClick={(e) => {
            e.preventDefault();
            if (active) setConfirmReset(true);
          }}
          className="brand"
        >
          <Crescent size={27} fill="currentColor" />
          <span>狼人真言</span>
        </a>
        <button className="pill" onClick={() => setHelp(true)}>
          玩法
        </button>
      </header>}
      <main>
        {stage === "setup" ? (
          <>
            <section className="intro">
              <h1>今夜，谁在说谎？</h1>
            </section>
            <section className="settings" aria-label="开局设置">
              <Stepper
                label="游戏人数"
                value={`${state.settings.players} 人`}
                count={state.settings.players}
                min={4}
                max={10}
                onMinus={() => setting({ players: state.settings.players - 1 })}
                onPlus={() => setting({ players: state.settings.players + 1 })}
              />
              <Stepper
                label="猜词时间"
                value={`${state.settings.daySeconds / 60} 分钟`}
                count={state.settings.daySeconds}
                min={60}
                max={600}
                onMinus={() =>
                  setting({ daySeconds: state.settings.daySeconds - 60 })
                }
                onPlus={() =>
                  setting({ daySeconds: state.settings.daySeconds + 60 })
                }
              />
              <Stepper
                label="看词时间"
                value={`${state.settings.nightSeconds} 秒`}
                count={state.settings.nightSeconds}
                min={4}
                max={30}
                onMinus={() =>
                  setting({ nightSeconds: state.settings.nightSeconds - 2 })
                }
                onPlus={() =>
                  setting({ nightSeconds: state.settings.nightSeconds + 2 })
                }
              />
              <Stepper label="闭眼等待" value={`${state.settings.closeSeconds} 秒`}
                count={state.settings.closeSeconds} min={1} max={15}
                onMinus={() => setting({ closeSeconds: state.settings.closeSeconds - 1 })}
                onPlus={() => setting({ closeSeconds: state.settings.closeSeconds + 1 })} />
              <label className="setting-row">
                <span>词库</span>
                <span className="select-wrap">
                  <select
                    value={state.settings.category}
                    onChange={(e) =>
                      setting({
                        category: e.target.value as Settings["category"],
                      })
                    }
                  >
                    <option value="all">全部词库</option>
                    {["日常", "自然", "饮食", "趣味"].map((c) => (
                      <option key={c} value={c}>
                        {c === "日常" ? "日常生活" : c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
              <label className="setting-row">
                <span>难度</span>
                <span className="select-wrap">
                  <select
                    value={state.settings.difficulty}
                    onChange={(e) =>
                      setting({
                        difficulty: e.target.value as Settings["difficulty"],
                      })
                    }
                  >
                    <option value="easy">标准</option>
                    <option value="hard">挑战</option>
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
            </section>
            <RoleSettings players={state.settings.players} counts={state.settings.roles}
              onChange={(roles) => setting({ roles })} />
            <button className="text-button audition" disabled={loading} onClick={() => void testVoice()}>
              <Play size={14} />{loading ? "播放中" : "试听"}
            </button>
            {error && (
              <p className="notice" role="status">
                {error}
              </p>
            )}
            {missingRoleAudio && <p className="role-note">扩展角色配音稍后补充，当前可手动预演。</p>}
            <button
              className="primary start"
              disabled={loading}
              onClick={() => void start()}
            >
              {missingRoleAudio ? "预演所选角色" : voiceReady ? "开始夜晚" : "无声预览流程"}
              <ArrowRight size={23} />
            </button>


          </>
        ) : (
          <>
            {stage !== "mayor" && <TablePrompt wordOnly={revealsWord} title={title} description={description} art={art}
              word={shownWord} timer={state.remaining > 0 ? (speaking ? "…" : timeText) : undefined}
              response={stage === "day" ? response : undefined} />}
            {revealsWord ? <h1 className="sr-only">{title}</h1> : <section className="stage-heading" aria-live="polite">
              <RoleArt kind={art} />
              <div><h1>{title}</h1><p>{description}</p></div>
            </section>}
            {stage === "mayor" ? (
              <section className="mayor-panel">
                <div className="word-options">
                  {state.candidates.map((word) => (
                    <button
                      key={word.text}
                      disabled={paused}
                      aria-pressed={selectedWord === word.id}
                      className={selectedWord === word.id ? "selected" : ""}
                      onClick={() => setSelectedWord(word.id)}
                    >
                      {paused || help || confirmReset ? "已遮挡" : word.text}
                      {selectedWord === word.id && <Check size={18} />}
                    </button>
                  ))}
                </div>
                <small>
                  记住再继续；跳过默认选第一个。
                </small>
                <button
                  className="primary"
                  disabled={!selectedWord}
                  onClick={() => {
                    const word = state.candidates.find(
                      (w) => w.id === selectedWord,
                    );
                    if (word) act({ type: "SELECT_WORD", word });
                  }}
                >
                  记住了，进入下一阶段
                  <ArrowRight size={18} />
                </button>
              </section>
            ) : revealsWord ? (
              <section className="secret-panel">
                <strong>
                  {paused || help || confirmReset
                    ? "已遮挡"
                    : state.secret?.text}
                </strong>
              </section>
            ) : stage === "day" ? (
              <section className="day-panel">
                <div
                  className={`big-timer ${state.remaining <= 30 ? "urgent" : ""}`}
                >
                  {timeText}
                </div>
                <span className="timer-label">
                  {paused ? "已暂停" : "猜词倒计时"}
                </span>
                <div className="answer-pad">
                  {["是", "不是", "可能", "接近了"].map((text) => (
                    <button
                      key={text}
                      className={response === text ? "chosen" : ""}
                      onClick={() => setResponse(text)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <p className="answer-hint">
                  {response
                    ? `镇长回答：${response}`
                    : ""}
                </p>
                <button
                  className="primary"
                  onClick={() => act({ type: "GUESS", correct: true })}
                >
                  <Check size={20} />
                  猜中真言了
                </button>
                <button
                  className="text-button"
                  onClick={() => act({ type: "GUESS", correct: false })}
                >
                  回答标记用完了
                </button>
              </section>
            ) : stage === "accusation" || stage === "discussion" ? (
              <section className="vote-panel">
                <div className="big-timer">{timeText}</div>
                <p>
                  {stage === "accusation"
                    ? "每只狼人可以指认一位玩家。"
                    : "线下同时投票，不能投给自己。"}
                </p>
                <button
                  className="primary"
                  onClick={() => act({ type: "NEXT" })}
                >
                  指认完成，确认结果
                  <ArrowRight size={18} />
                </button>
              </section>
            ) : stage === "verdict" ? (
              <section className="verdict-panel">
                <h2>
                  {state.guessed ? "狼人找到先知了吗？" : state.settings.roles.minion ? "找到狼人或爪牙了吗？" : "村民找到狼人了吗？"}
                </h2>
                <p>
                  {state.guessed
                    ? "多只狼人中，只要有一只指认正确，就算找到。"
                    : state.settings.roles.minion ? "最高票中有狼人或爪牙即找到；人人各一票则未找到。" : "最高票并列者中有狼人即找到；人人各一票则未找到。"}
                </p>
                <button
                  className="primary"
                  onClick={() => act({ type: "VERDICT", hit: true })}
                >
                  找到了
                  <Check size={19} />
                </button>
                <button
                  className="secondary"
                  onClick={() => act({ type: "VERDICT", hit: false })}
                >
                  没有找到
                  <X size={19} />
                </button>
              </section>
            ) : stage === "result" ? (
              <section className="result-panel">
                <span>本局真言</span>
                <strong>{state.secret?.text || "未选词"}</strong>
                <p>
                  {state.winner
                    ? "这一局的结果已确认。"
                    : "已跳过结算，本局不判定胜负。"}
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setSelectedWord(null);
                    act({ type: "RESET" });
                  }}
                >
                  再来一局
                  <RotateCcw size={18} />
                </button>
              </section>
            ) : (
              <section className="closed-panel">
                <EyeOff size={42} strokeWidth={1} />
                <p>
                  {stage === "dayIntro"
                    ? "准备开始猜词"
                    : nightStep ? nightStep.description : "请闭眼"}
                </p>
                <span className="small-timer">
                  {state.remaining.toString().padStart(2, "0")}
                </span>
              </section>
            )}
            {active && stage !== "result" && (
              <>
                {error && (
                  <p className="notice" role="alert">
                    {error}
                  </p>
                )}
                <div className="stage-controls">
                  {roundVoiceReady && stage in narration && <button className="icon-button" aria-label="重播本阶段语音"
                    onClick={() => { narrator.stop(); setReplay(n => n + 1); }}><RotateCcw size={18} /></button>}
                  <button
                    className="secondary"
                    aria-label={paused ? "继续" : "暂停"}
                    onClick={() => void togglePause()}
                  >
                    {paused ? <Play size={17} /> : <Pause size={17} />}
                    {!revealsWord && (paused ? "继续" : "暂停")}
                  </button>
                  <button className="secondary skip" aria-label="跳过此阶段" onClick={skip}>
                    {!revealsWord && "跳过此阶段"}
                    <ArrowRight size={18} />
                  </button>
                </div>
                {isNight && !revealsWord && !roundVoiceReady && stage !== "mayor" && (
                  <button
                    className="text-button"
                    onClick={() => act({ type: "NEXT" })}
                  >
                    手动继续
                    <ArrowRight size={15} />
                  </button>
                )}
              </>
            )}
            {stage === "result" && (
              <button className="text-button" onClick={skip}>
                跳过，返回设置
                <SkipForward size={14} />
              </button>
            )}
            <button
              className="reset-link"
              aria-label="结束本局"
              onClick={() => setConfirmReset(true)}
            >
              {revealsWord ? <X size={18} /> : "结束本局"}
            </button>
          </>
        )}
      </main>

      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close"
              aria-label="关闭玩法"
              onClick={() => setHelp(false)}
            >
              <X />
            </button>
            <h2 id="help-title">一局怎么玩</h2>
            <ol>
              <li>
                <b>用实体卡发身份。</b>
                镇长公开自己的职务，并保留一张隐藏身份卡。
              </li>
              <li>
                <b>大家闭眼，听语音。</b>
                镇长选词，先知、狼人依次睁眼看词。手机放在桌上即可。
              </li>
              <li>
                <b>天亮，开始猜词。</b>
                大家提是非问题，镇长用标记回应，不能说话。
              </li>
              <li>
                <b>猜中，狼人找先知。</b>狼人指认成功则翻盘；否则村民胜。
              </li>
              <li>
                <b>没猜中，大家找狼人。</b>讨论投票后按实体卡确认结果。
              </li>
            </ol>
            <p>
              每个阶段都可以跳过。夜晚自动推进会等播报结束再开始计时；切到后台将暂停夜晚并遮住词语。
            </p>
            <p>
              播报音频未就绪时，仅提供无声预览。正式开局前请试听并调高手机音量。
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              知道了
            </button>
          </section>
        </div>
      )}
      {confirmReset && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">结束这一局？</h2>
            <p>当前真言和进度会清空，开局设置会保留。</p>
            <button
              autoFocus
              className="secondary"
              onClick={() => setConfirmReset(false)}
            >
              继续游戏
            </button>
            <button
              className="primary"
              onClick={() => {
                setConfirmReset(false);
                setSelectedWord(null);
                act({ type: "RESET" });
              }}
            >
              结束并返回设置
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
