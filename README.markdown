Universal Reloader
==================

Universal reloader is a command line tool that refreshes your browser window when you change a file.

Why use it?
===========

This tools aims to be *simple to use* and *compatible* with almost anything.

* It works with your editor or IDE
* It works with your web server

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
* It hosts your page in an iframe or by reverse proxy
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

    --debounce, -d  Debounce interval for throttling websocket publications.         [default: 100]
    --folder, -f    Root folder to watch for changes.                                [default: "."]
    --host, -h      Method to use to host your url: iframe or proxy.                 [default: "proxy"]
    --mask, -m      Pipe-delimited file masks to watch (e.g., "**/*.css"|**/*.js").  [default: "**/*"]
    --port, -p      Port to run on.                                                  [default: 8080]
    --recent, -r    Interval of checks to the most-recently modified file.           [default: 100]
    --url, -u       Url to auto-reload on file changes (e.g., http://example.com).   [required]
    --verbose       Toggle verbose logging.

Limitations
===========

Using --host iframe, sites that publish an "X-Frame-Options: SAMEORIGIN" header won't work with universal-reloader.

License
=======

MIT
