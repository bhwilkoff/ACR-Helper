#!/bin/sh
# Builds the Marketplace/OAuth review video from the window clips and cards.
# Usage: tools/meet-addon/screencast/build.sh <clips dir> <work dir>
set -e
K=$1; O=$2; C=$(cd "$(dirname "$0")" && pwd)
mkdir -p $O
ENC="-r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an"
FIT="scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x000000,setsar=1,fps=30"
# Main window (2400x1682): drop tab strip + "Claude started debugging" banner and edge glow; blur the "Claude" pills.
WIN="crop=2372:1378:14:290,split[a][b];[b]crop=470:92:956:0,boxblur=18:3[p];[a][p]overlay=956:0[c];[c]split[d][e];[e]crop=260:90:0:1288,boxblur=18:3[q];[d][q]overlay=0:1288"
# Google's windows (1180x1770): keep title and address bar, drop the banner.
POP="split[t][m];[t]crop=1180:132:0:0[top];[m]crop=1180:1524:0:246[mid];[top][mid]vstack"
card(){ ffmpeg -v error -y -loop 1 -t $2 -i $C/card$1.png -vf "scale=1920:1080,setsar=1,fps=30,fade=in:0:9,fade=out:st=$(echo "$2-0.3"|bc):d=0.3" $ENC $O/c$1.mp4; }
card 01 11; card 02 10; card 03 8; card 04 6; card 05 8; card 06 7; card 07 11
ffmpeg -v error -y -ss 8 -t 39 -i $K/s1-signin.mp4 -vf "$WIN,$FIT" $ENC $O/v1.mp4
ffmpeg -v error -y -i $K/s1b-onetap-window.mp4 -vf "$POP,$FIT" $ENC $O/v1b.mp4
ffmpeg -v error -y -i $K/s2-openreview.mp4 -vf "$WIN,$FIT" $ENC $O/v2.mp4
ffmpeg -v error -y -i $K/s3-consent.mp4 -vf "$POP,$FIT" $ENC $O/v3.mp4
ffmpeg -v error -y -t 40 -i $K/s4-review.mp4 -vf "$WIN,$FIT" $ENC $O/v4a.mp4
ffmpeg -v error -y -ss 40 -t 28 -i $K/s4-review.mp4 -vf "$WIN,$FIT" $ENC $O/v4b.mp4
ffmpeg -v error -y -ss 68 -i $K/s4-review.mp4 -vf "$WIN,$FIT" $ENC $O/v4c.mp4
ffmpeg -v error -y -ss 38.5 -i $K/s5-sheet.mp4 -vf "$WIN,$FIT" $ENC $O/v5.mp4
python3 $C/tighten.py $O v1 v1b v2 v3 v4a v4b v4c v5
printf "file '%s'\n" c01.mp4 c02.mp4 v1t.mp4 v1bt.mp4 v2t.mp4 v3t.mp4 c03.mp4 v4at.mp4 c04.mp4 v4bt.mp4 c05.mp4 v4ct.mp4 c06.mp4 v5t.mp4 c07.mp4 > $O/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/list.txt -c copy $O/acr-helper-meet-addon-review.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $O/acr-helper-meet-addon-review.mp4
