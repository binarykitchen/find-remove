'use strict';

var   fs = require('fs')
    , path = require('path')
    , merge = require('fmerge')
    , util = require('util');

/**
 * findRemove(currentDir, options) takes any start directory and searches files from there for removal.
 * the selection of files for removal depends on the given options. when no options are given,
 * everything is removed as if there were no filters.
 * 
 * beware: everything happens synchronous.
 *
 *
 * @param {String} currentDir any directory to operate within. it will find files, directories recursively from there.
 * it also deletes the given currentDir.
 * @param options json object with two properties: extensions and/or files. both can be a string or an array with multiple values.
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
var findRemove = function(currentDir, options) {
    
    var removed = {};

    if (fs.existsSync(currentDir)) {
        
        var extensions = (options && options.extensions) ? options.extensions : null;
        var files      = (options && options.files) ? options.files : null;

        var   currentExt
            , doDelete
            , filesInDir = fs.readdirSync(currentDir);

        filesInDir.forEach(function(file) {

            var currentFile = path.join(currentDir, file);

            if (fs.statSync(currentFile).isDirectory()) {
                // the recursive call 
                var result = findRemove(currentFile, options);
                
                // merge results
                removed = merge(removed, result);
            } else {
                // by default it deletes anything unless there are options
                doDelete = !extensions && !files;

                if (extensions) {
                    currentExt = path.extname(currentFile);

                    if (util.isArray(extensions))
                        doDelete = extensions.indexOf(currentExt) !== -1;
                    else
                        doDelete = (currentExt === extensions);
                } 
                
                if (!doDelete && files) {
                    if (util.isArray(files))
                        doDelete = files.indexOf(file) !== -1;
                    else
                        doDelete = (file === files);
                }

                if (doDelete) {
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
};


/**
 * convenient function to delete anything recursively from the given directory onwards including the given directory.
 * it does the same as findRemove('directory').
 * 
 * why the f*** i added this function you may ask? just because of the name. findRemove() does not say it is
 * deleting stuff recursively.
 *
 * @param {String} dir any directory to begin with the recurse deletion. it deletes all files and directories from there,
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
var removeAll = function(dir) {
    return findRemove(dir, null);
};

module.exports.removeAll  = removeAll;
module.exports.findRemove = findRemove;