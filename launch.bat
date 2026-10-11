@echo off
title ASTRA-CUAS Simulator Launcher
echo =======================================================================
echo          ASTRA-CUAS: Drone and Counter-Drone Threat Simulator
echo          Ministry of Defence (MoD) / DSSC - SIH 2026 PS 26247
echo =======================================================================
echo.
echo [1] Launch Web Simulator in Browser (http://localhost:5173)
echo [2] Launch Standalone Offline Desktop App (Electron)
echo [3] Build Release Distribution Packages (.exe)
echo [4] Exit
echo.
set /p opt="Select an option (1-4): "

if "%opt%"=="1" (
    echo Starting Vite Dev Server...
    start http://localhost:5173
    npm run dev
)
if "%opt%"=="2" (
    echo Launching Native Desktop App...
    npm run electron:start
)
if "%opt%"=="3" (
    echo Building Offline Installer...
    npm run electron:pack
)
if "%opt%"=="4" (
    exit
)
pause
