Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
nodeExe = "C:\Program Files\nodejs\node.exe"
shell.Run "cmd.exe /k cd /d """ & folder & """ && """ & nodeExe & """ launch-ac-builde.mjs", 1, False
