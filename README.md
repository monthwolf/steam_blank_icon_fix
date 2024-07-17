# steam_blank_icon_fix
Fixes blank icons for Steam games shortcuts

![6CCpJP2tiO](https://user-images.githubusercontent.com/7318420/129628247-d0a9cca8-a404-4987-ab69-ca4e6c35e2fb.gif)

## Requirements
[deno](https://deno.land/manual/getting_started/installation)

## Permissions
```--allow-net``` Uses [steamdb.info](https://steamdb.info) to find and download icons

```--allow-read``` Reads shortcuts and checks if they're broken

```--allow-write``` Fixes broken shortcuts and recovers icon files in your Steam folder

# 使用说明
命令参数: `deno run --allow-read --allow-write fix.ts [--p1 <path>] [--p2 <path>] [--cdn] [--help]`

```sh
--p1 <path>    需要搜索的目录, 默认为当前目录".".
--p2 <path>    steam图标目录, 默认为"C:/Program Files (x86)/Steam/steam/games".
--cdn          是否使用cloudflare CDN，默认为False.
--help         显示帮助信息.
```

## 使用示例
当前文件夹下修复:

```
deno run --allow-net --allow-read --allow-write https://raw.githubusercontent.com/monthwolf/steam_blank_icon_fix/main/fix.ts
```

指定文件夹修复:

```
deno run --allow-net --allow-read --allow-write https://raw.githubusercontent.com/monthwolf/steam_blank_icon_fix/main/fix.ts --p1 C:\Users\username\Desktop
```
