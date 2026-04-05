#!/usr/bin/env python3
"""Generate og-image.png using only Python stdlib (struct + zlib)."""
import struct, zlib, os

W, H = 1200, 630

# Brand colors
BG = (26, 23, 20)        # #1a1714
GOLD = (201, 169, 110)   # #c9a96e
TEXT = (232, 224, 212)    # #e8e0d4
MUTED = (106, 94, 78)    # #6a5e4e

# Create pixel buffer (RGB)
pixels = bytearray(W * H * 3)

def fill_rect(x0, y0, w, h, color):
    for y in range(max(0, y0), min(H, y0 + h)):
        for x in range(max(0, x0), min(W, x0 + w)):
            off = (y * W + x) * 3
            pixels[off:off+3] = bytes(color)

# Fill background
for i in range(W * H):
    off = i * 3
    pixels[off:off+3] = bytes(BG)

# Border accent - thin gold lines at top and bottom
fill_rect(0, 0, W, 3, GOLD)
fill_rect(0, H - 3, W, 3, GOLD)

# 5x7 bitmap font
FONT_5X7 = {
    'A': ["01110","10001","10001","11111","10001","10001","10001"],
    'B': ["11110","10001","10001","11110","10001","10001","11110"],
    'C': ["01110","10001","10000","10000","10000","10001","01110"],
    'D': ["11100","10010","10001","10001","10001","10010","11100"],
    'E': ["11111","10000","10000","11110","10000","10000","11111"],
    'F': ["11111","10000","10000","11110","10000","10000","10000"],
    'G': ["01110","10001","10000","10111","10001","10001","01110"],
    'H': ["10001","10001","10001","11111","10001","10001","10001"],
    'I': ["01110","00100","00100","00100","00100","00100","01110"],
    'J': ["00111","00010","00010","00010","00010","10010","01100"],
    'K': ["10001","10010","10100","11000","10100","10010","10001"],
    'L': ["10000","10000","10000","10000","10000","10000","11111"],
    'M': ["10001","11011","10101","10101","10001","10001","10001"],
    'N': ["10001","10001","11001","10101","10011","10001","10001"],
    'O': ["01110","10001","10001","10001","10001","10001","01110"],
    'P': ["11110","10001","10001","11110","10000","10000","10000"],
    'Q': ["01110","10001","10001","10001","10101","10010","01101"],
    'R': ["11110","10001","10001","11110","10100","10010","10001"],
    'S': ["01111","10000","10000","01110","00001","00001","11110"],
    'T': ["11111","00100","00100","00100","00100","00100","00100"],
    'U': ["10001","10001","10001","10001","10001","10001","01110"],
    'V': ["10001","10001","10001","10001","01010","01010","00100"],
    'W': ["10001","10001","10001","10101","10101","10101","01010"],
    'X': ["10001","10001","01010","00100","01010","10001","10001"],
    'Y': ["10001","10001","01010","00100","00100","00100","00100"],
    'Z': ["11111","00001","00010","00100","01000","10000","11111"],
    '-': ["00000","00000","00000","11111","00000","00000","00000"],
    '.': ["00000","00000","00000","00000","00000","00000","00100"],
    ' ': ["00000","00000","00000","00000","00000","00000","00000"],
    "'": ["00100","00100","01000","00000","00000","00000","00000"],
}

def draw_text(text, cx, cy, scale, color):
    """Draw text centered at (cx, cy) using 5x7 bitmap font."""
    char_w = 5 * scale + scale  # char width + spacing
    total_w = len(text) * char_w - scale
    start_x = cx - total_w // 2
    start_y = cy - (7 * scale) // 2

    for ci, ch in enumerate(text):
        glyph = FONT_5X7.get(ch.upper(), FONT_5X7.get(' '))
        if glyph is None:
            continue
        ox = start_x + ci * char_w
        for row_i, row_str in enumerate(glyph):
            for col_i, bit in enumerate(row_str):
                if bit == '1':
                    fill_rect(ox + col_i * scale, start_y + row_i * scale,
                             scale, scale, color)

def draw_diamond(cx, cy, size, color):
    for dy in range(-size, size + 1):
        w = size - abs(dy)
        fill_rect(cx - w, cy + dy, w * 2 + 1, 1, color)

# Layout: centered vertically
# "PEOPLE'S" large (scale 5) at y=250
# "PATTERNS" medium (scale 3) at y=310  (gold)
# divider at y=360
# tagline at y=400
# domain at y=560

draw_text("PEOPLE'S", 600, 245, 5, TEXT)
draw_text("PATTERNS", 600, 320, 3, GOLD)

# Gold divider line with diamond
draw_diamond(600, 380, 6, GOLD)
fill_rect(430, 380, 150, 1, GOLD)
fill_rect(620, 380, 150, 1, GOLD)

draw_text("MADE-TO-MEASURE SEWING PATTERNS", 600, 430, 2, MUTED)
draw_text("PEOPLESPATTERNS.COM", 600, 560, 2, MUTED)

# Write PNG
def write_png(path, width, height, pixels_rgb):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)

    raw = bytearray()
    for y in range(height):
        raw.append(0)
        off = y * width * 3
        raw.extend(pixels_rgb[off:off + width * 3])

    compressed = zlib.compress(bytes(raw), 9)

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))

out_path = os.path.join(os.path.dirname(__file__), '../public/og-image.png')
out_path = os.path.normpath(out_path)
write_png(out_path, W, H, pixels)
print(f"Generated {out_path} ({W}x{H})")
