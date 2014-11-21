#!/usr/bin/env node

require('shelljs/global')

var semver = require('semver')
var witwip = require('witwip');
var fs = require('fs');

String.prototype.splitlines = function () {
  return this.split(/\r?\n/g).filter(function (line) {
    return line.length;
  });
};

var defaulttag = 'v1.0.0';
if (process.argv.indexOf('--default') != -1) {
  defaulttag = process.argv[process.argv.indexOf('--default') + 1] || defaulttag;
}

// Get a list of tags.
var tags = exec('git tag -l', {silent: true}).output.splitlines().filter(function (tag) {
  return semver.valid(tag);
}).sort(function (a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}).reverse();

// Get current tag.
var latest = tags[0], next = defaulttag;
if (latest) {
  console.error('last tag is', latest);

  // From list of commits since previous tag, determine next version bump.
  var since = exec('git rev-list ' + latest + '..HEAD --oneline', {silent: true}).output.splitlines();

  // Dump significant commits.
  var anysignificant = false;
  console.error('|', since.length, 'commits since last version.')
  since.reverse().forEach(function (line) {
    console.error('|', line);
  });

  // 
  var next = latest;
  var hasmajor = since.some(function (line) {
    return line.indexOf('[major]') > -1;
  }) ? 1 : 0;
  var hasminor = since.some(function (line) {
    return line.indexOf('[minor]') > -1;
  }) ? 1 : 0;
  var haspatch = since.length;

  if (hasmajor) {
    next = semver.inc(next, 'major');
  } else if (hasminor) {
    next = semver.inc(next, 'minor');
  } else if (haspatch) {
    next = semver.inc(next, 'patch');
  }
  next = next.replace(/^v?/, 'v');
  console.log(next);
} else {
  console.error('first tag, using default.')
  console.log(defaulttag);
}

if (process.argv.indexOf('--commit') == -1) {
  return;
}

// Output.
if (tags[0] && semver.eq(next, latest)) {
  console.error('version exists, checking out now.')
  exec('git reset --hard ' + next, {silent: true});
  process.exit(0);
}
console.error('version doesn\'t exist, creating.')

// If we need to update package.json and tag a release, do so.
witwip(process.cwd(), function (err, pkgPath, pkgData) {
  // if (err) {
  //   console.error('error in finding package.json:', err);
  //   process.exit(1);
  // }
  if (!err && typeof pkgPath == 'string') {
    pkgData = require(pkgPath);
    pkgData.version = next;
    fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, '  ') + '\n', 'utf-8');
    exec('git add package.json', {silent: true})
  }
  exec('git commit --allow-empty -m ' + next, {silent: true})
  exec('git tag -a ' + next + ' -m ' + next, {silent: true})
})
