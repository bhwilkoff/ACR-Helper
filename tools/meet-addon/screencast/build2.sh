#!/bin/sh
# Builds the Marketplace review video for v0.9.2 (2026-11-27): two people,
# asking for access during the session, Share, votes, record, the sheet.
# Usage: tools/meet-addon/screencast/build2.sh <clips dir> <work dir>
# Clips (window recordings, see SCREENCAST.md): s1-start s2-join s3-google
# s3b-consent s4-picker s4b-asked.png s5-share s6-select s7-vote s8-sheet.
set -e
K=$1; O=$2; C=$(cd "$(dirname "$0")" && pwd)
mkdir -p $O
ENC="-r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an"
FIT="scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x000000,setsar=1,fps=30"
# Main windows (3024x1752, vertical tabs): drop the tab sidebar, toolbar and
# the debugging banner; blur where the "Claude is working here" pill sits.
WIN="crop=2897:1530:115:210,split[a][b];[b]crop=480:100:1210:0,boxblur=18:3[p];[a][p]overlay=1210:0"
# Google's windows (1180x1752): keep title and address bar, blur the tab pill.
POP="split[a][b];[b]crop=110:55:25:5,boxblur=10:2[p];[a][p]overlay=25:5"
# The chooser window also had the debugging banner (133-248): drop it, and
# blur the two other accounts of the same person.
POPB="split[t][m];[t]crop=1180:133:0:0[top];[m]crop=1180:1504:0:248[mid];[top][mid]vstack,split[a][b];[b]crop=1180:240:0:800,boxblur=22:4[q];[a][q]overlay=0:800,$POP"
card(){ ffmpeg -v error -y -loop 1 -t $2 -i $C/card$1.png -vf "scale=1920:1080,setsar=1,fps=30,fade=in:0:9,fade=out:st=$(echo "$2-0.3"|bc):d=0.3" $ENC $O/c$1.mp4; }
card 01 11; card 02 10; card 03 11; card 04 9; card 05 9; card 06 7; card 07 8; card 08 9; card 09 7; card 10 11
ffmpeg -v error -y -i $K/s1-start.mp4 -vf "$WIN,$FIT" $ENC $O/v1.mp4
ffmpeg -v error -y -i $K/s2-join.mp4 -vf "$WIN,$FIT" $ENC $O/v2.mp4
ffmpeg -v error -y -i $K/s3-google.mp4 -vf "$POPB,$FIT" $ENC $O/v3a.mp4
ffmpeg -v error -y -i $K/s3b-consent.mp4 -vf "$POP,$FIT" $ENC $O/v3b.mp4
ffmpeg -v error -y -i $K/s4-picker.mp4 -vf "$WIN,$FIT" $ENC $O/v4.mp4
ffmpeg -v error -y -loop 1 -t 4 -i $K/s4b-asked.png -vf "$WIN,$FIT" $ENC $O/v4s.mp4
ffmpeg -v error -y -i $K/s5-share.mp4 -vf "$WIN,$FIT" $ENC $O/v5.mp4
ffmpeg -v error -y -ss 30 -t 38 -i $K/s6-select.mp4 -vf "$WIN,$FIT" $ENC $O/v6.mp4
ffmpeg -v error -y -ss 68 -i $K/s6-select.mp4 -vf "$WIN,$FIT" $ENC $O/v7a.mp4
ffmpeg -v error -y -t 46 -i $K/s7-vote.mp4 -vf "$WIN,$FIT" $ENC $O/v7b.mp4
ffmpeg -v error -y -ss 65 -i $K/s7-vote.mp4 -vf "$WIN,$FIT" $ENC $O/v8.mp4
ffmpeg -v error -y -i $K/s8-sheet.mp4 -vf "$WIN,$FIT" $ENC $O/v9.mp4
(cd $C && python3 tighten.py $O v1 v2 v3a v3b v4 v5 v6 v7a v7b v8 v9)
printf "file '%s'\n" c01.mp4 c02.mp4 v1t.mp4 c03.mp4 v2t.mp4 v3at.mp4 v3bt.mp4 c04.mp4 v4t.mp4 v4s.mp4 c05.mp4 v5t.mp4 c06.mp4 v6t.mp4 c07.mp4 v7at.mp4 v7bt.mp4 c08.mp4 v8t.mp4 c09.mp4 v9t.mp4 c10.mp4 > $O/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $O/list.txt -c copy $O/acr-helper-marketplace-review.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $O/acr-helper-marketplace-review.mp4
