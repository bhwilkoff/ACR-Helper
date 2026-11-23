#!/bin/sh
# Builds the OAuth/Marketplace review video (drive.file version, 2026-11-23).
# Usage: tools/meet-addon/screencast/build.sh <clips dir> <work dir>
# Clips: k1-open k2-google k3-choose (v0.8.1 sign-in) s6-review s7-sheet
#        (window recordings, see SCREENCAST.md).
set -e
K=$1; O=$2; C=$(cd "$(dirname "$0")" && pwd)
mkdir -p $O
ENC="-r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an"
FIT="scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x000000,setsar=1,fps=30"
# Main window (3024x1770): drop tab strip, bookmarks and the debugging banner,
# trim the edge glow, blur the "Claude is working here" pill.
WIN="crop=3000:1392:12:364,split[a][b];[b]crop=460:90:1276:0,boxblur=18:3[p];[a][p]overlay=1276:0"
# Same, plus the second account line in One Tap's chooser (s1, 7-23 s).
WIN1="$WIN,split[c][d];[d]crop=720:90:2280:1100,boxblur=18:3[q];[c][q]overlay=2280:1100:enable='between(t,6,24)'"
# Google's windows (1180x1768): keep title and address bar, drop the banner.
POP="split[t][m];[t]crop=1180:132:0:0[top];[m]crop=1180:1522:0:246[mid];[top][mid]vstack"
# The pick window (1520x1252): same idea.
PICK="split[t][m];[t]crop=1520:130:0:0[top];[m]crop=1520:1012:0:240[mid];[top][mid]vstack"
card(){ ffmpeg -v error -y -loop 1 -t $2 -i $C/card$1.png -vf "scale=1920:1080,setsar=1,fps=30,fade=in:0:9,fade=out:st=$(echo "$2-0.3"|bc):d=0.3" $ENC $O/c$1.mp4; }
card 01 11; card 02 10; card 03 11; card 04 7; card 05 8; card 06 9; card 07 9; card 08 11
ffmpeg -v error -y -i $K/k1-open.mp4 -vf "$WIN,$FIT" $ENC $O/v1.mp4
ffmpeg -v error -y -i $K/k2-google.mp4 -vf "$POP,$FIT" $ENC $O/v3.mp4
ffmpeg -v error -y -i $K/k3-choose.mp4 -vf "$WIN,$FIT" $ENC $O/v4.mp4
ffmpeg -v error -y -t 13 -i $K/s6-review.mp4 -vf "$WIN,$FIT" $ENC $O/v6a.mp4
ffmpeg -v error -y -ss 13 -t 17 -i $K/s6-review.mp4 -vf "$WIN,$FIT" $ENC $O/v6b.mp4
ffmpeg -v error -y -ss 30 -i $K/s6-review.mp4 -vf "$WIN,$FIT" $ENC $O/v6c.mp4
ffmpeg -v error -y -i $K/s7-sheet.mp4 -vf "$WIN,$FIT" $ENC $O/v7.mp4
(cd $C && python3 tighten.py $O v1 v3 v4 v6a v6b v6c v7)
printf "file '%s'\n" c01.mp4 c02.mp4 v1t.mp4 v3t.mp4 c03.mp4 v4t.mp4 c04.mp4 v6at.mp4 c05.mp4 v6bt.mp4 c06.mp4 v6ct.mp4 c07.mp4 v7t.mp4 c08.mp4 > $O/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/list.txt -c copy $O/acr-helper-oauth-review.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $O/acr-helper-oauth-review.mp4
