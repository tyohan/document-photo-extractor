var cv = require('./node_modules/opencv/lib/opencv');

var lowThresh =10;
var highThresh = 150;
var nIters = 2;
var maxArea = 2500;

var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R

cv.readImage('./form.jpg', function(err, im) {
  if (err) throw err;
  var width = im.width();
  var height = im.height();
  if (width < 1 || height < 1) throw new Error('Image has no size');

  var big = new cv.Matrix(height/2, width/2);

  im=im.roi(width/2, 0, width/2, height/2)
  im_canny = im.copy();
  im_canny.convertGrayscale();
  //im.gaussianBlur([5,5]);
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);

  contours = im_canny.findContours();

  var max_i=null;
  var ratio=0
  var rect=null;
  for(i = 0; i < contours.size(); i++) {
  	
    if(contours.area(i) > maxArea) {
      max_i=i;
      maxArea=contours.area(i);
      rect=contours.boundingRect(i);
      ratio=rect.width/rect.height;
      console.log(rect);
      console.log(ratio);
      if(ratio>0.5 && ratio<2){
      	  console.log('Saved countour: '+i);
		  var moments = contours.moments(i);
		  var cgx = Math.round(moments.m10 / moments.m00);
		  var cgy = Math.round(moments.m01 / moments.m00);
		  big.drawContour(contours, i, GREEN);
		  big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
		  big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
		  im.rectangle([rect.x, rect.y], [rect.width, rect.height], GREEN, 2);
      }
      
    }
  }
  
  im.save('./detect.png');
  big.save('./big.png');
  console.log('Image saved to ./big.png');
});