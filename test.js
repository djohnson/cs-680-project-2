var animate, camera, click2D, colorValues, color_gui, container, cube, cubeGeo, currentObj, dEnd, dStart, deselect, drawColor, i, init, intersector, isCtrlDown, isMouseDown, isShiftDown, lineMat, load, loadObject, makeCircle, makeLine, makeRectangle, makeSquare, meshMaterial, mouse2D, mouse3D, object_list, onDocumentKeyDown, onDocumentKeyUp, onDocumentMouseDown, onDocumentMouseMove, onDocumentMouseUp, plane, print, projector, ray, render, renderer, rollOverMaterial, rollOverMesh, rollOveredFace, save, scene, setDrawColor, shapeChoice, shapeChoiceIsSet, shape_gui, showPrompt, squarePosition, square_size, startSquarePosX, startSquarePosY, stats, theta, tmpVec;
if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
}
mouse2D = projector = camera = ray = scene = renderer = stats = container = plane = cube = mouse3D = rollOveredFace = rollOverMesh = rollOverMaterial = cubeGeo = meshMaterial = i = intersector = '';
object_list = [];
isMouseDown = false;
square_size = 2;
isShiftDown = false;
theta = 45;
isCtrlDown = false;
squarePosition = new THREE.Vector3();
tmpVec = new THREE.Vector3();
drawColor = "0x000000";
makeSquare = false;
startSquarePosX = '';
startSquarePosY = '';
click2D = '';
dStart = new THREE.Vector3();
dEnd = new THREE.Vector3();
colorValues = {
  red: 0,
  green: 0,
  blue: 0
};
shapeChoice = {
  rectangle: false,
  circle: false,
  line: false
};
currentObj = '';
shapeChoiceIsSet = false;
meshMaterial = new THREE.MeshBasicMaterial({
  color: drawColor,
  wireframe: false
});
lineMat = new THREE.LineBasicMaterial({
  color: drawColor,
  opacity: 0.8,
  linewidth: 1
});
init = function() {
  var aspect_ratio;
  container = document.createElement("div");
  document.body.appendChild(container);
  aspect_ratio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthoCamera(0, aspect_ratio * 1000, 1000, 0, 10000, -10000);
  camera.position.set(0, 0, 10000);
  camera.target.position.set(0, 0, 0);
  scene = new THREE.Scene();
  projector = new THREE.Projector();
  mouse2D = new THREE.Vector3(0, 10000, 0.5);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("mousedown", onDocumentMouseDown, false);
  document.addEventListener("mouseup", onDocumentMouseUp, false);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  return document.addEventListener("keyup", onDocumentKeyUp, false);
};
onDocumentMouseMove = function(event) {
  var dX, dY, radius, temp, xScale, yScale;
  event.preventDefault();
  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;
  temp = mouse2D.clone();
  projector.unprojectVector(temp, camera);
  if (isMouseDown && shapeChoiceIsSet() && !shapeChoice.line) {
    dX = Math.max(temp.x, dStart.x) - Math.min(temp.x, dStart.x);
    dY = Math.max(temp.y, dStart.y) - Math.min(temp.y, dStart.y);
    if (shapeChoice.rectangle) {
      xScale = dX / 5.0;
      yScale = dY / 5.0;
    } else if (shapeChoice.circle) {
      radius = Math.sqrt(dX * dX + dY * dY);
      xScale = yScale = radius / 14;
    }
    currentObj.scale.set(xScale, yScale, 1);
    return currentObj.updateMatrix();
  }
};
onDocumentMouseDown = function(event) {
  var pX, pY, temp;
  event.preventDefault();
  isMouseDown = true;
  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouse2D.z = 1;
  temp = mouse2D.clone();
  projector.unprojectVector(temp, camera);
  dStart.x = temp.x;
  dStart.y = temp.y;
  dStart.z = 0;
  if (shapeChoice.rectangle) {
    pX = dStart.x;
    pY = dStart.y;
    return makeRectangle(10, 10, pX, pY, drawColor);
  } else if (shapeChoice.circle) {
    return makeCircle(10, 10, dStart.x, dStart.y, drawColor);
  }
};
onDocumentMouseUp = function(event) {
  var dX, dY;
  event.preventDefault();
  isMouseDown = false;
  setDrawColor();
  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouse2D.z = 1;
  dEnd = mouse2D.clone();
  dEnd = projector.unprojectVector(dEnd, camera);
  dX = Math.max(dEnd.x, dStart.x) - Math.min(dEnd.x, dStart.x);
  dY = Math.max(dEnd.y, dStart.y) - Math.min(dEnd.y, dStart.y);
  if (shapeChoice.line) {
    return makeLine(dStart.x, dStart.y, dEnd.x, dEnd.y, drawColor);
  }
};
onDocumentKeyDown = function(event) {
  switch (event.keyCode) {
    case "P".charCodeAt(0):
      return print();
    case "L".charCodeAt(0):
      return load();
    case "S".charCodeAt(0):
      return save();
  }
};
onDocumentKeyUp = function(event) {};
print = function() {
  return window.open(renderer.domElement.toDataURL("image/png"), "SketchPad IMG");
};
save = function() {
  var name;
  name = showPrompt();
  if (name === null) {
    return alert("invalid file name");
  } else {
    return $.cookie(name, JSON.stringify(object_list), {
      expires: 7
    });
  }
};
load = function() {
  var e, name, tempObjArray, _i, _len, _results;
  name = showPrompt();
  if (name === null || $.cookie(name) === null) {
    return alert("invalid file name");
  } else {
    tempObjArray = JSON.parse($.cookie(name));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    object_list = [];
    _results = [];
    for (_i = 0, _len = tempObjArray.length; _i < _len; _i++) {
      e = tempObjArray[_i];
      _results.push(loadObject(e));
    }
    return _results;
  }
};
loadObject = function(object) {
  if (object === null || object === void 0) {} else {
    switch (object[0]) {
      case 'rectangle':
        return makeRectangle(object[1], object[2], object[3], object[4], object[5]);
      case 'circle':
        return makeCircle(object[1], object[2], object[3], object[4], object[5]);
      case 'line':
        return makeLine(object[1], object[2], object[3], object[4], object[5]);
    }
  }
};
makeRectangle = function(dX, dY, pX, pY, color) {
  var newSquareGeo, square;
  meshMaterial = new THREE.MeshBasicMaterial({
    color: color
  });
  newSquareGeo = new THREE.CubeGeometry(dX, dY, 1);
  square = new THREE.Mesh(newSquareGeo, meshMaterial);
  square.position.set(pX, pY, 0);
  square.matrixAutoUpdate = false;
  square.updateMatrix();
  scene.addObject(square);
  object_list[square.id] = ['rectangle', dX, dY, pX, pY, color];
  return currentObj = square;
};
makeCircle = function(dX, dY, pX, pY, color) {
  var circle, circleGeo, radius;
  meshMaterial = new THREE.MeshBasicMaterial({
    color: color
  });
  radius = Math.sqrt(dX * dX + dY * dY);
  if (radius > 10) {
    circleGeo = new THREE.SphereGeometry(radius, 20, 20);
    circle = new THREE.Mesh(circleGeo, meshMaterial);
    circle.position.set(pX, pY, 0);
    circle.matrixAutoUpdate = false;
    circle.updateMatrix();
    scene.addObject(circle);
    object_list[circle.id] = ['circle', dX, dY, pX, pY, color];
    return currentObj = circle;
  }
};
makeLine = function(sX, sY, eX, eY, color) {
  var line, lineGeo, p1, p2;
  lineMat = new THREE.LineBasicMaterial({
    color: color,
    opacity: 1.0,
    linewidth: 2
  });
  lineGeo = new THREE.Geometry(0);
  p1 = new THREE.Vector3(sX, sY, 0);
  p2 = new THREE.Vector3(eX, eY, 0);
  lineGeo.vertices.push(new THREE.Vertex(p1));
  lineGeo.vertices.push(new THREE.Vertex(p2));
  line = new THREE.Line(lineGeo, lineMat);
  scene.addObject(line);
  object_list[line.id] = ['line', sX, sY, eX, eY, color];
  return currentObj = line;
};
showPrompt = function() {
  var name;
  name = prompt("Please enter the file name to save/load");
  if (name !== null && name !== "") {
    return name;
  } else {
    return null;
  }
};
animate = function() {
  requestAnimationFrame(animate);
  return render();
};
render = function() {
  return renderer.render(scene, camera);
};
setDrawColor = function() {
  var b, g, r;
  drawColor = "0x";
  r = colorValues.red.toString(16);
  if (r.length < 2) {
    r = '0' + r;
  }
  g = colorValues.green.toString(16);
  if (g.length < 2) {
    g = '0' + g;
  }
  b = colorValues.blue.toString(16);
  if (b.length < 2) {
    b = '0' + b;
  }
  drawColor += r;
  drawColor += g;
  return drawColor += b;
};
shapeChoiceIsSet = function() {
  return shapeChoice.circle || shapeChoice.line || shapeChoice.rectangle;
};
color_gui = new DAT.GUI({
  height: 3 * 32 - 1
});
color_gui.name("Color Control");
color_gui.add(colorValues, 'red').min(0).max(255).step(1);
color_gui.add(colorValues, 'green').min(0).max(255).step(1);
color_gui.add(colorValues, 'blue').min(0).max(255).step(1);
shape_gui = new DAT.GUI({
  height: 3 * 32 - 1
});
shape_gui.name("Shape Selector");
shape_gui.add(shapeChoice, "rectangle").listen().onChange(deselect = function() {
  if (shapeChoice.rectangle) {
    shapeChoice.circle = false;
    return shapeChoice.line = false;
  }
});
shape_gui.add(shapeChoice, "circle").listen().onChange(deselect = function() {
  if (shapeChoice.circle) {
    shapeChoice.rectangle = false;
    return shapeChoice.line = false;
  }
});
shape_gui.add(shapeChoice, "line").listen().onChange(deselect = function() {
  if (shapeChoice.line) {
    shapeChoice.rectangle = false;
    return shapeChoice.circle = false;
  }
});
init();
animate();
setDrawColor();