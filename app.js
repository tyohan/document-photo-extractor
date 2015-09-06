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
              image=image.replace('jpg','png');
              var facepath='./tmp/'+image;

              if (fs.existsSync(facepath)) {
                if(files.length>0) {
                  console.log('not remaking this image');
                  cropPhoto(files);
                } else {
                  console.log('finished');
                }
                return;
              }

               console.log('detecting face on file '+image);

               cv.readImage(file, function(err, im) {
                if (err) throw err;
                var width = im.width();
                var height = im.height();
                if (width < 1 || height < 1) throw new Error('Image has no size');

                im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
                  if (err) throw err;

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


                  if(faces.length>0 && bigest_face!==null){
                    var padding=Math.round(bigest_face.width/3);
                    var photox=bigest_face.x-padding;
                    var photoy=bigest_face.y-padding;
                    if(photox>0 && photoy>0){

                        var imWidth=bigest_face.width+(padding*2);
                        var imHeight=Math.round(imWidth*(4/3));
                        if ((photox+imWidth)>width) {
                          photox=width-imWidth;
                        };
                        console.log('Document size x:'+width+',y:'+height);

                        console.log('Photo size:');
                        console.log(bigest_face);
                        im=im.roi(photox, photoy, imWidth, imHeight);
                        console.log('Cropped photo');
                        im.save(facepath);
                        console.log('Image saved to '+facepath);
                    }
                    else{
                      console.log(bigest_face);
                      console.log('Position not allowed x:'+photox+', y:'+photoy);
                    }

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
