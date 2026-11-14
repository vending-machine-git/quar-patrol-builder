@echo off
setlocal
cd /d "%~dp0"
title Quar Patrol Builder - Local Site

py -3 --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON=py -3"
    goto launch
)
python --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON=python"
    goto launch
)

echo Python 3 is required to run the local site.
echo Install Python 3, then double-click this file again.
pause
exit /b 1

:launch
echo Starting Quar Patrol Builder at http://127.0.0.1:8000
echo Keep this window open while using the site.
echo Close this window or press Ctrl+C to stop the server.
echo.
%PYTHON% -c "import http.server, threading, webbrowser; server = http.server.ThreadingHTTPServer(('127.0.0.1', 8000), http.server.SimpleHTTPRequestHandler); threading.Timer(0.5, lambda: webbrowser.open('http://127.0.0.1:8000')).start(); server.serve_forever()"
if errorlevel 1 (
    echo.
    echo The server stopped. If port 8000 is already in use, close the other local server and try again.
    pause
)
