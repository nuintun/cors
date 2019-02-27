/**
 * @module rollup
 * @license MIT
 * @version 2017/11/28
 */

'use strict';

const fs = require('fs');
const terser = require('terser');
const rollup = require('rollup');
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

async function build(module) {
  const bundle = await rollup.rollup({
    context: 'window',
    input: `src/${module}.js`
  });

  const { output } = await bundle.generate({
    banner,
    indent: true,
    strict: true,
    format: 'umd',
    amd: { id: `cors-${module}` },
    name: `CORS${module.replace(/^[a-z]/, function(letter) {
      return letter.toUpperCase();
    })}`
  });

  const [file] = output;
  const map = `${module}.js.map`;
  const src = `dist/${module}.js`;
  const min = `dist/${module}.min.js`;

  fs.writeFileSync(src, file.code);
  console.log(`  Build ${src} success!`);

  const result = terser.minify(
    {
      [`${module}.js`]: file.code
    },
    {
      ie8: true,
      mangle: { eval: true },
      sourceMap: { url: map }
    }
  );

  fs.writeFileSync(min, banner + result.code);
  console.log(`  Build ${min} success!`);
  fs.writeFileSync(src + '.map', result.map);
  console.log(`  Build ${src + '.map'} success!`);
}

fs.stat('dist', error => {
  if (error) {
    fs.mkdirSync('dist');
  }

  build('master');
  build('worker');
});
