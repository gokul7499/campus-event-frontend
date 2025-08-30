@echo off
echo Building Campus Events Frontend for Production...
echo.

echo Cleaning previous build...
if exist "build" rmdir /s /q "build"

echo Installing dependencies...
call npm install

echo Setting production environment...
set REACT_APP_API_URL=https://campus-event-backend.onrender.com
set REACT_APP_SOCKET_URL=https://campus-event-backend.onrender.com
set GENERATE_SOURCEMAP=false
set CI=false

echo Building application...
call npm run build

echo.
echo Build completed!
echo Check the 'build' folder for production files.
echo.
pause
