Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
app = folder & "\index.html"
edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

If fso.FileExists(edge) Then
  shell.Run """" & edge & """ """ & app & """", 1, False
ElseIf fso.FileExists(chrome) Then
  shell.Run """" & chrome & """ """ & app & """", 1, False
Else
  shell.Run """" & app & """", 1, False
End If
