// DEPENDENCIES
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require("moment");

// Require all models
var db = require("../models");

module.exports = function(router) {
    
    // Route to render the home page
    router.get("/", function(req, res){
        db.Headline.find({}).sort({ date: -1 }).then(function(data) {
            let articleData = {
                articles: data
            };
            res.render("home", articleData);
        }).catch(function(err) {
            res.json(err);
        });
    });

    // Route to render the saved page
    router.get("/saved", function(req, res){
        db.Headline.find({ saved: true }).sort({ date: -1 }).then(function(data) {
            let articleData = {
                articles: data
            };
            res.render("saved", articleData);
        }).catch(function(err) {
            res.json(err);
        });
    });

    // A GET route for scraping Time
    router.get("/scrape", function(req, res){
        // Grab the body of the html with axios
        axios.get("https://time.com/tag/crime/").then(function(response) { 
            // Then, we load that into cheerio and save it to $
            var $ = cheerio.load(response.data);

            $(".bt-dbdbdb").each(function(i, element) {
                var result = {};

                result.headline = $(this)
                    .children("a")
                    .attr("title").trim();
                result.link = $(this)
                    .children("a")
                    .attr("href");
                result.imgUrl = $(this)
                    .children("a")
                    .children("img")
                    .attr("src");
                result.summary = $(this)
                    .children("p")
                    .text();
                result.date = $(this)
                    .children("div")
                    .children("p")
                    .children("span:nth-child(2)")
                    .text()
                result.displayDate = moment(result.date).format('MMMM Do YYYY');
                result.tag = "Crime";

                console.log(result);
                db.Headline.create(result)
                        .then(function(dbHeadline) {
                            // View the added result in the console
                            console.log(dbHeadline);
                        })
                        .catch(function(err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
            });

        }).then(function (){
            // Grab the body of the html with axios
            axios.get("https://time.com/tag/crime/").then(function(response) { 
                // Then, we load that into cheerio and save it to $
                var $ = cheerio.load(response.data);

                $(".bt-dbdbdb").each(function(i, element) {
                    result = {};

                    result.headline = $(this)
                        .children("a")
                        .attr("title").trim();
                    result.link = $(this)
                        .children("a")
                        .attr("href");
                    result.imgUrl = $(this)
                        .children("a")
                        .children("img")
                        .attr("src");
                    result.summary = $(this)
                        .children("p")
                        .text();
                    result.date = $(this)
                        .children("div")
                        .children("p")
                        .children("span:nth-child(2)")
                        .text()
                    result.displayDate = moment(result.date).format('MMMM Do YYYY');
                    result.tag = "Coffee";

                    console.log(result);
                    db.Headline.create(result)
                        .then(function(dbHeadline) {
                            // View the added result in the console
                            console.log(dbHeadline);
                        })
                        .catch(function(err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
                });

                // Redirect to the home page
                res.redirect("/");
            });
        });
    });

    // Route to clear the Headline mongoDB collection
    router.get('/clear', function(req, res) {
        db.Headline.deleteMany({}).then(function() {
            // Redirect to the home page
            res.redirect("/");
        });
    });

    // Route to get notes for a HeadlineID
    router.get('/notes/:id', function(req, res) {
        db.Note.find({ _headlineId: req.params.id }).then(function(data) {
            res.json(data);
        })
    });

    // Route to delete notes by ID
    router.get('/deletenote/:id', function(req, res) {
        db.Note.findByIdAndDelete({ _id: req.params.id }).then(function(data) {
            res.json(data);
        })
    });

    // // Route not found, render 404 handlebars layout
    // router.get('*', function(req, res) {
    //     res.render("404");
    // });

    // Route to save/unsave an article
    router.post('/save/:id', function(req, res) {
        db.Headline.findOneAndUpdate({ _id: req.params.id }, 
            {$set: {saved: req.body.saved}},
            function (err, doc) {
                if (err) {
                    console.log("update document error");
                } else {
                    console.log("update document success");
                }
            });
    });

    // Route to add new note
    router.post('/addnote', function(req, res) {
        db.Note.create(req.body)
            .then(function(dbNote) {
                // View the added result in the console
                res.json(dbNote);
                console.log(dbNote);
            })
            .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
            });
    });
}