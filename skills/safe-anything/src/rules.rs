use std::sync::LazyLock;

use regex::Regex;

use crate::{Family, Finding, Severity};

pub mod agent;
mod code;
mod config;
mod mobile;
pub mod secrets;

pub struct FileInfo {
    pub rel: String,
    pub name: String,
    pub ext: String,
}

impl FileInfo {
    pub fn new(rel: &str) -> Self {
        let name = rel.rsplit('/').next().unwrap_or(rel).to_ascii_lowercase();
        let ext = name
            .rsplit_once('.')
            .map(|(_, e)| e.to_string())
            .unwrap_or_default();
        Self {
            rel: rel.to_string(),
            name,
            ext,
        }
    }

    pub fn ext_in(&self, exts: &[&str]) -> bool {
        exts.contains(&self.ext.as_str())
    }

    pub fn is_test(&self) -> bool {
        const DIRS: &[&str] = &[
            "test",
            "tests",
            "__tests__",
            "spec",
            "specs",
            "cypress",
            "e2e",
            "fixtures",
            "__mocks__",
            "testdata",
            "mocks",
        ];
        let mut parts = self.rel.split('/');
        parts.next_back();
        parts.any(|p| DIRS.contains(&p.to_ascii_lowercase().as_str()))
            || [".spec.", ".test.", "_test.", "_spec.", ".cy."]
                .iter()
                .any(|m| self.name.contains(m))
            || self.name.starts_with("test_")
    }

    pub fn under(&self, dir: &str) -> bool {
        self.rel.starts_with(dir) || self.rel.contains(&format!("/{dir}"))
    }
}

pub struct Rule {
    pub id: &'static str,
    pub family: Family,
    pub severity: Severity,
    pub files: fn(&FileInfo) -> bool,
    pub pattern: &'static str,
    pub unless: Option<&'static str>,
    pub message: &'static str,
    pub fix: &'static str,
}

struct Compiled {
    rule: &'static Rule,
    re: Regex,
    unless: Option<Regex>,
}

static RULES: LazyLock<Vec<Compiled>> = LazyLock::new(|| {
    [
        code::RULES,
        secrets::RULES,
        agent::RULES,
        mobile::RULES,
        config::RULES,
    ]
    .into_iter()
    .flatten()
    .map(|rule| Compiled {
        rule,
        re: Regex::new(rule.pattern).unwrap_or_else(|e| panic!("{}: {e}", rule.id)),
        unless: rule
            .unless
            .map(|u| Regex::new(u).unwrap_or_else(|e| panic!("{} unless: {e}", rule.id))),
    })
    .collect()
});

pub fn all() -> impl Iterator<Item = &'static Rule> {
    RULES.iter().map(|c| c.rule)
}

pub struct Text<'a> {
    pub src: &'a str,
    starts: Vec<usize>,
}

impl<'a> Text<'a> {
    pub fn new(src: &'a str) -> Self {
        let mut starts = vec![0];
        starts.extend(src.match_indices('\n').map(|(i, _)| i + 1));
        Self { src, starts }
    }

    pub fn line_of(&self, offset: usize) -> usize {
        self.starts.partition_point(|&s| s <= offset)
    }

    pub fn line(&self, n: usize) -> &'a str {
        let start = self.starts[n - 1];
        let end = self.starts.get(n).map(|e| e - 1).unwrap_or(self.src.len());
        self.src[start..end].trim_end_matches('\r')
    }

    pub fn suppressed(&self, n: usize) -> bool {
        const MARK: &str = "safe-anything:ignore";
        self.line(n).contains(MARK) || (n > 1 && self.line(n - 1).contains(MARK))
    }
}

pub struct Meta<'a> {
    pub id: &'a str,
    pub family: Family,
    pub severity: Severity,
    pub message: &'a str,
    pub fix: &'a str,
    pub secret: Option<&'a str>,
}

pub fn finding(file: &FileInfo, text: &Text, line: usize, meta: Meta) -> Finding {
    let raw = text.line(line).trim();
    let snippet = match meta.secret {
        Some(secret) if !secret.is_empty() => shorten(&raw.replace(secret, &mask(secret))),
        _ => shorten(raw),
    };
    Finding::new(
        meta.id,
        meta.family,
        meta.severity,
        file.rel.clone(),
        line,
        meta.message.to_string(),
        meta.fix.to_string(),
        snippet,
    )
}

fn shorten(s: &str) -> String {
    if s.chars().count() > 160 {
        format!("{}…", s.chars().take(160).collect::<String>())
    } else {
        s.to_string()
    }
}

fn mask(secret: &str) -> String {
    let keep: String = secret.chars().take(4).collect();
    format!("{keep}****")
}

pub fn check(file: &FileInfo, src: &str, include_tests: bool) -> Vec<Finding> {
    let text = Text::new(src);
    let test_file = !include_tests && file.is_test();
    let mut out = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for c in RULES.iter() {
        if !(c.rule.files)(file) {
            continue;
        }
        if test_file && !(c.rule.family == Family::Secret && c.rule.severity == Severity::Critical)
        {
            continue;
        }
        for caps in c.re.captures_iter(src) {
            let m = caps.get(0).expect("whole match");
            let secret = (c.rule.family == Family::Secret
                && !secrets::NAME_ONLY.contains(&c.rule.id))
            .then(|| {
                caps.iter()
                    .skip(1)
                    .flatten()
                    .last()
                    .unwrap_or(m)
                    .as_str()
                    .lines()
                    .next()
                    .unwrap_or("")
            });
            let line = text.line_of(m.start());
            if text.suppressed(line) {
                continue;
            }
            if c.rule.family == Family::Code
                && (is_comment(text.line(line)) || is_prose(text.line(line)))
            {
                continue;
            }
            if let Some(unless) = &c.unless
                && unless.is_match(text.line(line))
            {
                continue;
            }
            if seen.insert((c.rule.id.to_string(), line)) {
                out.push(finding(
                    file,
                    &text,
                    line,
                    Meta {
                        id: c.rule.id,
                        family: c.rule.family,
                        severity: c.rule.severity,
                        message: c.rule.message,
                        fix: c.rule.fix,
                        secret,
                    },
                ));
            }
        }
    }
    out.retain(|f| config::keep(file, &text, f));
    for f in agent::structured(file, &text)
        .into_iter()
        .filter(|_| !test_file)
    {
        if !text.suppressed(f.line) && seen.insert((f.rule.clone(), f.line)) {
            out.push(f);
        }
    }
    out
}

fn is_comment(line: &str) -> bool {
    let t = line.trim_start();
    ["//", "#", "/*", "* ", "--", "<!--"]
        .iter()
        .any(|p| t.starts_with(p))
        || t == "*"
}

fn is_prose(line: &str) -> bool {
    line.contains("**") || line.contains('⚠') || line.contains("\\b")
}
