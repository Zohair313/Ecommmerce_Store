use std::path::Path;
use std::sync::Mutex;

use ignore::{WalkBuilder, WalkState};

use crate::Finding;
use crate::deps::{self, Package};
use crate::rules::{self, FileInfo};

const MAX_BYTES: u64 = 2 * 1024 * 1024;
const SKIP_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "vendor",
    "dist",
    "build",
    ".next",
    ".venv",
    "venv",
    "__pycache__",
    "Pods",
    ".gradle",
];

pub struct Scanned {
    pub files: usize,
    pub findings: Vec<Finding>,
    pub packages: Vec<Package>,
    pub env_files: Vec<String>,
}

pub fn scan_files(root: &Path, include_tests: bool) -> Scanned {
    let out = Mutex::new(Scanned {
        files: 0,
        findings: Vec::new(),
        packages: Vec::new(),
        env_files: Vec::new(),
    });
    let single_file = root.is_file();
    let base = if single_file {
        root.parent().unwrap_or(Path::new(".")).to_path_buf()
    } else {
        root.to_path_buf()
    };
    WalkBuilder::new(root)
        .hidden(false)
        .git_ignore(true)
        .git_global(false)
        .require_git(false)
        .add_custom_ignore_filename(".safe-anything-ignore")
        .filter_entry(|e| {
            if !e.file_type().is_some_and(|t| t.is_dir()) {
                return true;
            }
            let name = e.file_name().to_string_lossy();
            let agent_copy = name == "worktrees"
                && e.path()
                    .parent()
                    .and_then(|p| p.file_name())
                    .is_some_and(|p| p == ".claude");
            !(SKIP_DIRS.contains(&name.as_ref()) || agent_copy)
        })
        .build_parallel()
        .run(|| {
            let out = &out;
            let base = &base;
            Box::new(move |entry| {
                let Ok(entry) = entry else {
                    return WalkState::Continue;
                };
                if !entry.file_type().is_some_and(|t| t.is_file()) {
                    return WalkState::Continue;
                }
                let path = entry.path();
                if entry.metadata().map(|m| m.len()).unwrap_or(0) > MAX_BYTES {
                    return WalkState::Continue;
                }
                let Ok(bytes) = std::fs::read(path) else {
                    return WalkState::Continue;
                };
                if bytes[..bytes.len().min(8192)].contains(&0) {
                    return WalkState::Continue;
                }
                let text = String::from_utf8_lossy(&bytes);
                let rel = path
                    .strip_prefix(base)
                    .unwrap_or(path)
                    .to_string_lossy()
                    .replace('\\', "/");
                let info = FileInfo::new(&rel);
                if info.name.ends_with(".min.js") || info.ext_in(&["map", "jsonl", "log"]) {
                    return WalkState::Continue;
                }
                let findings = if info.ext == "lock" {
                    Vec::new()
                } else {
                    rules::check(&info, &text, include_tests)
                };
                let packages = deps::parse_lockfile(&info, &text);
                let mut out = out.lock().unwrap();
                out.files += 1;
                out.findings.extend(findings);
                out.packages.extend(packages);
                if rules::secrets::is_env(&info.name) && !info.is_test() {
                    out.env_files.push(rel.clone());
                }
                WalkState::Continue
            })
        });
    let mut scanned = out.into_inner().unwrap();
    scanned.packages.sort();
    scanned.packages.dedup();
    scanned
}
