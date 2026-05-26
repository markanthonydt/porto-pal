Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function New-RoundedRectanglePath {
  param(
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
  $path.AddArc($Width - $diameter, 0, $diameter, $diameter, 270, 90)
  $path.AddArc($Width - $diameter, $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc(0, $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function New-Icon {
  param(
    [int]$Size,
    [string]$OutputPath
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $roundedRect = New-RoundedRectanglePath -Width $Size -Height $Size -Radius ($Size * 0.25)
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new(0, 0)),
    ([System.Drawing.PointF]::new($Size, $Size)),
    ([System.Drawing.ColorTranslator]::FromHtml('#f97316')),
    ([System.Drawing.ColorTranslator]::FromHtml('#facc15'))
  )
  $graphics.FillPath($gradient, $roundedRect)

  $circleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 15, 23, 42))
  $circleDiameter = $Size * 0.6875
  $circleOffset = ($Size - $circleDiameter) / 2
  $graphics.FillEllipse($circleBrush, $circleOffset, $circleOffset, $circleDiameter, $circleDiameter)

  $fontSize = $Size * 0.34375
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center

  $textBounds = [System.Drawing.RectangleF]::new(0, 0, $Size, $Size + ($Size * 0.08))
  $graphics.DrawString('PT', $font, $textBrush, $textBounds, $format)

  $directory = Split-Path -Parent $OutputPath
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory | Out-Null
  }

  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
  $circleBrush.Dispose()
  $gradient.Dispose()
  $roundedRect.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$publicDir = Join-Path $PSScriptRoot '..\public'

New-Icon -Size 180 -OutputPath (Join-Path $publicDir 'apple-touch-icon.png')
New-Icon -Size 192 -OutputPath (Join-Path $publicDir 'pwa-192x192.png')
New-Icon -Size 512 -OutputPath (Join-Path $publicDir 'pwa-512x512.png')
New-Icon -Size 1024 -OutputPath (Join-Path $publicDir 'pwa-1024x1024.png')
