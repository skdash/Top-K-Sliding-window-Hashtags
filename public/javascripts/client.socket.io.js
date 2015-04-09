//Client
var server_name = "http://127.0.0.1:3000/";
var socket = io.connect(server_name);
var len=5;

    //on reception of message from 'server'
    socket.on('ss-tweet', function (data) {
      
    var element1 = document.getElementById("hashtags");	//front-end element for Hashtags
    var element1 = $('#hashtags');
    var element2 = document.getElementById("count");  //front-end element for Count
    var element2 = $('#count');
 
	var globarr = data.list;

    element1.children().remove();
    element2.children().remove();

    for(i=globarr.length-1;i >= globarr.length - len;i--)
    {
        console.log('Value of len: ', len, 'Value of globarr.length: ', globarr.length);
        element1.append('<li>' + globarr[i].text.bold() + '</li>');                         //append the hashtags to the list
        element2.append('<li>' + '(' + globarr[i].value + ')' + '</li>');                   //append the count to the list
    }
    });

    //on click of 'Submit' button
    function btsubmit() {
    var element3 = document.getElementById('ktext');  //front-end element for value of k
    var element4 = document.getElementById('wtext');  //front-end element for value of window-size
    len = element3.value;
    win=element4.value;

    console.log('k value is: ', len);
    console.log('win value is: ', win);
    document.getElementById('ktext').value=len;
    document.getElementById('wtext').value=win;
    socket.emit('ss-submit', {k: len, w: win});       // k and window-size values sent to server upon Submit
    }