@ECHO off
(
  echo import { walk, exists } from "https://deno.land/std@0.83.0/fs/mod.ts";
  echo import { basename } from "https://deno.land/std@0.83.0/path/mod.ts";
  echo const compilerOptions = JSON.parse(await Deno.readTextFile("./tsconfig.json"^^^)^^^).compilerOptions;
  echo let debouncing = false;
  echo async function transpileScript(filename: string^^^) {
  echo   try {
  echo     const result = await Deno.transpileOnly({
  echo       [filename]: await Deno.readTextFile(filename^^^)
  echo     }, compilerOptions^^^);
  echo     await Deno.writeTextFile(filename.replace(".ts",".js"^^^), result[filename]["source"]^^^);
  echo     console.log("Built:", basename(filename^^^)^^^);
  echo   } catch (e^^^) {
  echo     console.log("Error:", e^^^);
  echo   }
  echo }
  echo console.log("JDCraft Build Script"^^^);
  echo for await (const entry of walk("./script/", { exts: [".ts"], includeDirs: false }^^^)^^^) {
  echo   await transpileScript(entry.path^^^)
  echo }
  echo for await (const event of Deno.watchFs("./script/"^^^)^^^) {
  echo   if (event.kind === "modify" ^^^&^^^& event.paths[0].endsWith(".ts"^^^) ^^^&^^^& debouncing === false^^^) {
  echo     debouncing = true;
  echo     await transpileScript(event.paths[0]^^^);
  echo     setTimeout((^^^)=^^^>{debouncing=false;},200^^^);
  echo   }
  echo }
) | deno run --unstable -A -