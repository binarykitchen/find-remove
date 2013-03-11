# find-delete

recursively finds files by filter options from a start directory onwards and deletes these. useful if you want to clean up a directory in your node.js app.

## installation
    
to install find-delete, use [npm](http://github.com/isaacs/npm):

    $ npm install find-delete

## quick examples

### delete all *.bak and *.log files within the /temp/ directory:

```javascript
var result = findRemove('/temp', {extensions: ['.bak', '.log']});
```

the return value 'result' is a json object with successfully deleted files. if you output `result` to the console, you will get something like this:

```
{
    '/tmp/haumiblau.bak': true,
    '/tmp/dump.log': true 
}
```

### delete all files called 'dump.log' within the /temp/ directory and any of its subfolders:

```javascript
var result = findRemove(rootDirectory, {files: 'dump.log'});
```

### delete recursively all files called 'dump.log' AND also all files with the extension '.dmp'  within '/temp/':

```javascript
var result = findRemove('/tmp', {files: 'dump.log', extension: '.dmp'});
```

### delete everything inside AND including the /temp directory

just call it without parameters so that there are no filters:

```javascript
var result = findRemove('/tmp', null);
```

or there is a nicer function for your majesty:

```javascript
var result = removeAll('/tmp');
```

## api

### findRemove(dir, options)

findRemove takes any start directory and searches files from there for removal. the selection of files for removal depends on the given options.
 
__Arguments__

* dir - any directory to search for files for deletion
* options - currently two properties are supported:
    * files - can be a string or an array of files you want to delete within 'dir'
    * extensions - this too, can be a string or an array of file extenstions you want to delete within 'dir'

when no options are given, everything is removed as if there were no filters.

### removeAll(dir)

removeAll is just a convenient function and does the same like 'findRemove(dir, null)' - it deletes everything including 'dir' in cold blood. **you have been warned.**
 
__arguments__

* dir - any directory to delete with all its subfolders and files within.

## todo

* add more filtering options (combinations, regex,  etc.)
* have an asynchronous solution

## license

MIT
