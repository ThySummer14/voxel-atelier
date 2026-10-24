#!/usr/bin/env python3
import sys, zlib, struct, pathlib

def ppm_to_png(src, dst):
    data = pathlib.Path(src).read_bytes()
    # parse P6 header (allow comments)
    i = 0
    parts = []
    while len(parts) < 4:
        while data[i:i+1].isspace(): i += 1
        if data[i:i+1] == b'#':
            while data[i:i+1] != b'\n': i += 1
            continue
        j = i
        while not data[j:j+1].isspace(): j += 1
        parts.append(data[i:j]); i = j
    i += 1
    w, h, maxv = int(parts[1]), int(parts[2]), int(parts[3])
    raw = data[i:i + w * h * 3]
    rows = b''.join(b'\x00' + raw[y*w*3:(y+1)*w*3] for y in range(h))
    def chunk(tag, payload):
        c = tag + payload
        return struct.pack('>I', len(payload)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(rows, 6))
    png += chunk(b'IEND', b'')
    pathlib.Path(dst).write_bytes(png)

if __name__ == '__main__':
    ppm_to_png(sys.argv[1], sys.argv[2])
    print('converted', sys.argv[2])
