// Gets some info about a video and then downloads the NTSC SD version

var api = require("gettyimages-api");
var https = require("https");
var fs = require("fs");

var creds = { apiKey: process.env.GettyImagesApi_ApiKey, apiSecret: process.env.GettyImagesApi_ApiSecret, username: process.env.GettyImagesApi_UserName, password: process.env.GettyImagesApi_UserPassword };
var client = new api(creds);
var videoId = "459425248";
client.videos().withResponseField("summary_set").withResponseField("downloads").withId(videoId).execute((err, response) => {
    if (!err) {
        console.log("Title: " + response.title);
        console.log("Sizes: ");
        response.download_sizes.forEach((current, index, arr) => {
            console.log(current.name + " - " + current.description);
        })
        client.downloads().videos().withId(videoId).withSize("ntsccm").execute((err, response) => {
            if (!err) {
                var downloadUri = response.uri;

                https.get(downloadUri, (res) => {
                    if (res.statusCode === 200) {
                        var header = res.headers["content-disposition"];
                        var filename = header.split("filename=")[1];
                        console.log(filename);
                        var file = fs.createWriteStream("./" + filename);
                        res.on("data", (chunk) => {
                            file.write(chunk);
                        }).on("end", () => {
                            file.end();
                        });
                    }
                });
            }
        });
    }
});
