var lame = require('lame'),
    fs = require('fs'),
    path = require('path'),
    q = require('q');

var cache = {};

exports.analyze = function(filePath) {

    var fullPath = path.resolve(filePath),
        readStream = fs.createReadStream(fullPath),
        parser = lame.createParser(),
        formOne = [],
        formTwo = [],
        result = q.defer(),
        header,
        id3;

    if(cache[fullPath])
        result.resolve(cache[fullPath])
    else {

        readStream.on(
            'data',
            function(data) {

                parser.write(data);
            }
        );

        readStream.on(
            'end',
            function() {

                parser.end();
            }
        );

        parser.on(
            'header',
            function(data, meta) {

                header = meta;
            }
        );

        parser.on(
            'id3v2',
            function(data) {

                id3 = data;
            }
        );

        parser.on(
            'id3v1',
            function(data) {

                id3 = id3 || data;
            }
        );

        parser.on(
            'frame',
            function(data) {

                //var bitrate = header.bitrateKBPS / 10,
                var bitrate = 16,
                    frequency = header.sampleRateHz,
                    byteSize = bitrate / 8,
                    bytes = [],
                    convert = function(byteOne, byteTwo) {

                        return byteOne + byteTwo * 256;
                    },
                    out,
                    temp;

                for(var i = 0; i < byteSize; i+=32) {
                    
                    bytes.push(data.readFloatLE(i));
                }

                temp = bytes[1] & 128 ? 0 : 128;

                temp = (bytes[1] & 127) + temp;

                out = Math.floor(convert(bytes[0], temp) / 256);

                //formOne.push(data[9]);
                //formTwo.push(data[11]);
                
                formOne.push(data.readUInt8(9) % 128 / 128 * 256);
                formTwo.push(data[9]);

            }
        );

        parser.on(
            'end',
            function() {

                result.resolve(cache[fullPath] = { header: header, formOne: formOne, formTwo: formTwo, id3: id3.toString() });
            }
        );
    }

    return result.promise;
};


