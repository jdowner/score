/**
 * Appends the objects necessary for a new class to extend a base class.
 */
Function.prototype.extends = function(base){
  if(base.constructor == Function){
    // normal inheritance
    this.prototype = Object.create(base.prototype);
    this.prototype.constructor = this;
    this.prototype.base = base.prototype;
  }
  else {
    // virtual inheritance
    this.prototype = Object.create(base.prototype);
    this.prototype.constructor = this;
    this.prototype.base = base;
  }
  return this;
}

var svg = {
  ns: "http://www.w3.org/2000/svg",
}

/*******************************************************************************
 * A node is the root base class for all classes in the svg namespace. It
 * provides methods for working with attributes and children.
 */
svg.node = function(){
  this.root = null;
  this.element = null;
}

/**
 * This function sets the value of an attribute on an element.
 *
 * @param key   - the name of the attribute
 * @param value - the value the attribute should be set to
 *
 * @return a reference to this object
 */
svg.node.prototype.attr = function(key, value){
  this.element.setAttributeNS(null, key, value);
  return this;
}

/**
 * This function sets the values of one or more attributes on an element.
 *
 * @param attrs - an object literal containg the attributes to modify
 *
 * @return a reference to this object
 */
svg.node.prototype.attrs = function(attrs){
  for(var key in attrs){
    this.element.setAttributeNS(null, key, attrs[key]);
  }
  return this;
}

/**
 * Returns the value of the specified attribute.
 *
 * @param key - the name of the attribute to return.
 *
 * @return the value of the attribute
 */
svg.node.prototype.get = function(key){
  return this.element.getAttributeNS(null, key);
}

/**
 * Adds an SVG as a child of this element.
 *
 * @param child - the element to add.
 *
 * @return a reference to this object
 */
svg.node.prototype.add = function(child){
  this.element.appendChild(child.element);
  return this;
}

/**
 * Returns a list of the children contained in this SVG element.
 *
 * @return a NodeList of children.
 */
svg.node.prototype.children = function(){
  return this.element.childNodes;
}

/*******************************************************************************
 * The element class defines an interface that is common to all of the SVG
 * classes.
 */
svg.element = function(){
  this.root = null;
  this.element = null;
}

svg.element.extends(svg.node);

/**
 * Translates this element.
 *
 * @param dx - the amount to move in the x co-ordinate
 * @param dy - the amount to move in the y co-ordinate
 */
svg.element.prototype.translate = function(dx, dy){
  var transform = this.root.translate(dx, dy);
  this.element.transform.baseVal.insertItemBefore(transform, 0);
}

/**
 * Rotate this element about a point.
 *
 * @param angle - the amount to rotate the element by (degrees)
 * @param x     - the x co-ordinate to rotate about
 * @param y     - the y co-ordinate to rotate about
 */
svg.element.prototype.rotate = function(angle, x, y){
  var transform = this.root.rotation(angle, x, y);
  this.element.transform.baseVal.insertItemBefore(transform, 0);
}

/**
 * Scale this element.
 *
 * @param factor - the scaling factor
 */
svg.element.prototype.scale = function(factor){
  var transform = this.root.scale(factor);
  this.element.transform.baseVal.insertItemBefore(transform,0);
}

/*******************************************************************************
 * This class is used to wrap an existing SVG element, rather than creating
 * one.
 */
svg.proxy = function(element){
  this.root = new svg.root(element.ownerSVGElement);
  this.element = element;
}

svg.proxy.extends(svg.node);

/*******************************************************************************
 * This class is specifically for elements that represent root nodes. It
 * exposes functionality that can only be obtained from the root note. In
 * particular, it is necessary to provide consist access to transformation
 * objects.
 */
svg.root = function(element){
  if(!(element instanceof SVGSVGElement))
    throw "A root element must be of type SVGSVGElement";

  this.element = element;
}

svg.root.extends(svg.proxy);

/**
 * Create an SVGTransform object. This is intended for use (internally) by the
 * other SVG elements (path, rect, or group).
 */
svg.root.prototype.transform = function(){
  return this.element.createSVGTransform();
}

/**
 * Create a translation transform.
 *
 * @param dx - the amount to move in the x co-ordinate
 * @param dy - the amount to move in the y co-ordinate
 *
 * @return a translation transform
 */
svg.root.prototype.translate = function(dx, dy){
  var transform = this.transform();
  transform.setTranslate(dx, dy);
  return transform;
}

/**
 * Create a rotation transform.
 *
 * @param angle - the amount to rotate the element by (degrees)
 * @param x     - the x co-ordinate to rotate about
 * @param y     - the y co-ordinate to rotate about
 *
 * @return a rotation transform
 */
svg.root.prototype.rotation = function(angle, x, y){
  var transform = this.transform();
  transform.setRotate(angle, x, y);
  return transform;
}

/**
 * Create a scale transform.
 *
 * @param factor - the scaling factor
 *
 * @return a scale transform
 */
svg.root.prototype.scale = function(factor){
  var transform = this.transform();
  transform.setScale(factor, factor);
  return transform;
}

/*******************************************************************************
 * This class provides the interface to the 'group' element. The group element
 * is a composite of other elements (even other group elements). It is useful
 * for applying a transformation to a set of related elements.
 */
svg.group = function(root){
  if(root instanceof SVGSVGElement)
    this.root = new svg.root(root);
  else
    this.root = root;
  this.element = document.createElementNS(svg.ns, "g");
}

svg.group.extends(svg.element);

/*******************************************************************************
 * This class provides the interface to the 'rect' element.
 */
svg.rect = function(root, x, y, w, h){
  this.root = root;
  this.element = document.createElementNS(svg.ns, "rect");
  this.attrs({x: x, y: y, width: w, height: h});
}

svg.rect.extends(svg.element);

/*******************************************************************************
 * This class provides the interface to the 'path' element.
 */
svg.path = function(root, path){
  this.root = root;
  this.element = document.createElementNS(svg.ns, "path");
  this.attr('d', path || '');
}

svg.path.extends(svg.element);

/**
 * Appends a move instruction to the path.
 *
 * @param x - the x absolute position to move to
 * @param y - the y absolute position to move to
 */
svg.path.prototype.move_to = function(x, y){
  this.attr('d', this.get('d') + ' M ' + x.toString() + ' ' + y.toString());
}

/**
 * Append a line instruction to the path.
 *
 * @param x - the x absolute position to draw to
 * @param y - the y absolute position to draw to
 */
svg.path.prototype.line_to = function(x, y){
  this.attr('d', this.get('d') + ' L ' + x.toString() + ' ' + y.toString());
}
