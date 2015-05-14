# find-remove

[![Build Status](https://travis-ci.org/binarykitchen/find-remove.png?branch=master)](https://travis-ci.org/binarykitchen/find-remove)

recursively finds files by filter options from a start directory onwards and deletes these. useful if you want to clean up a directory in your node.js app.

you can filter by extensions, names, level in directory structure and file creation date yeah!

## installation

to install find-remove, use [npm](http://github.com/isaacs/npm):

    $ npm install find-remove

then in your node.js app, get reference to the function like that:

```javascript
var findRemoveSync = require('find-remove');
```

## quick examples

### delete all *.bak and *.log files within the /temp/ directory

```javascript
var result = findRemoveSync('/temp', {extensions: ['.bak', '.log']});
```

the return value `result` is a json object with successfully deleted files. if you output `result` to the console, you will get something like this:

```
{
    '/tmp/haumiblau.bak': true,
    '/tmp/dump.log': true
}
```

### delete all files called 'dump.log' within the /temp/ directory and any of its subfolders

```javascript
var result = findRemoveSync(rootDirectory, {files: 'dump.log'});
```

### same as above but do not delete file 'haumiblau.bak'

```javascript
var result = findRemoveSync(rootDirectory, {files: 'dump.log', ignore: 'haumiblau.bak'});
```

### delete recursively all files called 'dump.log' AND also all files with the extension '.dmp'  within /temp/

```javascript
var result = findRemoveSync('/tmp', {files: 'dump.log', extension: '.dmp'});
```

### delete recursively all directories called 'CVS' within /dist/

```javascript
var result = findRemoveSync('/dist', {dir: 'CVS'});
```

### delete everything inside AND including the /temp directory

just call it without options because no options means nothing is filtered.

```javascript
var result = findRemoveSync('/tmp');
```

### delete all jpg files older than one hour

```javascript
var result = findRemoveSync('/tmp', {age: {seconds: 3600}, extensions: '.jpg'});
```

### apply filter options only for two levels inside the /temp directory

```javascript
var result = findRemoveSync('/tmp', {maxLevel: 2, extensions: '.tmp'});
```

this deletes any `.tmp` files up to two levels, for example:
/tmp/level1/level2/a.tmp

but not:
/tmp/level1/level2/level3/b.tmp

why the heck do we have this option? because of performance. if you do not care about deep subfolders, apply that option to get a speed boost.

## api

### findRemoveSync(dir, options)

findRemoveSync takes any start directory and searches files from there for removal. the selection of files for removal depends on the given options. and at last, it deletes the selected files/directories.

__arguments__

* dir - any directory to search for files for deletion
* options - currently two properties are supported:
    * files - can be a string or an array of files you want to delete within `dir`. also `*.*` is allowed here if you want to remove all files (but not directories).
    * dir - can be a string or an array of directories you want to delete within `dir`.
    * extensions - this too, can be a string or an array of file extenstions you want to delete within `dir`
    * ignore - useful to exclude some files. again, can be a string or an array of file names you do NOT want to delete within `dir`
    * age.seconds - can be any float number. findRemoveSync then compares it with the file stats and deletes those with creation times older than `age.seconds`
    * maxLevel - advanced: limits filtering to a certain level. useful for performance. recommended for crawling huge directory trees.
    * test - advanced: set to true for a test run, meaning it does not delete anything but returns an array of files/directories it would have deleted.

when no options are given, are undefined or null, then everything including directories are removed as if there were no filters. this also applies when only the `maxLevel` parameter is given.

__returns__

associative array of files/directories that were deleted.

## todo

* add more filtering options (combinations, regex,  etc.)
* have an asynchronous solution
* use streams instead

## license

MIT
