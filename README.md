bbsfdx
======

Bob Buzzard&#39;s SFDX Utilities Plugin

[![Version](https://img.shields.io/npm/v/bbsfdx.svg)](https://npmjs.org/package/bbsfdx)
[![CircleCI](https://circleci.com/gh/keirbowden/bbsfdx/tree/master.svg?style=shield)](https://circleci.com/gh/keirbowden/bbsfdx/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/keirbowden/bbsfdx?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/bbsfdx/branch/master)
[![Codecov](https://codecov.io/gh/keirbowden/bbsfdx/branch/master/graph/badge.svg)](https://codecov.io/gh/keirbowden/bbsfdx)
[![Greenkeeper](https://badges.greenkeeper.io/keirbowden/bbsfdx.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/keirbowden/bbsfdx/badge.svg)](https://snyk.io/test/github/keirbowden/bbsfdx)
[![Downloads/week](https://img.shields.io/npm/dw/bbsfdx.svg)](https://npmjs.org/package/bbsfdx)
[![License](https://img.shields.io/npm/l/bbsfdx.svg)](https://github.com/keirbowden/bbsfdx/blob/master/package.json)

<!-- toc -->

<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g bbsfdx
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
bbsfdx/1.0.1 darwin-x64 node-v8.11.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx bb:test:parallel [-d] [-e] [-k] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-bbtestparallel--d--e--k--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx bb:test:parallel [-d] [-e] [-k] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Disable or enable parallel test execution

```
USAGE
  $ sfdx bb:test:parallel [-d] [-e] [-k] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --disable                                                                     Disable parallel test execution
  -e, --enable                                                                      Enable parallel test execution

  -k, --keep                                                                        Keep generated deployment files
                                                                                    (automatically applied on error)

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx bm:test:parallel -d --targetusername myOrg@example.com
      Not done yet - sleeping
      Disable parallel test execution succeeded
  
  $ sfdx bm:test:parallel -e --targetusername myOrg@example.com --json
     {
       "status": 0,
       "result": {
         "success": true,
         "message": "Disable parallel test execution succeeded"
       }
     }
```

_See code: [lib/commands/bb/test/parallel.js](https://github.com/keirbowden/bbsfdx/blob/v1.0.1/lib/commands/bb/test/parallel.js)_
<!-- commandsstop -->
