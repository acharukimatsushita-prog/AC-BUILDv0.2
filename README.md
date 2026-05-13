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

## Google Drive取り込みの流れ

対象フォルダ:

```text
https://drive.google.com/drive/folders/1-2ycWi3ecB0ZCpDWmUjQ27LZV9EUOEJq?usp=drive_link
```

想定構成:

```text
AC-BUILDE Drive Root/
  大分類A/
    装置1.pdf
    装置2.pdf
  大分類B/
    装置3.pdf
```

Drive APIでは、フォルダIDを元に直下のファイルとフォルダを取得し、大分類フォルダを再帰的に読み込みます。
実連携にはGoogle CloudでDrive APIを有効化し、APIキーまたはOAuthクライアントIDを設定します。

## 実Drive同期の設定

1. Google Cloud Consoleでプロジェクトを作成
2. Google Drive APIを有効化
3. APIキーを作成
4. 対象のGoogle Driveフォルダを「リンクを知っている全員が閲覧可」に設定
5. `config.js` の `googleDriveApiKey` にAPIキーを設定

```js
window.AC_BUILDE_CONFIG = {
  googleDriveApiKey: "ここにAPIキー",
  driveFolderUrl: "https://drive.google.com/drive/folders/..."
};
```

ブラウザ版ではAPIキーが利用者から見えるため、社内限定の本運用ではOAuthログイン方式またはサーバー側プロキシ方式に変更するのが安全です。
