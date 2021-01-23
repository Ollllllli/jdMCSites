import { delay } from "https://deno.land/std@0.84.0/async/delay.ts";
import { walk } from "https://deno.land/std@0.84.0/fs/mod.ts";
import { basename } from "https://deno.land/std@0.84.0/path/mod.ts";
import { brightGreen, brightRed, brightYellow } from "https://deno.land/std@0.84.0/fmt/colors.ts";

const compilerOptions = JSON.parse(await Deno.readTextFile("./tsconfig.json")).compilerOptions;

function timestamp() {
  const date = new Date();
  let out = "";
  out += String(date.getFullYear());
  out += "-" + String(date.getMonth()+1).padStart(2,"0");
  out += "-" + String(date.getDate()).padStart(2,"0");
  out += "@" + String(date.getHours()).padStart(2,"0");
  out += ":" + String(date.getMinutes()).padStart(2,"0");
  out += ":" + String(date.getSeconds()).padStart(2,"0");
  out += "." + String(date.getMilliseconds()).padStart(3,"0");
  return out;
}

async function transpileScript(filename: string, root = "./script/") {
  try {
    const result = await Deno.emit(root + basename(filename), {
      compilerOptions: compilerOptions,
      check: false,
    });
    // hacky work around to get the compiled file.
    // finds the non-jsmap file, this is okay as bro
    const resultCompileTime = result.stats.find(v=>v[0]=="Total time")?.[1] || "unknown ";
    const compiledFiles =
      Object.entries(result.files)
      .filter(filenameSourceTuple => !filenameSourceTuple[0].includes(".js.map"))
      .map(filenameSourceTuple => [basename(filenameSourceTuple[0],".ts.js"), filenameSourceTuple[1]]);
    console.log(brightGreen(`[${timestamp()}] Build finished in ${resultCompileTime}ms...`));
    for (const file of compiledFiles) {
      const resultCode = file[1];
      if (resultCode == "") {
        console.log(brightYellow(`  No-Op: ${file[0]}, result empty.`));
      }
      else {
        console.log(`  Built: ${file[0]}`);
        await Deno.writeTextFile(root+file[0]+".js", resultCode);
      }
    }
  } catch (e) {
    console.log(brightRed(`[${timestamp()}] Build ${basename(filename)}.ts FAILED...`));
    console.log(e);
  }
  console.log();
}

if (import.meta.main) {

  /** `Map<filename, timerID>` */
  const debounceMap = new Map<string, number>();
  const debounceInterval = 200;
  
  console.log("-".repeat(32));
  console.log("JDCraft Build Script");
  console.log("-".repeat(32));
  
  for await (const entry of walk("./script/", { exts: [".ts"], includeDirs: false })) {
    await transpileScript(entry.path);
  }

  await delay(100);
  
  for await (const event of Deno.watchFs("./script/")) {
    const filename = event.paths[0];
    // check that a *.ts* file has been *saved*
    if (event.kind === "modify" && filename.endsWith(".ts")) {
      // reset timer if it exists to debounce compile
      if (debounceMap.has(filename)) clearTimeout(debounceMap.get(filename));
      // set a timer to compile file
      debounceMap.set(filename, setTimeout(async()=>{
        await transpileScript(filename);
        debounceMap.delete(filename);
      }, debounceInterval));
    }
  }

}
