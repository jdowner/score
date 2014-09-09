function read_property(obj, name, getfunc){
  Object.defineProperty(obj, name, {
    get: getfunc,
    configurable: false
  });
}

/**
 * The function creates a 'canvas' object.
 *
 * The canvas object is a representation of the <svg> element. It is intended to
 * expose a read only interface of the important properties on the SVG element.
 *
 * @param root_id - the ID of the <svg> that the canvas represents.
 *
 */
function canvas(root_id){
  var self = this;

  self._root = new svg.root(document.getElementById(root_id));
  self._vmargin = 40;
  self._hmargin = 100;
  self._vscale = 16;
  self._hscale = 16 + 2;
  self._nslices = 16;
  self._nslices_long = self._nslices + 4;
  self._vlinesep = 32 + 5 * self._vscale;
  self.measures = [];
  self.current_note_selection = "#def-4-note";

  read_property(self, 'height', function(){
    return self._root.height.baseVal.value;
  });

  read_property(self, 'width', function(){
    return self._root.width.baseVal.value;
  });

  read_property(self, 'root', function(){
    return self._root;
  });

  // initialize the definitions
  var defs = new svg.definition(self._root);
  var scale = self._vscale / score.raw.vb.bbox.h;

  var add_glyph = function(name, glyph){
    var head = new svg.path(self._root, glyph.path);
    var group = new svg.group(self._root);
    group.attrs({id: name});
    if(glyph.hasOwnProperty('types')){
      group.attrs({"class": glyph.types});
    }
    group.add(head);
    group.scale(scale);
    defs.add(group);
  }

  // Define a function for generating measures. The reason for generating the
  // measures is that the spacing, and thus the proportions, change dynamically.
  var make_measure_def = function(name, num){
    var width = num * self._hscale;
    var height = 4 * self._vscale;

    // Create a new path
    var path = new svg.path(self._root);

    // Create the outside box
    path.move_to(0, 0);
    path.line_to(width, 0);
    path.line_to(width, height);
    path.line_to(0, height);
    path.close();

    // Create the lines within
    for(var i = 1; i <= 3; i++){
      path.move_to(0, i * self._vscale);
      path.line_to(width, i * self._vscale);
    }

    // Put the measure within a group and add it to the definitions
    var group = new svg.group(self._root);
    group.attrs({id: name, "class": "score-measure"});
    group.add(path);
    defs.add(group);
  }

  var make_overlay_def = function(name, num){
    var height = 4 * self._vscale;

    // Create a new path
    var path = new svg.path(self._root);

    // Create a vertical line through each of the virtual grid points
    for(var i = 0; i < num; i++){
      path.move_to(i * self._hscale, 0);
      path.line_to(i * self._hscale, height);
    }

    // Put the measure within a group and add it to the definitions
    var group = new svg.group(self._root);
    group.attrs({id: name, "class": "score-overlay"});
    group.add(path);
    defs.add(group);
  }

  var make_quarter_note_rest_def = function(){
    var note = new svg.path(self._root, score.raw.v7c.path);
    note.translate(-score.raw.v7c.bbox.x, 0);
    var group = new svg.group(self._root);
    group.attrs({id: "def-4-rest", "class": "score-note"});
    group.add(note);
    group.scale(scale);
    defs.add(group);
  }

  var make_eighth_note_rest_def = function(){
    var note = new svg.path(self._root, score.raw.va5.path);
    note.translate(-score.raw.va5.bbox.x, 0);
    var group = new svg.group(self._root);
    group.attrs({id: "def-8-rest", "class": "score-note"});
    group.add(note);
    group.scale(scale);
    defs.add(group);
  }

  var make_quarter_note_def = function(){
    var head = new svg.path(self._root, score.raw.vb.path);
    var stem = new svg.path(self._root, score.raw.stem.path);
    var group = new svg.group(self._root);
    group.attrs({id: "def-4-note", "class": "score-note"});
    group.add(head);
    group.add(stem);
    group.scale(scale);
    defs.add(group);
  }

  var make_eighth_note_def = function(){
    var flag = new svg.group(self._root);
    {
      // The stem path has to be translated so that it is at the top of the 8th
      // notes stem.
      var path = new svg.path(self._root, score.raw.v54.path);
      path.translate(score.raw.vb.bbox.w, -score.raw.stem.bbox.h);
      flag.add(path);
    }
    var head = new svg.path(self._root, score.raw.vb.path);
    var stem = new svg.path(self._root, score.raw.stem.path);
    var group = new svg.group(self._root);
    group.attrs({id: "def-8-note", "class": "score-note"});
    group.add(flag);
    group.add(head);
    group.add(stem);
    group.scale(scale);
    defs.add(group);
  }

  var make_rounded_rect_def = function(){
    var rect = new svg.rect(self._root, 0, 0, 36, 50);
    rect.attrs({rx: 6, ry: 6});
    var group = new svg.group(self._root, 0, 0, 50, 50);
    group.attrs({id: "def-rounded-rect", "class": "score-button"});
    group.add(rect);
    defs.add(group);
  };

  // Add glyphs to the definitions
  add_glyph("def-head", score.raw.vb);
  add_glyph("def-clef", score.raw.v59);
  add_glyph("def-8th-flag", score.raw.v54);
  add_glyph("def-8th-flag-invert", score.raw.v9a);
  add_glyph("def-4", score.raw.v4);

  // Add generated measures to the definitions
  make_measure_def("def-measure", self._nslices);
  make_measure_def("def-long-measure", self._nslices_long);

  make_overlay_def("def-overlay", self._nslices);
  make_overlay_def("def-long-overlay", self._nslices_long);

  // Create defintions for glyphs
  make_quarter_note_def();
  make_quarter_note_rest_def();
  make_eighth_note_def();
  make_eighth_note_rest_def();

  make_rounded_rect_def();

  var add_note_from_click = function(x, y){
    // Get the current screen transformation
    var trans = self.root.element.createSVGTransform();
    trans.setMatrix(self.root.element.getScreenCTM().inverse());

    // Create a new note at the specified point
    var note = defs.create(self.current_note_selection, x, y);
    note.element.transform.baseVal.appendItem(trans);
    note.element.transform.baseVal.consolidate();

    return note;
  };

  var add_note_to_long_measure = function(measure, x, y){
    var note = add_note_from_click(x, y);

    // If he clicked point is in the area containing the clef and time
    // signature, it is ignored.
    var nx = parseInt(note.get("x"));
    if(nx < self._hmargin + (2 + self._nslices_long - self._nslices) * self._hscale){
      return;
    }

    // Find the grid point closest to the mouse click
    var r = 0.5 * self._hscale + self._hmargin;
    var rx = self._hscale * Math.floor((nx - r) / self._hscale) + r;
    var ry = parseInt(measure.get("y"))+ 2.5 * self._vscale;
    note.attrs({x: rx, y: ry});

    note.element.onclick = function(){
      self.root.element.removeChild(note.element);
    }

    self.root.add(note);
  };

  var add_note_to_measure = function(measure, x, y){
    var note = add_note_from_click(x, y);

    // Find the grid point closest to the mouse click
    var nx = parseInt(note.get("x"));
    var r = 0.5 * self._hscale + self._hmargin;
    var rx = self._hscale * Math.floor((nx - r) / self._hscale) + r;
    var ry = parseInt(measure.get("y"))+ 2.5 * self._vscale;
    note.attrs({x: rx, y: ry});

    note.element.onclick = function(){
      self.root.element.removeChild(note.element);
    }

    self.root.add(note);
  };

  this.draw = function(){
    var u = self._nslices_long * self._hscale;
    var v = self._nslices * self._hscale;
    var w = parseFloat(self.root.get('width'), 10);
    var nlines = 1 + Math.floor((w - u) / v);

    var draw_long_measure = function(x, y){
      var measure = defs.create("#def-long-measure", x, y);
      self.root.add(measure);
      self.root.add(defs.create("#def-clef", x + self._hscale, y + 2 * self._vscale));
      self.root.add(defs.create("#def-4", x + 3 * self._hscale, y + 2 * self._vscale));
      self.root.add(defs.create("#def-4", x + 3 * self._hscale, y + 4 * self._vscale));
      self.root.add(defs.create("#def-long-overlay", x, y));

      measure.onclick = function(e){
        add_note_to_long_measure(measure, e.clientX, e.clientY);
      };
    }

    var draw_measure = function(x, y){
      var measure = defs.create("#def-measure", x, y);
      self.root.add(measure);
      self.root.add(defs.create("#def-overlay", x, y));

      measure.onclick = function(e){
        add_note_to_measure(measure, e.clientX, e.clientY);
      }
    }

    var draw_measures = function(){
      for(var k = 0; k < self.measures.length; k++){
        var i = Math.floor(k / nlines);
        var j = k % nlines;
        if(j == 0){
          var x = self._hmargin;
          var y = self._vmargin + i * self._vlinesep;
          draw_long_measure(x, y);
        } else {
          var x = self._hmargin + (j - 1) * v + u;
          var y = self._vmargin + i * self._vlinesep;
          draw_measure(x, y);
        }
      }
    }

    var draw_quarter_note = function(x, y){
      self.root.add(defs.create("#def-4-note", x, y))
    }

    var draw_eighth_note = function(x, y){
      self.root.add(defs.create("#def-8-note", x, y))
    }

    var buttons = [];

    var make_button = function(def, id){
      var button = new svg.group(self.root);
      var rect = defs.create("#def-rounded-rect", 0, 0);
      var note = defs.create(def, 0, 0);
      var block = defs.create("#def-rounded-rect", 0, 0);
      block.add_class("score-transparent");
      block.add_class("score-event-block");
      note.root = self.root;
      note.scale(0.6);
      note.translate(12, 34);
      button.add(rect);
      button.add(note);
      button.add(block);
      button.id = id;
      button.add_class("score-button-overlay");
      button.add_class("score-inactive");

      button.onclick = function(e){
        for(var i = 0; i < buttons.length; i++){
          buttons[i].add_class("score-inactive");
        }
        button.remove_class("score-inactive");
        self.current_note_selection = def;
      }

      buttons.push(button);

      return button
    }

    var draw_quarter_note_button = function(){
      var id = "4-note-button";
      var def = "#def-4-note"
      var button = make_button(def, id)
      button.translate(20, 40);

      self.root.add(button);
    }

    var draw_eighth_note_button = function(){
      var id = "8-note-button";
      var def = "#def-8-note"
      var button = make_button(def, id)
      button.translate(20, 92);

      self.root.add(button);
    }

    var draw_quarter_note_rest_button = function(){
      var id = "4-rest-button";
      var def = "#def-4-rest"
      var button = make_button(def, id)
      button.translate(20, 144);

      self.root.add(button);
    }

    var draw_eighth_note_rest_button = function(){
      var id = "8--rest-button";
      var def = "#def-8-rest"
      var button = make_button(def, id)
      button.translate(20, 196);

      self.root.add(button);
    }

    var draw_buttons = function(){
      draw_quarter_note_button();
      draw_eighth_note_button();
      draw_quarter_note_rest_button();
      draw_eighth_note_rest_button();

      var button = new svg.element();
      button.element = document.getElementById("4-note-button");
      button.remove_class("score-inactive");
      self.current_note_selection = "#def-4-note";
    }

    draw_measures();
    draw_buttons();
  }
}
