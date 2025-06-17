function Show-Tree {
    param (
        [string]$Path = ".",
        [int]$Level = 0,
        [System.Collections.Generic.List[string]]$Output
    )

    $indent = " " * ($Level * 2)
    $items = Get-ChildItem -LiteralPath $Path -Force | Where-Object { $_.Name -ne "node_modules" }

    foreach ($item in $items) {
        $Output.Add("$indent- $($item.Name)")
        if ($item.PSIsContainer) {
            Show-Tree -Path $item.FullName -Level ($Level + 1) -Output $Output
        }
    }
}

$outputList = [System.Collections.Generic.List[string]]::new()
Show-Tree -Output $outputList
$outputList | Set-Content -Path "paths.txt"
