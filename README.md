Maiestro is a music app designed to help users kickstart their creativity and avoid writer's block. Check out the demo here: https://maiestro.netlify.app

- It generates a dynamic, customizable keyboard by using the react-piano library (available here: https://www.npmjs.com/package/react-piano). 
- Users can record, save, and load melodies.
- Uses magenta.js (https://github.com/magenta/magenta-js) and machine learning to continue user's recorded melody upon pressing the duet button. 
- Uses a session-based Rails API structure for authentication and authorization.

Front end was built using React and Redux, back end with a Rails API and a PostgreSQL database. Back end code: https://github.com/christopherleja/maiestro-backend

How to use:

```
// clone backend first
$ git clone git@github.com:christopherleja/maiestro-backend.git

// cd into backend folder
$ cd maiestro-backend

// install dependencies and start the server
$ bundle && rails s

// clone this repository
$ git clone git@github.com:christopherleja/maiestro.git 

// cd into the repository
$ cd maiestro

// install dependencies and run the app
$ npm install && npm start
