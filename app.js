//Server
//include necessary packages
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var createCountMinSketch = require("count-min-sketch")

//web framework 'express' to support MVC
var app = express();

//http server created; listening on port 3000
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);

var sio = require('socket.io').listen(server);

var pattern = /^#/g;
var sketch = createCountMinSketch()

//include the twitter Node package 'twit'
var Twit = require('twit');

//access keys need to be accessed as environment variables
var T = new Twit({
    consumer_key:         process.env.TWITTER_CONSUMER_KEY
  , consumer_secret:      process.env.TWITTER_CONSUMER_SECRET
  , access_token:         process.env.TWITTER_ACCESS_TOKEN
  , access_token_secret:  process.env.TWITTER_ACCESS_SECRET
});

var k = 5;                  // default k = 5
var globarr = [];
var w=20;                   // default window size = 20
var wcount=0;
var windowarr = []
var first=0;

//Binary heap functions
var binaryHeap = function(comp) {
 
  // default to max heap if comparator not provided
  comp = comp || function(a, b) {
    return a < b;
  };
 
  var arr = [];
 
  var swap = function(a, b) {
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  };
 
 //heapify
  var bubbleDown = function(pos) {
    var left = 2 * pos + 1;
    var right = left + 1;
    var smallest = pos;
    if (left < arr.length && comp(arr[left].value, arr[smallest].value)) {
      smallest = left;
    }
    if (right < arr.length && comp(arr[right].value, arr[smallest].value)) {
     smallest = right;
    }
    if (smallest != pos) {
      swap(smallest, pos);
      bubbleDown(smallest);
    }
  };
 
  var bubbleUp = function(pos) {
    if (pos <= 0) {
      return;
    }
    var parent = Math.floor((pos - 1) / 2);

    if (comp(arr[pos].value, arr[parent].value)) {
      swap(pos, parent);
      bubbleUp(parent);
    }
  };
 
  var that = {};

  that.display = function() {
  	for(i=0;i<arr.length;i++) 
  	{
  		console.log(arr[i].text,'(', arr[i].value, ')');
  	}
  	globarr=arr;
  }
 
  that.poll = function() {
    if (arr.length === 0) {
      throw new Error("poll() called on empty binary heap");
    }
    var head = arr[0];
    var last = arr.length - 1;
    arr[0] = arr[last];
    arr.length = last;
    if (last > 0) {
      bubbleDown(0);
    }
    return head;
  };
 
  that.push = function(word) {
    arr.push(word);
    bubbleUp(arr.length - 1);
  };
 
  that.size = function() {
    return arr.length;
  };

  that.heapsearch = function(word) {
    var pos = 0;
    for(i=0; i<arr.length;i++)
    	{
    		if(arr[i].text==word.text)
    		{
    			return i;
  		}
    	}
    	return -1;
  }

  that.remove = function(word) {
    var pos = that.heapsearch(word);
    var last = (arr.length) - 1;
    if(pos!= -1)
    {
      swap(pos, last);
      arr.length = (arr.length) - 1 ;
      bubbleDown(pos);
    }
  }

  that.peek = function() {
    return arr[0];
  }

  that.delete = function() {
   arr.length=0;
  }
 
  return that;
};

var heap = binaryHeap();

function updatepriorityqueue(word)
    {
        var size;
        var count_new, count_head;
        var head, removedhead;

        size = heap.size();
        if(size<k)                                            // If queue size is less than k, add the new word to queue
        {
            heap.remove(word);                                // remove the word from queue, if it exists, to avoid duplicates
            heap.push(word);                                  // add the word to the queue 
        }
        else                                                  // else compare the incoming word with the top-K words in queue
        {
            count_new=sketch.query(word.text);                // fetch the count of incoming word
            head=heap.peek();                               		// fetch the head of queue i.e. least count word in queue
            count_head=head.value;                          		// fetch the count of head word
            
            if(count_new > count_head)                        // compare the counts
            {
                if(heap.heapsearch(word)!=-1 && head.text!=word.text)             // check if the queue already contains the incoming word 
                    heap.remove(word);                        // and remove that if it's anything but the head of queue
                else
                    removedhead=heap.poll();                  // else remove the head from queue

                heap.push(word);                              // add the new word to queue
            }
        }
    }

function addtowindow(hashtags){
      var i,j, count=0;
      var eachwindow = [];
      var word;
      var found=0;

      // remove and update in countmin the hashtags in the current index of window
      for (i=0; first==1 && i<windowarr[wcount].length;i++) {
         sketch.update(windowarr[wcount][i], -1);
      }

      //add to countmin and window
      for (i = 0; hashtags && i < hashtags.length; i++) {
        
        sketch.update(hashtags[i],1);
        //if the hashtag has been already added to the current index in window then ignore it
        for(j=0;j<eachwindow.length;j++) {    
           if(eachwindow[j]==hashtags[i]){
            found=1;
            break;
           }
       }
       if(found==0)
        eachwindow.push(hashtags[i]);

        console.log('Added ', hashtags[i], ' to position ', i, 'in window');
      }

      if(wcount<w) {
         windowarr[wcount]=eachwindow;
      }
      console.log('wcount is: ', wcount);
      wcount++;

      //delete the current priorityqueue
      heap.delete();

      //add the words in window to priorityqueue
      for(var i=0;i<windowarr.length;i++){
       for(var j=0;j<windowarr[i].length; j++){
          var freq = sketch.query(windowarr[i][j]);
          var word = {text:windowarr[i][j], value:freq};
          console.log('Hashtag in CountMin: ',word.text, 'count is: ', freq);

          updatepriorityqueue(word);
        }
      }

      // initialize the window index to 0 upon reaching the max window size
      if(wcount==w) 
      {
        wcount=0;
        first=1;
      }
}

//on connection with web browser client
sio.sockets.on('connection', function(socket){

   console.log('Web client connected');
   var stream = T.stream('statuses/filter', { track: ['#'] }); //establish filter for hashtags
   stream.on('tweet', function (tweet) {
	
    var tagslistarr = tweet.text.match(/#\S+/g);               // split the tweet into hashtags
    
    if(tagslistarr)
    {
      console.log('Hashtags are: ',tagslistarr);
    }

    addtowindow(tagslistarr);

    var size = heap.size();
    console.log('size of PriorityQueue: ', size);
    console.log('..................................................');
    console.log('top-K Hashtags: ');
    heap.display();
    console.log('..................................................');

    //sort the list of hashtags before sending it to client
	globarr.sort(function(a,b) {return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0);} ); 
	//emit the meaningful data to the web browser client
	socket.volatile.emit('ss-tweet', {
		  	list: globarr,
	});
});
	
 // on client action 'Submit'
 socket.on('ss-submit', function (data) {
 
  k = data.k;
  console.log('k value is: ', k);
  w = data.w;
  console.log('w value is: ', w);
  first=0;
  wcount=0;
  heap.delete();

 });
    //on disconnection from client
   	socket.on('disconnect', function() {
    console.log('Web client disconnected');
   });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
