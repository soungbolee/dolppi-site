"""기본 공유 이미지(링크 미리보기) 1200x630 생성 — python3 tools/make_og.py"""
import cairosvg
F = "Noto Sans CJK KR"
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#FFFFFF"/>
<rect x="0" y="0" width="1200" height="12" fill="#0E6B66"/>
<g transform="translate(80,110) scale(2.2)">
<path d="M88 22 C104 22 114 34 113 50 C112 66 100 74 86 74 C72 74 63 63 64 48 C65 33 74 22 88 22 Z" fill="#0E6B66"/>
<path d="M42 8 C62 8 74 28 72 48 C70 68 56 78 40 78 C22 78 10 64 12 44 C14 24 24 8 42 8 Z" fill="#B9DCD8"/>
</g>
<text x="80" y="420" font-family="{F}" font-size="96" font-weight="700" fill="#172033">돌삐</text>
<text x="80" y="490" font-family="{F}" font-size="40" font-weight="500" fill="#4A5568">데이터와 AI, 현장의 기록</text>
<text x="80" y="570" font-family="{F}" font-size="26" font-weight="700" fill="#0E6B66">dolppi.com</text>
</svg>'''
cairosvg.svg2png(bytestring=svg.encode(), write_to="public/img/og-default.png")
print("ok")
