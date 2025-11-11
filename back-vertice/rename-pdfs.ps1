# Script para renombrar archivos PDF sin extensión en la carpeta uploads
# Solo añade .pdf a archivos que realmente son PDFs (detectados por sus bytes mágicos)

$uploadsPath = ".\uploads"

Write-Host "Analizando archivos en $uploadsPath..." -ForegroundColor Cyan

$renamed = 0
$skipped = 0

Get-ChildItem -Path $uploadsPath -File | ForEach-Object {
    $file = $_
    
    # Saltar si ya tiene extensión
    if ($file.Extension -ne "") {
        Write-Host "  [SKIP] $($file.Name) - ya tiene extensión" -ForegroundColor Gray
        $skipped++
        return
    }
    
    try {
        # Leer los primeros 5 bytes del archivo
        $bytes = Get-Content -Path $file.FullName -Encoding Byte -ReadCount 5 -TotalCount 5
        
        # Los PDFs comienzan con %PDF- que es: 0x25 0x50 0x44 0x46 0x2D
        if ($bytes.Count -ge 5 -and 
            $bytes[0] -eq 0x25 -and 
            $bytes[1] -eq 0x50 -and 
            $bytes[2] -eq 0x44 -and 
            $bytes[3] -eq 0x46 -and 
            $bytes[4] -eq 0x2D) {
            
            $newName = $file.Name + ".pdf"
            $newPath = Join-Path $uploadsPath $newName
            
            # Verificar que el nuevo nombre no exista
            if (Test-Path $newPath) {
                Write-Host "  [ERROR] $($file.Name) - ya existe $newName" -ForegroundColor Red
            } else {
                Rename-Item -Path $file.FullName -NewName $newName
                Write-Host "  [OK] $($file.Name) → $newName" -ForegroundColor Green
                $renamed++
            }
        } else {
            Write-Host "  [SKIP] $($file.Name) - no es PDF (probablemente imagen)" -ForegroundColor Yellow
            $skipped++
        }
    } catch {
        Write-Host "  [ERROR] $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nResumen:" -ForegroundColor Cyan
Write-Host "  Archivos renombrados: $renamed" -ForegroundColor Green
Write-Host "  Archivos omitidos: $skipped" -ForegroundColor Yellow
Write-Host "`n¡Listo!" -ForegroundColor Cyan
