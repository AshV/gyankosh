Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ashis\Downloads\Gemini_Generated_Image_4v52pr4v52pr4v52.png"
$publicDir = "a:\GitHub\Gyankosh\public"

if (-not (Test-Path $srcPath)) {
    $srcPath = "C:\Users\ashis\.gemini\antigravity-ide\brain\356bb53e-fb75-4bd9-9f6a-f0a0ce73f7c6\pwa_source.png"
}

Write-Host "Loading source image from: $srcPath"
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Plaque bounding box in the 2048x2048 source image
$cropX = 128
$cropY = 127
$cropSize = 1792

# Crop the raw square containing the plaque
$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$rawCropped = New-Object System.Drawing.Bitmap($cropSize, $cropSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gRaw = [System.Drawing.Graphics]::FromImage($rawCropped)
$gRaw.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gRaw.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gRaw.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gRaw.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gRaw.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gRaw.Dispose()

# Patch the watermark star in the bottom-right corner using the clean symmetric bottom-left corner
$patchW = 120
$patchH = 120
$blX = 70
$blY = $cropSize - $patchH - 70

$srcPatch = New-Object System.Drawing.Bitmap($patchW, $patchH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gPatch = [System.Drawing.Graphics]::FromImage($srcPatch)
$gPatch.DrawImage($rawCropped, (New-Object System.Drawing.Rectangle(0, 0, $patchW, $patchH)), (New-Object System.Drawing.Rectangle($blX, $blY, $patchW, $patchH)), [System.Drawing.GraphicsUnit]::Pixel)
$gPatch.Dispose()

# Flip patch horizontally to match bottom-right corner geometry
$srcPatch.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)

# Draw over watermark in bottom-right corner
$brX = $cropSize - $patchW - 70
$brY = $blY
$gRawEdit = [System.Drawing.Graphics]::FromImage($rawCropped)
$gRawEdit.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gRawEdit.DrawImage($srcPatch, $brX, $brY, $patchW, $patchH)
$gRawEdit.Dispose()
$srcPatch.Dispose()

# Create a rounded card with transparent background (removes dark mockup frame corners)
# The corner radius on 1792x1792 is ~140px
$radius = 140
$cleanCard = New-Object System.Drawing.Bitmap($cropSize, $cropSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gClean = [System.Drawing.Graphics]::FromImage($cleanCard)
$gClean.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gClean.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gClean.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gClean.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gClean.Clear([System.Drawing.Color]::Transparent)

# Build rounded rectangle path
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$diam = $radius * 2
$path.AddArc(0, 0, $diam, $diam, 180, 90)
$path.AddArc($cropSize - $diam, 0, $diam, $diam, 270, 90)
$path.AddArc($cropSize - $diam, $cropSize - $diam, $diam, $diam, 0, 90)
$path.AddArc(0, $cropSize - $diam, $diam, $diam, 90, 90)
$path.CloseFigure()

$gClean.SetClip($path)
$gClean.DrawImage($rawCropped, 0, 0, $cropSize, $cropSize)
$gClean.ResetClip()
$gClean.Dispose()

# Helper function to resize bitmap with high quality
function Resize-Bitmap($source, $targetWidth, $targetHeight, $bgColor = $null) {
    $target = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    if ($bgColor -ne $null) {
        $g.Clear($bgColor)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }
    
    $g.DrawImage($source, (New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)), 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    return $target
}

# 1. Generate PWA 512x512 standard icon (rounded card on transparent background)
Write-Host "Generating pwa-512x512.png..."
$pwa512 = Resize-Bitmap $cleanCard 512 512
$pwa512.Save("$publicDir\pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pwa512.Dispose()

# 2. Generate PWA 192x192 standard icon
Write-Host "Generating pwa-192x192.png..."
$pwa192 = Resize-Bitmap $cleanCard 192 192
$pwa192.Save("$publicDir\pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pwa192.Dispose()

# 3. Generate PWA Maskable 512x512 icon
# Must have full-bleed background (no transparency) with the emblem inside the 80% safe zone (diameter 410px)
Write-Host "Generating pwa-maskable-512x512.png..."
$maskable512 = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMask = [System.Drawing.Graphics]::FromImage($maskable512)
$gMask.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMask.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMask.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gMask.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Sacred vermillion background color matching the plaque
$vermillionBg = [System.Drawing.Color]::FromArgb(255, 130, 16, 11) # #82100b
$gMask.Clear($vermillionBg)

# Scale emblem into safe zone: 410x410 centered at (51, 51)
$safeSize = 410
$safeOffset = [int]((512 - $safeSize) / 2)
$gMask.DrawImage($cleanCard, (New-Object System.Drawing.Rectangle($safeOffset, $safeOffset, $safeSize, $safeSize)), 0, 0, $cleanCard.Width, $cleanCard.Height, [System.Drawing.GraphicsUnit]::Pixel)
$gMask.Dispose()
$maskable512.Save("$publicDir\pwa-maskable-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$maskable512.Dispose()

# 4. Generate Apple Touch Icon 180x180 (opaque background with full-bleed vermillion)
Write-Host "Generating apple-touch-icon.png (180x180)..."
$apple180 = New-Object System.Drawing.Bitmap(180, 180, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gApple = [System.Drawing.Graphics]::FromImage($apple180)
$gApple.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gApple.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gApple.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gApple.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gApple.Clear($vermillionBg)
# Draw emblem fitting nicely inside
$appleSize = 164
$appleOffset = [int]((180 - $appleSize) / 2)
$gApple.DrawImage($cleanCard, (New-Object System.Drawing.Rectangle($appleOffset, $appleOffset, $appleSize, $appleSize)), 0, 0, $cleanCard.Width, $cleanCard.Height, [System.Drawing.GraphicsUnit]::Pixel)
$gApple.Dispose()
$apple180.Save("$publicDir\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$apple180.Dispose()

# 5. Generate Favicons: 32x32, 16x16, 48x48
Write-Host "Generating favicon-32x32.png and favicon-16x16.png..."
$fav32 = Resize-Bitmap $cleanCard 32 32
$fav32.Save("$publicDir\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)

$fav16 = Resize-Bitmap $cleanCard 16 16
$fav16.Save("$publicDir\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)

$fav48 = Resize-Bitmap $cleanCard 48 48
$fav48.Save("$publicDir\favicon-48x48.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 6. Generate Header / Brand Logo: 256x256 (logo.png)
Write-Host "Generating logo.png (256x256)..."
$logo256 = Resize-Bitmap $cleanCard 256 256
$logo256.Save("$publicDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$logo256.Dispose()

# 7. Generate multi-resolution favicon.ico
Write-Host "Generating favicon.ico with 16x16, 32x32, 48x48 frames..."
# Construct binary ICO file containing PNG-encoded 16x16, 32x32, 48x48
$ms16 = New-Object System.IO.MemoryStream
$fav16.Save($ms16, [System.Drawing.Imaging.ImageFormat]::Png)
$bytes16 = $ms16.ToArray()
$ms16.Dispose()

$ms32 = New-Object System.IO.MemoryStream
$fav32.Save($ms32, [System.Drawing.Imaging.ImageFormat]::Png)
$bytes32 = $ms32.ToArray()
$ms32.Dispose()

$ms48 = New-Object System.IO.MemoryStream
$fav48.Save($ms48, [System.Drawing.Imaging.ImageFormat]::Png)
$bytes48 = $ms48.ToArray()
$ms48.Dispose()

$icoStream = [System.IO.File]::Create("$publicDir\favicon.ico")
$bw = New-Object System.IO.BinaryWriter($icoStream)

# ICONDIR header: idReserved (2), idType (2 = 1 for icon), idCount (2 = 3 images)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]3)

$headerSize = 6
$dirEntrySize = 16
$offset = $headerSize + (3 * $dirEntrySize)

# Entry 1: 16x16
$bw.Write([byte]16)          # width
$bw.Write([byte]16)          # height
$bw.Write([byte]0)           # color count
$bw.Write([byte]0)           # reserved
$bw.Write([uint16]1)         # planes
$bw.Write([uint16]32)        # bit count
$bw.Write([uint32]$bytes16.Length) # bytes in resource
$bw.Write([uint32]$offset)   # offset
$offset += $bytes16.Length

# Entry 2: 32x32
$bw.Write([byte]32)
$bw.Write([byte]32)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$bytes32.Length)
$bw.Write([uint32]$offset)
$offset += $bytes32.Length

# Entry 3: 48x48
$bw.Write([byte]48)
$bw.Write([byte]48)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$bytes48.Length)
$bw.Write([uint32]$offset)

# Write PNG payloads
$bw.Write($bytes16)
$bw.Write($bytes32)
$bw.Write($bytes48)

$bw.Flush()
$bw.Close()
$icoStream.Dispose()

# 8. Generate favicon.svg with embedded base64 emblem
Write-Host "Updating favicon.svg with authentic emblem..."
$pngBytes = [System.IO.File]::ReadAllBytes("$publicDir\favicon-48x48.png")
$b64 = [Convert]::ToBase64String($pngBytes)
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <image href="data:image/png;base64,$b64" width="48" height="48" />
</svg>
"@
Set-Content -Path "$publicDir\favicon.svg" -Value $svgContent -Encoding utf8

$fav16.Dispose()
$fav32.Dispose()
$fav48.Dispose()
$cleanCard.Dispose()
$rawCropped.Dispose()
$srcBmp.Dispose()

Write-Host "All PWA icons successfully generated in: $publicDir"
