const { copyFileSync } = require('node:fs');
const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');
const options = {
  entryPoints: ['public/javascript/index.js'],
  bundle: true,
  outfile: 'public/bundle.js',
  loader: { '.js': 'jsx' },
  jsx: 'automatic',
  target: ['es2020'],
  minify: !watch,
  define: { 'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production') },
  logLevel: 'info'
};

async function build() {
  copyFileSync('node_modules/bootstrap/dist/css/bootstrap.min.css', 'public/stylesheets/bootstrap.min.css');
  if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
  } else {
    await esbuild.build(options);
  }
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
