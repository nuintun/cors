/**
 * @module rollup
 * @license MIT
 * @version 2017/11/28
 */

'use strict';

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-es');
const pkg = require('./package.json');

const banner = `/**
 * @module ${pkg.name}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

function build(module) {
  rollup
    .rollup({
      legacy: true,
      context: 'window',
      input: `src/${module}.js`
    })
    .then(bundle => {
      const src = `dist/${module}.js`;
      const min = `dist/${module}.min.js`;
      const map = `${module}.js.map`;

      bundle
        .generate({
          name: `CORS${module.replace(/^[a-z]/, function(letter) {
            return letter.toUpperCase();
          })}`,
          format: 'umd',
          indent: true,
          strict: true,
          banner: banner,
          amd: { id: `cors-${module}` }
        })
        .then(result => {
          fs.writeFileSync(src, result.code);
          console.log(`  Build ${src} success!`);

          result = uglify.minify(
            {
              [`${module}.js`]: result.code
            },
            {
              ecma: 5,
              ie8: true,
              mangle: { eval: true },
              sourceMap: { url: map }
            }
          );

          fs.writeFileSync(min, banner + result.code);
          console.log(`  Build ${min} success!`);
          fs.writeFileSync(src + '.map', result.map);
          console.log(`  Build ${src + '.map'} success!`);
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
}

fs.stat('dist', error => {
  if (error) {
    fs.mkdirSync('dist');
  }

  build('master');
  build('worker');
});
