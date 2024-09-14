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
declare const findRemoveSync: (currentDir: string, options?: Options, currentLevel?: number) => Record<string, boolean>;
export default findRemoveSync;
