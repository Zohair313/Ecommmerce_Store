use super::{FileInfo, Rule};
use crate::{Family, Severity};

fn manifest(f: &FileInfo) -> bool {
    f.name == "androidmanifest.xml"
}
fn net_config(f: &FileInfo) -> bool {
    f.ext == "xml" && (f.name.contains("network_security") || f.name == "androidmanifest.xml")
}
fn android_code(f: &FileInfo) -> bool {
    f.ext_in(&["java", "kt"])
}
fn plist(f: &FileInfo) -> bool {
    f.ext == "plist"
}
fn app_code(f: &FileInfo) -> bool {
    f.ext_in(&["swift", "m", "dart", "js", "jsx", "ts", "tsx", "kt", "java"])
}

macro_rules! rule {
    ($id:literal, $sev:ident, $files:ident, $pat:literal, $unless:expr, $msg:literal, $fix:literal) => {
        Rule {
            id: $id,
            family: Family::Mobile,
            severity: Severity::$sev,
            files: $files,
            pattern: $pat,
            unless: $unless,
            message: $msg,
            fix: $fix,
        }
    };
}

pub static RULES: &[Rule] = &[
    rule!(
        "mobile.android-debuggable",
        High,
        manifest,
        r#"android:debuggable\s*=\s*"true""#,
        None,
        "The app is debuggable; anyone with the APK can attach a debugger and read its memory.",
        "Remove android:debuggable; the build system sets it for debug builds only."
    ),
    rule!(
        "mobile.android-allow-backup",
        Low,
        manifest,
        r#"android:allowBackup\s*=\s*"true""#,
        None,
        "App data can be copied off the device with adb backup.",
        "Set android:allowBackup=\"false\" or exclude sensitive files with backup rules."
    ),
    rule!(
        "mobile.android-cleartext",
        Medium,
        net_config,
        r#"android:usesCleartextTraffic\s*=\s*"true"|cleartextTrafficPermitted\s*=\s*"true""#,
        None,
        "Plain HTTP traffic is allowed, so data can be read or changed on the network.",
        "Use HTTPS everywhere; allow cleartext only for specific debug domains."
    ),
    rule!(
        "mobile.android-exported-provider",
        High,
        manifest,
        r#"<provider\b[^>]*android:exported\s*=\s*"true"[^>]*>"#,
        Some(r"android:(?:read|write)?[Pp]ermission"),
        "A content provider is exported with no permission, so any app on the device can read its data.",
        "Set android:exported=\"false\", or protect it with android:permission."
    ),
    rule!(
        "mobile.webview-js-bridge",
        Medium,
        android_code,
        r"\baddJavascriptInterface\s*\(",
        None,
        "Native methods are exposed to JavaScript in a WebView; any page it loads can call them.",
        "Load only trusted local content in that WebView, or remove the bridge."
    ),
    rule!(
        "mobile.webview-file-access",
        High,
        android_code,
        r"setAllow(?:Universal|File)AccessFromFileURLs\s*\(\s*true",
        None,
        "A WebView lets file:// pages read other files and origins.",
        "Leave these settings false (the default)."
    ),
    rule!(
        "mobile.world-readable",
        High,
        android_code,
        r"\bMODE_WORLD_(?:READABLE|WRITEABLE)\b",
        None,
        "A file or preferences store is readable or writable by every app on the device.",
        "Use MODE_PRIVATE, and a FileProvider to share specific files."
    ),
    rule!(
        "mobile.ios-ats-disabled",
        High,
        plist,
        r"<key>NSAllowsArbitraryLoads</key>\s*<true\s*/>",
        None,
        "App Transport Security is off, so the app may load anything over plain HTTP.",
        "Remove NSAllowsArbitraryLoads and add narrow exceptions per domain if needed."
    ),
    rule!(
        "mobile.insecure-storage",
        Medium,
        app_code,
        r#"UserDefaults[^\n]*\.set\([^\n]*forKey:\s*"[^"]*(?i:token|password|secret|jwt|session|pin)|(?i:prefs|preferences)\.set(?:String)?\(\s*['"][^'"]*(?i:token|password|secret|jwt|pin)|(?:AsyncStorage|localStorage|sessionStorage)\.setItem\(\s*['"][^'"]*(?i:token|password|secret|jwt|session)"#,
        None,
        "A token or password is saved in plain storage that other code, backups or XSS can read.",
        "Use the Keychain (iOS), EncryptedSharedPreferences/Keystore (Android), flutter_secure_storage, or an httpOnly cookie on the web."
    ),
];
