const functions = require('@google-cloud/functions-framework');
const request = require('request');
const { Datastore } = require('@google-cloud/datastore');
const projectId = 'ryksead-aesproject';

//create client
const datastore = new Datastore({
  projectId,
  databaseId: 'aes-gridapi',
});

functions.http('aesCourtGridAPI', (req, res) => {
  if (req.query.eventID === undefined) {
    // This is an error case, as "eventID" is required.
    res.status(400).send('No eventID defined!');
  } else {
    request.get(`https://results.advancedeventsystems.com/api/event/${req.query.eventID}/courts/${req.query.date}/300`, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      const aesresult = JSON.parse(body);
      // add for loop to process each array indice (corresponds to one court)
      console.log(aesresult.CourtSchedules[0]);

      //datastore write
      function saveCourt() {
        aesresult.CourtSchedules.forEach((element) => {
          const kind = 'Court';
          const courtKey = datastore.key(kind);
          const entity = {
            key: courtKey,
            data: element,
          }
          
          try {
            datastore.save(entity);
          } catch (err) {
            console.log('ERROR', err);
          }
        })

      }

      saveCourt();

      res.status(200).send("Success!");
  //     res.status(200).send(`<!doctype html>
  //   <head>
  //     <title>Court Schedule</title>
  //   </head>
  //   <body>
  //     ${JSON.stringify(aesresult)}
  //   </body>
  // </html>`)
    });
  }
});
