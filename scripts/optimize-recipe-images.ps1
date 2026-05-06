param(
    [Parameter(Mandatory = $true)]
    [string]$Directory,

    [int]$MaxSide = 1800,

    [ValidateRange(1, 100)]
    [int64]$Quality = 86
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$targetDir = Resolve-Path -LiteralPath $Directory
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1

if (-not $jpegEncoder) {
    throw "JPEG encoder is not available."
}

$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    $Quality
)

$files = @(Get-ChildItem -LiteralPath $targetDir -File -Include "*.jpg", "*.jpeg")

if ($files.Count -eq 0) {
    Write-Output "No JPEG files found in $targetDir"
    exit 0
}

foreach ($file in $files) {
    $path = $file.FullName
    $oldKb = [Math]::Round($file.Length / 1KB, 0)
    $tempPath = "$path.tmp.jpg"
    $image = [System.Drawing.Image]::FromFile($path)
    $newWidth = 0
    $newHeight = 0

    try {
        $longSide = [double][Math]::Max($image.Width, $image.Height)
        $scale = [Math]::Min([double]1.0, [double]$MaxSide / $longSide)
        $newWidth = [int][Math]::Round([double]$image.Width * $scale)
        $newHeight = [int][Math]::Round([double]$image.Height * $scale)

        $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        try {
            $bitmap.SetResolution(72, 72)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)
            }
            finally {
                $graphics.Dispose()
            }

            $bitmap.Save($tempPath, $jpegEncoder, $encoderParams)
        }
        finally {
            if ($bitmap) {
                $bitmap.Dispose()
            }
        }
    }
    finally {
        $image.Dispose()
    }

    Move-Item -LiteralPath $tempPath -Destination $path -Force
    $newKb = [Math]::Round((Get-Item -LiteralPath $path).Length / 1KB, 0)
    Write-Output "$($file.Name): $oldKb KB -> $newKb KB, ${newWidth}x${newHeight}"
}
