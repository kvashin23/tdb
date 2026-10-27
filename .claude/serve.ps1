# Локальный сервер для предпросмотра статического сайта (на машине нет Node/Python).
# -Root — папка сайта относительно корня проекта (по умолчанию сам проект).
param([string]$Root = ".", [int]$Port = 5173)
$projectRoot = Split-Path $PSScriptRoot -Parent
$Root = [IO.Path]::GetFullPath((Join-Path $projectRoot $Root)).TrimEnd('\') + '\'
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".json"="application/json"; ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp"; ".gif"="image/gif"; ".ico"="image/x-icon"; ".woff2"="font/woff2"; ".mp4"="video/mp4"; ".md"="text/plain; charset=utf-8" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Output "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
  if ($path -eq "" -or $path.EndsWith('/')) { $path += "index.html" }
  $file = [IO.Path]::GetFullPath((Join-Path $Root $path))
  if ($file.StartsWith($Root) -and (Test-Path $file -PathType Leaf)) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else { $ctx.Response.StatusCode = 404 }
  $ctx.Response.Close()
}
