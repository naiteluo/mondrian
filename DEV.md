# Development Docs

## main pakages and dirs

- `./packages/mondrian` main package of the lib.
- `./packages/mondrian-client` a fully funcitonal test project for debugging and developing the lib.
- `./pakcages/mondrian-server` a test ws server for simulating data client.
- `./tests` a playwright test suites for basic e2e test.
- `./utils` some tooling script for building or publishing.

## initial project

install npm dependencies:

```bash
npm run install
```

playwright's browser packages might take really long time at the first installation.

## modify codes, run, and see.

change codes and run:

```
npm run start
```

open the test url of the mondrian-client test page and test your changes.

## run tests.

it use playwright to run e2e test. make sure a client instance is running, and start test:

```bash
npm run start # if a client instance is already running, no need to start again, just run tests
npm run test
```

## how to publish.

Do full build and prepare for release

```bash
npm run build # build the whole lib
npm run build:api # generate typings and api docs

# opt 1. touch a prerelease rc version and publish
npm version prerelease --preid=rc
cd packages/mondrian && npm version prerelease --preid=rc && cd ../..
# commit changes
sh ./utils/publish-npm.sh --release-candidate

# opt 2. touch a release version and publish
npm version release
cd packages/mondrian && npm version release && cd ../..
# commit changes
sh ./utils/publish-npm.sh --release

```
