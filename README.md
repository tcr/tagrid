# tagrid

Increments version numbers for your git repository by checking `[major]`, `[minor]`, and `[patch]` tags since your last release.

## Usage

```
npm install tagrid -g
```

Run `tagrid` in your git repository and you'll see some information about the latest version found in your repo.

```
➜  firmware ✗ tagrid
last tag is v0.1.21
| 0 commits since last version.
v0.1.21
```

If there's been commits since your last version, the patch version will be incremented.

```
➜  firmware git:(master) tagrid
last tag is v0.1.21
| 3 commits since last version.
| 71e6b3f Commit one
| 3494762 Commit two
| 1b0780a Commit three
v0.1.22
```

If a commit contains `[major]`, `[minor]`, or `[patch]`, the tag is incremented appropriately.

```
➜  firmware git:(master) tagrid
last tag is v0.1.21
| 4 commits since last version.
| 71e6b3f Commit one
| 3494762 Commit two
| 1b0780a Commit three
| 80f0246 [minor] Incompatible API
v0.2.0
```

```
➜  firmware git:(master) tagrid
last tag is v0.1.21
| 5 commits since last version.
| 71e6b3f Commit one
| 3494762 Commit two
| 1b0780a Commit three
| 80f0246 [minor] Incompatible API
| 848920b [major] Completely breaking change
v1.0.0
```

**To commit your tag changes,** run `tagrid --commit`. This will make a new commit with that version number and a new tag with that version. The `package.json` in your repository's version will be updated to that of the commit. (For now, `package.json` must exist to commit.)

## License

MIT
