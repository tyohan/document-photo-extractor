var cv = require('./node_modules/opencv/lib/opencv');
var fs = require('fs');
var lowThresh =10;
var highThresh = 150;
var nIters = 2;
var maxArea = 2500;

var path='./color_images';
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var isImage=function(image){
    image=image.toLowerCase();
    return image.indexOf('jpg')!==-1 || image.indexOf('png')!==-1;
}

String.prototype.getFileName = function() {
    var pos = this.lastIndexOf('/');
    return this.substring(pos+1);
}

fs.readdir(path, function(err, files){
        cropPhoto(files)
          
   
});

var cropPhoto=function(files){
    var image=files.pop();

          console.log('Checking image '+image);
          console.log(isImage(image));
          if(isImage(image)){
              var file=path+'/'+image;
               console.log('detecting face on file '+image);
               cv.readImage(file, function(err, im) {
                if (err) throw err;
                var width = im.width();
                var height = im.height();
                if (width < 1 || height < 1) throw new Error('Image has no size');

                im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
                  if (err) throw err;
                  image=image.replace('jpg','png');
                  var facepath='./tmp/'+image;
                 
                  console.log('Found '+faces.length+' face\'s on '+image );
                  var biggest=0;
                  var bigest_face=null;
                  
                  for (var i = 0; i < faces.length; i++) {
                    var area=faces[i].width*faces[i].height;
                    if(area>biggest){
                      biggest=area;
                      bigest_face=faces[i];
                    }
                  }

                  if(faces.length>0 && bigest_face!==null && bigest_face.width > 120 && bigest_face.height > 160){
                    var padding=Math.round(bigest_face.width/3);
                    var imWidth=bigest_face.width+(padding*2);
                    var imHeight=Math.round(imWidth*(4/3));
                    im=im.roi(bigest_face.x-padding, bigest_face.y-padding, imWidth, imHeight);
                    //console.log('Image saved to '.face);
                    console.log(facepath);
                    im.save(facepath);
                  } else {
                    console.log('eliminated face as Page 2 artifact');
                  }
                  
                  console.log('Files left:'+files.length);
                  if(files.length>0)
                      cropPhoto(files);
                  
                });

              });
          }
}