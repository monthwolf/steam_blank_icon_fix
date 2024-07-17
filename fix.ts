const defaultSteamIconsPath = "C:/Program Files (x86)/Steam/steam/games";
const CDN1 = "akamai";
const CDN2 = "cloudflare";
const useCDN = Deno.args[2] == 0 ? CDN1 : CDN2;
const steamIconsPath = Deno.args[1] || defaultSteamIconsPath;
const searchPath = String(Deno.args[0] || ".");

console.log(`Steam icons path: "${steamIconsPath}"`);
console.log(`Searching shortcuts in: "${searchPath}"\n`);

for await (const entry of Deno.readDir(searchPath)) {
  if (!entry.isFile || !entry.name.endsWith(".url")) {
    continue;
  }

  const linkContent = await Deno.readTextFile(entry.name);
  const gameId = linkContent.match(/rungameid\/(.+)/m)?.[1];

  if (!gameId) {
    continue;
  }
  const localIconName = linkContent.match(/(\w|\d)+.ico/m)?.[0];
  const iconUrl = `https://cdn.${useCDN}.steamstatic.com/steamcommunity/public/images/apps/${gameId}/${localIconName}`;
  const hasIconFile = localIconName &&
    await Deno.stat(steamIconsPath + "/" + localIconName).catch(() => {});
  const status =  hasIconFile ? "ok" : "missed";
  if (!hasIconFile && iconUrl) {
    const iconBuffer = await fetch(iconUrl).then((res) => res.arrayBuffer());
    await Deno.writeFile(
      steamIconsPath + "/" + localIconName,
      new Uint8Array(iconBuffer),
    );
  }


  console.group(entry.name);
  console.log(gameId, localIconName);
  console.log(status + "\n");
  console.groupEnd();
}

console.log("Done!");
