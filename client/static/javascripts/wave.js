var analyzeWaveform = $.getJSON('/waveform/last-schala-mix'),
    readPlaylist = $.getJSON('/playlist.json'),
    attribution,
    copyright,
    tweet,
    sub,
    ship,
    canvas,
    sound,
    audio,
    greeting,
    body;

$(function() {

    var requestAnimationFrame = (function(){

            return  window.requestAnimationFrame       || 
                    window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame    || 
                    window.oRequestAnimationFrame      || 
                    window.msRequestAnimationFrame     || 
                    function( callback ) {

                        window.setTimeout(callback, 1000 / 60);
                    };
        })(),
        invalidateSize = function() {

            canvas.attr('width', window.innerWidth);
            canvas.attr('height', window.innerHeight);

            if(window.innerWidth < 1400) {

                attribution.attr(
                    'style',
                    [
                        "display: block",
                        "width: " + Math.floor(276 / 1440 * window.innerWidth) + "px"
                    ].join(';')
                ).children().first().attr('style', 'width: 100%');

                copyright.attr(
                    'style',
                    [
                        "width: " + Math.floor(340 / 1440 * window.innerWidth) + "px",
                        "right: " + (attribution.width() + 40) + "px"
                    ].join(';')
                );

                sound.attr(
                    'style',
                    [
                        "width: " + Math.floor(44 / 1440 * window.innerWidth) + "px",
                        "right: " + (attribution.width() + copyright.width() + 60) + "px"
                    ].join(';')
                ).children().first().attr('style', 'width: 100%');

            } else {

                attribution.attr('style', '').children().first().attr('style', '');
                copyright.attr('style', '');
                sound.attr('style', '').children().first().attr('style', '');
            }

            if(window.innerWidth < 1300)
                greeting.attr('style', 'width: ' + Math.floor(600 / 1540 * window.innerWidth) + 'px');
            else
                greeting.attr('style', '');
        };

    sound = $('#sound');
    canvas = $('#canvas');
    tweet = $('#tweet');

    greeting = $('#greeting');

    body = $('body');
    
    sub = $('#sub').get(0);
    ship = $('#ship').get(0);

    attribution = $('#attribution');
    copyright = $('#copyright');

    $(window).resize(
        function() {

            invalidateSize();
        }
    );

    invalidateSize();

    sound.toggle(
        function() {

            sound.children('img').attr('src', '/images/sound-off.png').attr('alt', 'Music is paused!');
            audio.get(0).pause();
        },
        function() {

            sound.children('img').attr('src', '/images/sound-on.png').attr('alt', 'Music is playing!');
            audio.get(0).play();
        }
    );

    if(window.navigator.userAgent.match(/ipad|iphone/i)) {

        $('<div><h1>PLAY</h1></div>').appendTo(body).css(
            {
                display: 'block',
                position: 'absolute',
                textAlign: 'center',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }
        ).click(
            function() {
                $(this).remove();
                audio.get(0).play();
            }
        ).children().first().css(
            {
                display: 'block',
                position: 'relative',
                marginTop: '40%',
                fontWeight: 'bold',
                fontSize: '40px'
            }
        );
    }

    tweet.click(
        function() {

            window.open(
                "https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Fsolsticesub.com&text=Seasons%20greetings%20from%20the%20Solstice%20Submarine!&url=http%3A%2F%2Fsolsticesub.com&hashtags=followthatsub&related=robodynamo%2Cdonnamatata",
                "solsticesub-tweet",
                "height=450,left=445,personalbar=0,resiable=1,scrollbars=1,toolbar=0,top=225,width=550"
            );
        }
    );

    $.when(analyzeWaveform, readPlaylist).then(
        function(data, playlist) {

            data = data[0];
            playlist = playlist[0];

            var context = canvas.get(0).getContext('2d'),
                colors = [
                    '#fc1e00',
                    '#fea700',
                    '#ffff00',
                    '#188000',
                    '#0000ff',
                    '#480087',
                    '#eb82f4'
                ],
                closeStars = [],
                farStars = [],
                playNextTrack = (function() {

                    var trackIndex = 0;

                    return function() {

                        var nextTrack = playlist[trackIndex++],
                            mp3Src = $('<source></source>'),
                            oggSrc = $('<source></source>');

                        if(trackIndex >= playlist.length) trackIndex = 0;

                        audio = $('<audio></audio>');

                        mp3Src.attr('type', 'audio/mpeg').attr('src', nextTrack.cdn[0]);
                        oggSrc.attr('type', 'audio/ogg; codecs=vorbis').attr('src', nextTrack.cdn[1]);

                        audio.append(mp3Src).append(oggSrc).bind(
                            'ended',
                            function() {
                                
                                audio.remove();
                                playNextTrack();
                            }
                        ).appendTo(body).get(0).play();

                        attribution.attr('href', nextTrack.ocr);
                        attribution.attr('alt', nextTrack.artist + ' - ' + nextTrack.song + ' - OverClocked Remix');

                    };
                })();

            playNextTrack();

            for(var i = 0; i < 25; i++) {

                closeStars.push([ Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight) ]); 
            }

            for(var j = 0; j < 50; j++) {

                farStars.push([ Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight) ]);
            }

            (function() {

                var time = audio.get(0).currentTime,
                    amplitude = Math.floor(time * (data.formOne.length / audio.get(0).duration) + 4),
                    maxHeight = 60,
                    count = Math.floor(window.innerWidth / 28),
                    width = window.innerWidth / count / 2,
                    peak = 80;

                context.fillStyle = '#0d4c94';
                context.fillRect(0, 0, window.innerWidth, window.innerHeight);

                // Draw star field..
                context.fillStyle = "rgba(255, 255, 255, 1)";

                for(var h = 0; h < closeStars.length; h++) {

                    context.fillRect(closeStars[h][0], closeStars[h][1], 8, 8);

                    closeStars[h][0] -= 8;

                    if(closeStars[h][0] < 0) {

                        closeStars[h][0] = window.innerWidth + 10;
                        closeStars[h][1] = Math.floor(Math.random() * window.innerHeight);
                    }
                }

                context.fillStyle = "rgba(255, 255, 255, 0.75)";

                for(var h = 0; h < farStars.length; h++) {

                    context.fillRect(farStars[h][0], farStars[h][1], 5, 5);

                    farStars[h][0] -= 6;

                    if(farStars[h][0] < 0) {

                        farStars[h][0] = window.innerWidth + 8;
                        farStars[h][1] = Math.floor(Math.random() * window.innerHeight);
                    }
                }

                // Draw rainbow wave form..
                for(var i = -1 * count; i < 1; i++) {

                    var position = amplitude + i,
                        topOne = Math.sin(Math.PI * (position / 64) - Math.PI / 2),
                        topTwo = Math.cos(Math.PI * (position / 64)),
                        subInFront = Math.floor(position / 64) % 2,
                        heightOne = data.formOne[amplitude + i] / (256 / maxHeight),
                        heightTwo = data.formTwo[amplitude + i] / (256 / maxHeight),
                        left = (i + count) * width;

                    topOne = topOne * peak + window.innerHeight / 2;
                    topOne -= topOne % 10;

                    topTwo = topTwo * peak + window.innerHeight / 2;
                    topTwo -= topTwo % 10;

                    for(var j = 0; j < colors.length; j++) {

                        context.fillStyle = colors[colors.length - 1 - j];

                        context.fillRect(left, (maxHeight / 2 - (heightOne / colors.length * j)) + topOne, width, heightOne / colors.length);

                        context.fillRect(left, (maxHeight / 2 - (heightTwo / colors.length * j)) + topTwo, width, heightTwo / colors.length);
                    }

                }

                // Draw sub and space ship..
                if(subInFront) {
                    context.drawImage(sub, left - 50, topOne - 60);
                    context.drawImage(ship, left - 50, topTwo - 40);
                } else {
                    context.drawImage(ship, left - 50, topTwo - 40);
                    context.drawImage(sub, left - 50, topOne - 60);
                }

                requestAnimationFrame(arguments.callee);

            })();
        }
    );
});

