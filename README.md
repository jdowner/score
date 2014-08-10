Score
=====

A simple javascript renderer for creating music notation for drums.


Introduction
--------------------------------------------------

Score is an SVG renderer for creating notation for drums using the VexFlow and
Raphael libraries. The goal of Score is to provide a simple way of specifying
single-note scores for the purpose of practicing timing and improving a
musicians inner clock.

Score has a rudimentary language for specifying notes. An example of how a
measure is written helps illustrate the language,

```
<html>
  <body>
    <div id="score" />
  </body>
  <script src="score.js"></script>
  <script>
    var container = document.getElementById('score')
    var score = new Score(container, '4n 4n 4n 4n | (8n 8n) 8n 4n 8r 4n')
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

In short, the language consists of

* notes <x>n, where x is 4, 8, or 16
* rests <x>r, where x is 4, 8, or 16
* beams (...), parentheses containing notes
* bars |, used to separate measures
