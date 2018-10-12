// Required modules
require("dotenv").config();
var keys = require('./keys.js');
var fs = require('fs');
var request = require('request');
var Spotify = require('node-spotify-api');
var moment = require('moment');

// Inuput Variables
var input = process.argv;
var userCommand = input[2];
var queryParameter = input.slice(3, input.length);


// Functions
concertThis = function(userInput) {

    if (typeof userInput !== 'string') {
        userQuery = userInput.join('%20');
    } else {
        userQuery = userInput.replace(' ', '%20');
    }

    if (userInput !== ""){
        var buildQuery = `https://rest.bandsintown.com/artists/` + userQuery + `/events?app_id=codingbootcamp`;

        request(buildQuery, function(error, response, body){
            if (!error && response.statusCode === 200) {

                if (body.length > 3) {
                    var retval = '\n'+ userInput + 
                    '\'s Next Concert Date:\n-----------------------\nVenue: '+ 
                    JSON.parse(body)[0].venue.name + '\nCity: ' +
                    JSON.parse(body)[0].venue.city + ', ' + JSON.parse(body)[0].venue.region;

                    // Format Date using Moment package
                    var datetime = JSON.parse(body)[0].datetime;
                    var m = moment(datetime).format("MM-DD-YYYY");

                    retval += '\nDate: '+ m + '\n-----------------------\n';
                } 
                // No results handling 
                else {
                    retval = '\nSorry '+ userInput + ' doesn\'t appear to be on tour right now.';
                }

                appendAndLog(retval);

            }
        });

    } else {
        console.log('Please provide a band/singer to search for.');
    }
}

spotifySong = function(userInput) {
    // Spotify Variables
    if (typeof userInput !== 'string') {
        userInput = userInput.join(' ');
    }

    var spotify = new Spotify(keys.spotify);
    var defaultQuery = { type: 'track', query: 'The Sign Ace of Base,', limit: 1 };
    var userQuery = { type: 'track', query: userInput};
    
    // Select query to Run
    if (userQuery.query === "") {
        var searchQuery = defaultQuery;
    } else {
        searchQuery = userQuery
    }
    
    // Make API Call
    spotify.search(searchQuery, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
        
        if (data.tracks.items.length !== 0) {
            // Log Result
            var retval = '\n-----------------------\n' + data.tracks.items[0].album.artists[0].name +
            '\n' + data.tracks.items[0].name + '\n' + data.tracks.items[0].preview_url + '\n' +
            data.tracks.items[0].album.name + '\n-----------------------\n'; 
        } 
        else {
            retval = '\nSorry- Spotify couldn\'t find that song, try another.\n';
        }

        appendAndLog(retval);

    });
}

movieThis = function(userInput) {

    // OMDb Variables
    var mrNobody = "Mr.+Nobody";
    var buildQuery = 'http://www.omdbapi.com/?apikey=trilogy&t="';
    if (typeof userInput === 'string') {
        var userQuery = userInput.replace(' ', '+');
    } else {
        userQuery = userInput.join('+');
    }

    // Build API Call
    if (userQuery === "") {
        buildQuery += mrNobody;
    } else {
        buildQuery += userQuery;
    }

    // Make Request
    request(buildQuery, function(error, response, body) {

        if (!error && response.statusCode === 200) {

            // Log Output 
            var retval = '\nTitle: ' + JSON.parse(body).Title + 
            '\nYear: ' + JSON.parse(body).Year + 
            '\n-----------------------'+
            '\nIMDB Rating: ' + JSON.parse(body).Ratings[0].Value +
            '\nRotten Tomatoes Rating: ' + JSON.parse(body).Ratings[1].Value + 
            '\n-----------------------'+
            '\nCountry: '+ JSON.parse(body).Country + 
            '\nLanguage: ' + JSON.parse(body).Language + 
            '\n-----------------------'+
            '\nPlot: ' + JSON.parse(body).Plot + 
            '\nActors: ' + JSON.parse(body).Actors + '\n';

        }
        
        appendAndLog(retval);

    });
}

doThis = function(fileName) {
    // Read File 
    fs.readFile(fileName, "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }

        // Check to see if Random.txt data has multiple entries
        if (data.includes('\n')) {

            // If it does, first split by line
            dataArr = (data.split("\n"));

            // Then split those indecies into arrays
            for (var i=0; i<dataArr.length; i++) {
                dataArr[i] = dataArr[i].split(',');
            }
        } else {
            data.split(',');
        }

        // If resulting data arrays
        if (typeof dataArr[0] !== 'string') {
            for (var i=0; i<dataArr.length; i++) {
                runLIRI(dataArr[i][0], dataArr[i][1]);
            }
        } else {
            runLIRI(dataArr[0], dataArr[1]);
        }
    });   
}

appendAndLog = function(responseData) {
    var separator = '\n******************************\n';
    fs.appendFile("log.txt", responseData+separator, function(err) {
      if (err) {
        return console.log(err);
      }
    });
    console.log(responseData);
}

runLIRI = function(command, userInput) {
    switch (command) {
        case(`concert-this`):
            concertThis(userInput);
            break;
    
        case(`spotify-this-song`):
            spotifySong(userInput);
            break;
    
        case(`movie-this`):
            movieThis(userInput);
            break;
    
        case(`do-what-it-says`) :
            doThis('random.txt');
            break;
    
    }
}

runLIRI(userCommand, queryParameter);
