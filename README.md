Score
=====

A simple javascript renderer for creating drum tabulature.


Introduction
--------------------------------------------------

Score is an SVG renderer for creating drum tabulature using the VexFlow library.
The goal of Score is to provide a simple way of specifying single-note scores
for the purpose of practicing timing and improving a musicians inner clock.

Score has a rudimentary language for specifying notes. An example of how a
measure is written helps illustrate the language,

```
<html>
  <body>
    <svg id="score" />
  </body>
  <script src="score.js"></script>
  <script>
    var score = new Score('score', '4 4 4 4 | (8 8) 8 4 8r 4')
  </script>
</html>
```

This example shows a piece that contains 2 measures. The first measure is a set
of 4 quarter notes. The vertical bar is the separator between the measures.  If
the values in the measures are read as the denominators of a series of
fractions, each measure should sum to 1; so in the first measure the 4 quarter
notes sum to 1. In the second measure there are 4 eighth notes and 2 quarter
notes. The brackets around the first 2 eighth notes are used to group the notes
together and this will be rendered as a bar across the notes. All notes can
either be normal notes or rest notes. The final eighth note in the second
measure has an 'r' following it, which is used to indicate that it is a rest
note.

In short, the language consists of a number representing the duration of the
notes, and symbols for specifying rests ('r'), groups ('()'), and bars ('|').

