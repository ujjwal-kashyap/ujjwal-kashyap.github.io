function UserAction() {

  url ='https://nxul9z35le.execute-api.ap-southeast-2.amazonaws.com/DEV/video';
  axios.get(url,null)
   .then(response => {
     console.log('success');

     var i;
     for(i=0; i<response.data.length; i++) {
       // Buffer for the jpg data
        var buf = response.data[i];
        // Create an HTML img tag
        var imageElem = document.createElement('img');
        // Just use the toString() method from your buffer instance
        // to get date as base64 type
        imageElem.src = 'data:image/jpeg;base64,' + buf;
        //imageElem.height = 500;
        //imageElem.width = 200;
        imageElem.border = '2px solid black';
        document.getElementById('result').appendChild(imageElem);
     }


   })
   .catch(error => {
     console.log(error);
   });

}
