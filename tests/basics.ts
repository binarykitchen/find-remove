import test from "tape";
import randomstring from "randomstring";
import { mkdirp } from "mkdirp";
import path from "path";
import { existsSync } from "fs";
import { rimrafSync } from "rimraf";
import os from "os";

import findRemoveSync from "../src/index";
import { writeFile } from "fs/promises";

const rootDirectory = path.join(os.tmpdir(), "find-remove");

function generateRandomFilename(ext?: string) {
  let filename = randomstring.generate(24);

  if (ext) {
    filename += "." + ext;
  }

  return filename;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
        + patternDirectory_token (directory4)
        + token_patternDirectory (directory5)
 */

const directory1 = path.join(rootDirectory, "directory1");
const directory2 = path.join(rootDirectory, "directory2");
const directory3 = path.join(rootDirectory, "CVS");
const directory4 = path.join(rootDirectory, "patternDirectory_token");
const directory5 = path.join(rootDirectory, "token_patternDirectory");

const directory1_1 = path.join(directory1, "directory1_1");
const directory1_2 = path.join(directory1, "directory1_2");
const directory1_3 = path.join(directory1, "CVS");

const directory1_2_1 = path.join(directory1_2, "directory1_2_1");
const directory1_2_2 = path.join(directory1_2, "directory1_2_2");

// mix of pre defined and random file names
const randomFilename1 = generateRandomFilename("bak");
const randomFile1 = path.join(rootDirectory, randomFilename1);
const randomFilename2 = generateRandomFilename("log");
const randomFile2 = path.join(rootDirectory, randomFilename2);
const randomFile3 = path.join(rootDirectory, generateRandomFilename("log"));
const randomFile4 = path.join(rootDirectory, generateRandomFilename("csv"));

const randomFile2_1 = path.join(directory2, generateRandomFilename("bak"));
const randomFile2_2 = path.join(directory2, generateRandomFilename("csv"));

const randomFilename1_2_1_1 = generateRandomFilename("log");
const randomFile1_2_1_1 = path.join(directory1_2_1, randomFilename1_2_1_1);
const randomFile1_2_1_2 = path.join(directory1_2_1, generateRandomFilename("bak"));
const randomFilename1_2_1_3 = generateRandomFilename("bak");
const randomFile1_2_1_3 = path.join(directory1_2_1, randomFilename1_2_1_3);

const fixFilename1_2_1_4 = "something.jpg";
const fixFile1_2_1_4 = path.join(directory1_2_1, fixFilename1_2_1_4);
const fixFilename1_2_1_5 = "something.png";
const fixFile1_2_1_5 = path.join(directory1_2_1, fixFilename1_2_1_5);

async function createFakeDirectoryTree() {
  try {
    await mkdirp(directory1);
    await mkdirp(directory2);
    await mkdirp(directory3);
    await mkdirp(directory1_1);
    await mkdirp(directory1_2);
    await mkdirp(directory1_3);
    await mkdirp(directory1_2_1);
    await mkdirp(directory1_2_2);

    await writeFile(randomFile1, "");
    await writeFile(randomFile2, "");
    await writeFile(randomFile3, "");
    await writeFile(randomFile4, "");
    await writeFile(randomFile2_1, "");
    await writeFile(randomFile2_2, "");
    await writeFile(randomFile1_2_1_1, "");
    await writeFile(randomFile1_2_1_2, "");
    await writeFile(randomFile1_2_1_3, "");
    await writeFile(fixFile1_2_1_4, "");
    await writeFile(fixFile1_2_1_5, "");
  } catch (exc) {
    console.error(exc);
  }
}

async function createFakeDirectoryTreeRegex() {
  try {
    await createFakeDirectoryTree();
    await mkdirp(directory4);
    await mkdirp(directory5);
  } catch (exc) {
    console.error(exc);
  }
}

function destroyFakeDirectoryTree() {
  rimrafSync(rootDirectory);
}

test("find-remove", function (t) {
  t.test("TC 1: tests without real files", function (tt) {
    tt.test("removing non-existing directory", function (ttt) {
      const dir = generateRandomFilename();
      const result = findRemoveSync(dir);

      ttt.strictEqual(Object.keys(result).length, 0, "returned empty");

      ttt.end();
    });
  });

  t.test("TC 2: tests with real files", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    tt.test("findRemoveSync(nonexisting)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync("/tmp/blahblah/hehehe/yo/what/");

      ttt.strictEqual(Object.keys(result).length, 0, "did nothing.");

      ttt.end();
    });

    tt.test("findRemoveSync(no params)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory);

      ttt.strictEqual(Object.keys(result).length, 0, "did nothing.");

      const exists = existsSync(rootDirectory);
      ttt.equal(exists, true, "did not remove root directory");

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "findRemoveSync(no params) did not remove directory1_1");

      ttt.end();
    });

    tt.test("findRemoveSync(all files)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { files: "*.*" });

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "did not remove directory1_1");

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(exists1_2_1_2, false, "removed randomFile1_2_1_2 fine");

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(exists1_2_1_3, false, "removed randomFile1_2_1_3 fine");

      ttt.end();
    });

    tt.test("findRemoveSync(all directories)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { dir: "*" });
      ttt.strictEqual(Object.keys(result).length, 8, "all 8 directories deleted");

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, false, "removed directory1_1");

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(exists1_2_1_2, false, "removed randomFile1_2_1_2");

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(exists1_2_1_3, false, "removed randomFile1_2_1_3");

      ttt.end();
    });

    tt.test("findRemoveSync(everything)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { dir: "*", files: "*.*" });

      ttt.strictEqual(
        Object.keys(result).length,
        19,
        "all 19 directories + files deleted",
      );

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, false, "removed directory1_1");

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(exists1_2_1_2, false, "did not remove randomFile1_2_1_2 fine");

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(exists1_2_1_3, false, "dit not remove randomFile1_2_1_3 fine");

      ttt.end();
    });

    tt.test("findRemoveSync(files no hit)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { files: "no.hit.me" });

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "did not remove directory1_1");

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(exists1_2_1_3, true, "did not remove randomFile1_2_1_3");

      ttt.end();
    });

    tt.test("findRemoveSync(directory1_2_1)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { dir: "directory1_2_1" });

      const exists1_2_1 = existsSync(directory1_2_1);
      ttt.equal(exists1_2_1, false, "did remove directory1_2_1");

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "did not remove directory1_1");

      ttt.end();
    });

    tt.test("findRemoveSync(one directory and all files)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        dir: "directory1_2_1",
        files: "*.*",
      });

      const exists1_2_1 = existsSync(directory1_2_1);
      ttt.equal(exists1_2_1, false, "did remove directory1_2_1");

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "did not remove directory1_1");

      ttt.ok(result[randomFile1_2_1_1], "randomFile1_2_1_1 is in result");
      ttt.ok(result[randomFile1_2_1_2], "randomFile1_2_1_2 is in result");
      ttt.ok(result[randomFile1_2_1_3], "randomFile1_2_1_3 is in result");
      ttt.ok(result[directory1_2_1], "directory1_2_1 is in result");

      ttt.end();
    });

    tt.test("findRemoveSync(another directory and all files)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { dir: "directory2", files: "*.*" });

      const exists2 = existsSync(directory2);
      ttt.equal(exists2, false, "directory2 not removed");

      const exists1_2 = existsSync(directory1_2);
      ttt.equal(exists1_2, true, "directory1_2 not removed");

      ttt.ok(result[randomFile2_1], "randomFile2_1 is in result");

      ttt.end();
    });

    tt.test("findRemoveSync(all bak files from root)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { extensions: ".bak" });

      const exists1 = existsSync(randomFile1);
      const exists2_1 = existsSync(randomFile2_1);
      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);

      ttt.equal(
        exists1,
        false,
        "findRemoveSync(all bak files from root) removed randomFile1 fine",
      );

      ttt.equal(
        exists2_1,
        false,
        "findRemoveSync(all bak files from root) removed exists2_1 fine",
      );

      ttt.equal(
        exists1_2_1_2,
        false,
        "findRemoveSync(all bak files from root) removed exists1_2_1_2 fine",
      );

      ttt.equal(
        exists1_2_1_3,
        false,
        "findRemoveSync(all bak files from root) removed exists1_2_1_3 fine",
      );

      const exists3 = existsSync(randomFile3);
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      const exists0 = existsSync(rootDirectory);
      const exists1_2_1 = existsSync(directory1_2_1);

      ttt.equal(
        exists3,
        true,
        "findRemoveSync(all bak files from root) did not remove log file exists3",
      );

      ttt.equal(
        exists1_2_1_1,
        true,
        "findRemoveSync(all bak files from root) did not remove log file exists1_2_1_1",
      );

      ttt.equal(
        exists0,
        true,
        "findRemoveSync(all bak files from root) did not remove root directory",
      );

      ttt.equal(
        exists1_2_1,
        true,
        "findRemoveSync(all bak files from root) did not remove directory directory1_2_1",
      );

      ttt.end();
    });

    tt.test("findRemoveSync(all log files from directory1_2_1)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(directory1_2_1, { extensions: ".log" });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);

      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(all log files from directory1_2_1) removed randomFile1_2_1_1 fine",
      );

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(
        exists1_2_1_2,
        true,
        "findRemoveSync(all log files from directory1_2_1) did not remove file randomFile1_2_1_2",
      );

      const exists1_2_1 = existsSync(directory1_2_1);
      ttt.equal(
        exists1_2_1,
        true,
        "findRemoveSync(all log files from directory1_2_1) did not remove directory directory1_2_1",
      );

      ttt.end();
    });

    tt.test("findRemoveSync(all bak or log files from root)", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { extensions: [".bak", ".log"] });

      const exists1 = existsSync(randomFile1);
      const exists2_1 = existsSync(randomFile2_1);
      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);

      const exists2 = existsSync(randomFile2);
      const exists3 = existsSync(randomFile3);
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);

      ttt.equal(
        exists1,
        false,
        "findRemoveSync(all bak and log files from root) removed randomFile1 fine",
      );

      ttt.equal(
        exists2_1,
        false,
        "findRemoveSync(all bak and log files from root) removed exists2_1 fine",
      );

      ttt.equal(
        exists1_2_1_2,
        false,
        "findRemoveSync(all bak and log files from root) removed exists1_2_1_2 fine",
      );

      ttt.equal(
        exists1_2_1_3,
        false,
        "findRemoveSync(all bak and log files from root) removed exists1_2_1_3 fine",
      );

      ttt.equal(
        exists2,
        false,
        "findRemoveSync(all bak and log files from root) removed exists2 fine",
      );

      ttt.equal(
        exists3,
        false,
        "findRemoveSync(all bak and log files from root) removed exists3 fine",
      );

      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(all bak and log files from root) removed exists1_2_1_1 fine",
      );

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(
        exists1_1,
        true,
        "findRemoveSync(all bak and log files from root) did not remove directory1_1",
      );

      ttt.end();
    });

    tt.test(
      "findRemoveSync(filename randomFilename1_2_1_1 from directory1_2",
      async function (ttt) {
        await createFakeDirectoryTree();

        findRemoveSync(directory1_2, { files: randomFilename1_2_1_1 });

        const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
        ttt.equal(
          exists1_2_1_1,
          false,
          "findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) removed randomFile1_2_1_1 fine",
        );

        const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
        ttt.equal(
          exists1_2_1_2,
          true,
          "findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove randomFile1_2_1_2",
        );

        const exists1_2 = existsSync(directory1_2);
        ttt.equal(
          exists1_2,
          true,
          "findRemoveSync(filename randomFilename1_2_1_1 from directory1_2) did not remove directory1_2",
        );

        ttt.end();
      },
    );

    tt.test("two files from root", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { files: [randomFilename2, randomFilename1_2_1_3] });

      const exists2 = existsSync(randomFile2);
      ttt.equal(
        exists2,
        false,
        "findRemoveSync(two files from root) removed randomFile2 fine",
      );

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(
        exists1_2_1_3,
        false,
        "findRemoveSync(two files from root) removed randomFile1_2_1_3 fine",
      );

      const exists1 = existsSync(randomFile1);
      ttt.equal(
        exists1,
        true,
        "findRemoveSync(two files from root) did not remove randomFile1",
      );

      const exists0 = existsSync(rootDirectory);
      ttt.equal(
        exists0,
        true,
        "findRemoveSync(two files from root) did not remove root directory",
      );

      ttt.end();
    });

    tt.test("files set to *.*", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(directory1_2_1, { files: "*.*" });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(files set to *.*) removed randomFile1_2_1_1 fine",
      );

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(
        exists1_2_1_2,
        false,
        "findRemoveSync(files set to *.*) removed randomFile1_2_1_2 fine",
      );

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(
        exists1_2_1_3,
        false,
        "findRemoveSync(files set to *.*) removed randomFile1_2_1_3 fine",
      );

      const exists1_2_1 = existsSync(directory1_2_1);
      ttt.equal(
        exists1_2_1,
        true,
        "findRemoveSync(files set to *.* did not remove directory1_2_1",
      );

      ttt.end();
    });

    tt.test("with mixed ext and file params", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: randomFilename1,
        extensions: [".log"],
      });

      const exists1 = existsSync(randomFile1);
      const exists2 = existsSync(randomFile2);
      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1,
        false,
        "findRemoveSync(with mixed ext and file params) removed randomFile1 fine",
      );

      ttt.equal(
        exists2,
        false,
        "findRemoveSync(with mixed ext and file params) removed randomFile2 fine",
      );

      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(with mixed ext and file params) removed randomFile1_2_1_1 fine",
      );

      const exists1_2_1 = existsSync(directory1_2_1);
      ttt.equal(exists1_2_1, true, "did not remove directory1_2_1");

      ttt.strictEqual(
        typeof result[randomFile1],
        "boolean",
        "randomFile1 in result is boolean",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_2],
        "undefined",
        "randomFile1_2_1_2 is NOT in result",
      );

      ttt.end();
    });

    tt.test("with ignore param)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        ignore: fixFilename1_2_1_4,
      });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(with ignore) did remove file randomFile1_2_1_1",
      );

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4);
      ttt.equal(exists1_2_1_4, true, "file fixFile1_2_1_4 not removed");

      ttt.strictEqual(
        typeof result[randomFile1_2_1_1],
        "boolean",
        "randomFile1_2_1_1 in result is boolean",
      );
      ttt.strictEqual(
        typeof result[fixFile1_2_1_4],
        "undefined",
        "fixFile1_2_1_4 is NOT in result",
      );

      ttt.end();
    });

    tt.test("with ignore and jpg extension params", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        ignore: fixFilename1_2_1_4,
        extensions: ".jpg",
      });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      const exists1_2_1_4 = existsSync(fixFile1_2_1_4);

      ttt.equal(
        exists1_2_1_1,
        true,
        "findRemoveSync(with ignore + jpg extension) did not remove file randomFile1_2_1_1",
      );

      ttt.equal(
        exists1_2_1_4,
        true,
        "findRemoveSync(with ignore + jpg extension) did not remove file fixFile1_2_1_4",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_1],
        "undefined",
        "randomFile1_2_1_1 is NOT in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_4],
        "undefined",
        "fixFile1_2_1_4 is NOT in result",
      );

      ttt.end();
    });

    tt.test("with multiple ignore", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        ignore: [fixFilename1_2_1_4, fixFilename1_2_1_5],
      });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(with multiple ignore) did remove file randomFile1_2_1_1",
      );

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4);
      ttt.equal(
        exists1_2_1_4,
        true,
        "findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_4",
      );

      const exists1_2_1_5 = existsSync(fixFile1_2_1_5);
      ttt.equal(
        exists1_2_1_5,
        true,
        "findRemoveSync(with multiple ignore) did not remove file fixFile1_2_1_5",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_1],
        "boolean",
        "randomFile1_2_1_1 is in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_4],
        "undefined",
        "fixFile1_2_1_4 is NOT in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_5],
        "undefined",
        "fixFile1_2_1_5 is NOT in result",
      );

      ttt.end();
    });

    tt.test("with ignore and bak extension params", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        ignore: fixFilename1_2_1_4,
        extensions: ".bak",
      });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        true,
        "findRemoveSync(with ignore + bak extension) did not remove file randomFile1_2_1_1",
      );

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(
        exists1_2_1_2,
        false,
        "findRemoveSync(with ignore + bak extension) did remove file randomFile1_2_1_2",
      );

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4);
      ttt.equal(
        exists1_2_1_4,
        true,
        "findRemoveSync(with ignore + bak extension) did not remove file fixFile1_2_1_4",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_1],
        "undefined",
        "randomFile1_2_1_1 is NOT in result",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_2],
        "boolean",
        "randomFile1_2_1_2 is in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_4],
        "undefined",
        "fixFile1_2_1_4 is NOT in result",
      );

      ttt.end();
    });

    tt.test("two files and check others", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: [randomFilename1_2_1_1, randomFilename1_2_1_3],
      });

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        false,
        "findRemoveSync(two files and check others) removed randomFile1_2_1_1 fine",
      );

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(
        exists1_2_1_3,
        false,
        "findRemoveSync(two files and check others) removed randomFile1_2_1_3 fine",
      );

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4);
      ttt.equal(
        exists1_2_1_4,
        true,
        "findRemoveSync(two files and check others) did not remove fixFile1_2_1_4",
      );

      const exists1_2_1_5 = existsSync(fixFile1_2_1_5);
      ttt.equal(
        exists1_2_1_5,
        true,
        "findRemoveSync(two files and check others) did not remove fixFile1_2_1_5",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_1],
        "boolean",
        "randomFile1_2_1_1 is in result",
      );

      ttt.strictEqual(
        typeof result[randomFile1_2_1_3],
        "boolean",
        "randomFile1_2_1_3 is in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_4],
        "undefined",
        "fixFile1_2_1_4 is NOT in result",
      );

      ttt.strictEqual(
        typeof result[fixFile1_2_1_5],
        "undefined",
        "fixFile1_2_1_5 is NOT in result",
      );

      ttt.end();
    });

    tt.test("limit to maxLevel = 0", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        dir: "*",
        maxLevel: 0,
      });

      ttt.strictEqual(
        Object.keys(result).length,
        0,
        "findRemoveSync(limit to maxLevel = 0) returned empty an array.",
      );

      ttt.end();
    });

    tt.test("limit to maxLevel = 1", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        dir: "*",
        maxLevel: 1,
      });

      ttt.strictEqual(
        Object.keys(result).length,
        7,
        "findRemoveSync(limit to maxLevel = 1) returned 7 entries.",
      );

      ttt.end();
    });

    tt.test("limit to maxLevel = 2", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        dir: "*",
        maxLevel: 2,
      });

      ttt.strictEqual(
        Object.keys(result).length,
        12,
        "findRemoveSync(limit to maxLevel = 2) returned 12 entries.",
      );

      ttt.end();
    });

    tt.test("limit to maxLevel = 3", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { files: "*.*", maxLevel: 3 });

      ttt.strictEqual(
        Object.keys(result).length,
        6,
        "findRemoveSync(limit to maxLevel = 3) returned 6 entries.",
      );

      ttt.end();
    });

    tt.test("limit to maxLevel = 3 + bak only", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { maxLevel: 3, extensions: ".bak" });

      ttt.strictEqual(
        Object.keys(result).length,
        2,
        "findRemoveSync(limit to maxLevel = 3 + bak only) returned 2 entries.",
      );

      ttt.end();
    });

    tt.test("single dir", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { dir: "directory1_2" });

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(
        exists1_1,
        true,
        "findRemoveSync(single dir) did not remove directory1_1",
      );

      const exists1_2 = existsSync(directory1_2);
      ttt.equal(exists1_2, false, "findRemoveSync(single dir) removed directory1_2");

      ttt.end();
    });

    tt.test("two directories", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { dir: ["directory1_1", "directory1_2"] });

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, false, "findRemoveSync(two dirs) removed directory1_1");

      const exists1_2 = existsSync(directory1_2);
      ttt.equal(exists1_2, false, "findRemoveSync(two dirs) removed directory1_2");

      const exists1_3 = existsSync(directory1_3);
      ttt.equal(exists1_3, true, "findRemoveSync(two dirs) did not remove directory1_3");

      ttt.end();
    });

    tt.test("directories with the same basename", async function (ttt) {
      await createFakeDirectoryTree();

      findRemoveSync(rootDirectory, { dir: "CVS" });

      const exists1_3 = existsSync(directory1_3);
      ttt.equal(
        exists1_3,
        false,
        "findRemoveSync(directories with the same basename) removed root/directory1/CVS",
      );

      const exists3 = existsSync(directory3);
      ttt.equal(
        exists3,
        false,
        "findRemoveSync(directories with the same basename) removed root/CVS",
      );

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(
        exists1_1,
        true,
        "findRemoveSync(remove single dir) did not remove directory1_1",
      );

      const exists1_2 = existsSync(directory1_2);
      ttt.equal(
        exists1_2,
        true,
        "findRemoveSync(remove single dir) did not remove directory1_2",
      );

      ttt.end();
    });

    tt.test("test run", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        dir: "*",
        test: true,
      });

      ttt.strictEqual(
        Object.keys(result).length,
        19,
        "findRemoveSync(test run) returned 19 entries.",
      );

      const exists1_2_1_1 = existsSync(randomFile1_2_1_1);
      ttt.equal(
        exists1_2_1_1,
        true,
        "findRemoveSync(test run) did not remove randomFile1_2_1_1",
      );

      const exists1_2_1_3 = existsSync(randomFile1_2_1_3);
      ttt.equal(
        exists1_2_1_3,
        true,
        "findRemoveSync(test run) did not remove randomFile1_2_1_3",
      );

      const exists1_1 = existsSync(directory1_1);
      ttt.equal(exists1_1, true, "findRemoveSync(test run) did not remove directory1_1");

      ttt.end();
    });
  });

  t.test("TC 3: age checks", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    tt.test(
      "findRemoveSync(files and dirs older than 10000000000000000 sec)",
      async function (ttt) {
        await createFakeDirectoryTree();

        const result = findRemoveSync(rootDirectory, {
          files: "*.*",
          dir: "*",
          age: { seconds: 10000000000000000 },
        });

        ttt.strictEqual(
          Object.keys(result).length,
          0,
          "findRemoveSync(files older than 10000000000000000 sec) returned zero entries.",
        );

        ttt.end();
      },
    );

    tt.test("findRemoveSync(files and dirs older than 10 sec)", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        dir: "*",
        age: { seconds: 10 },
      });

      ttt.strictEqual(
        Object.keys(result).length,
        0,
        "findRemoveSync(files older than 10 sec) returned zero entries.",
      );

      ttt.end();
    });

    tt.test("findRemoveSync(files older than 2 sec with wait)", async function (ttt) {
      await createFakeDirectoryTree();

      await sleep(2000);

      const result = findRemoveSync(rootDirectory, {
        files: "*.*",
        age: { seconds: 2 },
      });

      ttt.strictEqual(
        Object.keys(result).length,
        11,
        "findRemoveSync(files older than 2 sec with wait) returned 11 entries.",
      );

      ttt.end();
    });

    tt.test(
      "findRemoveSync(files older than 2 sec with wait + maxLevel = 1)",
      async function (ttt) {
        await createFakeDirectoryTree();

        await sleep(2000);

        const result = findRemoveSync(rootDirectory, {
          files: "*.*",
          maxLevel: 1,
          age: { seconds: 2 },
        });

        ttt.strictEqual(
          Object.keys(result).length,
          4,
          "findRemoveSync(files older than 2 sec with wait + maxLevel = 1) returned 4 entries.",
        );

        ttt.end();
      },
    );
  });

  t.test("TC 4: github issues", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    // from https://github.com/binarykitchen/find-remove/issues/7
    tt.test("findRemoveSync(issues/7a)", async function (ttt) {
      await createFakeDirectoryTree();

      await sleep(3000);

      const result = findRemoveSync(rootDirectory, {
        age: { seconds: 2 },
        extensions: ".csv",
      });

      ttt.strictEqual(
        Object.keys(result).length,
        2,
        "findRemoveSync(issues/7) deleted 2 files.",
      );

      ttt.end();
    });

    // from https://github.com/binarykitchen/find-remove/issues/7
    tt.test("findRemoveSync(issues/7b)", async function (ttt) {
      await createFakeDirectoryTree();

      await sleep(3000);

      const result = findRemoveSync(rootDirectory, { extensions: ".dontexist" });

      ttt.deepEqual(result, {}, "is an empty json");

      ttt.end();
    });
  });

  t.test("TC 5: limit checks", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    tt.test("files older with limit of 2", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { files: "*.*", limit: 2 });

      ttt.strictEqual(
        Object.keys(result).length,
        2,
        "findRemoveSync(files with limit of 2) returned 2 entries (out of 11).",
      );

      ttt.end();
    });

    tt.test("files and dirs with limit of 5", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { files: "*.*", dir: "*", limit: 5 });

      ttt.strictEqual(
        Object.keys(result).length,
        5,
        "findRemoveSync(files and dirs with limit of 5) returned 5 entries (out of 19).",
      );

      ttt.end();
    });
  });

  t.test("TC 6: prefix checks", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    tt.test("files with exiting prefix 'someth'", async function (ttt) {
      await createFakeDirectoryTree();

      const result = findRemoveSync(rootDirectory, { prefix: "someth" });

      ttt.strictEqual(
        Object.keys(result).length,
        2,
        'findRemoveSync(files with prefix "someth") returned 2 entries (out of 11).',
      );

      ttt.end();
    });

    tt.test(
      "files with non-existing prefix 'ssssssssssssssssssssssssss' - too many chars",
      async function (ttt) {
        await createFakeDirectoryTree();

        const result = findRemoveSync(rootDirectory, {
          prefix: "ssssssssssssssssssssssssss",
        });

        ttt.strictEqual(
          Object.keys(result).length,
          0,
          'findRemoveSync(files with non-existing prefix "ssssssssssssssssssssssssss"- too many chars) returned 0 entries (out of 11).',
        );

        ttt.end();
      },
    );
  });

  t.test("TC 7: tests with regex patterns", async function (tt) {
    tt.teardown(() => {
      destroyFakeDirectoryTree();
    });

    tt.test("regex pattern files", async function (ttt) {
      await createFakeDirectoryTreeRegex();

      findRemoveSync(rootDirectory, { files: "thing", regex: true });

      const exists1_2_1_2 = existsSync(randomFile1_2_1_2);
      ttt.equal(exists1_2_1_2, true, "did not remove randomFile1_2_1_2");

      const exists1_2_1_4 = existsSync(fixFile1_2_1_4); // something.png
      ttt.equal(exists1_2_1_4, false, "removed fixFile1_2_1_4 fine");

      const exists1_2_1_5 = existsSync(fixFile1_2_1_5); // something.jpg
      ttt.equal(exists1_2_1_5, false, "removed fixFile1_2_1_5 fine");

      ttt.end();
    });

    tt.test("regex pattern directories", async function (ttt) {
      await createFakeDirectoryTreeRegex();

      findRemoveSync(rootDirectory, { dir: "^token", regex: true });

      const exists4 = existsSync(directory4);
      ttt.equal(exists4, true, "did not remove directory4");

      const exists5 = existsSync(directory5);
      ttt.equal(exists5, false, "removed directory5 fine");

      ttt.end();
    });
  });
});
