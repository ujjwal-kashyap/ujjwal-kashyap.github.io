function animate(cvs,ctx) {

  //animation area
  var cW = cvs.width;
  var cH = cvs.height;
  const tL1 = "Create Stories";
  const tL2 = "At";
  const tL3 = "Lightning Speed";
  const tL10 = "Visit us";
  const tL11 = "@AlphaBlue.co";
  const font = "Electrolize";

  var img = new Image();   // Create new img element
  //img.crossOrigin = 'anonymous';


  /*=============================================================================*/
  /* Utility Functions
  /*=============================================================================*/
  const rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);};

  /*=============================================================================*/
  /* BG layer
  /*=============================================================================*/
  const refBg = () => {
    ctx.clearRect(0, 0, cW, cH);
    ctx.fillStyle = "#152238";
    ctx.fillRect(0, 0, cW, cH);

    //ctx.globalCompositeOperation = 'destination-out';
    //ctx.fillStyle = 'rgba(0,0,0,'+rand(1,30)/100+')';
    //ctx.fillRect(0, 0, cW, cH);
    //ctx.globalCompositeOperation = 'source-over';
  };

  /*=============================================================================*/
  /* Animation Layer
  /*=============================================================================*/
  const refBg1 = () => {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, rand(cW/3,cW/2), cH/2);
    ctx.drawImage(img, 0, 0);


  };

  /*=============================================================================*/
  /* Text Layer
  /*=============================================================================*/
  const line = (l,h) => {
    ctx.fillText(l, cW/2, h);
  }

  // text on bg
  const text = () => {
    ctx.font = "70px "+font;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    line(tL1,cH/4);
    line(tL2,cH/2.7);
    line(tL3,cH/2.1);

    //offset=2;
    ctx.font = "40px "+font;
    line(tL10,cH/1.5);
    line(tL11,cH/1.3);
  }


  /*=============================================================================*/
  /* Loop functions
  /*=============================================================================*/
  const animationFunc = () => {

    img.onload = function () {

      const animationFunc1 = () => {
        //refBg();
        refBg1();
        text();
        window.requestAnimationFrame( animationFunc1 );
      };
      animationFunc1();

    };
    img.src = 'a.JPG'; // Set source path

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
