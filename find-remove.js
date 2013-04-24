module.exports = findRemoveSync;

var   fs = require('fs')
    , path = require('path')
    , merge = require('fmerge')
    , util = require('util');

/**
 * findRemoveSync(currentDir, options) takes any start directory and searches files from there for removal.
 * the selection of files for removal depends on the given options. when no options are given,
 * everything is removed as if there were no filters.
 * 
 * beware: everything happens synchronously. 
 *
 *
 * @param {String} currentDir any directory to operate within. it will find files, directories recursively from there.
 * it also deletes the given currentDir.
 * @param options json object with three properties: extensions, files and ignore. they can be a string or an array with multiple values.
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
function findRemoveSync(currentDir, options) {
    
    var removed = {};

    if (fs.existsSync(currentDir)) {       

        var filesInDir = fs.readdirSync(currentDir);

        filesInDir.forEach(function(file) {

            var currentFile = path.join(currentDir, file);

            if (fs.statSync(currentFile).isDirectory()) {
                // the recursive call 
                var result = findRemoveSync(currentFile, options);
                
                // merge results
                removed = merge(removed, result);
            } else {
                
                if (doDelete(currentFile, options)) {
                    fs.unlinkSync(currentFile);
                    removed[currentFile] = true;
                }
            }
        });

        // when no option is given, delete directory.
        // because all the options are file-related.
        if (!options) {
            fs.rmdirSync(currentDir);
            removed[currentDir] = true;
        }
    }
    
    return removed;
}

function doDelete(currentFile, options) {
    
    var extensions = (options && options.extensions) ? options.extensions : null;    
    var files      = (options && options.files) ? options.files : null;
    var ignore     = (options && options.ignore) ? options.ignore : null;

    // return the last portion of a path, the filename aka basename
    var basename = path.basename(currentFile);
    
    // by default it deletes anything
    var doDelete = !extensions && !files;

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
        else {
            doDelete = !(basename === ignore);
        }
    }
    
    return doDelete;
}