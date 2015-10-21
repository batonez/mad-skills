function drawArrow(ctx, fromx, fromy, tox, toy)
{
  //variables to be used when creating the arrow
  var headlen = 10;
  ctx.fillStyle   = "#66391A";
  ctx.strokeStyle = "#66391A";
  ctx.lineWidth = 2;

  var angle = Math.atan2(toy-fromy,tox-fromx);

  //starting path of the arrow from the start square to the end square and drawing the stroke
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  //starting a new path from the head of the arrow to one of the sides of the point
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

  //path from the side point back to the tip of the arrow, and then again to the opposite side point
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

  //draws the paths created above
  ctx.stroke();
  ctx.fill();
}

function drawRect(ctx, rect, drawRectId = undefined)
{
  ctx.fillStyle   = "#66391A";
  ctx.strokeStyle = "#66391A";

  ctx.fillRect(rect.x - rect.width / 2,
    rect.y - rect.height / 2,
    rect.width,
    rect.height
  );

  ctx.fillStyle = "#00F";
  ctx.strokeStyle = "#F00";
  ctx.font = "8pt Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(rect.text, rect.x, rect.y-rect.height/2);

  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000"
  ctx.font = "14pt Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(drawRectId == undefined ? rect.value : drawRectId, rect.x, rect.y);
}

function lineIntersectionBy4Points(
  line1point1x, line1point1y, line1point2x, line1point2y,
  line2point1x, line2point1y, line2point2x, line2point2y)
{
  var epsilon = 0.0001;
  var resultX, resultY;
  // y=kx+b:
  // y = ((y2-y1)/(x2-x1))*x + (x2*y1 - x1*y2)/(x2-x1)

  var k1 = (line1point2y - line1point1y)/(line1point2x - line1point1x);
  var k2 = (line2point2y - line2point1y)/(line2point2x - line2point1x);
  var b1 = (line1point2x*line1point1y - line1point1x*line1point2y)/(line1point2x - line1point1x);
  var b2 = (line2point2x*line2point1y - line2point1x*line2point2y)/(line2point2x - line2point1x);

  if (Math.abs(line1point1x - line1point2x) < epsilon) {
    //console.log("Line 1 is vertical");
    if (Math.abs(line2point1x - line2point2x) < epsilon) {
      //console.log("Line 2 is vertical");
      return undefined;
    }

    resultX = line1point1x;
    resultY = k2 * resultX + b2;
    return {x: resultX, y: resultY};
  } else if (Math.abs(line2point1x - line2point2x) < epsilon) {
    resultX = line2point1x;
    resultY = k1 * resultX + b1;
    return {x: resultX, y: resultY};
  }

  if (Math.abs(k1 - k2) < epsilon) {
    return undefined; // lines are parallel
  }

  // k1*x + b1 = k2 * x + b2
  resultX = (b2 - b1)/(k1 - k2);
  resultY = k1 * resultX + b1;

  return {x: resultX, y: resultY};
}

function segmentIntersectionBy4Points(
  seg1point1x, seg1point1y, seg1point2x, seg1point2y,
  seg2point1x, seg2point1y, seg2point2x, seg2point2y)
{
  //console.log("Rect segment from: " + seg1point1x, seg1point1y);
  //console.log("Rect segment to: " + seg1point2x, seg1point2y);

  var lineIntersection = lineIntersectionBy4Points(
    seg1point1x, seg1point1y, seg1point2x, seg1point2y,
    seg2point1x, seg2point1y, seg2point2x, seg2point2y);

  if (lineIntersection == undefined)
  {
    //console.log("Lines are parallel");
    return undefined;
  }

  //console.log("Found line intersection: " + lineIntersection.x + "; " + lineIntersection.y);

  if (lineIntersection.x < Math.min(seg1point1x, seg1point2x))
    return undefined;

  if (lineIntersection.x < Math.min(seg2point1x, seg2point2x))
    return undefined;

  if (lineIntersection.x > Math.max(seg1point1x, seg1point2x))
    return undefined;

  if (lineIntersection.x > Math.max(seg2point1x, seg2point2x))
    return undefined;


  if (lineIntersection.y < Math.min(seg1point1y, seg1point2y))
    return undefined;

  if (lineIntersection.y < Math.min(seg2point1y, seg2point2y))
    return undefined;

  if (lineIntersection.y > Math.max(seg1point1y, seg1point2y))
    return undefined;

  if (lineIntersection.y > Math.max(seg2point1y, seg2point2y))
    return undefined;

  //console.log("... And it's inside segments");
  return lineIntersection;
}

function drawArrowBetweenRects(ctx, first_rect, second_rect)
{
  var firstPoint, secondPoint, thirdPoint, fourthPoint;

  //console.log("Arrow line from: " + first_rect.x + "; " + first_rect.y);
  //console.log("Arrow line to  : " + second_rect.x + "; " + second_rect.y);

  //console.log("Right rect side");

  firstPoint = segmentIntersectionBy4Points(
    second_rect.x + second_rect.width/2, second_rect.y + second_rect.height/2,
    second_rect.x + second_rect.width/2, second_rect.y - second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (firstPoint != undefined) {
    drawArrow(ctx, first_rect.x, first_rect.y, firstPoint.x, firstPoint.y);
    return;
  }

  //console.log("Top rect side");

  secondPoint = segmentIntersectionBy4Points(
    second_rect.x + second_rect.width/2, second_rect.y - second_rect.height/2,
    second_rect.x - second_rect.width/2, second_rect.y - second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (secondPoint != undefined) {
    drawArrow(ctx, first_rect.x, first_rect.y, secondPoint.x, secondPoint.y);
    return;
  }

  //console.log("Left rect side");

  thirdPoint = segmentIntersectionBy4Points(
    second_rect.x - second_rect.width/2, second_rect.y - second_rect.height/2,
    second_rect.x - second_rect.width/2, second_rect.y + second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (thirdPoint != undefined) {
    drawArrow(ctx, first_rect.x, first_rect.y, thirdPoint.x, thirdPoint.y);
    return;
  }

  //console.log("Bottom rect side");

  fourthPoint = segmentIntersectionBy4Points(
    second_rect.x - second_rect.width/2, second_rect.y + second_rect.height/2,
    second_rect.x + second_rect.width/2, second_rect.y + second_rect.height/2,
    first_rect.x, first_rect.y, second_rect.x, second_rect.y);

  if (fourthPoint != undefined) {
    drawArrow(ctx, first_rect.x, first_rect.y, fourthPoint.x, fourthPoint.y);
    return;
  }

  drawArrow(ctx, first_rect.x, first_rect.y, second_rect.x, second_rect.y);
}

function isPointInsideRect(rect, x, y)
{
  return (x <= rect.x + rect.width  / 2) &&
    (x >= rect.x - rect.width  / 2) &&
    (y <= rect.y + rect.height / 2) &&
    (y >= rect.y - rect.height / 2);
}

function getMousePositionOnCanvas(canvas, mouseEvent)
{
  var canvasBounds = canvas.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - canvasBounds.left,
    y: mouseEvent.clientY - canvasBounds.top
  };
}