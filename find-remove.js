var fs      = require('fs'),
    path    = require('path'),
    merge   = require('fmerge'),
    util    = require('util'),
    rimraf  = require('rimraf'),
    now,
    testRun

function isOlder(path, ageSeconds) {
    var stats = fs.statSync(path),
        mtime = stats.mtime.getTime()

    return (mtime + (ageSeconds * 1000)) < now;
}

function getMaxLevel(options) {
    return (options && options.hasOwnProperty('maxLevel')) ? options.maxLevel : -1;
}

function getAgeSeconds(options) {
    return (options && options.age && options.age.seconds) ? options.age.seconds : null;
}

function doDeleteDirectory(currentDir, options, currentLevel) {

    var dir          = (options && options.dir) ? options.dir : null;
    var optionsCount = options ? Object.keys(options).length : 0;
    var doDelete     = optionsCount < 1;

    var basename = path.basename(currentDir);

    if (!doDelete && dir) {
        if (util.isArray(dir))
            doDelete = dir.indexOf(basename) !== -1;
        else {
            doDelete = (basename === dir);
        }
    }

    if (!doDelete && currentLevel > 0) {

        if (options.maxLevel && optionsCount === 1) {

            var maxLevel = getMaxLevel(options);
            doDelete = currentLevel <= maxLevel;

        } else {
            var ageSeconds = getAgeSeconds(options);

            if (ageSeconds)
                doDelete = isOlder(currentDir, ageSeconds);
        }
    }

    return doDelete;
}

function doDeleteFile(currentFile, options) {

    var extensions = (options && options.extensions) ? options.extensions : null;
    var files      = (options && options.files) ? options.files : null;
    var dir        = (options && options.dir) ? options.dir : null;
    var ignore     = (options && options.ignore) ? options.ignore : null;

    // return the last portion of a path, the filename aka basename
    var basename = path.basename(currentFile);

    // by default it deletes anything
    var doDelete = !extensions && !files && !dir;

    if (!doDelete && extensions) {
        var currentExt = path.extname(currentFile);

        if (util.isArray(extensions))
            doDelete = extensions.indexOf(currentExt) !== -1;
        else
            doDelete = (currentExt === extensions);
    }

    if (!doDelete && files) {
        if (util.isArray(files))
            doDelete = files.indexOf(basename) !== -1;
        else {
            if (files === '*.*')
                doDelete = true;
            else
                doDelete = (basename === files);
        }
    }

    if (doDelete && ignore) {
        if (util.isArray(ignore))
            doDelete = !(ignore.indexOf(basename) !== -1);
        else
            doDelete = !(basename === ignore);
    }

    if (doDelete) {
        var ageSeconds = getAgeSeconds(options);

        if (ageSeconds)
            doDelete = isOlder(currentFile, ageSeconds);
    }

    return doDelete;
}

function isTestRun(options) {
    return (options && options.hasOwnProperty('test')) ? options.test : false;
}

/**
 * findRemoveSync(currentDir, options) takes any start directory and searches files from there for removal.
 * the selection of files for removal depends on the given options. when no options are given, or only the maxLevel
 * parameter is given, then everything is removed as if there were no filters.
 *
 * beware: everything happens synchronously.
 *
 *
 * @param {String} currentDir any directory to operate within. it will seek files and/or directories recursively from there.
 * beware that it deletes the given currentDir when no options or only the maxLevel parameter are given.
 * @param options json object with optional properties like extensions, files, ignore, maxLevel and age.seconds.
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
var findRemoveSync = module.exports = function(currentDir, options, currentLevel) {

    var removed = [];

    if (fs.existsSync(currentDir)) {

        var maxLevel = getMaxLevel(options);

        if (currentLevel === undefined)
            currentLevel = 0;
        else
            currentLevel++;

        if (currentLevel < 1) {
            now = new Date().getTime();
            testRun = isTestRun(options);
        }

        // check directore before deleting files inside to maintain the original creation time, because
        // linux modifies creation date of folders when files have been deleted inside.
        var deleteDirectory = doDeleteDirectory(currentDir, options, currentLevel);

        if (maxLevel === -1 || currentLevel < maxLevel) {
            var filesInDir = fs.readdirSync(currentDir);

            filesInDir.forEach(function(file) {

                var currentFile = path.join(currentDir, file);

                if (fs.statSync(currentFile).isDirectory()) {
                    // the recursive call
                    var result = findRemoveSync(currentFile, options, currentLevel);

                    // merge results
                    removed = merge(removed, result);
                } else {

                    if (doDeleteFile(currentFile, options)) {
                        if (!testRun)
                            fs.unlinkSync(currentFile);

                        removed[currentFile] = true;
                    }
                }
            });
        }

        if (deleteDirectory) {
            try {
                if (!testRun)
                    rimraf.sync(currentDir);

                removed[currentDir] = true
            } catch (err) {
                throw err;
            }
        }
    }

    return removed;
}
