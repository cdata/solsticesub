var connect = require('connect'),
    path = require('path'),
    crushWave = require('./crushwave');

connect(
    connect.profiler(),
    connect.static('./client/static'),
    connect.favicon('./client/static/images/favicon.png'),
    connect.router(
        function(app) {

            app.get(
                "/waveform/:name",
                function(req, res) {

                    crushWave.analyze('./client/static/music/' + req.params.name + '.mp3').then(
                        function(meta) {

                            res.writeHead(200, { "Content-Type" : "application/json" });
                            res.end(JSON.stringify(meta));
                        }
                    );
                }
            )
        }
    )
).listen(9000, "127.0.0.1");
