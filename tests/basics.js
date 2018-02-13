var testCase     = require('nodeunit').testCase,
    randomstring = require('randomstring'),
    mkdirp       = require('mkdirp'),
    path         = require('path'),
    fs           = require('fs'),
    async        = require('async'),
    rimraf       = require('rimraf'),
    findRemoveAsync

var rootDirectory = path.join(require('os').tmpDir(), 'find-remove')

function generateRandomFilename(ext) {
    var filename = randomstring.generate(24)

    if (ext)
        filename += '.' + ext

    return filename
}

/*
 pre defined directories:
    + rootDirectory

        * randomFile1 (*.bak)
        * randomFile2 (*.log)
        * randomFile3 (*.log)
        * randomFile4 (*.csv)

        + CVS (directory3)
        + directory1
            + CVS (directory1_3)
            + directory1_1
            + directory1_2
                + directory1_2_1
                    * randomFile1_2_1_1 (*.log)
                    * randomFile1_2_1_2 (*.bak)
                    * randomFile1_2_1_3 (*.bak)
                    * fixFile1_2_1_4 (something.jpg)
                    * fixFile1_2_1_5 (something.png)
                + directory1_2_2
        + directory2
            * randomFile2_1 (*.bak)
            * randomFile2_2 (*.csv)
 */

var directory1 = path.join(rootDirectory, 'directory1')
var directory2 = path.join(rootDirectory, 'directory2')
var directory3 = path.join(rootDirectory, 'CVS')

var directory1_1 = path.join(directory1, 'directory1_1')
var directory1_2 = path.join(directory1, 'directory1_2')
var directory1_3 = path.join(directory1, 'CVS')

var directory1_2_1 = path.join(directory1_2, 'directory1_2_1')
var directory1_2_2 = path.join(directory1_2, 'directory1_2_2')

// mix of pre defined and random file names
var randomFilename1 = generateRandomFilename('bak')
var randomFile1 = path.join(rootDirectory, randomFilename1)
var randomFilename2 = generateRandomFilename('log')
var randomFile2 = path.join(rootDirectory, randomFilename2)
var randomFile3 = path.join(rootDirectory, generateRandomFilename('log'))
var randomFile4 = path.join(rootDirectory, generateRandomFilename('csv'))

var randomFile2_1 = path.join(directory2, generateRandomFilename('bak'))
var randomFile2_2 = path.join(directory2, generateRandomFilename('csv'))

var randomFilename1_2_1_1 = generateRandomFilename('log')
var randomFile1_2_1_1 = path.join(directory1_2_1, randomFilename1_2_1_1)
var randomFile1_2_1_2 = path.join(directory1_2_1, generateRandomFilename('bak'))
var randomFilename1_2_1_3 = generateRandomFilename('bak')
var randomFile1_2_1_3 = path.join(directory1_2_1, randomFilename1_2_1_3)

var fixFilename1_2_1_4 = 'something.jpg'
var fixFile1_2_1_4 = path.join(directory1_2_1, fixFilename1_2_1_4)
var fixFilename1_2_1_5 = 'something.png'
var fixFile1_2_1_5 = path.join(directory1_2_1, fixFilename1_2_1_5)

function makeFile(file, cb) {
    fs.writeFile(file, '', function(err) {
        if (err)
            cb(err)
        else
            cb(null)
    })
}

function createFakeDirectoryTree(cb) {

    async.series(
        [
            function(cb) {mkdirp(directory1, cb)},
            function(cb) {mkdirp(directory2, cb)},
            function(cb) {mkdirp(directory3, cb)},

            function(cb) {mkdirp(directory1_1, cb)},
            function(cb) {mkdirp(directory1_2, cb)},
            function(cb) {mkdirp(directory1_3, cb)},

            function(cb) {mkdirp(directory1_2_1, cb)},
            function(cb) {mkdirp(directory1_2_2, cb)},

            function(cb) {makeFile(randomFile1, cb)},
            function(cb) {makeFile(randomFile2, cb)},
            function(cb) {makeFile(randomFile3, cb)},
            function(cb) {makeFile(randomFile4, cb)},

            function(cb) {makeFile(randomFile2_1, cb)},
            function(cb) {makeFile(randomFile2_2, cb)},

            function(cb) {makeFile(randomFile1_2_1_1, cb)},
            function(cb) {makeFile(randomFile1_2_1_2, cb)},
            function(cb) {makeFile(randomFile1_2_1_3, cb)},
            function(cb) {makeFile(fixFile1_2_1_4, cb)},
            function(cb) {makeFile(fixFile1_2_1_5, cb)}
        ],

        function(err) {
            if (err) {
                console.error(err)
            } else {
                cb()
            }
        }
    )
}

function destroyFakeDirectoryTree(cb) {
    rimraf(rootDirectory, cb)
}

module.exports = testCase({

    'TC 1: tests without real files': testCase({
        'loading findRemoveAsync function (require)': function(t) {
            findRemoveAsync = require('../find-remove.js')

            t.ok(findRemoveAsync, 'findRemoveAsync is loaded.')
            t.done()
        },

        'removing non-existing directory': function(t) {
            var result, dir = generateRandomFilename()

            result = findRemoveAsync(dir).then(() => {

                t.strictEqual(Object.keys(result).length, 0, 'returned empty')

                t.done()
            });
        }
    }),

    'TC 2: tests with real files': testCase({

        setUp: function(cb) {
            createFakeDirectoryTree(cb)
        },
        tearDown: function(cb) {
            destroyFakeDirectoryTree(cb)
        },

        'findRemoveAsync(nonexisting)': function(t) {
            findRemoveAsync('/tmp/blahblah/hehehe/yo/what/').then((result) => {
                t.strictEqual(Object.keys(result).length, 0, 'did nothing.')

                t.done()
            }).catch((err) => {
                console.log(err);
            })
        },

        'findRemoveAsync(no params)': function(t) {
            findRemoveAsync(rootDirectory).then((result) => {

                t.strictEqual(Object.keys(result).length, 0, 'did nothing.')

                var exists = fs.existsSync(rootDirectory)
                t.equal(exists, true, 'did not remove root directory')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'findRemoveAsync(no params) did not remove directory1_1')

                t.done()
            })
        },

        'findRemoveAsync(all files)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*"}).then((result) => {
                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'did not remove directory1_1')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, false, 'removed randomFile1_2_1_2 fine')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'removed randomFile1_2_1_3 fine')

                t.done()
            })
        },

        'findRemoveAsync(all directories)': function(t) {
            findRemoveAsync(rootDirectory, {dir: "*"}).then((result) => {

                t.strictEqual(Object.keys(result).length, 8, 'all 8 directories deleted')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, false, 'removed directory1_1')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, false, 'removed randomFile1_2_1_2')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'removed randomFile1_2_1_3')

                t.done()
            })
        },

        'findRemoveAsync(everything)': function(t) {
            findRemoveAsync(rootDirectory, {dir: "*", files: "*.*"}).then((result) => {

                t.strictEqual(Object.keys(result).length, 19, 'all 19 directories + files deleted')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, false, 'removed directory1_1')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, false, 'did not remove randomFile1_2_1_2 fine')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'dit not remove randomFile1_2_1_3 fine')

                t.done()
            })
        },

        'findRemoveAsync(files no hit)': function(t) {
            findRemoveAsync(rootDirectory, {files: "no.hit.me"}).then((result) => {

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'did not remove directory1_1')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, true, 'did not remove randomFile1_2_1_3')

                t.done()
            })
        },

        'findRemoveAsync(directory1_2_1)': function(t) {
            findRemoveAsync(rootDirectory, {dir: 'directory1_2_1'}).then((result) => {

                var exists1_2_1 = fs.existsSync(directory1_2_1)
                t.equal(exists1_2_1, false, 'did remove directory1_2_1')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'did not remove directory1_1')

                t.done()
            })
        },


        'findRemoveAsync(one directory and all files)': function(t) {
            findRemoveAsync(rootDirectory, {dir: 'directory1_2_1', files: '*.*'}).then((result) => {

                var exists1_2_1 = fs.existsSync(directory1_2_1)
                t.equal(exists1_2_1, false, 'did remove directory1_2_1')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'did not remove directory1_1')

                t.ok(result[randomFile1_2_1_1], 'randomFile1_2_1_1 is in result')
                t.ok(result[randomFile1_2_1_2], 'randomFile1_2_1_2 is in result')
                t.ok(result[randomFile1_2_1_3], 'randomFile1_2_1_3 is in result')
                t.ok(result[directory1_2_1], 'directory1_2_1 is in result')

                t.done()
            })
        },

        'findRemoveAsync(another directory and all files)': function(t) {
            findRemoveAsync(rootDirectory, {dir: 'directory2', files: '*.*'}).then((result) => {

                var exists2 = fs.existsSync(directory2)
                t.equal(exists2, false, 'directory2 not removed')

                var exists1_2 = fs.existsSync(directory1_2)
                t.equal(exists1_2, true, 'directory1_2 not removed')

                t.ok(result[randomFile2_1], 'randomFile2_1 is in result')

                t.done()
            })
        },

        'findRemoveAsync(all bak files from root)': function(t) {
            findRemoveAsync(rootDirectory, {extensions: '.bak'}).then(() => {

                var exists1 = fs.existsSync(randomFile1)
                var exists2_1 = fs.existsSync(randomFile2_1)
                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)

                t.equal(exists1, false, 'findRemoveAsync(all bak files from root) removed randomFile1 fine')
                t.equal(exists2_1, false, 'findRemoveAsync(all bak files from root) removed exists2_1 fine')
                t.equal(exists1_2_1_2, false, 'findRemoveAsync(all bak files from root) removed exists1_2_1_2 fine')
                t.equal(exists1_2_1_3, false, 'findRemoveAsync(all bak files from root) removed exists1_2_1_3 fine')

                var exists3 = fs.existsSync(randomFile3)
                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                var exists0 = fs.existsSync(rootDirectory)
                var exists1_2_1 = fs.existsSync(directory1_2_1)

                t.equal(exists3, true, 'findRemoveAsync(all bak files from root) did not remove log file exists3')
                t.equal(exists1_2_1_1, true, 'findRemoveAsync(all bak files from root) did not remove log file exists1_2_1_1')
                t.equal(exists0, true, 'findRemoveAsync(all bak files from root) did not remove root directory')
                t.equal(exists1_2_1, true, 'findRemoveAsync(all bak files from root) did not remove directory directory1_2_1')

                t.done()
            })
        },

        'findRemoveAsync(all log files from directory1_2_1)': function(t) {
            findRemoveAsync(directory1_2_1, {extensions: '.log'}).then(() => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(all log files from directory1_2_1) removed randomFile1_2_1_1 fine')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, true, 'findRemoveAsync(all log files from directory1_2_1) did not remove file randomFile1_2_1_2')

                var exists1_2_1 = fs.existsSync(directory1_2_1)
                t.equal(exists1_2_1, true, 'findRemoveAsync(all log files from directory1_2_1) did not remove directory directory1_2_1')

                t.done()
            });
        },

        'findRemoveAsync(all bak or log files from root)': function(t) {
            findRemoveAsync(rootDirectory, {extensions: ['.bak', '.log']}).then(() => {

                var exists1 = fs.existsSync(randomFile1)
                var exists2_1 = fs.existsSync(randomFile2_1)
                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)

                var exists2 = fs.existsSync(randomFile2)
                var exists3 = fs.existsSync(randomFile3)
                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)

                t.equal(exists1, false, 'findRemoveAsync(all bak and log files from root) removed randomFile1 fine')
                t.equal(exists2_1, false, 'findRemoveAsync(all bak and log files from root) removed exists2_1 fine')
                t.equal(exists1_2_1_2, false, 'findRemoveAsync(all bak and log files from root) removed exists1_2_1_2 fine')
                t.equal(exists1_2_1_3, false, 'findRemoveAsync(all bak and log files from root) removed exists1_2_1_3 fine')

                t.equal(exists2, false, 'findRemoveAsync(all bak and log files from root) removed exists2 fine')
                t.equal(exists3, false, 'findRemoveAsync(all bak and log files from root) removed exists3 fine')
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(all bak and log files from root) removed exists1_2_1_1 fine')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'findRemoveAsync(all bak and log files from root) did not remove directory1_1')

                t.done()
            })
        },

        'findRemoveAsync(filename randomFilename1_2_1_1 from directory1_2)': function(t) {
            findRemoveAsync(directory1_2, {files: randomFilename1_2_1_1}).then(() => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(filename randomFilename1_2_1_1 from directory1_2) removed randomFile1_2_1_1 fine')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, true, 'findRemoveAsync(filename randomFilename1_2_1_1 from directory1_2) did not remove randomFile1_2_1_2')

                var exists1_2 = fs.existsSync(directory1_2)
                t.equal(exists1_2, true, 'findRemoveAsync(filename randomFilename1_2_1_1 from directory1_2) did not remove directory1_2')

                t.done()
            })
        },

        'findRemoveAsync(two files from root)': function(t) {
            findRemoveAsync(rootDirectory, {files: [randomFilename2, randomFilename1_2_1_3]}).then((result) => {

                var exists2 = fs.existsSync(randomFile2)
                t.equal(exists2, false, 'findRemoveAsync(two files from root) removed randomFile2 fine')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'findRemoveAsync(two files from root) removed randomFile1_2_1_3 fine')

                var exists1 = fs.existsSync(randomFile1)
                t.equal(exists1, true, 'findRemoveAsync(two files from root) did not remove randomFile1')

                var exists0 = fs.existsSync(rootDirectory)
                t.equal(exists0, true, 'findRemoveAsync(two files from root) did not remove root directory')

                t.done()
            })
        },

        'findRemoveAsync(files set to *.*)': function(t) {
            findRemoveAsync(directory1_2_1, {files: '*.*'}).then(() => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(files set to *.*) removed randomFile1_2_1_1 fine')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, false, 'findRemoveAsync(files set to *.*) removed randomFile1_2_1_2 fine')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'findRemoveAsync(files set to *.*) removed randomFile1_2_1_3 fine')

                var exists1_2_1 = fs.existsSync(directory1_2_1)
                t.equal(exists1_2_1, true, 'findRemoveAsync(files set to *.* did not remove directory1_2_1')

                t.done()
            })
        },

        'findRemoveAsync(with mixed ext and file params)': function(t) {
            findRemoveAsync(rootDirectory, {files: randomFilename1, extensions: ['.log']}).then((result) => {

                var exists1 = fs.existsSync(randomFile1)
                var exists2 = fs.existsSync(randomFile2)
                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1, false, 'findRemoveAsync(with mixed ext and file params) removed randomFile1 fine')
                t.equal(exists2, false, 'findRemoveAsync(with mixed ext and file params) removed randomFile2 fine')
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(with mixed ext and file params) removed randomFile1_2_1_1 fine')

                var exists1_2_1 = fs.existsSync(directory1_2_1)
                t.equal(exists1_2_1, true, 'did not remove directory1_2_1')

                t.strictEqual(typeof result[randomFile1], 'boolean', 'randomFile1 in result is boolean')
                t.strictEqual(typeof result[randomFile1_2_1_2], 'undefined', 'randomFile1_2_1_2 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(with ignore param)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", ignore: fixFilename1_2_1_4}).then((result) => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(with ignore) did remove file randomFile1_2_1_1')

                var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4)
                t.equal(exists1_2_1_4, true, 'file fixFile1_2_1_4 not removed')

                t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 in result is boolean')
                t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(with ignore and jpg extension params)': function(t) {
            findRemoveAsync(rootDirectory, {ignore: fixFilename1_2_1_4, extensions: '.jpg'}).then((result) => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4)
                t.equal(exists1_2_1_1, true, 'findRemoveAsync(with ignore + jpg extension) did not remove file randomFile1_2_1_1')
                t.equal(exists1_2_1_4, true, 'findRemoveAsync(with ignore + jpg extension) did not remove file fixFile1_2_1_4')
                t.strictEqual(typeof result[randomFile1_2_1_1], 'undefined', 'randomFile1_2_1_1 is NOT in result')
                t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(with multiple ignore)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", ignore: [fixFilename1_2_1_4, fixFilename1_2_1_5]}).then((result) => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(with multiple ignore) did remove file randomFile1_2_1_1')

                var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4)
                t.equal(exists1_2_1_4, true, 'findRemoveAsync(with multiple ignore) did not remove file fixFile1_2_1_4')

                var exists1_2_1_5 = fs.existsSync(fixFile1_2_1_5)
                t.equal(exists1_2_1_5, true, 'findRemoveAsync(with multiple ignore) did not remove file fixFile1_2_1_5')

                t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 is in result')
                t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result')
                t.strictEqual(typeof result[fixFile1_2_1_5], 'undefined', 'fixFile1_2_1_5 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(with ignore and bak extension params)': function(t) {
            findRemoveAsync(rootDirectory, {ignore: fixFilename1_2_1_4, extensions: '.bak'}).then((result) => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, true, 'findRemoveAsync(with ignore + bak extension) did not remove file randomFile1_2_1_1')

                var exists1_2_1_2 = fs.existsSync(randomFile1_2_1_2)
                t.equal(exists1_2_1_2, false, 'findRemoveAsync(with ignore + bak extension) did remove file randomFile1_2_1_2')

                var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4)
                t.equal(exists1_2_1_4, true, 'findRemoveAsync(with ignore + bak extension) did not remove file fixFile1_2_1_4')

                t.strictEqual(typeof result[randomFile1_2_1_1], 'undefined', 'randomFile1_2_1_1 is NOT in result')
                t.strictEqual(typeof result[randomFile1_2_1_2], 'boolean', 'randomFile1_2_1_2 is in result')
                t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(two files and check others)': function(t) {
            findRemoveAsync(rootDirectory, {files: [randomFilename1_2_1_1, randomFilename1_2_1_3]}).then((result) => {

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, false, 'findRemoveAsync(two files and check others) removed randomFile1_2_1_1 fine')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, false, 'findRemoveAsync(two files and check others) removed randomFile1_2_1_3 fine')

                var exists1_2_1_4 = fs.existsSync(fixFile1_2_1_4)
                t.equal(exists1_2_1_4, true, 'findRemoveAsync(two files and check others) did not remove fixFile1_2_1_4')

                var exists1_2_1_5 = fs.existsSync(fixFile1_2_1_5)
                t.equal(exists1_2_1_5, true, 'findRemoveAsync(two files and check others) did not remove fixFile1_2_1_5')

                t.strictEqual(typeof result[randomFile1_2_1_1], 'boolean', 'randomFile1_2_1_1 is in result')
                t.strictEqual(typeof result[randomFile1_2_1_3], 'boolean', 'randomFile1_2_1_3 is in result')
                t.strictEqual(typeof result[fixFile1_2_1_4], 'undefined', 'fixFile1_2_1_4 is NOT in result')
                t.strictEqual(typeof result[fixFile1_2_1_5], 'undefined', 'fixFile1_2_1_5 is NOT in result')

                t.done()
            })
        },

        'findRemoveAsync(limit to maxLevel = 0)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", maxLevel: 0}).then((result) => {

                t.strictEqual(Object.keys(result).length, 0, 'findRemoveAsync(limit to maxLevel = 0) returned empty an array.')

                t.done()
            })
        },

        'findRemoveAsync(limit to maxLevel = 1)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", maxLevel: 1}).then((result) => {

                t.strictEqual(Object.keys(result).length, 7, 'findRemoveAsync(limit to maxLevel = 1) returned 7 entries.')

                t.done()
            })
        },

        'findRemoveAsync(limit to maxLevel = 2)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", maxLevel: 2}).then((result) => {

                t.strictEqual(Object.keys(result).length, 12, 'findRemoveAsync(limit to maxLevel = 2) returned 12 entries.')

                t.done()
            })
        },

        'findRemoveAsync(limit to maxLevel = 3)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", maxLevel: 3}).then((result) => {

                t.strictEqual(Object.keys(result).length, 6, 'findRemoveAsync(limit to maxLevel = 3) returned 6 entries.')

                t.done()
            })
        },

        'findRemoveAsync(limit to maxLevel = 3 + bak only)': function(t) {
            findRemoveAsync(rootDirectory, {maxLevel: 3, extensions: '.bak'}).then((result) => {

                t.strictEqual(Object.keys(result).length, 2, 'findRemoveAsync(limit to maxLevel = 3 + bak only) returned 2 entries.')

                t.done()
            })
        },

        'findRemoveAsync(single dir)': function(t) {
            findRemoveAsync(rootDirectory, {dir: 'directory1_2'}).then((result) => {

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'findRemoveAsync(single dir) did not remove directory1_1')

                var exists1_2 = fs.existsSync(directory1_2)
                t.equal(exists1_2, false, 'findRemoveAsync(single dir) removed directory1_2')

                t.done()
            })
        },

        'findRemoveAsync(two directories)': function(t) {
            findRemoveAsync(rootDirectory, {dir: ['directory1_1', 'directory1_2']}).then(() => {

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, false, 'findRemoveAsync(remove single dir) removed directory1_1')

                var exists1_2 = fs.existsSync(directory1_2)
                t.equal(exists1_2, false, 'findRemoveAsync(remove single dir) removed directory1_2')

                t.done()
            })
        },

        'findRemoveAsync(directories with the same basename)': function(t) {
            findRemoveAsync(rootDirectory, {dir: 'CVS'}).then(() => {

                var exists1_3 = fs.existsSync(directory1_3)
                t.equal(exists1_3, false, 'findRemoveAsync(directories with the same basename) removed root/directory1/CVS')

                var exists3 = fs.existsSync(directory3)
                t.equal(exists3, false, 'findRemoveAsync(directories with the same basename) removed root/CVS')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'findRemoveAsync(remove single dir) did not remove directory1_1')

                var exists1_2 = fs.existsSync(directory1_2)
                t.equal(exists1_2, true, 'findRemoveAsync(remove single dir) did not remove directory1_2')

                t.done()
            })
        },

        'findRemoveAsync(test run)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", test: true}).then((result) => {

                t.strictEqual(Object.keys(result).length, 19, 'findRemoveAsync(test run) returned 19 entries.')

                var exists1_2_1_1 = fs.existsSync(randomFile1_2_1_1)
                t.equal(exists1_2_1_1, true, 'findRemoveAsync(test run) did not remove randomFile1_2_1_1')

                var exists1_2_1_3 = fs.existsSync(randomFile1_2_1_3)
                t.equal(exists1_2_1_3, true, 'findRemoveAsync(test run) did not remove randomFile1_2_1_3')

                var exists1_1 = fs.existsSync(directory1_1)
                t.equal(exists1_1, true, 'findRemoveAsync(test run) did not remove directory1_1')

                t.done()
            })
        }
    }),

    'TC 3: age checks': testCase({

        setUp: function(cb) {
            createFakeDirectoryTree(cb)
        },
        tearDown: function(cb) {
            destroyFakeDirectoryTree(cb)
        },

        'findRemoveAsync(files and dirs older than 10000000000000000 sec)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", age: {seconds: 10000000000000000}}).then((result) => {

                t.strictEqual(Object.keys(result).length, 0, 'findRemoveAsync(files older than 10000000000000000 sec) returned zero entries.')

                t.done()
            })
        },

        'findRemoveAsync(files and dirs older than 10 sec)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", age: {seconds: 10}}).then((result) => {

                t.strictEqual(Object.keys(result).length, 0, 'findRemoveAsync(files older than 10 sec) returned zero entries.')

                t.done()
            })
        },

        'findRemoveAsync(files older than .0005 sec)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", age: {seconds: 0.0005}}).then((result) => {

                t.strictEqual(Object.keys(result).length, 11, 'findRemoveAsync(files older than .0005 sec) returned 11 entries.')

                t.done()
            })
        },

        'findRemoveAsync(files and dirs older than .0005 sec)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", age: {seconds: 0.0005}}).then((result) => {

                t.strictEqual(Object.keys(result).length, 19, 'findRemoveAsync(files older than .0005 sec) returned 19 entries.')

                t.done()
            })
        },

        'findRemoveAsync(files older than 2 sec with wait)': function(t) {
            setTimeout(function() {
                findRemoveAsync(rootDirectory, {files: "*.*", age: {seconds: 2}}).then((result) => {

                    t.strictEqual(Object.keys(result).length, 11, 'findRemoveAsync(files older than 2 sec with wait) returned 11 entries.')

                    t.done()
                })
            }, 2100)
        },

        'findRemoveAsync(files older than 2 sec with wait + maxLevel = 1)': function(t) {
            setTimeout(function() {
                findRemoveAsync(rootDirectory, {files: "*.*", maxLevel: 1, age: {seconds: 2}}).then((result) => {

                    t.strictEqual(Object.keys(result).length, 4, 'findRemoveAsync(files older than 2 sec with wait + maxLevel = 1) returned 4 entries.')

                    t.done()
                })
            }, 2100)
        }
    }),

    'TC 4: github issues': testCase({

        setUp: function(cb) {
            createFakeDirectoryTree(cb)
        },
        tearDown: function(cb) {
            destroyFakeDirectoryTree(cb)
        },

        // from https://github.com/binarykitchen/find-remove/issues/7
        'findRemoveAsync(issues/7a)': function(t) {
            setTimeout(function() {
                findRemoveAsync(rootDirectory, {age: {seconds: 2}, extensions: '.csv'}).then((result) => {

                    t.strictEqual(Object.keys(result).length, 2, 'findRemoveAsync(issues/7) deleted 2 files.')

                    t.done()
                })
            }, 3 * 1000)
        },

        // from https://github.com/binarykitchen/find-remove/issues/7
        'findRemoveAsync(issues/7b)': function(t) {
            findRemoveAsync(rootDirectory, {extensions: '.dontexist'}).then((result) => {

                t.deepEqual(result, {}, 'is an empty json')

                t.done()
            })
        }
    }),

    'TC 5: limit checks': testCase({

        setUp: function(cb) {
            createFakeDirectoryTree(cb)
        },
        tearDown: function(cb) {
            destroyFakeDirectoryTree(cb)
        },

        'findRemoveAsync(files older than .0005 sec with limit of 2)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", age: {seconds: 0.0005}, limit: 2}).then((result) => {

                t.strictEqual(Object.keys(result).length, 2, 'findRemoveAsync(files older than .0005 sec with limit of 2) returned 2 entries (out of 11).')

                t.done()
            })
        },

        'findRemoveAsync(files and dirs older than .0005 sec with limit of 5)': function(t) {
            findRemoveAsync(rootDirectory, {files: "*.*", dir: "*", age: {seconds: 0.0005}, limit: 5}).then((result) => {

                t.strictEqual(Object.keys(result).length, 5, 'findRemoveAsync(files and dirs older than .0005 sec with limit of 5) returned 5 entries (out of 19).')

                t.done()
            })
        }

    }),

    'TC 6: prefix checks': testCase({

        setUp: function(cb) {
            createFakeDirectoryTree(cb)
        },
        tearDown: function(cb) {
            destroyFakeDirectoryTree(cb)
        },

        'findRemoveAsync(files with exiting prefix "someth")': function(t) {
            findRemoveAsync(rootDirectory, {prefix: "someth"}).then((result) => {

                t.strictEqual(Object.keys(result).length, 2, 'findRemoveAsync(files with prefix "someth") returned 2 entries (out of 11).')

                t.done()
            })
        },

        'findRemoveAsync(files with non-existing prefix "ssssssssssssssssssssssssss" - too many chars)': function(t) {
            findRemoveAsync(rootDirectory, {prefix: "ssssssssssssssssssssssssss"}).then((result) => {

                t.strictEqual(Object.keys(result).length, 0, 'findRemoveAsync(files with non-existing prefix "ssssssssssssssssssssssssss"- too many chars) returned 0 entries (out of 11).')

                t.done()
            })
        }

    })
})
