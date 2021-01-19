import { delay } from "https://deno.land/std@0.83.0/async/delay.ts";
import { walk, exists } from "https://deno.land/std@0.83.0/fs/mod.ts";
import { basename } from "https://deno.land/std@0.83.0/path/mod.ts";

const compilerOptions = JSON.parse(await Deno.readTextFile("./tsconfig.json")).compilerOptions;

function timestamp() {
  return new Date().toLocaleTimeString();
}

async function transpileScript(filename: string) {
  try {
    const result = await Deno.transpileOnly({
      [filename]: await Deno.readTextFile(filename)
    }, compilerOptions);
    const sourceCode = result[filename]["source"];
    if (sourceCode == "")
      console.log(timestamp(), "No-Op: Source file compiled to empty.")
    else
      await Deno.writeTextFile(filename.replace(".ts", ".js"), result[filename]["source"]);
    console.log(timestamp(), "Built:", basename(filename));
  } catch (e) {
    console.log(timestamp(), "Error:", e);
  }
}

if (import.meta.main) {

  const debounceList: Record<string, boolean> = {};
  
  console.log("JDCraft Build Script");
  
  for await (const entry of walk("./script/", { exts: [".ts"], includeDirs: false })) {
    await transpileScript(entry.path);
  }
  
  for await (const event of Deno.watchFs("./script/")) {
    if (event.kind === "modify" && event.paths[0].endsWith(".ts")) {
      if (debounceList[event.paths[0]] != true) {
        await delay(100);
        debounceList[event.paths[0]] = true;
        await transpileScript(event.paths[0]);
        setTimeout(()=>{
          debounceList[event.paths[0]] = false;
        }, 200);
      }
    }
  }

}
