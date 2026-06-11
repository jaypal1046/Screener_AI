#!/bin/bash
# Simple script to generate PNG icons using ImageMagick
# Install: apt-get install imagemagick

convert -size 16x16 xc:#3b82f6 -gravity center -pointsize 10 -fill white -annotate 0 "S" icon16.png
convert -size 48x48 xc:#3b82f6 -gravity center -pointsize 24 -fill white -annotate 0 "S" icon48.png
convert -size 128x128 xc:#3b82f6 -gravity center -pointsize 64 -fill white -annotate 0 "S" icon128.png
echo "Icons generated!"
