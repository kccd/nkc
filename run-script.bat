@echo off
title run nkc script

cd %~dp0scripts

if "%~x1"==".js" (goto A) else if "%~x1"==".ts" (goto B) else (goto C)

:A
node %~f1
exit /B

:B
node -r ts-node/register %~f1
exit /B

:C
echo no found script file
exit /B