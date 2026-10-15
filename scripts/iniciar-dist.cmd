@echo off
setlocal
set "ROOT=%~dp0.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale uma versao compativel e tente novamente.
  pause
  exit /b 1
)

if not exist "%ROOT%\dist\index.html" (
  echo A pasta dist nao foi encontrada. Execute pnpm build antes de usar este atalho.
  pause
  exit /b 1
)

node "%~dp0serve-dist.mjs"
endlocal
