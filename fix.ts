import puppeteer from "https://deno.land/x/puppeteer@14.1.1/mod.ts";

const defaultSteamIconsPath = "C:/Program Files (x86)/Steam/steam/games";
const steamIconsPath = String(Deno.args[1] || defaultSteamIconsPath);
const searchPath = String(Deno.args[0] || ".");

console.log(`Steam icons path: "${steamIconsPath}"`);
console.log(`Searching shortcuts in: "${searchPath}"\n`);

async function fetchSteamInfo(gameId) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://steamdb.info/app/${gameId}/info/`;

  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.content();
  await browser.close();
  return content;
}

for await (const entry of Deno.readDir(searchPath)) {
  if (!entry.isFile || !entry.name.endsWith(".url")) {
    continue;
  }

  const linkContent = await Deno.readTextFile(entry.name);
  const gameId = linkContent.match(/rungameid\/(.+)/m)?.[1];

  if (!gameId) {
    continue;
  }

  const infoHtml = await fetchSteamInfo(gameId);
  console.log(infoHtml)
  const iconUrlMatch = infoHtml.match(/https.+\.ico/m);
  const iconUrl = iconUrlMatch?.[0];
  const iconName = iconUrl?.match(/(\w|\d)+\.ico/)?.[0];
  const hasIconPath = !!linkContent.match(/IconFile=.+/m);
  const hasIconFile = iconName &&
    await Deno.stat(steamIconsPath + "/" + iconName).catch(() => {});
  const status = [!hasIconPath && "unlinked", !hasIconFile && "file missing"]
    .filter(Boolean)
    .join(", ") || "ok";

  if (!hasIconPath) {
    const linkContentFixed = linkContent.replace(
      /IconFile=$/m,
      `IconFile=${steamIconsPath}/${iconName}`,
    );
    await Deno.writeTextFile(entry.name, linkContentFixed);
  }

  if (!hasIconFile && iconUrl) {
    const iconBuffer = await fetch(iconUrl).then((res) => res.arrayBuffer());
    await Deno.writeFile(
      steamIconsPath + "/" + iconName,
      new Uint8Array(iconBuffer),
    );
  }

  console.group(entry.name);
  console.log(gameId, iconName);
  console.log(status + "\n");
  console.groupEnd();
}

console.log("Done!");
