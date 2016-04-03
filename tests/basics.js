var testCase     = require('nodeunit').testCase,
    randomstring = require('randomstring'),
    mkdirp       = require('mkdirp'),
    path         = require('path'),
    fs           = require('fs'),
    async        = require('async'),
    rimraf       = require('rimraf'),
    findRemoveSync;

var rootDirectory = path.join(require('os').tmpDir(), 'find-remove');

function generateRandomFilename(ext) {
    var filename = randomstring.generate(24);

    if (ext)
        filename += '.' + ext;

    return filename;
}

/*
 pre defined directories:
    + rootDirectory

        * randomFile1 (*.bak)
        * randomFile2 (*.log)
        * randomFile3 (*.log)

        + directory1
            + directory1_1
            + directory1_2
                + directory1_2_1
                    * randomFile1_2_1_1 (*.log)
                    * randomFile1_2_1_2 (*.bak)
                    * randomFile1_2_1_3 (*.bak)
                    * fixFile1_2_1_4 (something.jpg)
                    * fixFile1_2_1_5 (something.png)
                + directory1_2_2
            + CVS (directory1_3)
                * randomFile1_3_1
        + directory2
            * randomFile2_1 (*.bak)
        + CVS (directory3)
            * randomFile3_1

 */

var directory1 = path.join(rootDirectory, 'directory1');
var directory2 = path.join(rootDirectory, 'directory2');
var directory3 = path.join(rootDirectory, 'CVS');

var directory1_1 = path.join(directory1, 'directory1_1');
var directory1_2 = path.join(directory1, 'directory1_2');
var directory1_3 = path.join(directory1, 'CVS');

var directory1_2_1 = path.join(directory1_2, 'directory1_2_1');
var directory1_2_2 = path.join(directory1_2, 'directory1_2_2');

// mix of pre defined and random file names
var randomFilename1 = generateRandomFilename('bak');
var randomFile1 = path.join(rootDirectory, randomFilename1);
var randomFilename2 = generateRandomFilename('log');
var randomFile2 = path.join(rootDirectory, randomFilename2);
var randomFile3 = path.join(rootDirectory, generateRandomFilename('log'));

var randomFile2_1 = path.join(directory2, generateRandomFilename('bak'));

var randomFilename1_2_1_1 = generateRandomFilename('log');
var randomFile1_2_1_1 = path.join(directory1_2_1, randomFilename1_2_1_1);
var randomFile1_2_1_2 = path.join(directory1_2_1, generateRandomFilename('bak'));
var randomFilename1_2_1_3 = generateRandomFilename('bak');
var randomFile1_2_1_3 = path.join(directory1_2_1, randomFilename1_2_1_3);

var fixFilename1_2_1_4 = 'something.jpg';
var fixFile1_2_1_4 = path.join(directory1_2_1, fixFilename1_2_1_4);
var fixFilename1_2_1_5 = 'something.png';
var fixFile1_2_1_5 = path.join(directory1_2_1, fixFilename1_2_1_5);

function makeFile(file, callback) {
    fs.writeFile(file, '', function(err) {
        if (err)
            callback(err);
        else
            callback(null);
    })
}

function createFakeDirectoryTree(callback) {

    async.series(
        [
            function(callback) {mkdirp(directory1, callback);},
            function(callback) {mkdirp(directory2, callback);},

            function(callback) {mkdirp(directory1_1, callback);},
            function(callback) {mkdirp(directory1_2, callback);},

            function(callback) {mkdirp(directory1_2_1, callback);},
            function(callback) {mkdirp(directory1_2_2, callback);},

            function(callback) {makeFile(randomFile1, callback);},
            function(callback) {makeFile(randomFile2, callback);},
            function(callback) {makeFile(randomFile3, callback);},

            function(callback) {makeFile(randomFile2_1, callback);},

            function(callback) {makeFile(randomFile1_2_1_1, callback);},
            function(callback) {makeFile(randomFile1_2_1_2, callback);},
            function(callback) {makeFile(randomFile1_2_1_3, callback);},
            function(callback) {makeFile(fixFile1_2_1_4, callback);},
            function(callback) {makeFile(fixFile1_2_1_5, callback);}
        ],

        function(err) {
            if (err) {
                console.error(err);
            } else {
                callback();
            }
        }
    );
}

function destroyFakeDirectoryTree(callback) {
    rimraf(rootDirectory, callback);
}

module.exports = testCase({

    'TC 1: tests without real files': testCase({
        'loading findRemoveSync function (require)': function(t) {
            findRemoveSync = require('../find-remove.js');

            t.ok(findRemoveSync, 'findRemoveSync is loaded.');
            t.done();
        },

        'removing non-existing directory': function(t) {
            var result, dir = generateRandomFilename();

            result = findRemoveSync(dir);
            t.strictEqual(Object.keys(result).length, 0, 'findRemoveSync() returned empty an array.');

            t.done();
        }
    }),

    'TC 2: tests with real files': testCase({
        setUp: function(callback) {
            createFakeDirectoryTree(callback);
        },
        tearDown: function(callback) {
            destroyFakeDirectoryTree(callback);
        },

        'findRemoveSync(rootDirectory)': function(t) {
            findRemoveSync(rootDirectory);

            var exists = fs.existsSync(rootDirectory);
            t.equal(exists, false, 'findRemoveSync(rootDirectory) removed everything fine');

            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);
            t.equal(exists1_2_1_3, false, 'findRemoveSync(rootDirectory) also removed randomFile1_2_1_3 fine');

            t.done();
        },

        'findRemoveSync(directory1_2_1)': function(t) {
            var result = findRemoveSync(directory1_2_1);

            var exists1_2_1 = fs.existsSync(directory1_2_1);
            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_2_1, false, 'findRemoveSync(directory1_2_1) removed everything fine');
            t.equal(exists1_1, true, 'findRemoveSync(directory1_2_1) did not remove exists1_1');

            t.ok(result[randomFile1_2_1_1], 'randomFile1_2_1_1 is in result');
            t.ok(result[randomFile1_2_1_2], 'randomFile1_2_1_2 is in result');
            t.ok(result[randomFile1_2_1_3], 'randomFile1_2_1_3 is in result');
            t.ok(result[directory1_2_1], 'directory1_2_1 is in result');

            t.done();
        },

        'findRemoveSync(directory2)': function(t) {
            var result = findRemoveSync(directory2);

            var exists2 = fs.existsSync(directory2);
            var exists1_2 = fs.existsSync(directory1_2);
            t.equal(exists2, false, 'findRemoveSync(directory2) removed everything fine');
            t.equal(exists1_2, true, 'findRemoveSync(directory2) did not remove directory1_2');

            t.ok(result[randomFile2_1], 'randomFile2_1 is in result');

            t.strictEqual(typeof result[randomFile1], 'undefined', 'randomFile1_2_1_2 is NOT in result');
            t.strictEqual(typeof result[randomFile1_2_1_3], 'undefined', 'randomFile1_2_1_3 is NOT in result');

            t.done();
        },

        'findRemoveSync(all bak files from root)': function(t) {
            findRemoveSync(rootDirectory, {extensions: '.bak'});

            var exists1 = fs.existsSync(randomFile1);
            var exists2_1 = fs.existsSync(randomFile2_1);
            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);

            t.equal(exists1, false, 'findRemoveSync(all bak files from root) removed randomFile1 fine');
            t.equal(exists2_1, false, 'findRemoveSync(all bak files from root) removed exists2_1 fine');
            t.equal(exists1_2_1_2, false, 'findRemoveSync(all bak files from root) removed exists1_2_1_2 fine');
            t.equal(exists1_2_1_3, false, 'findRemoveSync(all bak files from root) removed exists1_2_1_3 fine');

            var exists3 = fs.existsSync(randomFile3);
            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            var exists0 = fs.existsSync(rootDirectory);
            var exists1_2_1 = fs.existsSync(directory1_2_1);

            t.equal(exists3, true, 'findRemoveSync(all bak files from root) did not remove log file exists3');
            t.equal(exists1_2_1_1, true, 'findRemoveSync(all bak files from root) did not remove log file exists1_2_1_1');
            t.equal(exists0, true, 'findRemoveSync(all bak files from root) did not remove root directory');
            t.equal(exists1_2_1, true, 'findRemoveSync(all bak files from root) did not remove directory directory1_2_1');

            t.done();
        },

        'findRemoveSync(all log files from directory1_2_1)': function(t) {
            findRemoveSync(directory1_2_1, {extensions: '.log'});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(all log files from directory1_2_1) removed randomFile1_2_1_1 fine');

            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            t.equal(exists1_2_1_2, true, 'findRemoveSync(all log files from directory1_2_1) did not remove file randomFile1_2_1_2');

            var exists1_2_1 = fs.existsSync(directory1_2_1);
            t.equal(exists1_2_1, true, 'findRemoveSync(all log files from directory1_2_1) did not remove directory directory1_2_1');

            t.done();
        },

        'findRemoveSync(all bak and log files from root)': function(t) {
            findRemoveSync(rootDirectory, {extensions: ['.bak', '.log']});

            var exists1 = fs.existsSync(randomFile1);
            var exists2_1 = fs.existsSync(randomFile2_1);
            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);

            var exists2 = fs.existsSync(randomFile2);
            var exists3 = fs.existsSync(randomFile3);
            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);

            t.equal(exists1, false, 'findRemoveSync(all bak and log files from root) removed randomFile1 fine');
            t.equal(exists2_1, false, 'findRemoveSync(all bak and log files from root) removed exists2_1 fine');
            t.equal(exists1_2_1_2, false, 'findRemoveSync(all bak and log files from root) removed exists1_2_1_2 fine');
            t.equal(exists1_2_1_3, false, 'findRemoveSync(all bak and log files from root) removed exists1_2_1_3 fine');

            t.equal(exists2, false, 'findRemoveSync(all bak and log files from root) removed exists2 fine');
            t.equal(exists3, false, 'findRemoveSync(all bak and log files from root) removed exists3 fine');
            t.equal(exists1_2_1_1, false, 'findRemoveSync(all bak and log files from root) removed exists1_2_1_1 fine');

            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_1, true, 'findRemoveSync(all bak and log files from root) did not remove directory1_1');

            t.done();
        },

        'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2)': function(t) {
            findRemoveSync(directory1_2, {files: randomFilename1_2_1_1});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) removed randomFile1_2_1_1 fine');

            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            t.equal(exists1_2_1_2, true, 'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove randomFile1_2_1_2');

            var exists1_2 = fs.existsSync(directory1_2);
            t.equal(exists1_2, true, 'findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove directory1_2');

            t.done();
        },

        'findRemoveSync(two files from root)': function(t) {
            findRemoveSync(rootDirectory, {files: [randomFilename2, randomFilename1_2_1_3]});

            var exists2 = fs.existsSync(randomFile2);
            t.equal(exists2, false, 'findRemoveSync(two files from root) removed randomFile2 fine');

            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);
            t.equal(exists1_2_1_3, false, 'findRemoveSync(two files from root) removed randomFile1_2_1_3 fine');

            var exists1 = fs.existsSync(randomFile1);
            t.equal(exists1, true, 'findRemoveSync(two files from root) did not remove randomFile1');

            var exists0 = fs.existsSync(rootDirectory);
            t.equal(exists0, true, 'findRemoveSync(two files from root) did not remove root directory');

            t.done();
        },

        'findRemoveSync(files set to *.*)': function(t) {
            findRemoveSync(directory1_2_1, {files: '*.*'});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(files set to *.*) removed randomFile1_2_1_1 fine');

            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            t.equal(exists1_2_1_2, false, 'findRemoveSync(files set to *.*) removed randomFile1_2_1_2 fine');

            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);
            t.equal(exists1_2_1_3, false, 'findRemoveSync(files set to *.*) removed randomFile1_2_1_3 fine');

            var exists1_2_1 = fs.existsSync(directory1_2_1);
            t.equal(exists1_2_1, true, 'findRemoveSync(files set to *.* did not remove directory1_2_1');

            t.done();
        },

        'findRemoveSync(with mixed ext and file params)': function(t) {
            var result = findRemoveSync(rootDirectory, {files: randomFilename1, extensions: ['.log']});

            var exists1 = fs.existsSync(randomFile1);
            var exists2 = fs.existsSync(randomFile2);
            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1, false, 'findRemoveSync(with mixed ext and file params) removed randomFile1 fine');
            t.equal(exists2, false, 'findRemoveSync(with mixed ext and file params) removed randomFile2 fine');
            t.equal(exists1_2_1_1, false, 'findRemoveSync(with mixed ext and file params) removed randomFile1_2_1_1 fine');

            var exists1_2_1 = fs.existsSync(directory1_2_1);
            t.equal(exists1_2_1, true, 'findRemoveSync(two files from root) did not remove directory1_2_1');

            t.strictEqual(typeof result[randomFile1], 'boolean', 'randomFile1 in result is boolean');
            t.strictEqual(typeof result[randomFile1_2_1_2], 'undefined', 'randomFile1_2_1_2 is NOT in result');

            t.done();
        },

        'findRemoveSync(with ignore param only)': function(t) {
            var result = findRemoveSync(rootDirectory, {ignore: fixFilename1_2_1_4});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(with ignore) did remove file randomFile1_2_1_1');
            t.equal(exists1_2_1_4, true, 'findRemoveSync(with ignore) did not remove file fixFile1_2_1_4');
            t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 in result is boolean');
            t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result');

            t.done();
        },

        'findRemoveSync(with ignore and jpg extension params)': function(t) {
            var result = findRemoveSync(rootDirectory, {ignore: fixFilename1_2_1_4, extensions: '.jpg'});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4);
            t.equal(exists1_2_1_1, true, 'findRemoveSync(with ignore + jpg extension) did not remove file randomFile1_2_1_1');
            t.equal(exists1_2_1_4, true, 'findRemoveSync(with ignore + jpg extension) did not remove file fixFile1_2_1_4');
            t.strictEqual(typeof result[randomFile1_2_1_1], 'undefined', 'randomFile1_2_1_1 is NOT in result');
            t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result');

            t.done();
        },

        'findRemoveSync(with multiple ignore)': function(t) {
            var result = findRemoveSync(rootDirectory, {ignore: [fixFilename1_2_1_4, fixFilename1_2_1_5]});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4);
            var exists1_2_1_5 = fs.existsSync(fixFile1_2_1_5);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(with multiple ignore) did remove file randomFile1_2_1_1');
            t.equal(exists1_2_1_4, true, 'findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_4');
            t.equal(exists1_2_1_5, true, 'findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_5');
            t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 is in result');
            t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result');
            t.strictEqual(typeof result[fixFile1_2_1_5], 'undefined', 'fixFile1_2_1_5 is NOT in result');

            t.done();
        },

        'findRemoveSync(with ignore and bak extension params)': function(t) {
            var result = findRemoveSync(rootDirectory, {ignore: fixFilename1_2_1_4, extensions: '.bak'});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2);
            var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4);
            t.equal(exists1_2_1_1, true, 'findRemoveSync(with ignore + bak extension) did not remove file randomFile1_2_1_1');
            t.equal(exists1_2_1_2, false, 'findRemoveSync(with ignore + bak extension) did remove file randomFile1_2_1_2');
            t.equal(exists1_2_1_4, true, 'findRemoveSync(with ignore + bak extension) did not remove file fixFile1_2_1_4');
            t.strictEqual(typeof result[randomFile1_2_1_1], 'undefined', 'randomFile1_2_1_1 is NOT in result');
            t.strictEqual(typeof result[randomFile1_2_1_2], 'boolean', 'randomFile1_2_1_2 is in result');
            t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result');

            t.done();
        },

        'findRemoveSync(two files and check others)': function(t) {
            var result = findRemoveSync(rootDirectory, {files: [randomFilename1_2_1_1, randomFilename1_2_1_3]});

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1_2_1_1, false, 'findRemoveSync(two files and check others) removed randomFile1_2_1_1 fine');

            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);
            t.equal(exists1_2_1_3, false, 'findRemoveSync(two files and check others) removed randomFile1_2_1_3 fine');

            var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4);
            t.equal(exists1_2_1_4, true, 'findRemoveSync(two files and check others) did not remove fixFile1_2_1_4');

            var exists1_2_1_5 = fs.existsSync(fixFile1_2_1_5);
            t.equal(exists1_2_1_5, true, 'findRemoveSync(two files and check others) did not remove fixFile1_2_1_5');

            t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 is in result');
            t.strictEqual(typeof result[randomFile1_2_1_3], 'boolean', 'randomFile1_2_1_3 is in result');
            t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result');
            t.strictEqual(typeof result[fixFile1_2_1_5], 'undefined', 'fixFile1_2_1_5 is NOT in result');

            t.done();
        },

        'findRemoveSync(limit to maxLevel = 0)': function(t) {
            var result = findRemoveSync(rootDirectory, {maxLevel: 0});

            t.strictEqual(Object.keys(result).length, 0, 'findRemoveSync(limit to maxLevel = 0) returned empty an array.');

            t.done();
        },

        'findRemoveSync(limit to maxLevel = 1)': function(t) {
            var result = findRemoveSync(rootDirectory, {maxLevel: 1});

            t.strictEqual(Object.keys(result).length, 5, 'findRemoveSync(limit to maxLevel = 1) returned 5 entries.');

            t.done();
        },

        'findRemoveSync(limit to maxLevel = 2)': function(t) {
            var result = findRemoveSync(rootDirectory, {maxLevel: 2});

            t.strictEqual(Object.keys(result).length, 8, 'findRemoveSync(limit to maxLevel = 2) returned 8 entries.');

            t.done();
        },

        'findRemoveSync(limit to maxLevel = 3)': function(t) {
            var result = findRemoveSync(rootDirectory, {maxLevel: 3});

            t.strictEqual(Object.keys(result).length, 10, 'findRemoveSync(limit to maxLevel = 3) returned 10 entries.');

            t.done();
        },

        'findRemoveSync(limit to maxLevel = 3 + bak only)': function(t) {
            var result = findRemoveSync(rootDirectory, {maxLevel: 2, extensions: '.bak'});

            t.strictEqual(Object.keys(result).length, 2, 'findRemoveSync(limit to maxLevel = 3 + bak only) returned 2 entries.');

            t.done();
        },

        'findRemoveSync(single dir)': function(t) {
            findRemoveSync(rootDirectory, {dir: 'directory1_2'});

            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_1, true, 'findRemoveSync(single dir) did not remove directory1_1');

            var exists1_2 = fs.existsSync(directory1_2);
            t.equal(exists1_2, false, 'findRemoveSync(single dir) removed directory1_2');

            t.done();
        },

        'findRemoveSync(two directories)': function(t) {
            findRemoveSync(rootDirectory, {dir: ['directory1_1', 'directory1_2']});

            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_1, false, 'findRemoveSync(remove single dir) removed directory1_1');

            var exists1_2 = fs.existsSync(directory1_2);
            t.equal(exists1_2, false, 'findRemoveSync(remove single dir) removed directory1_2');

            t.done();
        },

        'findRemoveSync(directories with the same basename)': function(t) {
            findRemoveSync(rootDirectory, {dir: 'CVS'});

            var exists1_3 = fs.existsSync(directory1_3);
            t.equal(exists1_3, false, 'findRemoveSync(directories with the same basename) removed root/directory1/CVS');

            var exists3 = fs.existsSync(directory3);
            t.equal(exists3, false, 'findRemoveSync(directories with the same basename) removed root/CVS');

            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_1, true, 'findRemoveSync(remove single dir) did not remove directory1_1');

            var exists1_2 = fs.existsSync(directory1_2);
            t.equal(exists1_2, true, 'findRemoveSync(remove single dir) did not remove directory1_2');

            t.done();
        },

        'findRemoveSync(test run)': function(t) {
            var result = findRemoveSync(rootDirectory, {test: true});

            t.strictEqual(Object.keys(result).length, 9, 'findRemoveSync(test run) returned 9 entries.');

            var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1);
            t.equal(exists1_2_1_1, true, 'findRemoveSync(test run) did not remove randomFile1_2_1_1');

            var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3);
            t.equal(exists1_2_1_3, true, 'findRemoveSync(test run) did not remove randomFile1_2_1_3');

            var exists1_1 = fs.existsSync(directory1_1);
            t.equal(exists1_1, true, 'findRemoveSync(test run) did not remove directory1_1');

            t.done();
        }
    }),

    'TC 3: age checks': testCase({

        setUp: function(callback) {
            createFakeDirectoryTree(callback);
        },
        tearDown: function(callback) {
            destroyFakeDirectoryTree(callback);
        },

        'findRemoveSync(files older than 10000000000000000 sec)': function(t) {
            var result = findRemoveSync(rootDirectory, {age: {seconds: 10000000000000000}});

            t.strictEqual(Object.keys(result).length, 0, 'findRemoveSync(files older than 10000000000000000 sec) returned zero entries.');

            t.done();
        },

        'findRemoveSync(files older than 10 sec)': function(t) {
            var result = findRemoveSync(rootDirectory, {age: {seconds: 10}});

            t.strictEqual(Object.keys(result).length, 0, 'findRemoveSync(files older than 10 sec) returned zero entries.');

            t.done();
        },

        'findRemoveSync(files older than .0005 sec)': function(t) {
            var result = findRemoveSync(rootDirectory, {age: {seconds: 0.0005}});

            t.strictEqual(Object.keys(result).length, 15, 'findRemoveSync(files older than .0005 sec) returned 15 entries.');

            t.done();
        },

        'findRemoveSync(files older than 2 sec with wait)': function(t) {
            setTimeout(function() {
                var result = findRemoveSync(rootDirectory, {age: {seconds: 2}});

                t.strictEqual(Object.keys(result).length, 15, 'findRemoveSync(files older than 2 sec with wait) returned 15 entries.');

                t.done();
            }, 2100);
        },

        'findRemoveSync(files older than 2 sec with wait + maxLevel = 1)': function(t) {
            setTimeout(function() {
                var result = findRemoveSync(rootDirectory, {maxLevel: 1, age: {seconds: 2}});

                t.strictEqual(Object.keys(result).length, 5, 'findRemoveSync(files older than 2 sec with wait + maxLevel = 1) returned 5 entries.');

                t.done();
            }, 2100);
        }
    })
});
