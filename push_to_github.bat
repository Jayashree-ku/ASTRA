@echo off
setlocal
echo ========================================================
echo   ASTRA - Beyond the Stars - GitHub Connect Helper
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/your-username/astra-beyond-stars.git): "

if "%REPO_URL%"=="" (
    echo Error: No repository URL provided.
    pause
    exit /b 1
)

echo.
echo Setting branch to main...
git branch -M main

echo Configuring remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! ASTRA is now connected and pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo If authentication failed, please ensure you have created the empty repository on GitHub
    echo and signed in with your Personal Access Token or Git Credential Manager.
)

echo.
pause
