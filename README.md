# find-remove

finally in typescript (since v5)

recursively finds files by filter options from a start directory onwards and deletes only those which meet conditions you can define. useful if you want to clean up a directory in your node.js app.

you can filter by extensions, names, level in directory structure, file creation date and ignore by name, yeah!

## installation

to install find-remove, use [npm](http://github.com/isaacs/npm):

    $ npm install -S find-remove

then in your node.js app, get reference to the function like that:

```ts
import findRemoveSync from "find-remove";
```

## quick examples

### 1. delete all _.bak or _.log files within the /temp/ directory

```ts
const result = findRemoveSync("/temp", { extensions: [".bak", ".log"] });
```

the return value `result` is a json object with successfully deleted files. if you output `result` to the console, you will get something like this:

```
{
    '/tmp/haumiblau.bak': true,
    '/tmp/dump.log': true
}
```

### 2. delete all files called 'dump.log' within the /temp/ directory and within its subfolders

```ts
const result = findRemoveSync("/temp", { files: "dump.log" });
```

### 3. same as above, but also deletes any subfolders

```ts
const result = findRemoveSync("/temp", { files: "dump.log", dir: "*" });
```

### 4. delete all \*.bak files but not file 'haumiblau.bak'

```ts
const result = findRemoveSync("/temp", { extensions: [".bak"], ignore: "haumiblau.bak" });
```

### 5. delete recursively any subdirectory called 'CVS' within /dist/

```ts
const result = findRemoveSync("/dist", { dir: "CVS" });
```

### 6. delete all jpg files older than one hour with limit of 100 files deletion per operation

```ts
const result = findRemoveSync("/tmp", {
  age: { seconds: 3600 },
  extensions: ".jpg",
  limit: 100,
});
```

### 7. delete all files with prefix 'filenamestartswith'

```javascript
const result = findRemoveSync("/tmp", { prefix: "filenamestartswith" });
```

### 8. apply filter options only for two levels inside the /temp directory for all tmp files

```ts
const result = findRemoveSync("/tmp", { maxLevel: 2, extensions: ".tmp" });
```

this deletes any `.tmp` files up to two levels, for example: `/tmp/level1/level2/a.tmp`

but not `/tmp/level1/level2/level3/b.tmp`

why the heck do we have this `maxLevel` option? because of performance. if you care about deep subfolders, apply that option to get a speed boost.

### 9. delete everything recursively (hey, who needs that when you can use nodejs' fs.unlink?)

```ts
const result = findRemoveSync(rootDirectory, { dir: "*", files: "*.*" });
```

### 10. delete all files that match a regular expression

```ts
const result = findRemoveSync(rootDirectory, { files: "example[1-3]", regex: true });
```

this deletes files `example1.txt`, `example2.txt`, and `example3.txt`, but not `example8.txt`.

### 11. delete all directories that match a regular expression

```ts
const result = findRemoveSync(rootDirectory, { dir: "^assets_", regex: true });
```

this deletes all directories that start with `assets_`.

## api

### findRemoveSync(dir, options)

findRemoveSync takes any start directory and searches files from there for removal. the selection of files for removal depends on the given options. and at last, it deletes the selected files/directories.

**arguments**

- `dir` - any directory to search for files and/or directories for deletion (does not delete that directory itself)
- options - currently those properties are supported:
  - `files` - can be a string or an array of files you want to delete within `dir`.
  - `dir` - can be a string or an array of directories you want to delete within `dir`.
  - `extensions` - this too, can be a string or an array of file extensions you want to delete within `dir`.
  - `ignore` - useful to exclude some files. again, can be a string or an array of file names you do NOT want to delete within `dir`
  - `age.seconds` - can be any float number. findRemoveSync then compares it with the file stats and deletes those with modification times older than `age.seconds`
  - `limit` - can be any integer number. Will limit the number of <b>files</b> to be deleted at single operation to be `limit`
  - `prefix` - can be any string. Will delete any files that start with `prefix`.
  - `maxLevel` - advanced: limits filtering to a certain level. useful for performance. recommended for crawling huge directory trees.
  - `test` - advanced: set to true for a test run, meaning it does not delete anything but returns a JSON of files/directories it would have deleted. useful for testing.
  - `regex` - set to true to treat `files` or `dir` option strings as regular expression patterns.

as a precaution, nothing happens when there are no options.

the unit tests are good examples on how to use the above arguments.

**returns**

JSON of files/directories that were deleted. For limit option - will only return number of files deleted.

## todo

- add more filtering options (e.g. combinations)
- have an asynchronous solution
- use streams instead

## license

MIT
