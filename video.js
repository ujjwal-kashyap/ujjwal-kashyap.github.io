function UserAction() {
  url ='https://nxul9z35le.execute-api.ap-southeast-2.amazonaws.com/DEV/video';
  axios.get(url,null)
   .then(response => {
     console.log('success');

     var i;
     for(i=0; i<response.data.length; i++) {
       // Buffer for the jpg data
        var buf = response.data[i];

        var ancorElem = document.createElement('a');
        ancorElem.classList='carousel-item';
        ancorElem.id='carousel-item-'+i;
        ancorElem.href='#'+i+'!';
        document.getElementById('result').appendChild(ancorElem);

        var imageElem = document.createElement('img');
        imageElem.src = 'data:image/jpeg;base64,' + buf;
        document.getElementById('carousel-item-'+i).appendChild(imageElem);
     }

     var elems = document.querySelectorAll('.carousel');
     var options = {}
     var instances = M.Carousel.init(elems, options);
   })
   .catch(error => {
     console.log(error);
   });
}
