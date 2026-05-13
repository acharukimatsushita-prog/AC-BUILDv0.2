# AC-BUILDE

組立作業標準をAndroidタブレットで閲覧するための試作Webアプリです。

## 目的

- Google Driveに置いたExcel/PDFを元データとして管理する
- 装置を選択して、組立詳細をスライド形式で閲覧する
- 小工程は自動分割を基本とし、必要に応じて確認・修正できる構成にする
- Excelを修正した後、再取り込みでスライドを再構成できるようにする

## 現在の試作内容

- 装置一覧
- スライド閲覧
- Android向けスワイプ操作
- 全画面表示
- 取り込み画面の入口
- 自動分割プレビューのUI

## 推奨データ構成

```text
Google Drive/
  AC-BUILDE/
    sources/
      Vベルト巻込まれ安全体感装置組立図面.pdf
      装置A.xlsx
    processed/
      Vベルト巻込まれ安全体感装置/
        manifest.json
        step_001.png
        step_002.png
```

## 次に実装する機能

1. Google Drive API連携
2. PDFのページ画像化
3. ExcelからPDFまたは画像への変換
4. 工程番号・見出し・余白検出による自動分割
5. 分割結果の手直し画面
