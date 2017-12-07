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

// Make rollup compatible with ES3, remove Object.defineProperty of __esModule part
function es3(removeArr) {
  const removeHash = {
    defineProperty: [/^\s*Object\.defineProperty\(\s*exports,\s*'__esModule'.*\n$/gm, ''],
    freeze: [/Object.freeze\s*\(\s*([^)]*)\)/g, '$1']
  };

  if (!Array.isArray(removeArr)) removeArr = Object.keys(removeHash);

  return {
    name: 'es3',
    transformBundle: function(code) {
      for (let k in removeHash) {
        if (removeArr.indexOf(k) > -1) {
          code = code.replace(removeHash[k][0], removeHash[k][1]);
        }
      }

      return { code, map: { mappings: '' } };
    }
  };
}

function build(module) {
  rollup
    .rollup({
      legacy: true,
      // plugins: [es3()],
      context: 'window',
      input: `src/${module}.js`
    })
    .then(bundle => {
      const src = `dist/${module}.js`;
      const min = `dist/${module}.min.js`;
      const map = `${module}.js.map`;

      bundle
        .generate({
          name: 'CORS',
          format: 'umd',
          indent: true,
          strict: true,
          banner: banner,
          amd: { id: 'cors' }
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
