Universal Reloader
==================

Universal reloader is a simple command line tool that refreshes your browser window when you change a file.

Why use it?
===========

This tools aims to be *super simple* and *compatible* with almost anything.

* It works with your editor (notepad, vim, Sublime, Visual Studio, Eclipse, anything else)
* It works with your backend (PHP, ASP, Ruby, and more)

Quick Start
===========

Execute:

    npm install -g universal-reloader

Navigate to the directory you want to watch.  Execute:

    universal-reloader --port 8080 --url http://your-dev-server-goes-here

Navigate to http://localhost:8080.

Save a change to one of your files and watch your browser reload.

How does it work?
=================

* You run the program on the command line
* It hosts your page in an iframe
* It opens a websocket
* It watches the filesystem
* You open your browser to Universal Reloader's webpage
* You open a file and make a change
* Your browser refreshes automatically

Usage
=====

    npm install -g universal-reloader

Then you can run:

    universal-reloader [arguments]

    --debounce, -d  Debounce interval for throttling websocket publications           [default: 100]
    --folder, -f    Root folder to watch for changes                                  [default: "."]
    --mask, -m      Pipe-delimited file patterns to watch (e.g., **/*.css|**/*.html)  [default: "**/*"]
    --port, -p      Port to run on                                                    [default: 8080]
    --recent, -r    Interval of checks to the most-recently modified file             [default: 100]
    --url, -u       Url to auto-reload on file changes (e.g., http://example.com)     [required]
    --verbose       Toggle verbose logging

For example, the following would watch all js and css while hosting example.com at http://localhost:8080:

    universal-reloader --mask "**/*.js|**/*.css" --url http://example.com

Limitations
===========

Because this tool uses an iframe, sites that publish an "X-Frame-Options: SAMEORIGIN" header won't work with universal-reloader.

License
=======

MIT
