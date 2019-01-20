# Bethlehem

## Node-based Christmas Light Show Player

Create and play light shows with music using a Raspberry Pi.

<a href="http://www.youtube.com/watch?feature=player_embedded&v=jkk-ZqFBmM4
" target="_blank"><img src="http://img.youtube.com/vi/jkk-ZqFBmM4/0.jpg" 
alt="Finished product on YouTube" /></a>

## Installation

1. Get a Raspberry Pi with some kind of Linux (I used Raspbian)
2. Install Node. 10+ has a bug with SQLite on ARM, so I used 8.
3. Run `npm install`
4. Build the [front end](https://github.com/gregoryjjb/bethlehem-ui) and put the result in `REPO-FOLDER/www/*`
5. Start the server, either using Nodemon with `npm start` or your choice of process manager like PM2. `src/server.js` is the entry file.
6. The server runs on :1225; you should be able to see the page
7. Use the Settings page to configure which GPIO pins you have hooked up to control the lights
8. Use the Editor page to create and edit shows