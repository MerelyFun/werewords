"""从已存档原件重建题库，不运行上游代码，不联网。"""
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = json.loads((ROOT / 'src/data/github-sources.json').read_text(encoding='utf-8'))

# 本项目人工整理：适合通过是/否提问拆解的常见成语优先标准，其余挑战。
HANDLE_STANDARD = set('''彬彬有礼 里里外外 十指连心 见缝插针 心甘情愿 有心无力 志同道合 名不虚传 万无一失 天南海北 地动山摇 福寿安康 虎虎生威 卧虎藏龙 虎视眈眈 吃里扒外 井然有条 口是心非 一心一意 三心二意 四面八方 五颜六色 六神无主 七上八下 八仙过海 九牛一毛 十全十美 一石二鸟 一箭双雕 画蛇添足 画龙点睛 井底之蛙 对牛弹琴 守株待兔 亡羊补牢 刻舟求剑 掩耳盗铃 狐假虎威 盲人摸象 自相矛盾 拔苗助长 叶公好龙 滥竽充数 杯弓蛇影 愚公移山 水滴石穿 一举两得 一刀两断 一模一样 一目了然 一清二楚 一言为定 一路顺风 一帆风顺 一五一十 一马当先 一分为二 一落千丈 一鸣惊人 一视同仁 不三不四 不知不觉 不伦不类 不慌不忙 不约而同 不可思议 不劳而获 半途而废 半信半疑 百发百中 百里挑一 白手起家 白日做梦 大惊小怪 大同小异 大摇大摆 东张西望 东山再起 风和日丽 风雨交加 风平浪静 风吹草动 欢天喜地 花好月圆 花言巧语 火上浇油 鸡飞狗跳 鸡犬不宁 鸡毛蒜皮 九死一生 见钱眼开 将心比心 口口声声 哭笑不得 狼吞虎咽 两全其美 乱七八糟 马马虎虎 美中不足 门当户对 名列前茅 目中无人 目瞪口呆 鸟语花香 七嘴八舌 千军万马 千山万水 千言万语 千变万化 前因后果 前所未有 情不自禁 人山人海 人来人往 如鱼得水 三长两短 三头六臂 三言两语 山清水秀 生龙活虎 十拿九稳 手忙脚乱 手舞足蹈 水落石出 四海为家 天长地久 天罗地网 同甘共苦 偷鸡摸狗 完好无损 望子成龙 无家可归 无价之宝 无影无踪 五光十色 喜出望外 心直口快 心想事成 兴高采烈 雪中送炭 摇头晃脑 引人注目 有说有笑 有眼无珠 自言自语 自由自在 左顾右盼 走马观花 众所周知 众志成城 争先恐后 举棋不定 江河日下 吃喝玩乐 无所事事 良药苦口 破镜重圆 独一无二 金玉良缘 老态龙钟 正大光明 起早贪黑 笑里藏刀 浑水摸鱼 永无止境 眼高手低 言行不一 双喜临门 千里迢迢'''.split())
PARTI_HARD = set('''太空站 月球基地 海底世界 云端城堡 秘密花园 魔法学校 恐龙公园 机器人工厂 未来城市 数字博物馆 证券交易所 地质学家 考古学家 物理学家 人工智能工程师 数据分析师 生物学家 气象员 珠宝匠 钟表匠 陶艺家 测量员 穿山甲 食蚁兽 鸭嘴兽 信天翁 鳐鱼 剑鱼 鬣蜥 独角仙 鹈鹕 狐猴 藤球 曲棍球 壁球 手球 水上芭蕾 撑杆跳高 定向越野 越野滑雪 自由搏击 武术套路 普拉提 铁人三项 定格动画 光合作用 满汉全席 流水席 九宫格火锅'''.split())
CATEGORIES = {'daily': '日常生活', 'animals': '动物世界', 'imagination': '脑洞想象', 'food': '美食饮品', 'sports': '运动竞技', 'places': '地点场景', 'jobs': '职业身份', 'culture': '文化故事'}

def load(source, name):
    item = next(f for f in source['files'] if f['rawPath'].endswith('/' + name))
    raw = (ROOT / item['rawPath']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item['sha256'], '原件哈希不一致'
    return raw.decode('utf-8')

def record(source, word, category, difficulty):
    return {'id': source['id'] + '-' + hashlib.sha256(word.encode()).hexdigest()[:12], 'text': word, 'category': category, 'difficulty': difficulty}

def main():
    for source in SOURCES:
        entries = []
        if source['id'] == 'github-handle':
            # 只提取答案数组的第一个字段，排除提示字、日期种子和占位空数组。
            entries = [record(source, word, '成语', 'easy' if word in HANDLE_STANDARD else 'hard')
                       for word in re.findall(r"\['([^']+)'", load(source, 'list.ts.txt'))]
            expected = 424
        else:
            base = load(source, 'word-bank.ts.txt').split('export const WORD_BANK = {', 1)[1]
            extra = load(source, 'word-bank-extra.ts.txt').split('const firstHint:', 1)[0]
            for key, category in CATEGORIES.items():
                block = re.search(r'\b' + key + r': \[(.*?)\n  \]', base, re.S).group(1)
                words = re.findall(r"\bword: '([^']+)'", block)
                words += re.search(r'^  ' + key + r": '([^']+)'", extra, re.M).group(1).split(',')
                for word in words:
                    difficulty = 'hard' if key in ('imagination', 'culture') or word in PARTI_HARD else 'easy'
                    entries.append(record(source, word, category, difficulty))
            expected = 880
        assert len(entries) == expected
        assert len({w['text'] for w in entries}) == expected
        assert all(w['text'] == w['text'].strip() and w['text'] for w in entries)
        slug = source['id'].removeprefix('github-')
        (ROOT / f'src/data/{slug}-words.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(source['name'], len(entries), {d: sum(w['difficulty'] == d for w in entries) for d in ['easy', 'hard']})
    notices = ['第三方词库来源与许可\n\n标准/挑战为狼人真言项目整理，原词未改。\nParti 词库采用 PolyForm Noncommercial 1.0.0，保留其非商业许可条款。']
    for source in SOURCES:
        license_text = (ROOT / source['licensePath']).read_text(encoding='utf-8')
        notices.append(f"{source['name']}\n{source['url']}\nRevision: {source['revision']}\n\n{license_text}")
    (ROOT / 'public/wordlist-notices.txt').write_text('\n\n--------------------\n\n'.join(notices), encoding='utf-8')

if __name__ == '__main__':
    main()
