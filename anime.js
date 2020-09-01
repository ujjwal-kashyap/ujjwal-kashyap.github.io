function animate(cvs,ctx) {

  //animation area
  var cW = cvs.width;
  var cH = cvs.height;
  //const tL1 = "";
  //const tL2 = "At";
  //const tL3 = "Lightning Speed";
  //const tL10 = "The time is always right";
  //const tL11 = "to do somethig right";
  const font = "Merriweather";
  const fontSize = 35;
  const lineSize = 50;
  const text = "The Quote \n @alphablue.co"
  var lines = [];
  var twOff = 30; // text width offset
  var tboxY = 0; // text box y cordinate starting position
  var tboxY1 = 0; //text box y cordinate ending position
  var tboxMover = 0; // pixels to move text box each RAF

  var img = new Image();   // Create new img element
  var imagefile = './images/thinkingdavid.jpg';
  //img.crossOrigin = 'anonymous';
  var tiW = 0; // transformed image width
  var tiH = 0; // transformed image height
  var run = 0;
  var rf = 0.1;// run factor, zoom in pic
  var hOff = 20; // height offset for images




  /*=============================================================================*/
  /* Utility Functions
  /*=============================================================================*/
  const rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);};

  function getLines() {
    ctx.font = fontSize+"px "+font;

    var words = text.split(" ");
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (word == "\n") {
        lines.push(currentLine);
        currentLine = word;
      } else if (width < cW-twOff*2) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  }

  /*=============================================================================*/
  /* BG layer
  /*=============================================================================*/
  const bgLayer = () => {
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, cW, cH);
    run = run+rf;

    //ctx.globalCompositeOperation = 'destination-out';
    //ctx.fillStyle = 'rgba(0,0,0,'+rand(1,30)/100+')';
    //ctx.fillRect(0, 0, cW, cH);
    //ctx.globalCompositeOperation = 'source-over';
  };

  /*=============================================================================*/
  /* Animation Layer
  /*=============================================================================*/
  const imgLayer = () => {
    r=(run/2);

    ctx.clearRect(0, 0, cW, cH);

    ctx.drawImage(img, 0-r, ((cH-tiH)/2) - r - hOff, tiW + (2*r), tiH + (2*r));

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cW, ((cH-tiH)/2)-hOff);
    ctx.fillRect(0, cH - ((cH-tiH)/2) - hOff, cW, ((cH-tiH)/2) +  hOff);
  };

  /*=============================================================================*/
  /* Text Layer
  /*=============================================================================*/
  const line = (l,h) => {
    ctx.fillText(l, cW/2, h);
  }

  // text on bg
  const textLayer = () => {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "black";
    ctx.fillRect(twOff, tboxY, cW-(2*twOff), (lineSize*lines.length)+2*(lineSize-fontSize));
    ctx.globalAlpha = 1;

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    for( var i=0; i<lines.length; i++) {
      ctx.fillText(lines[i], cW/2, tboxY + (lineSize*(i+1)));
    }

    if (tboxY > tboxY1) {
      tboxY = tboxY-tboxMover;
    }
    //console.log(tboxY);

  }


  /*=============================================================================*/
  /* Loop functions
  /*=============================================================================*/
  const animationFunc = () => {

    img.onload = function () {

      if (img.width < img.height) {
        tiW = cW; // transformed image width
        tiH = (cW/img.width)*img.height; // transformed image height
      }

      getLines();
      tboxY = Math.max(cH - lines.length*lineSize, cH*3/4);
      //console.log(tboxY);
      tboxY1 = Math.min(cH - lines.length*lineSize, cH*2/3);
      //console.log(tboxY1);
      tboxMover = (tboxY - tboxY1)/180;
      //console.log(tboxMover)


      const animationFunc1 = () => {
        bgLayer();
        imgLayer();
        textLayer();
        window.requestAnimationFrame( animationFunc1 );
      };
      animationFunc1();
    };
    img.src = imagefile; // Set source path

    //window.requestAnimationFrame( animationFunc );
  };

  /*=============================================================================*/
  /* Load font and Init Animation
  /*=============================================================================*/

  WebFontConfig = {
   google: { families: [font+':400:latin'] },
   active: function() {animationFunc();}
  };

  (function () {
   var wf = document.createElement("script");
   wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
   wf.async = 'true';
   document.head.appendChild(wf);
  })();

}
