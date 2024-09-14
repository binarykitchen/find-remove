import fs from "fs";
import path from "path";
import { rimrafSync } from "rimraf";

let now: number | undefined;
let testRun: boolean | undefined;

interface Options {
  test?: boolean;
  limit?: number;
  totalRemoved?: number;
  maxLevel?: number;
  dir?: string | string[];
  regex?: boolean;
  prefix?: string;
  ignore?: string | string[];
  extensions?: string | string[];
  files?: string | string[];
  age?: {
    seconds?: number;
  };
}

function isOlder(path: string, ageSeconds: number) {
  if (!now) return false;
  const stats = fs.statSync(path);
  const mtime = stats.mtime.getTime();
  const expirationTime = mtime + ageSeconds * 1000;

  return now > expirationTime;
}

function getLimit(options: Options = {}) {
  if (options.limit !== undefined) {
    return options.limit;
  }

  return -1;
}

function getTotalRemoved(options: Options = {}) {
  if (options.totalRemoved !== undefined) {
    return options.totalRemoved;
  }

  return -2;
}

function isOverTheLimit(options: Options = {}) {
  return getTotalRemoved(options) >= getLimit(options);
}

function getMaxLevel(options: Options = {}) {
  if (options.maxLevel !== undefined) {
    return options.maxLevel;
  }

  return -1;
}

function getAgeSeconds(options: Options = {}) {
  return options.age && options.age.seconds ? options.age.seconds : null;
}

function doDeleteDirectory(
  currentDir: string,
  options: Options = {},
  currentLevel: number,
) {
  let doDelete = false;

  const dir = options.dir;

  if (dir) {
    const ageSeconds = getAgeSeconds(options);
    const basename = path.basename(currentDir);

    if (Array.isArray(dir)) {
      doDelete = dir.indexOf("*") !== -1 || dir.indexOf(basename) !== -1;
    } else if (
      (options.regex && basename.match(new RegExp(dir))) ||
      basename === dir ||
      dir === "*"
    ) {
      doDelete = true;
    }

    if (doDelete && options.limit !== undefined) {
      doDelete = !isOverTheLimit(options);
    }

    if (doDelete && options.maxLevel !== undefined && currentLevel > 0) {
      doDelete = currentLevel <= getMaxLevel(options);
    }

    if (ageSeconds && doDelete) {
      doDelete = isOlder(currentDir, ageSeconds);
    }
  }

  return doDelete;
}

function doDeleteFile(currentFile: string, options: Options = {}) {
  // by default it deletes nothing
  let doDelete = false;

  const extensions = options.extensions ? options.extensions : null;
  const files = options.files ? options.files : null;
  const prefix = options.prefix ? options.prefix : null;
  const ignore = options && options.ignore ? options.ignore : null;

  // return the last portion of a path, the filename aka basename
  const basename = path.basename(currentFile);

  if (files) {
    if (Array.isArray(files)) {
      doDelete = files.indexOf("*.*") !== -1 || files.indexOf(basename) !== -1;
    } else {
      if ((options.regex && basename.match(new RegExp(files))) || files === "*.*") {
        doDelete = true;
      } else {
        doDelete = basename === files;
      }
    }
  }

  if (!doDelete && extensions) {
    const currentExt = path.extname(currentFile);

    if (Array.isArray(extensions)) {
      doDelete = extensions.indexOf(currentExt) !== -1;
    } else {
      doDelete = currentExt === extensions;
    }
  }

  if (!doDelete && prefix) {
    doDelete = basename.indexOf(prefix) === 0;
  }

  if (doDelete && options.limit !== undefined) {
    doDelete = !isOverTheLimit(options);
  }

  if (doDelete && ignore) {
    if (Array.isArray(ignore)) {
      doDelete = !(ignore.indexOf(basename) !== -1);
    } else {
      doDelete = !(basename === ignore);
    }
  }

  if (doDelete) {
    const ageSeconds = getAgeSeconds(options);

    if (ageSeconds) {
      doDelete = isOlder(currentFile, ageSeconds);
    }
  }

  return doDelete;
}

/**
 * FindRemoveSync(currentDir, options) takes any start directory and searches files from there for removal.
 * the selection of files for removal depends on the given options. when no options are given, or only the maxLevel
 * parameter is given, then everything is removed as if there were no filters.
 *
 * Beware: everything happens synchronously.
 *
 *
 * @param {string} currentDir any directory to operate within. it will seek files and/or directories recursively from there.
 * beware that it deletes the given currentDir when no options or only the maxLevel parameter are given.
 * @param options json object with optional properties like extensions, files, ignore, maxLevel and age.seconds.
 * @return {Object} json object of files and/or directories that were found and successfully removed.
 * @api public
 */
const findRemoveSync = function (
  currentDir: string,
  options: Options = {},
  currentLevel?: number,
) {
  let removed: Record<string, boolean> = {};

  if (!isOverTheLimit(options) && fs.existsSync(currentDir)) {
    const maxLevel = getMaxLevel(options);
    let deleteDirectory = false;

    if (options.limit !== undefined) {
      options.totalRemoved =
        options.totalRemoved !== undefined ? getTotalRemoved(options) : 0;
    }

    if (currentLevel === undefined) {
      currentLevel = 0;
    } else {
      currentLevel++;
    }

    if (currentLevel < 1) {
      now = new Date().getTime();
      testRun = options.test;
    } else {
      // check directories before deleting files inside.
      // this to maintain the original creation time,
      // because linux modifies creation date of folders when files within have been deleted.
      deleteDirectory = doDeleteDirectory(currentDir, options, currentLevel);
    }

    if (maxLevel === -1 || currentLevel < maxLevel) {
      const filesInDir = fs.readdirSync(currentDir);

      filesInDir.forEach(function (file) {
        const currentFile = path.join(currentDir, file);
        let skip = false;
        let stat;

        try {
          stat = fs.statSync(currentFile);
        } catch (exc) {
          // ignore
          skip = true;
        }

        if (skip) {
          // ignore, do nothing
        } else if (stat?.isDirectory()) {
          // the recursive call
          const result = findRemoveSync(currentFile, options, currentLevel);

          // merge results
          removed = Object.assign({}, removed, result);

          if (options.totalRemoved !== undefined) {
            options.totalRemoved += Object.keys(result).length;
          }
        } else {
          if (doDeleteFile(currentFile, options)) {
            let unlinked;

            if (!testRun) {
              try {
                fs.unlinkSync(currentFile);
                unlinked = true;
              } catch (exc) {
                // ignore
              }
            } else {
              unlinked = true;
            }

            if (unlinked) {
              removed[currentFile] = true;

              if (options.totalRemoved !== undefined) {
                options.totalRemoved++;
              }
            }
          }
        }
      });
    }

    if (deleteDirectory) {
      if (!testRun) {
        rimrafSync(currentDir);
      }

      if (options.totalRemoved === undefined) {
        // for limit of files - we do not want to count the directories
        removed[currentDir] = true;
      }
    }
  }

  return removed;
};

export default findRemoveSync;
