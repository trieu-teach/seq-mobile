$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = 'C:\Users\ADMIN\Downloads\FinTeen_Game_Document\Document v2\Revised'
$outputDir = Join-Path $sourceDir 'Money Wealth Fixed'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$wNs = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

function Text-Of($node, $ns) { (($node.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '') }

function Set-PText($xml, $p, $ns, [string]$text) {
    $pPr = $p.SelectSingleNode('./w:pPr', $ns)
    $saved = if ($pPr) { $pPr.CloneNode($true) } else { $null }
    $p.RemoveAll()
    if ($saved) { [void]$p.AppendChild($saved) }
    $r = $xml.CreateElement('w', 'r', $wNs)
    $t = $xml.CreateElement('w', 't', $wNs)
    $t.InnerText = $text
    [void]$r.AppendChild($t)
    [void]$p.AppendChild($r)
}

function Remove-Wealth-Table-Structures($xml, $ns) {
    foreach ($table in @($xml.SelectNodes('//w:tbl', $ns))) {
        $rows = @($table.SelectNodes('./w:tr', $ns))
        if ($rows.Count -eq 0) { continue }
        $headerCells = @($rows[0].SelectNodes('./w:tc', $ns))
        $wealthColumn = -1
        for ($i = 0; $i -lt $headerCells.Count; $i++) {
            if ((Text-Of $headerCells[$i] $ns).Trim() -eq 'WEALTH') { $wealthColumn = $i; break }
        }
        if ($wealthColumn -ge 0) {
            foreach ($row in $rows) {
                $cells = @($row.SelectNodes('./w:tc', $ns))
                if ($wealthColumn -lt $cells.Count) { [void]$row.RemoveChild($cells[$wealthColumn]) }
            }
        }
        foreach ($row in @($table.SelectNodes('./w:tr', $ns))) {
            $cells = @($row.SelectNodes('./w:tc', $ns))
            if ($cells.Count -gt 0 -and (Text-Of $cells[0] $ns).Trim() -eq 'WEALTH') {
                [void]$table.RemoveChild($row)
            }
        }
    }
}

function Replace-ParagraphText($xml, $ns, [hashtable]$exact, [array]$substitutions, [array]$deleteExact) {
    foreach ($p in @($xml.SelectNodes('//w:p', $ns))) {
        $text = Text-Of $p $ns
        if ($deleteExact -contains $text) { [void]$p.ParentNode.RemoveChild($p); continue }
        if ($exact.ContainsKey($text)) { Set-PText $xml $p $ns $exact[$text]; continue }
        $newText = $text
        foreach ($pair in $substitutions) { $newText = $newText.Replace($pair[0], $pair[1]) }
        if ($newText -ne $text) { Set-PText $xml $p $ns $newText }
    }
}

function Edit-Docx($inputPath, $outputPath, [scriptblock]$editor) {
    Copy-Item -LiteralPath $inputPath -Destination $outputPath -Force
    $zip = [IO.Compression.ZipFile]::Open($outputPath, [IO.Compression.ZipArchiveMode]::Update)
    try {
        $entry = $zip.GetEntry('word/document.xml')
        $reader = [IO.StreamReader]::new($entry.Open(), [Text.Encoding]::UTF8)
        try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
        $ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
        $ns.AddNamespace('w', $wNs)
        & $editor $xml $ns
        $entry.Delete()
        $newEntry = $zip.CreateEntry('word/document.xml', [IO.Compression.CompressionLevel]::Optimal)
        $settings = [Xml.XmlWriterSettings]::new()
        $settings.Encoding = [Text.UTF8Encoding]::new($false)
        $stream = $newEntry.Open()
        $writer = [Xml.XmlWriter]::Create($stream, $settings)
        try { $xml.Save($writer) } finally { $writer.Dispose(); $stream.Dispose() }
    } finally { $zip.Dispose() }
}

$commonSubs = @(
    @('Money cùng 5 stats', 'Money cùng 4 stats'),
    @('Money, 5 stats', 'Money, 4 stats'),
    @('mức tăng hoặc giảm của 5 stats', 'mức tăng hoặc giảm của 4 stats'),
    @('Save giữ Money, 5 stats', 'Save giữ Money, 4 stats'),
    @('WEALTH/SAVING/HAPPINESS/RISK/GOAL', 'SAVING/HAPPINESS/RISK/GOAL')
)

$vnIn = Join-Path $sourceDir 'FinTeen_Visual_Novel_Game_Design_v2_revised.docx'
$vnOut = Join-Path $outputDir 'FinTeen_Visual_Novel_Game_Design_v3_money_fixed.docx'
Edit-Docx $vnIn $vnOut {
    param($xml, $ns)
    Remove-Wealth-Table-Structures $xml $ns
    $exact = @{
        'FINTEEN – VISUAL NOVEL GAME DESIGNThiết kế tuyến tính, choices matter, 5 stats và mini-game casual' = 'FINTEEN – VISUAL NOVEL GAME DESIGNThiết kế tuyến tính, choices matter, Money, 4 stats và mini-game casual'
        '3. Nhân vật và 5 stats' = '3. Nhân vật, Money và 4 stats'
        'WEALTH ≥ 55' = 'Money đủ giá lựa chọn'
        'Stat logic: Stats: mua ngay WEALTH -6, SAVING -5, HAPPINESS +5, GOAL -6; chờ SAVING +5, GOAL +6, HAPPINESS -2.' = 'Stat logic: Mua ngay làm Money giảm đúng giá mua, SAVING -5, HAPPINESS +5, GOAL -6; chờ không đổi Money, SAVING +5, GOAL +6, HAPPINESS -2.'
        'Stat logic: Budget cân bằng: GOAL +5, SAVING +5; thiếu hụt: WEALTH -8, GOAL -8, RISK +4.' = 'Stat logic: Budget cân bằng: GOAL +5, SAVING +5; thiếu hụt không tự làm Money giảm, GOAL -8, RISK +4.'
        'Stat logic: Có emergency fund: RISK -6; không có fund: biến cố làm WEALTH/SAVING giảm mạnh.' = 'Stat logic: Có emergency fund: RISK -6; không có fund: Money chỉ giảm khi chi phí thật phát sinh, SAVING có thể giảm nếu kế hoạch tích lũy bị phá vỡ.'
        'Stat logic: Job lương cao nhưng không phù hợp: WEALTH +6, GOAL +1, HAPPINESS -4. Job có training: WEALTH -2 trước mắt, GOAL +7.' = 'Stat logic: Lời hứa lương chưa làm Money thay đổi. Job lương cao nhưng không phù hợp: GOAL +1, HAPPINESS -4. Khóa training đã thanh toán làm Money giảm đúng học phí và GOAL +7.'
        'Stat logic: So sánh kỹ: RISK -2, GOAL +2; mua theo peer pressure: WEALTH -8, HAPPINESS +4, GOAL -5.' = 'Stat logic: So sánh kỹ: RISK -2, GOAL +2. Mua theo áp lực nhóm làm Money giảm đúng giá mua, HAPPINESS +4, GOAL -5.'
        'Stat logic: Tài khoản phù hợp: SAVING +5. Bỏ qua phí: WEALTH -4. Không hiểu inflation: GOAL -3.' = 'Stat logic: Tài khoản phù hợp: SAVING +5. Phí chỉ làm Money giảm khi thực sự bị thu. Không hiểu lạm phát: GOAL -3.'
        'Stat logic: Emergency fund: WEALTH -3, RISK -7. Vay nóng: WEALTH +3, RISK +15, GOAL -5. Phishing: WEALTH -15, RISK +20.' = 'Stat logic: Dùng quỹ dự phòng làm Money giảm đúng khoản chi và RISK -7. Vay nóng chỉ tăng Money khi giải ngân và tạo nghĩa vụ trả, RISK +15, GOAL -5. Phishing làm Money giảm đúng tổn thất và RISK +20.'
        'Các mã D, thứ tự chapter, tình huống, mechanic, ngưỡng và số điểm WEALTH/SAVING/HAPPINESS/RISK/GOAL thuộc thiết kế FinTeen; các framework không quy định những yếu tố này. SMART và các nhãn FOMO/herd behavior/overconfidence/loss aversion là công cụ hoặc thuật ngữ biên soạn FinTeen, không gán là taxonomy chính thức CFPB.' = 'Các mã D, thứ tự chapter, tình huống, mechanic và số điểm SAVING/HAPPINESS/RISK/GOAL thuộc thiết kế FinTeen; các framework không quy định những yếu tố này. Money là số dư VND của tình huống, chỉ thay đổi khi có giao dịch. SMART và các nhãn FOMO/herd behavior/overconfidence/loss aversion là công cụ hoặc thuật ngữ biên soạn FinTeen, không gán là taxonomy chính thức CFPB.'
    }
    $subs = @($commonSubs) + @(
        @('"effects": {"WEALTH": -7, "HAPPINESS": 5, "SAVING": -5, "GOAL": -4}', '"effects": {"HAPPINESS": 5, "SAVING": -5, "GOAL": -4}'),
        @('eWEALTHe: -7, ', '')
    )
    $delete = @("WEALTH' = clamp(WEALTH + income - spending - fees - losses + investment_return, 0, 100)")
    Replace-ParagraphText $xml $ns $exact $subs $delete
}

$gddIn = Join-Path $sourceDir 'FinTeen_Game_Design_Document_GDD_v2_revised.docx'
$gddOut = Join-Path $outputDir 'FinTeen_Game_Design_Document_GDD_v3_money_fixed.docx'
Edit-Docx $gddIn $gddOut {
    param($xml, $ns)
    Remove-Wealth-Table-Structures $xml $ns
    $exact = @{
        'Giữ 5 stats WEALTH, SAVING, HAPPINESS, RISK, GOAL, thang 0–100. WEALTH là điểm nguồn lực mô phỏng kế thừa bản nguồn, không phải tài sản ròng hay số tiền chính xác. SAVING phản ánh duy trì kế hoạch; HAPPINESS phản ánh động lực/cân bằng; RISK cao là phơi nhiễm lớn; GOAL phản ánh tiến độ theo mục tiêu tình huống.' = 'Game hiển thị Money bằng VND và giữ 4 stats SAVING, HAPPINESS, RISK, GOAL trên thang 0–100. Money là số dư khả dụng duy nhất. SAVING phản ánh khả năng duy trì kế hoạch tích lũy; HAPPINESS phản ánh động lực và cân bằng; RISK cao là phơi nhiễm lớn; GOAL phản ánh tiến độ theo mục tiêu tình huống.'
        'Trạng thái đầu mỗi chapter: WEALTH 50, SAVING 50, HAPPINESS 50, RISK 30, GOAL 50. Money đầu chapter ghi riêng trong bảng và phần mở đầu. Các điểm này là baseline prototype, không mô tả giàu nghèo ngoài đời. Reset cả tiền và stats khi đổi chapter; chỉ giữ kết quả học tập và lịch sử lựa chọn.' = 'Trạng thái đầu mỗi chapter: SAVING 50, HAPPINESS 50, RISK 30, GOAL 50. Money đầu chapter ghi riêng trong bảng và phần mở đầu. Các điểm này là baseline prototype, không mô tả giàu nghèo ngoài đời. Reset Money và stats khi đổi chapter; chỉ giữ kết quả học tập và lịch sử lựa chọn.'
        'WEALTH giảm 1' = 'Không đổi'
        'Không lấy Money chia một hằng số để tính mọi thay đổi WEALTH. Ví dụ chờ mua có Money 0 nhưng S/G tăng; loan có thể tăng W theo logic mô phỏng gốc nhưng không là thu nhập thật. UI ghi rõ điểm nguồn lực dự kiến ở các lựa chọn nghề/vay. Tổn thất và giá giả lập được đặt trước, không sinh số ngẫu nhiên để chấm năng lực.' = 'Money chỉ thay đổi khi giao dịch thực sự phát sinh và không được quy đổi thành điểm stat. Lập kế hoạch, lời hứa lương, hạn mức vay hoặc giá trị đầu tư dự kiến không làm Money thay đổi. Khoản vay chỉ tăng Money sau khi giải ngân và phải lưu nghĩa vụ trả trong dữ liệu tình huống. Tổn thất và giá giả lập được đặt trước, không sinh số ngẫu nhiên để chấm năng lực.'
        'Vì sao tiền và stats thay đổi: Đối chiếu tổng chi với 3.000.000đ; không cộng WEALTH vì chỉ lập kế hoạch.' = 'Vì sao tiền và stats thay đổi: Đối chiếu tổng chi với 3.000.000đ; Money không đổi vì người chơi mới lập kế hoạch.'
        'Vì sao tiền và stats thay đổi: Dùng logic khóa đào tạo của nguồn: WEALTH −2 trước mắt, GOAL +7; trả đúng chi phí xác nhận.' = 'Vì sao tiền và stats thay đổi: Money giảm đúng 200.000đ học phí khi thanh toán; GOAL +7 vì khóa học phù hợp đã được kiểm tra.'
        'Vì sao tiền và stats thay đổi: WEALTH +6 là tiềm năng nguồn lực trong mô phỏng gốc, không phải lương đã nhận; cần ghi rõ ở UI.' = 'Vì sao tiền và stats thay đổi: Lời hứa lương chưa phải tiền đã nhận nên Money không đổi; GOAL phản ánh mức phù hợp của lựa chọn.'
        'Vì sao tiền và stats thay đổi: Phí thật làm Money giảm; 100.000đ quy đổi −1 WEALTH trong sự kiện phí, áp dụng mức 100.000đ/điểm cho phí này.' = 'Vì sao tiền và stats thay đổi: Phí thật làm Money giảm đúng 100.000đ; không quy đổi khoản tiền này thành stat.'
        'Vì sao tiền và stats thay đổi: Giữ logic nguồn bỏ qua phí WEALTH −4; Money chưa bị trừ vì chưa thanh toán phí.' = 'Vì sao tiền và stats thay đổi: Money chưa đổi vì phí chưa được thu; RISK hoặc GOAL phản ánh việc bỏ qua điều kiện, không tạo một khoản giảm tiền giả.'
        'Vì sao tiền và stats thay đổi: WEALTH +10 theo sự kiện vay chi phí cao của mô phỏng gốc, là điểm nguồn lực dự kiến; xác nhận thật bị chặn khi thiếu điều kiện.' = 'Vì sao tiền và stats thay đổi: Khoản vay chưa được giải ngân nên Money không đổi. Xác nhận thật bị chặn khi thiếu điều kiện; rủi ro tăng do đề nghị vay không minh bạch.'
        'Vì sao tiền và stats thay đổi: Logic nguồn dùng dự phòng WEALTH −3, RISK −7; không giảm SAVING vì dùng đúng mục đích.' = 'Vì sao tiền và stats thay đổi: Money giảm đúng 300.000đ chi phí y tế; RISK −7 vì khoản dự phòng được dùng đúng mục đích, SAVING không bị phạt.'
        'Vì sao tiền và stats thay đổi: Điểm gốc phishing WEALTH −15, RISK +20. 150.000đ là tổn thất giả định hiển thị trước lượt xác nhận, không suy ra tỷ giá WEALTH cho mọi giao dịch.' = 'Vì sao tiền và stats thay đổi: Money giảm đúng 150.000đ tổn thất giả định và RISK +20. Không quy đổi tổn thất thành điểm tài sản.'
        'Ending không cộng hay trừ thêm stats. A không đòi tối đa HAPPINESS/WEALTH; B không có nghĩa kiến thức kém hơn nếu kế hoạch thay thế phù hợp; C luôn có một bước phục hồi cụ thể. Sau 8 chapter, màn tổng kết gom các ending và bằng chứng học tập, không suy ra một tính cách cố định hay bắt buộc một ending chiến dịch liên tục.' = 'Ending không cộng hay trừ thêm stats. A không đòi tối đa HAPPINESS hoặc Money; B không có nghĩa kiến thức kém hơn nếu kế hoạch thay thế phù hợp; C luôn có một bước phục hồi cụ thể. Sau 8 chapter, màn tổng kết gom các ending và bằng chứng học tập, không suy ra một tính cách cố định hay bắt buộc một ending chiến dịch liên tục.'
        'Điểm lựa chọn = 100 × tổng điểm I/C/P đang hiệu lực ÷ (6 × số choice node đã hoàn tất). Dùng điểm theo từng phương án ghi tại scene; không lấy delta WEALTH, Money kiếm được hoặc ending làm điểm lựa chọn. Mỗi node có cùng trọng số trong một chapter; mỗi chapter có cùng trọng số khi tổng hợp để chapter nhiều node không chiếm ưu thế.' = 'Điểm lựa chọn = 100 × tổng điểm I/C/P đang hiệu lực ÷ (6 × số choice node đã hoàn tất). Dùng điểm theo từng phương án ghi tại scene; không lấy số Money còn lại, Money kiếm được hoặc ending làm điểm lựa chọn. Mỗi node có cùng trọng số trong một chapter; mỗi chapter có cùng trọng số khi tổng hợp để chapter nhiều node không chiếm ưu thế.'
        'Ví dụ CH07_SC03 lựa chọn bảo vệ: moneyEvents=[], deltaStats={WEALTH:0,SAVING:1,HAPPINESS:1,RISK:-8,GOAL:2}, evidence={I:2,C:1,P:2}, flag=fraud_contained, knowledgeUnits=[D07.06,D07.10]. Lựa chọn lộ OTP lưu một sự kiện Money −150.000đ và fraud_exposed; scene hồi phục không xóa tổn thất. Mỗi moneyEvent có mã duy nhất để tải lại save không trừ lần hai.' = 'Ví dụ CH07_SC03 lựa chọn bảo vệ: moneyEvents=[], deltaStats={SAVING:1,HAPPINESS:1,RISK:-8,GOAL:2}, evidence={I:2,C:1,P:2}, flag=fraud_contained, knowledgeUnits=[D07.06,D07.10]. Lựa chọn lộ OTP lưu một sự kiện Money −150.000đ và fraud_exposed; scene hồi phục không xóa tổn thất. Mỗi moneyEvent có mã duy nhất để tải lại save không trừ lần hai.'
    }
    $subs = @($commonSubs)
    $delete = @()
    Replace-ParagraphText $xml $ns $exact $subs $delete
}

$fwIn = Join-Path $sourceDir 'FinTeen_Financial_Knowledge_Framework_v2_revised.docx'
$fwOut = Join-Path $outputDir 'FinTeen_Financial_Knowledge_Framework_v3_money_fixed.docx'
Edit-Docx $fwIn $fwOut {
    param($xml, $ns)
    Remove-Wealth-Table-Structures $xml $ns
    $exact = @{
        'Không coi 5 stats của game là chuẩn tài chính quốc tế. WEALTH, SAVING, HAPPINESS, RISK, GOAL là thiết kế game của FinTeen, được ánh xạ tới các năng lực của framework.' = 'Không coi Money hoặc 4 stats của game là chuẩn tài chính quốc tế. Money là số dư VND trong tình huống; SAVING, HAPPINESS, RISK và GOAL là chỉ số gameplay của FinTeen được ánh xạ tới các năng lực của framework.'
        '6. Mapping với 5 stats của FinTeen' = '6. Mapping Money và 4 stats của FinTeen'
        'Quy ước RISK: điểm càng cao nghĩa là phơi nhiễm càng lớn. Không cộng tiết kiệm hai lần vào WEALTH nếu đã nằm trong tài sản; vay tiền không tự làm tăng tài sản ròng. Không phạt mặc định việc dùng quỹ dự phòng đúng mục đích. Đây là quy tắc mô phỏng FinTeen.' = 'Quy ước Money: chỉ thay đổi khi có giao dịch bằng VND và không được cộng thêm vào stat. Vay tiền chỉ làm Money tăng khi giải ngân và luôn đi kèm nghĩa vụ trả trong tình huống. Quy ước RISK: điểm càng cao nghĩa là phơi nhiễm càng lớn. Không phạt mặc định việc dùng quỹ dự phòng đúng mục đích. Đây là quy tắc mô phỏng FinTeen.'
    }
    $subs = @($commonSubs)
    $delete = @()
    Replace-ParagraphText $xml $ns $exact $subs $delete
}

$vnOut
$gddOut
$fwOut
