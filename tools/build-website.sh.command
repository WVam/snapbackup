#!/bin/sh
##################
# Snap Backup    #
# snapbackup.org #
##################

# To make this file runnable:
#    $ chmod +x *.sh.command

port=11598  #"sb" -> 115 98
projectHome=$(cd $(dirname $0)/..; pwd)

needNpm() {
   echo "**********************************"
   echo "Need to install Node.js to get npm"
   echo "**********************************"
   open "http://nodejs.org/"
   exit
   }

needGulp() {
   echo "***************************************"
   echo "Need to install Gulp:                  "
   echo "   $ sudo npm install --global gulp-cli"
   echo "***************************************"
   exit
   }

needGulpLocal() {
   echo "***************************************"
   echo "Need to install Gulp locally:          "
   echo "   $ cd $(dirname $0)"
   echo "   $ npm install gulp                  "
   echo "***************************************"
   exit
   }

info() {
   cd $projectHome
   echo "npm:"
   which npm || needNpm
   npm --version
   echo
   echo "Gulp:"
   which gulp || needGulp
   gulp --version
   test -d node_modules || needGulpLocal
   echo
   }

setupWebServer() {
   cd $projectHome/website
   process=$(pgrep -lf "SimpleHTTPServer $port")
   launch() {
      echo "Launching SimpleHTTPServer:"
      pwd
      python -m SimpleHTTPServer $port &> /dev/null &
      echo
      }
   test -z "$process" && launch
   echo "Web server:"
   pgrep -lf SimpleHTTPServer
   echo
   }

buildHtmlFiles() {
   cd $projectHome
   attributesFile=src/java/org/snapbackup/settings/SystemAttributes.java
   versionJava=$(grep --max-count 1 appVersion $attributesFile | awk -F'"' '{ print $2 }')
   versionHtml=$(grep --max-count 1 version package.json | awk -F'"' '{print $4}')
   echo "Versions:"
   echo "Java: $versionJava"
   echo "HTML: $versionHtml"
   echo
   echo "Tasks:"
   echo "To get latest modules --> $ npm update"
   gulp web
   cd website/httpdocs
   mv htaccess.txt .htaccess
   sed s/@@version/$versionJava/ ../static/version/index.php >version/index.php
   cd translate
   mv SnapBackup.properties.txt SnapBackup_en.properties.txt
   zip --quiet SnapBackup.properties.zip SnapBackup_*.properties.txt
   echo
   }

publish() {
   cd $projectHome/website/httpdocs
   publishWebRoot=$(grep ^DocumentRoot /private/etc/apache2/httpd.conf | awk -F\" '{ print $2 }')
   publishFolder=$publishWebRoot/snapbackup.org
   copyWebFiles() {
      echo "Publishing:"
      echo $publishFolder
      cp -R * $publishFolder
      echo
      }
   test -w $publishFolder && copyWebFiles
   }

launchBrowser() {
   url=http://localhost:$port/httpdocs
   echo "Opening:"
   echo $url
   sleep 2
   open $url
   echo
   }

echo
echo "snapbackup.org website"
echo "======================"
echo
info
setupWebServer
buildHtmlFiles
publish
launchBrowser
