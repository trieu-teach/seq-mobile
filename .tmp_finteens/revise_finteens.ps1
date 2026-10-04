$ErrorActionPreference = 'Stop'

$sourceDir = 'C:\Users\ADMIN\Downloads\FinTeen_Game_Document\Document v2'
$outputDir = Join-Path $sourceDir 'Revised'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Find-Paragraph {
    param($Document, [string]$ExactText)
    $range = $Document.Content.Duplicate
    $find = $range.Find
    $find.ClearFormatting()
    $find.Text = $ExactText
    $find.Forward = $true
    $find.Wrap = 0
    $find.MatchCase = $false
    $find.MatchWholeWord = $false
    if ($find.Execute()) { return $range.Paragraphs.Item(1) }
    throw "Paragraph not found: $ExactText"
}

function Set-ParagraphText {
    param($Paragraph, [string]$Text)
    $Paragraph.Range.Text = $Text + "`r"
}

function Set-StyleByText {
    param($Document, [string]$Text, [string]$StyleName)
    $paragraph = Find-Paragraph $Document $Text
    try { $paragraph.Range.Style = $StyleName } catch { }
}

function Save-RevisedCopy {
    param($Document, [string]$FileName)
    $path = Join-Path $outputDir $FileName
    $Document.SaveCopyAs($path)
    return $path
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    # 1. Visual Novel design: resolve the previously open implementation decisions.
    $vnPath = Join-Path $sourceDir 'FinTeen_Visual_Novel_Game_Design_v2.docx'
    $doc = $word.Documents.Open($vnPath, $false, $false)
    try {
        $start = Find-Paragraph $doc '13. Những điểm cần chốt trước khi triển khai'
        $next = Find-Paragraph $doc '14. Nguồn tham chiếu'
        $replacement = @(
            '13. Các quyết định triển khai đã chốt',
            'Đối tượng chính là teen 13–18 tuổi. Nội dung dùng hai mức diễn đạt: 13–15 tuổi ưu tiên nhận biết, tính toán đơn giản và tình huống gần gũi; 16–18 tuổi tăng độ phức tạp của tín dụng, đầu tư, hợp đồng và lập kế hoạch. Tình huống chỉ dành cho người đủ tuổi phải ghi rõ là mô phỏng chuẩn bị cho tuổi 18.',
            'Tiền tệ hiển thị bằng VND. Mỗi chapter dùng số tiền và giả định đã ghi trong GDD; tỷ giá, lãi suất, phí và thu nhập phải hiện ngay trong thẻ Inspect, không được trình bày như mức thị trường hoặc quy định pháp luật hiện hành.',
            'Bộ nhân vật mặc định gồm An, Minh, Cô Linh và NPC theo chapter. An có thể đổi tên và sprite; đại từ phải nhất quán trong một lượt chơi. NPC theo chapter tái sử dụng asset để kiểm soát chi phí sản xuất.',
            'Cấu trúc phát hành dùng tuyến tính theo chapter với nhánh ngắn rồi hội tụ. Các chapter độc lập về Money và stats; chỉ lưu lịch sử học tập, ending và lựa chọn để người chơi xem lại. Không thiết kế branching sâu trong phạm vi phiên bản đầu.',
            'HAPPINESS là mức cân bằng và động lực trong tình huống, không phải điểm vui hay thước đo sức khỏe tinh thần. RISK là mức phơi nhiễm rủi ro, không phải khẩu vị rủi ro đầu tư. UI phải hiển thị mô tả ngắn khi người chơi chạm vào tên stat.',
            'Nội dung đầu tư, tín dụng, bảo hiểm, thuế và quyền người tiêu dùng là mô phỏng giáo dục. Màn mở đầu và phần thông tin phải nêu rõ game không cung cấp khuyến nghị tài chính, pháp lý hoặc sản phẩm cụ thể.',
            'Yêu cầu tiếp cận tối thiểu gồm cỡ chữ co giãn, tương phản đủ đọc, nhãn cho nút và thanh stat, không phụ thuộc riêng vào màu sắc, tùy chọn giảm chuyển động, đọc lại hội thoại và không bắt trả lời theo thời gian.',
            'Dữ liệu phân tích chỉ ghi sự kiện học tập cần thiết như chapter, choiceId, kết quả mini-game và trạng thái hoàn thành. Không ghi nội dung người chơi tự nhập, danh tính thật hoặc dữ liệu tài chính cá nhân. Cơ chế đồng ý và lưu trữ phải phù hợp với người dùng chưa thành niên.',
            'Mọi thay đổi giá, phí, luật, tên cơ quan hoặc phạm vi bảo vệ phải qua bước rà soát Việt hóa trước phát hành. Nội dung có phiên bản; save lưu contentVersion để có thể kiểm tra hoặc chuyển đổi khi dữ liệu chapter thay đổi.'
        ) -join "`r"
        $range = $doc.Range($start.Range.Start, $next.Range.Start)
        $range.Text = $replacement + "`r"
        Set-StyleByText $doc '13. Các quyết định triển khai đã chốt' 'Heading 1'
        $vnOut = Save-RevisedCopy $doc 'FinTeen_Visual_Novel_Game_Design_v2_revised.docx'
    } finally { $doc.Close(0) }

    # 2. GDD: remove stale wording and add explicit implementation acceptance gates.
    $gddPath = Join-Path $sourceDir 'FinTeen_Game_Design_Document_GDD_v2.docx'
    $doc = $word.Documents.Open($gddPath, $false, $false)
    try {
        $stale = Find-Paragraph $doc 'Không yêu cầu cốt truyện hoặc số tiền nối giữa các chapter. An là nhân vật đại diện của từng tình huống; tuổi và hoàn cảnh được giới thiệu lại lúc mở chapter. Mỗi lượt bắt đầu với trạng thái riêng. Bản này không sửa file Visual Novel nguồn và không áp dụng điểm số hay ngưỡng của một chapter cho chapter khác.'
        Set-ParagraphText $stale 'Không yêu cầu cốt truyện hoặc số tiền nối giữa các chapter. An là nhân vật đại diện của từng tình huống; tuổi và hoàn cảnh được giới thiệu lại lúc mở chapter. Mỗi lượt bắt đầu với trạng thái riêng. GDD này triển khai trực tiếp Visual Novel Design đã đồng bộ và không áp dụng điểm số hay ngưỡng của một chapter cho chapter khác.'

        $section10 = Find-Paragraph $doc '10 Knowledge mapping và nguồn tham chiếu'
        $insert = @(
            'Cổng nghiệm thu kỹ thuật và nội dung',
            'Mỗi gói nội dung phải có contentVersion. Save ghi chapterId, sceneId, choiceId, moneyEventId và phiên bản nội dung; tải lại cùng save không được lặp giao dịch hoặc cộng lại delta. Khi một ID bị đổi hoặc xóa, bản phát hành phải có quy tắc chuyển đổi save hoặc đưa người chơi về checkpoint an toàn.',
            'Accessibility phải được kiểm tra trên iOS và Android với cỡ chữ lớn, trình đọc màn hình, chế độ giảm chuyển động và tương phản. Nút bị khóa phải có nhãn giải thích; biểu đồ, màu stat và phản hồi đúng/sai phải luôn có nội dung chữ tương đương.',
            'Bản build phát hành không thu thập tên thật, số tài khoản, số điện thoại, nội dung hội thoại tự nhập hoặc dữ liệu tài chính cá nhân. Analytics chỉ dùng ID nội dung và kết quả học tập tối thiểu; cơ chế đồng ý, xóa dữ liệu và thời hạn lưu phải được duyệt cho nhóm người dùng chưa thành niên.',
            'Trước khi khóa nội dung, người phụ trách chuyên môn xác nhận phép tính, nguồn và giả định; người phụ trách Việt hóa xác nhận thuật ngữ, độ tuổi sử dụng sản phẩm, thuế, hợp đồng, quyền, khiếu nại, tín dụng, bảo hiểm và phạm vi bảo vệ. Không phát hành câu chữ mang tính khuyến nghị sản phẩm hoặc cam kết lợi nhuận.',
            'Một chapter chỉ đạt nghiệm thu khi mọi nhánh đều tới được ending; các điều kiện khóa luôn có đường sửa; số tiền và delta chỉ ghi một lần; hai phương án hợp lý được chấm tương xứng; nội dung đọc được ở hai nhóm 13–15 và 16–18; người chơi có thể thoát, tải lại, đọc lại và chơi lại mà không làm hỏng trạng thái.'
        ) -join "`r"
        $section10.Range.InsertBefore($insert + "`r")
        Set-StyleByText $doc 'Cổng nghiệm thu kỹ thuật và nội dung' 'Heading 2'
        $gddOut = Save-RevisedCopy $doc 'FinTeen_Game_Design_Document_GDD_v2_revised.docx'
    } finally { $doc.Close(0) }

    # 3. Knowledge framework: make learning evidence and age adaptation mandatory.
    $fwPath = Join-Path $sourceDir 'FinTeen_Financial_Knowledge_Framework_v2.docx'
    $doc = $word.Documents.Open($fwPath, $false, $false)
    try {
        $oldRule = Find-Paragraph $doc 'Mỗi knowledge unit nên có learning objective, skill/decision, tiêu chí đánh giá và hoạt động tương tác.'
        Set-ParagraphText $oldRule 'Mỗi knowledge unit phải có learning objective, hành động hoặc quyết định quan sát được, tiêu chí đánh giá, phản hồi giải thích và hoạt động tương tác. Không dùng thay đổi Money hoặc stats làm bằng chứng duy nhất rằng người chơi đã hiểu kiến thức.'

        $sources = Find-Paragraph $doc '8. Tài liệu nguồn'
        Set-ParagraphText $sources '9. Tài liệu nguồn'
        $section = @(
            '8. Chuẩn triển khai và đánh giá knowledge unit',
            'Mỗi knowledge unit khi đưa vào scene hoặc mini-game phải lưu tối thiểu các trường: knowledgeUnitId, nhóm tuổi, learningObjective, dữ kiện người chơi được xem, hành động cần thực hiện, đáp án hoặc tiêu chí chấp nhận, phản hồi khi đúng và sai, nguồn, contentVersion và người duyệt chuyên môn.',
            'Minh chứng đánh giá phải khớp mức độ học tập. Nhận biết yêu cầu gọi tên hoặc phân loại đúng. Hiểu yêu cầu giải thích bằng lời của người chơi hoặc chọn lý do đúng. Áp dụng yêu cầu tính toán, lập kế hoạch hoặc thực hiện quy trình trong dữ kiện mới. Phân tích yêu cầu so sánh phương án, chỉ ra đánh đổi, rủi ro và điều kiện. Ra quyết định yêu cầu chọn phương án, nêu căn cứ và xem lại hậu quả.',
            'Một lựa chọn không được chấm đúng chỉ vì làm Money hoặc một stat tăng. Hệ thống đánh giá tách ba thành phần: kiểm tra thông tin, tính toán hoặc so sánh, và lập kế hoạch hoặc giải thích. Hai phương án khác nhau đều có thể đạt nếu cùng đáp ứng tiêu chí và nêu được đánh đổi.',
            'Nhóm 13–15 tuổi dùng số bước ít hơn, số liệu tròn, giải thích thuật ngữ ngay trong ngữ cảnh và ưu tiên tình huống chi tiêu, tiết kiệm, an toàn số. Nhóm 16–18 tuổi có thể dùng nhiều điều kiện hơn, lịch tiền, tổng chi phí tín dụng, hợp đồng, đầu tư và kịch bản kinh tế. Mức độ khó phải tăng bằng dữ kiện và lập luận, không bằng câu chữ đánh đố.',
            'Mỗi đơn vị phải qua bốn kiểm tra trước phát hành: đúng phép tính và đơn vị; đúng nguồn và không suy rộng quá tài liệu; phù hợp độ tuổi và tải nhận thức; phù hợp bối cảnh Việt Nam. Nội dung pháp lý hoặc sản phẩm phải có ngày rà soát và người chịu trách nhiệm phê duyệt.',
            'Báo cáo học tập dùng tỷ lệ hoàn thành theo knowledge unit, số lần xem dữ kiện, chất lượng bằng chứng và khả năng sửa quyết định sau phản hồi. Không suy luận tính cách, mức độ giàu nghèo hoặc năng lực tài chính ngoài đời từ một lựa chọn trong game.'
        ) -join "`r"
        $sources.Range.InsertBefore($section + "`r")
        Set-StyleByText $doc '8. Chuẩn triển khai và đánh giá knowledge unit' 'Heading 1'
        Set-StyleByText $doc '9. Tài liệu nguồn' 'Heading 1'
        $fwOut = Save-RevisedCopy $doc 'FinTeen_Financial_Knowledge_Framework_v2_revised.docx'
    } finally { $doc.Close(0) }

    Write-Output $vnOut
    Write-Output $gddOut
    Write-Output $fwOut
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
