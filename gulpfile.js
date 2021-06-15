// Snap Backup ~ GPLv3
// Gulp configuration and tasks

// Imports
import concat from        'gulp-concat';
import del from           'del';
import fileInclude from   'gulp-file-include';
import gulp from          'gulp';
import htmlHint from      'gulp-htmlhint';
import mergeStream from   'merge-stream';
import rename from        'gulp-rename';
import size from          'gulp-size';
import zip from           'gulp-zip';
import { htmlValidator } from 'gulp-w3c-html-validator';
import { readFileSync } from 'fs';

// Setup
const pkg = JSON.parse(readFileSync('./package.json'));
const releaseUrl = pkg.homepage + '/blob/main/releases/';
const installer = {
   mac:  'snap-backup-installer-v' + pkg.version + '.pkg',
   win:  'snap-backup-installer-v' + pkg.version + '.msi',
   java: 'snapbackup-v' +            pkg.version + '.jar',
   };
const download = {
   mac:  releaseUrl + installer.mac +  '?raw=true',
   win:  releaseUrl + installer.win +  '?raw=true',
   java: releaseUrl + installer.java + '?raw=true',
   past: releaseUrl + 'archive',
   };
const htmlHintConfig = { 'attr-value-double-quotes': false };
const context = {
   pkg:           pkg,
   pageTitle:     pkg.description,
   installer:     installer,
   download:      download,
   propertiesUri: pkg.homepage + '/blob/main/src/resources/properties',
   };
const websitesTargetFolder = 'websites-target';
const orgWebsite = {
   root:      websitesTargetFolder + '/www.snapbackup.org',
   translate: websitesTargetFolder + '/www.snapbackup.org/translate',
   graphics:  websitesTargetFolder + '/www.snapbackup.org/graphics',
   };

// Tasks
const task = {
   cleanWebsitesTarget() {
      return del([websitesTargetFolder + '/**/*', '**/.DS_Store']);  //only delete folder contents so as to not kill webserver
      },
   buildWebsites() {
      const processWeb = (topLevel) =>
         gulp.src(`websites/web/www.snapbackup.${topLevel}/**/*`)
            .pipe(fileInclude({ basepath: '@root', indent: true, context: context }))
            .pipe(gulp.dest(`${websitesTargetFolder}/www.snapbackup.${topLevel}`));
      const processUserGuide = () =>
         gulp.src('src/resources/snap-backup-user-guide.html')
            .pipe(gulp.dest(orgWebsite.root));
      const processProperties = () =>
         gulp.src('src/resources/properties/SnapBackup*.properties')
            .pipe(rename({ extname: '.properties.txt' }))
            .pipe(gulp.dest(orgWebsite.translate))
            .pipe(zip('SnapBackup.properties.zip'))
            .pipe(gulp.dest(orgWebsite.translate));
      const processDefaultProperties = () =>
         gulp.src('src/resources/properties/SnapBackup.properties')
            .pipe(rename('SnapBackup_en.properties.txt'))
            .pipe(gulp.dest(orgWebsite.translate));
      const processFlags = () =>
         gulp.src('src/resources/graphics/application/language-*.png')
            .pipe(gulp.dest(orgWebsite.graphics));
      const processGraphics = () =>
         gulp.src('websites/graphics/**/*')
            .pipe(gulp.dest(orgWebsite.graphics));
      const processCss = () =>
         gulp.src('websites/*.css')
            .pipe(concat('style.css'))
            .pipe(gulp.dest(orgWebsite.root));
      const processJs = () =>
         gulp.src('websites/*.js')
            .pipe(concat('app.js'))
            .pipe(gulp.dest(orgWebsite.root));
      return mergeStream(
         processWeb('com'),
         processWeb('eu'),
         processWeb('net'),
         processWeb('org'),
         processUserGuide(),
         processProperties(),
         processDefaultProperties(),
         processFlags(),
         processGraphics(),
         processCss(),
         processJs());
      },
   lintWebsites() {
      return gulp.src(websitesTargetFolder + '/**/*.html')
         .pipe(htmlHint(htmlHintConfig))
         .pipe(htmlHint.reporter())
         .pipe(htmlValidator.analyzer())
         .pipe(htmlValidator.reporter())
         .pipe(size({ showFiles: true }));
      },
   };

// Gulp
gulp.task('clean', task.cleanWebsitesTarget);
gulp.task('web',   task.buildWebsites);
gulp.task('lint',  task.lintWebsites);
