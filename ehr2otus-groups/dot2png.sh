#!/bin/sh
ACRONYM="CARA"
PNG_OUTPUT="./output/$ACRONYM/graph"
EHR_FILES="./output/$ACRONYM/graph/ehr/*.dot"
OTUS_FILES="./output/$ACRONYM/graph/otus/*.dot"
for f in $EHR_FILES
do
    b=$(basename $f .dot)
	  dot -Tpng $f > "$PNG_OUTPUT/ehr/$b.png"
	  rm $f
done
for f in $OTUS_FILES
do
    b=$(basename $f .dot)
	  dot -Tpng $f > "$PNG_OUTPUT/otus/$b.png"
	  rm $f
done