from PIL import Image, ImageFilter
import numpy as np, base64, io, json, sys
from collections import deque
S = 1568/1920.0
def crop_css(im, r):  # r = [x,y,w,h] in CSS px
    x,y,w,h = r
    return im.crop((int(x*S)+4, int(y*S)+4, int((x+w)*S)-4, int((y+h)*S)-4))
def cut(im, tol=28, erode=1, largest=False, neutral=False):
    a = np.asarray(im.convert('RGB')).astype(int)
    h,w,_ = a.shape
    # background colour = median of the border pixels
    border = np.concatenate([a[0,:],a[-1,:],a[:,0],a[:,-1]])
    bg = np.median(border,axis=0)
    diff = np.abs(a-bg).sum(axis=2)
    isbg = diff <= tol*3
    if neutral:  # background = any light, unsaturated pixel (white page + grey neighbours)
        isbg = ((a.max(axis=2)-a.min(axis=2)) < 20) & (a.mean(axis=2) > 190)
    seen = np.zeros((h,w),bool)
    q = deque()
    for x in range(w):
        q.append((0,x)); q.append((h-1,x))
    for y in range(h):
        q.append((y,0)); q.append((y,w-1))
    while q:
        y,x = q.popleft()
        if seen[y,x] or not isbg[y,x]: continue
        seen[y,x]=True
        if y>0: q.append((y-1,x))
        if y<h-1: q.append((y+1,x))
        if x>0: q.append((y,x-1))
        if x<w-1: q.append((y,x+1))
    fg = ~seen
    if largest:
        import cv2
        n, lab, stats, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8))
        if n > 1:
            big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); fg = lab == big
    alpha = fg.astype(np.uint8)*255
    al = Image.fromarray(alpha)
    if erode:
        al = al.filter(ImageFilter.MinFilter(3))
    al = al.filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA'); out.putalpha(al)
    bbox = al.point(lambda v: 255 if v>8 else 0).getbbox()
    if bbox:
        pad=4; bbox=(max(0,bbox[0]-pad),max(0,bbox[1]-pad),min(w,bbox[2]+pad),min(h,bbox[3]+pad))
        out = out.crop(bbox)
    return out
def finish(im, maxdim=440, q=80):
    im = im.copy(); im.thumbnail((maxdim,maxdim), Image.LANCZOS)
    b = io.BytesIO(); im.save(b,'WEBP',quality=q,method=6)
    return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode(), im.size, len(b.getvalue())
jobs = {
 'wilfa':   ('screenshot-1793285983175-322985e9.jpg', [493,1,935,935], True, None),
 'mic':     ('screenshot-1793286358586-2f3e3e12.jpg', [8,8,900,900], True, None),
 'whoop':   ('screenshot-1793286385062-03f6a508.jpg', [8,8,705,900], True, None),
 'adidas':  ('screenshot-1793286403575-2300795b.jpg', [8,8,1260,900], True, None),
 'osprey':  ('screenshot-1793286422706-99b45ad4.jpg', [8,8,900,900], True, None),
 'slnt':    ('screenshot-1793286439774-702945ec.jpg', [8,8,900,900], True, None),
 'puncube': ('screenshot-1793286458087-53969f31.jpg', [8,8,900,900], True, None),
 'rc':      ('screenshot-1793286476600-79a618c1.jpg', [8,8,1200,800], True, None),
 'lg':      ('screenshot-1793286497505-391491bc.jpg', [8,8,900,900], True, None),
 'breitling':('screenshot-1793286516949-6d04e4c2.jpg', [8,8,900,900], True, None),
 'imac':    ('screenshot-1793286536980-22fe34a2.jpg', None, True, (940,183,1128,574)),
 'macmini': ('screenshot-1793286556080-df7b8d29.jpg', None, True, (300,180,1000,728)),
 'tesla':   ('screenshot-1793286580191-320fec09.jpg', None, False, (715,222,1395,628)),
 'rode':    ('screenshot-1793286600896-3c1a5b46.jpg', None, False, (170,30,740,740)),
}
out = {}
for k,(f,r,docut,px) in jobs.items():
    im = Image.open(f)
    im = crop_css(im, r) if r else im.crop(px)
    if docut:
        im = cut(im, tol={'slnt':22,'puncube':22,'imac':22}.get(k,30), largest=(k in ('macmini',)), neutral=(k=='imac'))
    url,size,n = finish(im, q=80 if docut else 74)
    out[k] = url
    print(k, size, n)
json.dump(out, open('wl/images.json','w'))
print('total', sum(len(v) for v in out.values()))
