# Top-K-Sliding-window-Hashtags
Display of Top-K hashtags from twitter stream in a dynamically configurable sliding window and K

Installation
The assignment is designed on a web client-server architecture implemented on NodeJS server as backend service and Jade view engine as frontend. 

1. Installation of NodeJS
Execute the following instructions to install Node web server.
sudo apt-get update
sudo apt-get install git-core curl build-essential openssl
libssl-dev
git clone https://github.com/joyent/node.git && cd node
./configure
make
sudo make install

Also install node-express-generator by the following command:
sudo npm install -g express-generator

To install external modules to be used by Node, use NPM. The provided file "package.json" has the required modules to be installed. The following command when executed installs all the modules listed in the file:
npm install

2. Installation of Jade, Jquery and Twitter bootstrap
cd $HOME # move to home directory
sudo npm set registry http://registry.npmjs.org/
sudo npm install -g jade # option -g: install globally
sudo npm install -g bower # pkg manager, http://bower.io
bower install -g jquery
bower install bootstrap

3. Set environment variables
Please add the following lines to the file '$HOME/.bashrc' as environment variables:
export TWITTER_CONSUMER_KEY=*****************************
export TWITTER_CONSUMER_SECRET=****************************
export TWITTER_ACCESS_TOKEN=**************************
export TWITTER_ACCESS_SECRET=*****************************

4. Installing countminsketch and twit
npm install count-min-sketch
npm install twit

Compilation
Running the server
1. Extract the submitted archived file
2. Open a terminal session and move to directory 'src' (cd src)
3. Run the command: node app.js

Running the client
1. Open web-browser (chrome/firefox)
2. View the initial results on: http://localhost:3000. The initial list of hashtags is based on the values of k=5 and window size=20.
3. Values of k and window size are dynamically configurable and could be provided as input in the dedicated text area and on clicking 'Submit' results are displayed.
