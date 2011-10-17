################ Check for WebGL ###############
Detector.addGetWebGLMessage()  unless Detector.webgl

################ Global Variables ##############
mouse2D = projector = camera = ray = scene = renderer = stats = container = plane = cube = mouse3D = rollOveredFace = rollOverMesh = rollOverMaterial = cubeGeo = meshMaterial = i = intersector = ''

object_list = []

isMouseDown = false
square_size = 2
isShiftDown = false
theta = 45
isCtrlDown = false
squarePosition = new THREE.Vector3()
tmpVec = new THREE.Vector3()

drawColor = "0x000000"
makeSquare = false
startSquarePosX = ''
startSquarePosY = ''
click2D = ''

dStart = new THREE.Vector3()
dEnd = new THREE.Vector3()

colorValues =
  red: 0
  green: 0
  blue: 0

shapeChoice =
  rectangle: false
  circle: false
  line: false

currentObj = ''
shapeChoiceIsSet = false

meshMaterial = new THREE.MeshBasicMaterial(
  color: drawColor
  wireframe: false
)

lineMat = new THREE.LineBasicMaterial(
  color: drawColor
  opacity: 0.8
  linewidth: 1
)

############  Functions ######################

# init()
# sets up the window, camera, canvas, and other necessary objects
init = ->
  # create a div and append it to the page body
  container = document.createElement("div")
  document.body.appendChild container

  # I want a orthographic projection because this is a 2d project
  # compute the aspect ratio of the window
  aspect_ratio = window.innerWidth / window.innerHeight
  # create a new camera with an orthographic projection
  # params go (left, right, top, bottom, near, far)
  # the aspect ration * 1000 for right is set the far right coordiante of the canvas correctly in the event of a non square window
  camera = new THREE.OrthoCamera(0, aspect_ratio * 1000, 1000, 0, 10000, -10000)
  # set the camera to somewhere high up on the z axis
  camera.position.set(0, 0, 10000)
  # ensure the camera view projection is centered on the origin (it is by default, but being verbose)
  camera.target.position.set( 0, 0, 0 )

  # create scene object, this will contain all my drawable elements
  scene = new THREE.Scene()


  projector = new THREE.Projector()
  mouse2D = new THREE.Vector3(0, 10000, 0.5)

  # Create the render window and set antialias on and preserveDrawingBuffer to true so that printing will work correctly
  renderer = new THREE.WebGLRenderer(
    antialias: true
    preserveDrawingBuffer: true
  )
  # set the size of the renderer window to a size in pixels
  renderer.setSize window.innerWidth, window.innerHeight

  # add the canvas to the dom
  container.appendChild renderer.domElement

  # add event listener callbacks for keyboard/mouse
  document.addEventListener "mousemove", onDocumentMouseMove, false
  document.addEventListener "mousedown", onDocumentMouseDown, false
  document.addEventListener "mouseup", onDocumentMouseUp, false
  document.addEventListener "keydown", onDocumentKeyDown, false
  document.addEventListener "keyup", onDocumentKeyUp, false

# onDocumentMouseMove(event)
# updates the mouse coordinates and will eventually be used to "rubberband" draw objects
onDocumentMouseMove = (event) ->
  event.preventDefault()
  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse2D.y = -((event.clientY )/ (window.innerHeight )) * 2 + 1

  temp = mouse2D.clone()
  projector.unprojectVector(temp, camera)

  if isMouseDown && shapeChoiceIsSet() && ! shapeChoice.line

    dX = ( Math.max(temp.x, dStart.x) - Math.min(temp.x, dStart.x) )
    dY = ( Math.max(temp.y, dStart.y) - Math.min(temp.y, dStart.y) )

    if shapeChoice.rectangle
      xScale = dX / 5.0
      yScale = dY / 5.0
    else if shapeChoice.circle
      radius = Math.sqrt(dX * dX + dY * dY)
      xScale = yScale = radius / 14

    currentObj.scale.set(xScale, yScale, 1)
    currentObj.updateMatrix()


# onDocumentMouseDown(event)
# find the current location of the click event by unprojecting
# if a shapeChoice has been made then create the base object of small size (scale it as mouse moves while mouse down)
onDocumentMouseDown = (event) ->
  event.preventDefault()
  isMouseDown = true

  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse2D.y = -((event.clientY )/ window.innerHeight) * 2 + 1
  mouse2D.z = 1

  temp = mouse2D.clone()
  projector.unprojectVector( temp, camera)

  dStart.x = temp.x
  dStart.y = temp.y
  dStart.z = 0

  if shapeChoice.rectangle
    pX = dStart.x
    pY = dStart.y
    makeRectangle(10,10,pX,pY, drawColor)
  else if shapeChoice.circle
    makeCircle(10, 10, dStart.x, dStart.y, drawColor)




# onDocumentMouseUp(event)
# find the current location of the click event by unprojecting
# create a shape object depending on the menu selections
onDocumentMouseUp = (event) ->
  event.preventDefault()
  isMouseDown = false

  # set the draw color (value from the color control UI)
  setDrawColor()

  mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse2D.y = -((event.clientY )/ window.innerHeight) * 2 + 1
  mouse2D.z = 1

  dEnd = mouse2D.clone()
  dEnd = projector.unprojectVector( dEnd, camera)

  # find the delta between the initial mouse down and the mouse up positions
  dX = ( Math.max(dEnd.x, dStart.x) - Math.min(dEnd.x, dStart.x) )
  dY = ( Math.max(dEnd.y, dStart.y) - Math.min(dEnd.y, dStart.y) )


  # draw the shape
  # if shapeChoice.rectangle
  #   # calculate the position of the rectangle (position is the center of the object so I have to offset by half the height and width)
  #   pX = dStart.x + .5 * dX
  #   pY = dStart.y - .5 * dY
  #   makeRectangle(dX,dY,pX,pY, drawColor)
  # else if shapeChoice.circle
  #   makeCircle(dX, dY, dStart.x, dStart.y, drawColor)
  # else
  if shapeChoice.line
    makeLine(dStart.x, dStart.y, dEnd.x, dEnd.y, drawColor)

# onDocumentKeyDown(event)
# respond to keypresses
onDocumentKeyDown = (event) ->
  switch event.keyCode
    # "CHARACTER".charCodeAt(0) returns the asci value of the key
    when "P".charCodeAt(0)
      print()
    when "L".charCodeAt(0)
      load()
    when "S".charCodeAt(0)
	    save()

# onDocumentKeyUp(event)
# respond to keyUps
onDocumentKeyUp = (event) ->
  # nothing needed so far

# print()
# create an image file of the current window
print = ->
  # open a new browser window with the current page as a base 64 encoded image object
  window.open renderer.domElement.toDataURL("image/png"), "SketchPad IMG"

# save()
# open a prompt so a user can choose a name to save under
# then save all the objects in the scene to a cookie by JSON encoding the array
# saving to a cookie and not a user file due to design of modern browsers
# basically saving files to to a user machine from a web script is a Bad Thing
# One way this could be accomplished is through AJAX calls to a server everytime the user
# draws something thus saving all the drawn objects server side so that a file could be served
# that would open a save as dialog.  This would require a much more complex server side archetecture
# and quite a bit of work on something that has nothing to do with graphics so I went choose the web standard cookie save
save = ->
  # get the name to save as from the user via prompt
  name = showPrompt()
  if name == null
    alert("invalid file name")
  else
    # encode the object list in JSON and shove it in a cookie that expires in a week
    $.cookie(name, JSON.stringify(object_list), { expires: 7 })

# load()
# reads in the contents of a cookie store, parses the JSOn, and creates objects to draw from the data
load = ->
  # get the name of the file to load from the user
  name = showPrompt()
  if name == null || $.cookie(name) == null
    alert("invalid file name")
  else
    # parse the JSON back into a JS array
    tempObjArray = JSON.parse($.cookie(name))
    # a Load event clears the current screen so remove the container div and recreate it
    container.innerHTML = ''
    container.appendChild renderer.domElement
    # create a new scene so none of the old objects draw on next render
    scene = new THREE.Scene()
    # clear the object list so that if we save and load the old objects are not saved
    object_list = []
    # now draw all the objects from the parsed JSON
    loadObject(e) for e in tempObjArray


# loadObject(object)
# create the shape from the data in the array object
loadObject = (object) ->
  if object == null || object == undefined
    # do nothing
  else
    switch object[0]
      when 'rectangle'
        makeRectangle(object[1], object[2], object[3], object[4], object[5])
      when 'circle'
        makeCircle(object[1], object[2], object[3], object[4], object[5])
      when 'line'
        makeLine(object[1], object[2], object[3], object[4], object[5])

# makeRectangle(deltaX, deltaY, positionX, positionY)
# create a rectangle from width, height, and center point
makeRectangle = (dX, dY, pX, pY, color ) ->
  # specify the materials (shader/color/etc) needed for the object to be drawn
  meshMaterial = new THREE.MeshBasicMaterial(
    color: color
  )

  newSquareGeo = new THREE.CubeGeometry(dX, dY, 1)
  square = new THREE.Mesh(newSquareGeo, meshMaterial)
  square.position.set(pX,pY,0)
  square.matrixAutoUpdate = false
  square.updateMatrix()
  scene.addObject square
  # add the object to the object list for save/load purposes
  object_list[square.id] = ['rectangle', dX, dY, pX, pY, color]
  currentObj = square

# makeCircle(deltaX, deltaY, positionX, positionY)
# create a circle from radius, and center point
makeCircle = (dX, dY, pX, pY, color) ->
  # specify the materials (shader/color/etc) needed for the object to be drawn
  meshMaterial = new THREE.MeshBasicMaterial(
    color: color
  )
  radius = Math.sqrt(dX * dX + dY * dY)
  if radius > 10
    circleGeo = new THREE.SphereGeometry(radius, 20, 20)
    circle = new THREE.Mesh(circleGeo, meshMaterial)
    circle.position.set(pX, pY,0)
    circle.matrixAutoUpdate = false
    circle.updateMatrix()
    scene.addObject circle
    # add the object to the object list for save/load purposes
    object_list[circle.id] = ['circle', dX, dY, pX, pY, color]
    currentObj = circle

# makeLine(startX, startY, end, endY)
# create a Line from start point and end point
makeLine = (sX, sY, eX, eY, color) ->
  lineMat = new THREE.LineBasicMaterial(
    color: color
    opacity: 1.0
    linewidth: 2
  )

  lineGeo = new THREE.Geometry(0)
  p1 = new THREE.Vector3(sX, sY,0)
  p2 = new THREE.Vector3(eX, eY,0)
  lineGeo.vertices.push(new THREE.Vertex(p1))
  lineGeo.vertices.push(new THREE.Vertex(p2))
  line = new THREE.Line(lineGeo, lineMat )
  scene.addObject(line)
  # add the object to the object list for save/load purposes
  object_list[line.id] = ['line', sX, sY, eX, eY, color]
  currentObj = line

# open a prompt asking for the save/load name
showPrompt = ->
  name=prompt "Please enter the file name to save/load"
  if name != null && name != ""
    return name
  else
    return null

# animate()
# ask the browser to call render() when it can
# this differs from a console application approach due to design considerations, mondern browsers will render much more smoothly
# refreshing the scene at their own pace instead of using scripted time events
animate = ->
  requestAnimationFrame animate
  render()

# render()
# draw the scene
render = ->
  renderer.render scene, camera

# setDrawColor()
# create the hex string needed to specify color
setDrawColor = ->
  drawColor = "0x"
  r = colorValues.red.toString(16)
  if r.length < 2
    r = '0' + r
  g = colorValues.green.toString(16)
  if g.length < 2
    g = '0' + g
  b = colorValues.blue.toString(16)
  if b.length < 2
    b = '0' + b
  drawColor += r
  drawColor += g
  drawColor += b

######## UI Elements ################

shapeChoiceIsSet = ->
  return (shapeChoice.circle || shapeChoice.line || shapeChoice.rectangle)

# create the color control UI
color_gui = new DAT.GUI({
  height: 3 * 32 -1
})
color_gui.name("Color Control")
# rgb values are of the range 0-255 as ints only so step 1
color_gui.add(colorValues, 'red').min(0).max(255).step(1)
color_gui.add(colorValues, 'green').min(0).max(255).step(1)
color_gui.add(colorValues, 'blue').min(0).max(255).step(1)

# create the shape control UI
shape_gui = new DAT.GUI({
  height: 3*32 -1
})

shape_gui.name("Shape Selector")
# the shape options should deselect the other shape choices and those that are deselected should update their values
shape_gui.add(shapeChoice, "rectangle").listen().onChange(deselect = ->
  if shapeChoice.rectangle
    shapeChoice.circle = false
    shapeChoice.line = false
)
shape_gui.add(shapeChoice, "circle").listen().onChange(deselect = ->
  if shapeChoice.circle
    shapeChoice.rectangle = false
    shapeChoice.line = false
)

shape_gui.add(shapeChoice, "line").listen().onChange(deselect = ->
  if shapeChoice.line
    shapeChoice.rectangle = false
    shapeChoice.circle = false
)

# shape_gui.domElement.id = "shapeSelector"


############# Main Loop ###############

# call the function that call all the others
init()
# enter the render loop
animate()
# pull default color from the color control UI
setDrawColor()
