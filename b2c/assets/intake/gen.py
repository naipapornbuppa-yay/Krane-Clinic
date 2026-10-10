from PIL import Image, ImageDraw
S=1600  # supersample, downscaled to 800
BG=(234,237,242,255)      # neutral slot
HEAD=(197,205,220,255)    # soft head fill
ZONE=(150,167,196,255)    # highlighted concern zone
LINE=(92,100,114,255)     # ink line
LW=int(S*0.012)

def canvas():
    im=Image.new("RGBA",(S,S),BG)
    return im, ImageDraw.Draw(im)

def save(im,name):
    im=im.resize((800,800),Image.LANCZOS).convert("RGB")
    im.save(name,"JPEG",quality=90)

# 1. FRONT hairline ---------------------------------------------------
im,d=canvas()
cx,cy=S*0.5,S*0.54
rx,ry=S*0.28,S*0.34
d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=HEAD,outline=LINE,width=LW)
# hairline band across the top
d.pieslice([cx-rx,cy-ry,cx+rx,cy+ry],180,360,fill=ZONE)
d.arc([cx-rx,cy-ry,cx+rx,cy+ry],180,360,fill=LINE,width=LW)
d.line([cx-rx,cy,cx+rx,cy],fill=LINE,width=int(LW*0.7))
# simple face marks
ey=cy+ry*0.15
d.ellipse([cx-rx*0.45-S*0.012,ey-S*0.012,cx-rx*0.45+S*0.012,ey+S*0.012],fill=LINE)
d.ellipse([cx+rx*0.45-S*0.012,ey-S*0.012,cx+rx*0.45+S*0.012,ey+S*0.012],fill=LINE)
d.arc([cx-rx*0.3,ey+ry*0.25,cx+rx*0.3,ey+ry*0.6],20,160,fill=LINE,width=LW)
save(im,"hair-angle-front.jpg")

# 2. CROWN top-down ---------------------------------------------------
im,d=canvas()
cx,cy=S*0.5,S*0.5
r=S*0.32
d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=HEAD,outline=LINE,width=LW)
cr=S*0.15
d.ellipse([cx-cr,cy-cr*1.1,cx+cr,cy+cr*0.9],fill=ZONE,outline=LINE,width=LW)
# swirl hint
d.arc([cx-cr*0.5,cy-cr*0.6,cx+cr*0.5,cy+cr*0.4],0,300,fill=LINE,width=int(LW*0.8))
save(im,"hair-angle-crown.jpg")

# 3. BACK of head -----------------------------------------------------
im,d=canvas()
cx=S*0.5
# shoulders
d.pieslice([S*0.2,S*0.62,S*0.8,S*1.15],180,360,fill=HEAD,outline=LINE,width=LW)
# head
hr_x,hr_y=S*0.22,S*0.26
hy=S*0.42
d.ellipse([cx-hr_x,hy-hr_y,cx+hr_x,hy+hr_y],fill=HEAD,outline=LINE,width=LW)
# crown zone (back)
d.pieslice([cx-hr_x*0.7,hy-hr_y*0.9,cx+hr_x*0.7,hy+hr_y*0.2],180,360,fill=ZONE)
d.arc([cx-hr_x*0.7,hy-hr_y*0.9,cx+hr_x*0.7,hy+hr_y*0.2],180,360,fill=LINE,width=int(LW*0.8))
save(im,"hair-angle-back.jpg")

# 4. SIDE profile / temple -------------------------------------------
im,d=canvas()
cx,cy=S*0.52,S*0.52
rx,ry=S*0.27,S*0.33
d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=HEAD,outline=LINE,width=LW)
# temple zone (upper left front)
d.pieslice([cx-rx,cy-ry,cx+rx,cy+ry],170,270,fill=ZONE)
d.arc([cx-rx,cy-ry,cx+rx,cy+ry],170,270,fill=LINE,width=int(LW*0.8))
# nose profile bump
d.polygon([(cx-rx*0.95,cy),(cx-rx*1.12,cy+ry*0.12),(cx-rx*0.95,cy+ry*0.24)],fill=HEAD,outline=LINE)
# ear
d.ellipse([cx+rx*0.25,cy+ry*0.05,cx+rx*0.55,cy+ry*0.4],outline=LINE,width=int(LW*0.8),fill=HEAD)
save(im,"hair-angle-side.jpg")

print("generated 4 images")
