import { parseArgs } from "jsr:@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  boolean: ["help", "cdn"],
  string: ["p1",'p2'],
  default: { p2: "C:/Program Files (x86)/Steam/steam/games",p1: "."},
});
if (flags.help) {
  console.log(`Usage: deno run --allow-read --allow-write fix.ts [--p1 <path>] [--p2 <path>] [--cdn] [--color] [--help]`);
  console.log(`修复目录下的空白steam图标`);
  console.log(`--p1 <path>    需要搜索的目录, 默认为当前目录".".`);
  console.log(`--p2 <path>    steam图标目录, 默认为"C:/Program Files (x86)/Steam/steam/games".`);
  console.log(`--cdn          是否使用cloudflare CDN，默认为False.`);
  console.log(`--help         显示帮助信息.`);
  Deno.exit(0)
}
const CDN1 = "akamai";
const CDN2 = "cloudflare";
const useCDN = flags.cdn? CDN2 : CDN1;
console.log(`使用CDN: ${useCDN}`);
console.log(`Steam图标目录: "${flags.p2}"`);
console.log(`待修复图标的目录: "${flags.p1}"\n`);

for await (const entry of Deno.readDir(flags.p1)) {
  if (!entry.isFile || !entry.name.endsWith(".url")) {
    continue;
  }

  const linkContent = await Deno.readTextFile(`${flags.p1}/${entry.name}`);
  const gameId = linkContent.match(/rungameid\/(.+)/m)?.[1];

  if (!gameId) {
    continue;
  }
  const localIconName = linkContent.match(/(\w|\d)+.ico/m)?.[0];
  const iconUrl = `https://cdn.${useCDN}.steamstatic.com/steamcommunity/public/images/apps/${gameId}/${localIconName}`;
  const hasIconFile = localIconName &&
    await Deno.stat(flags.p2 + "/" + localIconName).catch(() => {});
  const status =  hasIconFile ? "完好" : "缺失";
  if (!hasIconFile && iconUrl) {
    const iconBuffer = await fetch(iconUrl).then((res) => res.arrayBuffer());
    await Deno.writeFile(
      flags.p2 + "/" + localIconName,
      new Uint8Array(iconBuffer),
    );
  }


  console.group(entry.name);
  console.log(gameId, localIconName);
  console.log(status + "\n");
  console.groupEnd();
}

console.log("完成!");
