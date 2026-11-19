import html, json, subprocess, os
cards = json.load(open('cards.json'))
chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
for i, c in enumerate(cards, 1):
    body = ''.join(f'<p>{html.escape(p)}</p>' for p in c.get('body', []))
    items = ''.join(f'<li>{html.escape(p)}</li>' for p in c.get('list', []))
    page = f'''<!doctype html><meta charset="utf-8"><style>
html,body{{margin:0;width:1920px;height:1080px;background:#000;color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}}
main{{box-sizing:border-box;height:1080px;padding:110px 160px;display:flex;flex-direction:column;justify-content:center}}
img{{width:96px;height:96px;border-radius:20px;margin-bottom:56px}}
.k{{color:#f0b91e;font-size:30px;font-weight:500;margin:0 0 20px;letter-spacing:.02em}}
h1{{font-size:66px;font-weight:700;line-height:1.12;margin:0 0 40px;max-width:1560px}}
p,li{{font-size:36px;line-height:1.45;color:#d2cdc8;max-width:1560px;margin:0 0 22px}}
ul{{margin:0;padding-left:1.1em}}
</style><main><img src="mark.png" alt=""><p class="k">{html.escape(c.get("kicker",""))}</p><h1>{html.escape(c["title"])}</h1>{body}<ul>{items}</ul></main>'''
    f = f'card{i:02d}.html'; open(f, 'w').write(page)
    subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1920,1080',
                    '--virtual-time-budget=3000', f'--screenshot={os.getcwd()}/card{i:02d}.png', f'file://{os.getcwd()}/{f}'],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print('card', i, c['title'][:50])
