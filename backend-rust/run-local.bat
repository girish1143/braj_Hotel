@echo off
set "LIB=C:\Program Files\Microsoft Visual Studio\18\Community\SDK\ScopeCppSDK\vc15\SDK\lib;%LIB%"
call "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat"
set "LIB=C:\Program Files\Microsoft Visual Studio\18\Community\SDK\ScopeCppSDK\vc15\SDK\lib;%LIB%"
cargo run --release
