@ECHO off
explorer "http://localhost:4507/index.html"
START deno run --unstable -A build.ts
START deno run -A https://deno.land/std/http/file_server.ts -p 4507