import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
img = Image.new('RGBA', (W, H), (15, 17, 21, 255))
draw = ImageDraw.Draw(img)

# 1. Background Gradient & Tech Grid
for y in range(H):
    # Vertikal gradient dari #0d0f12 ke #141923
    r = int(13 + (20 - 13) * (y / H))
    g = int(15 + (25 - 15) * (y / H))
    b = int(18 + (35 - 18) * (y / H))
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# Subtle Grid Lines
grid_color = (255, 255, 255, 10)
grid_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
grid_draw = ImageDraw.Draw(grid_layer)
for x in range(0, W, 40):
    grid_draw.line([(x, 0), (x, H)], fill=grid_color, width=1)
for y in range(0, H, 40):
    grid_draw.line([(0, y), (W, y)], fill=grid_color, width=1)
img = Image.alpha_composite(img, grid_layer)

# Radial Glow Aksen Teal di Kanan Bawah & Kiri Atas
glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

# Glow 1: Kanan (di belakang UI Card)
gx, gy = 880, 320
for radius in range(320, 0, -10):
    alpha = int(38 * (1 - (radius / 320)))
    glow_draw.ellipse([gx - radius, gy - radius, gx + radius, gy + radius], fill=(10, 160, 148, alpha))

# Glow 2: Kiri Atas (di belakang Logo)
gx2, gy2 = 120, 100
for radius in range(200, 0, -10):
    alpha = int(24 * (1 - (radius / 200)))
    glow_draw.ellipse([gx2 - radius, gy2 - radius, gx2 + radius, gy2 + radius], fill=(10, 160, 148, alpha))

img = Image.alpha_composite(img, glow_layer)
draw = ImageDraw.Draw(img)

# Coba cari font sistem Windows (Segoe UI, Arial)
def get_font(size, bold=False):
    font_paths = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
    ]
    for p in font_paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

font_brand = get_font(34, bold=True)
font_badge = get_font(13, bold=True)
font_title = get_font(42, bold=True)
font_subtitle = get_font(19, bold=False)
font_school = get_font(15, bold=True)
font_pill = get_font(14, bold=True)
font_card_title = get_font(16, bold=True)
font_metric_num = get_font(32, bold=True)
font_metric_lbl = get_font(12, bold=False)
font_cta = get_font(15, bold=True)

# 2. Paste Logo WIRU di Kiri Atas
try:
    logo = Image.open("d:/Projects/ZeroBug/Wiru/assets/wiru-tight.png").convert("RGBA")
    logo = logo.resize((68, 68), Image.Resampling.LANCZOS)
    img.paste(logo, (70, 58), logo)
except Exception as e:
    print("Logo load error:", e)

# Teks Brand di Samping Logo
draw.text((150, 62), "WIRU", fill=(245, 247, 250), font=font_brand)
# Tag Version Badge
badge_box = [260, 70, 345, 96]
draw.rounded_rectangle(badge_box, radius=6, fill=(10, 160, 148, 45), outline=(10, 160, 148, 120), width=1)
draw.text((272, 74), "v1.2 SCADA", fill=(45, 212, 191), font=font_badge)

# 3. Main Headlines Kiri
draw.text((70, 160), "Water Intelligence for", fill=(240, 243, 246), font=font_title)
draw.text((70, 214), "Raising Underwater life", fill=(45, 212, 191), font=font_title)

# Subtitle
draw.text((70, 290), "Sistem Kontrol & Monitoring Tambak Cerdas IoT", fill=(203, 213, 225), font=font_subtitle)
draw.text((70, 322), "SMKS Perikanan dan Kelautan Puger — Pesisir Jember", fill=(148, 163, 184), font=font_school)

# Feature Badges
badges = [
    ("⚡ ESP32 Online (Live 3s)", (10, 160, 148)),
    ("🌊 Aerator & Pompa Otomatis", (56, 189, 248)),
    ("🦐 Smart Auto-Feeder 4x", (245, 158, 11))
]
bx = 70
by = 380
for text, col in badges:
    bbox = font_pill.getbbox(text)
    pw = (bbox[2] - bbox[0]) + 24
    ph = 34
    draw.rounded_rectangle([bx, by, bx + pw, by + ph], radius=8, fill=(25, 30, 40, 220), outline=(col[0], col[1], col[2], 90), width=1)
    draw.text((bx + 12, by + 8), text, fill=(230, 235, 245), font=font_pill)
    bx += pw + 12

# CTA Button di Kiri Bawah
cta_box = [70, 480, 370, 532]
draw.rounded_rectangle(cta_box, radius=26, fill=(10, 160, 148), outline=(45, 212, 191), width=1)
draw.text((95, 494), "Buka Live Cockpit Dashboard →", fill=(255, 255, 255), font=font_cta)

# 4. Sisi Kanan: UI SCADA Preview Glass Card
card_x, card_y, card_w, card_h = 580, 58, 550, 514
card_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
card_draw = ImageDraw.Draw(card_layer)

# Glass Card Body
card_draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=16, fill=(22, 27, 36, 235), outline=(255, 255, 255, 28), width=1)
img = Image.alpha_composite(img, card_layer)
draw = ImageDraw.Draw(img)

# Header Card
draw.text((card_x + 24, card_y + 20), "Petak A1 (Vaname 1.200m²)", fill=(245, 247, 250), font=font_card_title)
# Status dot
draw.ellipse([card_x + card_w - 110, card_y + 24, card_x + card_w - 98, card_y + 36], fill=(45, 212, 191))
draw.text((card_x + card_w - 92, card_y + 22), "Normal", fill=(45, 212, 191), font=font_badge)

# Divider line
draw.line([(card_x + 20, card_y + 54), (card_x + card_w - 20, card_y + 54)], fill=(255, 255, 255, 20), width=1)

# 3 KPI Stat Tiles
metrics = [
    ("Oksigen (DO)", "5.40", "mg/L", (45, 212, 191)),
    ("Suhu Air", "28.5", "°C", (244, 63, 94)),
    ("pH Air", "7.40", "pH", (56, 189, 248))
]

tile_w = 156
tile_h = 90
tile_y = card_y + 68
for idx, (lbl, val, unit, color) in enumerate(metrics):
    tx = card_x + 20 + idx * (tile_w + 16)
    draw.rounded_rectangle([tx, tile_y, tx + tile_w, tile_y + tile_h], radius=10, fill=(30, 36, 48, 200), outline=(255, 255, 255, 18), width=1)
    draw.text((tx + 12, tile_y + 10), lbl, fill=(148, 163, 184), font=font_metric_lbl)
    draw.text((tx + 12, tile_y + 32), val, fill=(248, 250, 252), font=font_metric_num)
    draw.text((tx + 98, tile_y + 44), unit, fill=color, font=font_metric_lbl)
    # Status bar kecil
    draw.rounded_rectangle([tx + 12, tile_y + 74, tx + tile_w - 12, tile_y + 78], radius=2, fill=(col[0], col[1], col[2], 120))

# Mini Interactive Chart Simulation
chart_top = tile_y + tile_h + 20
chart_h = 160
chart_bottom = chart_top + chart_h
chart_left = card_x + 24
chart_right = card_x + card_w - 24

draw.text((chart_left, chart_top - 2), "Telemetri Oksigen vs Kritis (Real-time 3s)", fill=(148, 163, 184), font=font_metric_lbl)

# Chart Background Grid
for cy in range(chart_top + 24, chart_bottom, 36):
    draw.line([(chart_left, cy), (chart_right, cy)], fill=(255, 255, 255, 12), width=1)

# Ambang batas kritis (garis putus-putus oranye)
crit_y = chart_top + 95
for cx in range(chart_left, chart_right, 14):
    draw.line([(cx, crit_y), (min(cx + 8, chart_right), crit_y)], fill=(245, 158, 11, 180), width=1)
draw.text((chart_right - 100, crit_y - 14), "Batas Kritis 5.0", fill=(245, 158, 11), font=font_metric_lbl)

# Chart Area Fill & Curve (DO Points)
chart_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
chart_draw = ImageDraw.Draw(chart_layer)

points = [
    (chart_left, chart_top + 60),
    (chart_left + 60, chart_top + 68),
    (chart_left + 120, chart_top + 54),
    (chart_left + 180, chart_top + 74),
    (chart_left + 240, chart_top + 88),
    (chart_left + 300, chart_top + 70),
    (chart_left + 360, chart_top + 45),
    (chart_left + 420, chart_top + 50),
    (chart_right, chart_top + 42),
]

# Polygon Fill
poly_points = [(chart_left, chart_bottom)] + points + [(chart_right, chart_bottom)]
chart_draw.polygon(poly_points, fill=(10, 160, 148, 35))

# Line Curve
for i in range(len(points) - 1):
    chart_draw.line([points[i], points[i+1]], fill=(45, 212, 191, 255), width=3)
    chart_draw.ellipse([points[i][0] - 3, points[i][1] - 3, points[i][0] + 3, points[i][1] + 3], fill=(245, 247, 250), outline=(10, 160, 148), width=1)
chart_draw.ellipse([points[-1][0] - 4, points[-1][1] - 4, points[-1][0] + 4, points[-1][1] + 4], fill=(45, 212, 191))

img = Image.alpha_composite(img, chart_layer)
draw = ImageDraw.Draw(img)

# Bottom Card Info Bar
bot_y = chart_bottom + 12
draw.rounded_rectangle([chart_left, bot_y, chart_right, bot_y + 44], radius=8, fill=(28, 34, 46, 220), outline=(255, 255, 255, 14), width=1)
draw.text((chart_left + 14, bot_y + 14), "Kincir Aerator: Nyala (Aerasi)", fill=(45, 212, 191), font=font_metric_lbl)
draw.text((chart_left + 230, bot_y + 14), "Pompa: Sirkulasi Aktif", fill=(56, 189, 248), font=font_metric_lbl)
draw.text((chart_right - 100, bot_y + 14), "FCR: 1.24", fill=(245, 158, 11), font=font_metric_lbl)

# Simpan hasil OG Image
img = img.convert('RGB')
output_path = "d:/Projects/ZeroBug/Wiru/assets/og-image.png"
img.save(output_path, "PNG", quality=95)
print("OG Image successfully generated at:", output_path)
