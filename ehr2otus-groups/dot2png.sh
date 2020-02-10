#!/bin/sh
PNG_OUTPUT="./output/ELEA/graph"
FILES="./output/ELEA/graph/*.dot"
for f in $FILES
do
    b=$(basename $f .dot)
	  dot -Tpng $f > "$PNG_OUTPUT/$b.png"
	  rm $f
done