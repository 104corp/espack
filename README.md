# @104corp/espack

[![Node version](https://img.shields.io/badge/node-%3E%3D8.10.0-brightgreen.svg)](http://nodejs.org/) [![GitHub license](https://img.shields.io/github/license/104corp/espack.svg)](https://github.com/104corp/espack/blob/master/LICENSE) [![Build Status](https://travis-ci.org/104corp/espack.svg?branch=master)](https://travis-ci.org/104corp/espack) [![Coverage Status](https://coveralls.io/repos/github/104corp/espack/badge.svg?branch=master)](https://coveralls.io/github/104corp/espack?branch=master)

espack is a front-end tool with JS bundle solution around webpack for building static web.

espack works on macOS. If something doesn't work, please file an issue.

## Introduction

The front-end development environment built with espack is based on the concept of Convention-Over-Configuration. The goal is to allow developers to focus on the development of the project itself without having to be distracted in the development environment. You can quickly create multiple page content by simply creating some file.

## Getting Started

Automatically create a project.

``` sh
npx @104corp/espack new my-app
cd my-app
npm run dev
```

If you prefer yarn.

``` sh
npx @104corp/espack new my-app -i yarn
```

## Depend

* [webpack 4](https://webpack.js.org/)
* [ejs](https://github.com/mde/ejs)
* [sass](http://sass-lang.com/), [less](http://lesscss.org/)
* *You can inject more dependencies with `espack.config.js`*


## Docs

* [document](https://github.com/104corp/espack/wiki)
* [example](https://github.com/104corp/espack/tree/example)

## License

espack is open source software [licensed as MIT](https://github.com/104corp/espack/blob/master/LICENSE).