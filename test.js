var animate, blah, camera, click2D, colorValues, color_gui, container, copy, copyObj, cube, cubeGeo, currentHeight, currentObj, cut, dEnd, dStart, deselect, drawColor, getPosition, i, inCanvas, init, intersector, isCtrlDown, isMouseDown, isShiftDown, lineMat, load, loadObject, makeCircle, makeLine, makeRectangle, makeSquare, meshMaterial, mod_gui, modeChoice, mode_gui, modifierValues, mouse3D, mousePos, object_list, onDocumentKeyDown, onDocumentKeyUp, onDocumentMouseDown, onDocumentMouseMove, onDocumentMouseUp, paste, plane, print, projector, ray, render, renderer, rollOverMaterial, rollOverMesh, rollOveredFace, rot, save, sca, scene, setDrawColor, shapeChoice, shapeChoiceIsSet, shape_gui, showPrompt, squarePosition, square_size, startSquarePosX, startSquarePosY, stats, theta, tmpVec, updateCurObjColor, updateCurObjRot, updateCurObjScale;
if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
}
mousePos = projector = camera = ray = scene = renderer = stats = container = plane = cube = mouse3D = rollOveredFace = rollOverMesh = rollOverMaterial = cubeGeo = meshMaterial = i = intersector = '';
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
copyObj = '';
dStart = new THREE.Vector3();
dEnd = new THREE.Vector3();
colorValues = {
  red: 0,
  green: 0,
  blue: 0
};
modifierValues = {
  rotation: 0,
  scale: 1
};
shapeChoice = {
  rectangle: false,
  circle: false,
  line: false,
  point: false
};
modeChoice = {
  create: false,
  select: false
};
currentObj = '';
shapeChoiceIsSet = false;
currentHeight = 0;
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
  container = $('#container')[0];
  aspect_ratio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(0, aspect_ratio * 1000, 1000, 0, -10000, 10000);
  scene = new THREE.Scene();
  projector = new THREE.Projector();
  mousePos = new THREE.Vector3(0, 10000, 0.5);
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
  var dX, dY, position, radius, temp, xScale, yScale;
  event.preventDefault();
  position = getPosition(event);
  mousePos.x = (position.x / window.innerWidth) * 2 - 1;
  mousePos.y = -(position.y / window.innerHeight) * 2 + 1;
  temp = mousePos.clone();
  projector.unprojectVector(temp, camera);
  if (inCanvas(event)) {
    if (isMouseDown && modeChoice.create && shapeChoiceIsSet() && !shapeChoice.line) {
      dX = Math.max(temp.x, dStart.x) - Math.min(temp.x, dStart.x);
      dY = Math.max(temp.y, dStart.y) - Math.min(temp.y, dStart.y);
      if (shapeChoice.rectangle) {
        xScale = dX / 5.0;
        yScale = dY / 5.0;
      } else if (shapeChoice.circle) {
        radius = Math.sqrt(dX * dX + dY * dY);
        xScale = yScale = radius / 14;
      }
      currentObj.scale.set(xScale, yScale, .000001);
      currentObj.updateMatrix();
    }
    if (isMouseDown && modeChoice.select) {
      currentObj.position.x = temp.x;
      currentObj.position.y = temp.y;
      return currentObj.updateMatrix();
    }
  }
};
onDocumentMouseDown = function(event) {
  var intersects, obj, pX, pY, position, temp, tempTopObj, _i, _len;
  event.preventDefault();
  isMouseDown = true;
  position = getPosition(event);
  mousePos.x = (position.x / window.innerWidth) * 2 - 1;
  mousePos.y = -(position.y / window.innerHeight) * 2 + 1;
  mousePos.z = 1;
  temp = mousePos.clone();
  projector.unprojectVector(temp, camera);
  dStart.x = temp.x;
  dStart.y = temp.y;
  dStart.z = 0;
  if (inCanvas(event)) {
    if (modeChoice.select) {
      ray = projector.pickingRay(mousePos.clone(), camera);
      tempTopObj = null;
      intersects = ray.intersectScene(scene);
      for (_i = 0, _len = intersects.length; _i < _len; _i++) {
        obj = intersects[_i];
        if (tempTopObj === null) {
          tempTopObj = obj.object;
        }
        if (obj.object.position.z > tempTopObj.position.z) {
          tempTopObj = obj.object;
        }
      }
      currentObj = tempTopObj;
      currentObj.position.z = currentHeight;
      currentHeight += 1;
    }
    if (modeChoice.create) {
      if (shapeChoice.rectangle) {
        pX = dStart.x;
        pY = dStart.y;
        return makeRectangle(10, 10, pX, pY, drawColor);
      } else if (shapeChoice.circle) {
        return makeCircle(10, 10, dStart.x, dStart.y, drawColor);
      } else if (shapeChoice.point) {
        return makeCircle(5, 5, dStart.x, dStart.y, drawColor);
      }
    }
  }
};
onDocumentMouseUp = function(event) {
  var dX, dY, position;
  event.preventDefault();
  isMouseDown = false;
  if (inCanvas(event)) {
    setDrawColor();
    position = getPosition(event);
    mousePos.x = (position.x / window.innerWidth) * 2 - 1;
    mousePos.y = -(position.y / window.innerHeight) * 2 + 1;
    mousePos.z = 1;
    dEnd = mousePos.clone();
    dEnd = projector.unprojectVector(dEnd, camera);
    dX = Math.max(dEnd.x, dStart.x) - Math.min(dEnd.x, dStart.x);
    dY = Math.max(dEnd.y, dStart.y) - Math.min(dEnd.y, dStart.y);
    if (modeChoice.create) {
      if (shapeChoice.line) {
        return makeLine(dStart.x, dStart.y, dEnd.x, dEnd.y, drawColor);
      }
    }
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
    case "X".charCodeAt(0):
      return cut();
    case "C".charCodeAt(0):
      return copy();
    case "V".charCodeAt(0):
      return paste();
  }
};
onDocumentKeyUp = function(event) {};
cut = function() {
  copyObj = new THREE.Mesh(currentObj.geometry, currentObj.materials[0]);
  copyObj.position.set(currentObj.position.x, currentObj.position.y, currentHeight);
  copyObj.scale = currentObj.scale;
  currentHeight += 1;
  copyObj.matrixAutoupdate = false;
  copyObj.updateMatrix();
  return scene.remove(currentObj);
};
copy = function() {
  copyObj = new THREE.Mesh(currentObj.geometry, currentObj.materials[0]);
  copyObj.position.set(currentObj.position.x, currentObj.position.y, currentHeight);
  copyObj.scale = currentObj.scale;
  currentHeight += 1;
  copyObj.matrixAutoupdate = false;
  return copyObj.updateMatrix();
};
paste = function() {
  currentObj = copyObj;
  scene.add(copyObj);
  copyObj = new THREE.Mesh(currentObj.geometry, currentObj.materials[0]);
  copyObj.position.set(currentObj.position.x, currentObj.position.y, currentHeight);
  copyObj.scale = currentObj.scale;
  currentHeight += 1;
  copyObj.matrixAutoupdate = false;
  return copyObj.updateMatrix();
};
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
  square.position.set(pX, pY, currentHeight);
  square.matrixAutoUpdate = false;
  square.updateMatrix();
  scene.add(square);
  object_list[square.id] = ['rectangle', dX, dY, pX, pY, color];
  currentObj = square;
  return currentHeight += 1;
};
makeCircle = function(dX, dY, pX, pY, color) {
  var circle, circleGeo, radius;
  meshMaterial = new THREE.MeshBasicMaterial({
    color: color
  });
  radius = Math.sqrt(dX * dX + dY * dY);
  if (radius > 5) {
    circleGeo = new THREE.SphereGeometry(radius, 20, 20);
    circle = new THREE.Mesh(circleGeo, meshMaterial);
    circle.position.set(pX, pY, currentHeight);
    circle.matrixAutoUpdate = false;
    circle.updateMatrix();
    scene.add(circle);
    object_list[circle.id] = ['circle', dX, dY, pX, pY, color];
    currentObj = circle;
    return currentHeight += 1;
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
  p1 = new THREE.Vector3(sX, sY, currentHeight);
  p2 = new THREE.Vector3(eX, eY, currentHeight);
  lineGeo.vertices.push(new THREE.Vertex(p1));
  lineGeo.vertices.push(new THREE.Vertex(p2));
  line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
  object_list[line.id] = ['line', sX, sY, eX, eY, color];
  currentObj = line;
  return currentHeight += 1;
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
updateCurObjColor = function() {
  setDrawColor();
  if (modeChoice.select) {
    return currentObj.materials[0].color.setHex(drawColor);
  }
};
updateCurObjRot = function() {
  if (modeChoice.select && currentObj) {
    currentObj.rotation.z = modifierValues.rotation;
    return currentObj.updateMatrix();
  }
};
updateCurObjScale = function() {
  var temp_scale;
  if (modeChoice.select && currentObj) {
    temp_scale = currentObj.scale.x;
    temp_scale = temp_scale * modifierValues.scale;
    currentObj.scale.x = temp_scale;
    currentObj.scale.y = temp_scale;
    currentObj.updateMatrix();
    return console.log('test');
  }
};
shapeChoiceIsSet = function() {
  return shapeChoice.circle || shapeChoice.line || shapeChoice.rectangle || shapeChoice.point;
};
mod_gui = new DAT.GUI({
  height: 2 * 32 - 1
});
mod_gui.name("Modifier Control");
mod_gui.add(modifierValues, "scale").min(0.25).max(4.0).step(0.25).onFinishChange(sca = function() {
  return updateCurObjScale();
});
mod_gui.add(modifierValues, "rotation").min(0).max(365).step(1).onFinishChange(rot = function() {
  return updateCurObjRot();
});
color_gui = new DAT.GUI({
  height: 3 * 32 - 1
});
color_gui.name("Color Control");
color_gui.add(colorValues, 'red').min(0).max(255).step(1).onFinishChange(blah = function() {
  return updateCurObjColor();
});
color_gui.add(colorValues, 'green').min(0).max(255).step(1).onFinishChange(blah = function() {
  return updateCurObjColor();
});
color_gui.add(colorValues, 'blue').min(0).max(255).step(1).onFinishChange(blah = function() {
  return updateCurObjColor();
});
shape_gui = new DAT.GUI({
  height: 4 * 32 - 1
});
shape_gui.name("Shape Selector");
shape_gui.add(shapeChoice, "rectangle").listen().onChange(deselect = function() {
  if (shapeChoice.rectangle) {
    shapeChoice.circle = false;
    shapeChoice.line = false;
    return shapeChoice.point = false;
  }
});
shape_gui.add(shapeChoice, "circle").listen().onChange(deselect = function() {
  if (shapeChoice.circle) {
    shapeChoice.rectangle = false;
    shapeChoice.line = false;
    return shapeChoice.point = false;
  }
});
shape_gui.add(shapeChoice, "line").listen().onChange(deselect = function() {
  if (shapeChoice.line) {
    shapeChoice.rectangle = false;
    shapeChoice.circle = false;
    return shapeChoice.point = false;
  }
});
shape_gui.add(shapeChoice, "point").listen().onChange(deselect = function() {
  if (shapeChoice.line) {
    shapeChoice.rectangle = false;
    shapeChoice.circle = false;
    return shapeChoice.line = false;
  }
});
mode_gui = new DAT.GUI({
  height: 2 * 32 - 1
});
mode_gui.name("Mode Selector");
mode_gui.add(modeChoice, "create").listen().onChange(deselect = function() {
  if (modeChoice.create) {
    return modeChoice.select = false;
  }
});
mode_gui.add(modeChoice, "select").listen().onChange(deselect = function() {
  if (modeChoice.select) {
    return modeChoice.create = false;
  }
});
inCanvas = function(e) {
  var targ;
  targ = void 0;
  if (!e) {
    e = window.event;
  }
  if (e.target) {
    targ = e.target;
  } else {
    if (e.srcElement) {
      targ = e.srcElement;
    }
  }
  return targ === $('canvas')[0];
};
getPosition = function(e) {
  var targ, x, y;
  targ = void 0;
  if (!e) {
    e = window.event;
  }
  if (e.target) {
    targ = e.target;
  } else {
    targ = e.srcElement(e.srcElement ? targ.nodeType === 3 ? targ = targ.parentNode : void 0 : void 0);
  }
  x = e.pageX - $(targ).offset().left;
  y = e.pageY - $(targ).offset().top;
  return {
    x: x,
    y: y
  };
};
init();
animate();
setDrawColor();