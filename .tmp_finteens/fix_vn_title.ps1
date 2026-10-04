$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$path='C:\Users\ADMIN\Downloads\FinTeen_Game_Document\Document v2\Revised\Money Wealth Fixed\FinTeen_Visual_Novel_Game_Design_v3_money_fixed.docx'
$w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$zip=[IO.Compression.ZipFile]::Open($path,[IO.Compression.ZipArchiveMode]::Update)
try{
  $entry=$zip.GetEntry('word/document.xml');$reader=[IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8)
  try{[xml]$xml=$reader.ReadToEnd()}finally{$reader.Dispose()}
  $ns=[Xml.XmlNamespaceManager]::new($xml.NameTable);$ns.AddNamespace('w',$w)
  function Txt($n){(($n.SelectNodes('.//w:t',$ns)|%{$_.InnerText})-join '')}
  function MakeP([string]$text,[string]$style){$p=$xml.CreateElement('w','p',$w);$pp=$xml.CreateElement('w','pPr',$w);$ps=$xml.CreateElement('w','pStyle',$w);[void]$ps.SetAttribute('val',$w,$style);[void]$pp.AppendChild($ps);[void]$p.AppendChild($pp);$r=$xml.CreateElement('w','r',$w);$t=$xml.CreateElement('w','t',$w);$t.InnerText=$text;[void]$r.AppendChild($t);[void]$p.AppendChild($r);$p}
  $first=$xml.SelectSingleNode('/w:document/w:body/w:p[1]',$ns)
  if((Txt $first)-eq 'FinTeen Visual Novel Game Design'){$oldSubtitle=$first.NextSibling;if($oldSubtitle -and $oldSubtitle.LocalName -eq 'p'){[void]$oldSubtitle.ParentNode.RemoveChild($oldSubtitle)}}
  $title=MakeP 'FinTeen Visual Novel Game Design' 'Title'
  $subtitle=MakeP 'Thiết kế tuyến tính choices matter Money 4 stats và mini game casual' 'Subtitle'
  foreach($p in @($title,$subtitle)){$r=$p.SelectSingleNode('./w:r',$ns);$rp=$xml.CreateElement('w','rPr',$w);$color=$xml.CreateElement('w','color',$w);[void]$color.SetAttribute('val',$w,'000000');[void]$rp.AppendChild($color);[void]$r.InsertBefore($rp,$r.FirstChild)}
  [void]$first.ParentNode.InsertBefore($title,$first);[void]$first.ParentNode.InsertBefore($subtitle,$first);[void]$first.ParentNode.RemoveChild($first)
  $heading=$null
  foreach($p in $xml.SelectNodes('/w:document/w:body/w:p',$ns)){if((Txt $p)-eq '3. Nhân vật, Money và 4 stats'){$heading=$p;break}}
  $noteText='Money là số dư khả dụng bằng VND và chỉ thay đổi khi có giao dịch thực tế. Bốn stats dưới đây phản ánh hành vi, mức phơi nhiễm và tiến độ; không stat nào được dùng như một số dư tiền thứ hai.'
  foreach($p in @($xml.SelectNodes('/w:document/w:body/w:p',$ns))){if((Txt $p)-eq $noteText){[void]$p.ParentNode.RemoveChild($p)}}
  if($heading){$note=MakeP $noteText 'Normal';[void]$heading.ParentNode.InsertAfter($note,$heading)}
  $entry.Delete();$ne=$zip.CreateEntry('word/document.xml',[IO.Compression.CompressionLevel]::Optimal);$settings=[Xml.XmlWriterSettings]::new();$settings.Encoding=[Text.UTF8Encoding]::new($false);$stream=$ne.Open();$writer=[Xml.XmlWriter]::Create($stream,$settings);try{$xml.Save($writer)}finally{$writer.Dispose();$stream.Dispose()}
}finally{$zip.Dispose()}
