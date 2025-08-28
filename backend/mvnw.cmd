@ECHO OFF
REM Apache Maven Wrapper startup script for Windows
SETLOCAL

SET WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
SET PROPS_FILE=.mvn\wrapper\maven-wrapper.properties

REM Resolve base dir
SET BASE_DIR=%~dp0
CD /D "%BASE_DIR%"

IF NOT EXIST "%WRAPPER_JAR%" (
  IF EXIST "%PROPS_FILE%" (
    FOR /F "usebackq tokens=1,* delims==" %%A IN ("%PROPS_FILE%") DO (
      IF "%%A"=="wrapperUrl" SET WRAPPER_URL=%%B
    )
    ECHO Downloading Maven Wrapper from: %WRAPPER_URL%
    IF NOT EXIST ".mvn\wrapper" MKDIR ".mvn\wrapper"
    powershell -Command "try { (New-Object Net.WebClient).DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%') } catch { Write-Error $_; exit 1 }"
    IF ERRORLEVEL 1 (
      ECHO Failed to download maven-wrapper.jar
      EXIT /B 1
    )
  ) ELSE (
    ECHO %PROPS_FILE% not found. Cannot determine wrapperUrl.
    EXIT /B 1
  )
)

SET JAVA_EXE=java
"%JAVA_EXE%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%
