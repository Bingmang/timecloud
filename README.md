
# TimeCloud

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

> A distributed scheduling system based on node and typescript.


## Installation

To install prebuilt Timecloud binaries, use [`npm`](https://docs.npmjs.com/).
The preferred method is to install Timecloud as a development dependency in your
app:

```sh
npm install timecloud --save
yarn add timecloud
```

## Quick start

Clone and run 
```sh
git clone https://github.com/bingmang/timecloud
cd timecloud
npm install
npm test
```

## Resources for learning Timecloud

- [agenda/agenda](https://github.com/agenda/agenda) - all of Agenda's documentation

## Programmatic usage

Most people use Timecloud from the command line, but if you require `timecloud` inside
your **Node app** (not your Timecloud app) it will return the file path to the
binary. Use this to spawn Timecloud from Node scripts:

```javascript
const timecloud = require('timecloud')
const proc = require('child_process')

console.log(timecloud)

// spawn Timecloud
const child = proc.spawn(timecloud)
```

### Mirrors

- [China](https://npm.taobao.org/mirrors/timecloud)

## Documentation Translations

Find documentation translations in [nowhere](https://github.com/bingmang/timecloud).

## Community

You can ask questions and interact with the community in the following
locations:
- [`timecloud`](https://github.com/Bingmang/timecloud/issues) category on the Timecloud

Check out [Agendash](https://github.com/agenda/agendash)
for a community maintained list of useful example apps, tools and resources.

## License

[MIT](https://github.com/bingmang/timecloud/master/LICENSE)

When using the Timecloud or other GitHub logos, be sure to follow the [GitHub logo guidelines](https://github.com/logos).

[npm-image]: https://img.shields.io/npm/v/timecloud.svg?style=flat-square
[npm-url]: https://npmjs.org/package/timecloud
[travis-image]: https://img.shields.io/travis/Bingmang/timecloud/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/Bingmang/timecloud
[license-image]: http://img.shields.io/npm/l/timecloud.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/timecloud.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/timecloud
[coveralls-image]: https://img.shields.io/coveralls/github/bingmang/timecloud/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/Bingmang/timecloud