# Android用ビルドと移動ガイド

## 概要
神の手じゃんけんアプリをAndroidデバイスにビルド・デプロイする方法をまとめています。

## 前提条件
- Flutter SDKがインストール済み
- Android Studioまたは Android SDK がセットアップ済み
- USBデバッグが有効なAndroidデバイス（801SH）が接続済み

## 1. デバイス接続確認

### 接続されているデバイスを確認
```bash
cd packages/client_app
flutter devices
```

期待される出力例：
```
Found 4 connected devices:
  801SH (mobile)    • 357782090141369 • android-arm64  • Android 10 (API 29)
  Windows (desktop) • windows         • windows-x64    • Microsoft Windows
  Chrome (web)      • chrome          • web-javascript • Google Chrome
  Edge (web)        • edge            • web-javascript • Microsoft Edge
```

## 2. デバッグビルド（開発用）

### 2.1 デバッグモードで直接実行
```bash
# 801SHデバイスで直接実行（ホットリロード有効）
flutter run -d 357782090141369

# または、デバイス名を指定
flutter run -d "801SH"
```

### 2.2 デバッグAPKを作成してインストール
```bash
# デバッグAPKをビルド
flutter build apk --debug

# ビルド後のAPKファイルの場所
# packages/client_app/build/app/outputs/flutter-apk/app-debug.apk

# 手動でインストール（adbコマンド使用）
adb install build/app/outputs/flutter-apk/app-debug.apk
```

## 3. リリースAPK作成

### 3.1 リリースAPKのビルド
```bash
# リリースAPKをビルド
flutter build apk --release

# 出力先
# packages/client_app/build/app/outputs/flutter-apk/app-release.apk
```

### 3.2 分割APK（複数アーキテクチャ対応）
```bash
# 分割APKをビルド（ファイルサイズ最適化）
flutter build apk --split-per-abi

# 出力先
# packages/client_app/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
# packages/client_app/build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
# packages/client_app/build/app/outputs/flutter-apk/app-x86_64-release.apk
```

### 3.3 Android App Bundle（AAB）の作成
```bash
# Google Play Store用のAABファイルを作成
flutter build appbundle --release

# 出力先
# packages/client_app/build/app/outputs/bundle/release/app-release.aab
```

## 4. APKのインストール方法

### 4.1 adbコマンドを使用
```bash
# 特定のデバイスにインストール
adb -s 357782090141369 install build/app/outputs/flutter-apk/app-release.apk

# 既存アプリを置き換えてインストール
adb -s 357782090141369 install -r build/app/outputs/flutter-apk/app-release.apk
```

### 4.2 手動インストール
1. APKファイルをデバイスに転送
2. デバイスで「提供元不明のアプリ」の許可を有効化
3. ファイルマネージャーからAPKファイルをタップしてインストール

## 5. トラブルシューティング

### 5.1 デバイスが認識されない場合
```bash
# USBデバッグの確認
adb devices

# adbサーバーの再起動
adb kill-server
adb start-server
```

### 5.2 ビルドエラーの対処
```bash
# 依存関係の更新
flutter pub get

# キャッシュのクリア
flutter clean
flutter pub get

# Android Gradle キャッシュのクリア
cd android
./gradlew clean
cd ..
```

### 5.3 パーミッションエラー
- デバイスの開発者オプションでUSBデバッグが有効になっているか確認
- インストール時に「提供元不明のアプリ」の許可が必要

### 5.4 型エラーの対処
```
type 'String' is not a subtype of type 'bool'
type 'init' is not a subtype of type 'bool'
```
このような型エラーが発生した場合：

#### 解決方法1: アプリのSharedPreferencesをクリア

一時的にadbパスを通す
# platform-toolsのパスを追加
$env:PATH += ";C:\Users\USER\AppData\Local\Android\sdk\platform-tools"

# cmdline-toolsのパスも追加
$env:PATH += ";C:\Users\USER\AppData\Local\Android\sdk\cmdline-tools\latest\bin"

# 確認
adb --version

```bash
# 特定のアプリのSharedPreferencesをクリア
adb shell run-as com.example.client_app rm -rf /data/data/com.example.client_app/shared_prefs/

# アプリを再起動
adb shell am force-stop com.example.client_app
adb shell am start -n com.example.client_app/.MainActivity
```

#### 解決方法2: アプリを再インストール
```bash
# アプリをアンインストール
adb uninstall com.example.client_app

# 再インストール
flutter install
```

#### 解決方法3: デバイスのアプリデータをクリア
1. デバイスの設定 > アプリ > 神の手じゃんけん
2. 「ストレージ」をタップ
3. 「データを削除」をタップ

このエラーは主にSharedPreferencesに不正な値が保存された際に発生します。上記の手順でアプリのデータをクリアすることで解決できます。

## 6. ビルド成果物の場所

### デバッグビルド
- APK: `packages/client_app/build/app/outputs/flutter-apk/app-debug.apk`

### リリースビルド
- APK: `packages/client_app/build/app/outputs/flutter-apk/app-release.apk`
- 分割APK: `packages/client_app/build/app/outputs/flutter-apk/app-{arch}-release.apk`
- AAB: `packages/client_app/build/app/outputs/bundle/release/app-release.aab`

## 7. よく使用するコマンド一覧

```bash
# デバイス接続確認
flutter devices

# デバッグ実行（ホットリロード付き）
flutter run -d "801SH"

# デバッグAPK作成
flutter build apk --debug

# リリースAPK作成
flutter build apk --release

# 分割APK作成（推奨）
flutter build apk --split-per-abi

# AAB作成（Google Play用）
flutter build appbundle --release

# APKインストール
adb install -r build/app/outputs/flutter-apk/app-release.apk

# アプリログ確認
flutter logs

# クリーンビルド
flutter clean && flutter pub get
```

## 8. 最適化のヒント

1. **リリースビルド**: 本番環境では必ず `--release` フラグを使用
2. **分割APK**: ファイルサイズを最小化するために `--split-per-abi` を使用
3. **プロガード**: リリースビルドでコードの難読化と最適化が自動適用
4. **テスト**: デバッグビルドで十分にテストしてからリリースビルドを作成

## 9. セキュリティ注意事項

- デバッグキーで署名されたAPKは本番環境で使用しないこと
- リリース版には適切な署名キーを使用すること
- 機密情報がログに出力されないよう注意すること
