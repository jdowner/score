var score = {
  notation: {
    note_1: '1n',
    note_2: '2n',
    note_4: '4n',
    note_8: '8n',
    note_16: '16n',
    note_32: '32n',
    rest_1: '1r',
    rest_2: '2r',
    rest_4: '4r',
    rest_8: '8r',
    rest_16: '16r',
    rest_32: '32r',
    beam_begin: '(',
    beam_end: ')',
    bar: '|',

    symbols: {
      '1n': true,
      '2n': true,
      '4n': true,
      '8n': true,
      '16n': true,
      '32n': true,
      '1r': true,
      '2r': true,
      '4r': true,
      '8r': true,
      '16r': true,
      '32r': true,
      '(': true,
      ')': true,
      '|': true,
    },

    notes: {
      '1n': true,
      '2n': true,
      '4n': true,
      '8n': true,
      '16n': true,
      '32n': true,
      '1r': true,
      '2r': true,
      '4r': true,
      '8r': true,
      '16r': true,
      '32r': true,
    },

    is_symbol: function(sym){
      return score.notation.symbols.hasOwnProperty(sym);
    },

    is_note: function(sym){
      return score.notation.notes.hasOwnProperty(sym);
    }
  },

  is_valid_score: function(notes){
    // add padding
    notes = notes.replace(/\|/g, ' | ');
    notes = notes.replace(/\(/g, ' ( ');
    notes = notes.replace(/\)/g, ' ) ');
    notes = notes.replace(/ [ ]+/g, ' ');

    // now split
    notes = notes.split(' ');

    // check that each symbol is recognized
    for(var i = 0; i < notes.length; i++){
      if(!score.notation.is_symbol(notes[i])){
        return false;
      }
    }

    // check that the number of parentheses match
    var count = 0;
    for(var i = 0; i < notes.length; i++){
      if(notes[i] == score.notation.beam_begin){
        count++;
      } else if (notes[i] == score.notation.beam_end){
        count--
      }

      // beams should not extend across measures
      if((notes[i] == score.notation.bar) && (count != 0)){
        return false;
      }
    }

    // the final bar is implicit to we need to check the count explicitly
    if(count != 0){
      return false;
    }

    return true;
  },
}
