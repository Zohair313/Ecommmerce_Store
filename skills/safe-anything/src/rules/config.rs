use std::sync::LazyLock;

use regex::Regex;

use super::{FileInfo, Rule, Text};
use crate::Finding;
use crate::{Family, Severity};

fn dockerfile(f: &FileInfo) -> bool {
    f.name == "dockerfile"
        || f.name.starts_with("dockerfile.")
        || f.name.ends_with(".dockerfile")
        || f.name == "containerfile"
}
fn shell(f: &FileInfo) -> bool {
    f.ext_in(&["sh", "bash", "zsh", "ps1"])
        || f.name == "makefile"
        || f.name == "justfile"
        || dockerfile(f)
}
fn workflow(f: &FileInfo) -> bool {
    f.under(".github/workflows/") && f.ext_in(&["yml", "yaml"])
}
fn yaml(f: &FileInfo) -> bool {
    f.ext_in(&["yml", "yaml"])
}
fn terraform(f: &FileInfo) -> bool {
    f.ext_in(&["tf", "hcl"])
}
fn server_conf(f: &FileInfo) -> bool {
    f.ext == "conf" || f.name == "nginx.conf" || f.name == "httpd.conf" || f.name == ".htaccess"
}

macro_rules! rule {
    ($id:literal, $sev:ident, $files:ident, $pat:literal, $unless:expr, $msg:literal, $fix:literal) => {
        Rule {
            id: $id,
            family: Family::Config,
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
        "config.remote-script",
        Medium,
        shell,
        r"\b(?:curl|wget|iwr|Invoke-WebRequest)\b[^|\n]*?(?:https?://|\$\{?\w)[^|\n]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|python3?|iex)\b",
        None,
        "A script is downloaded and piped straight into a shell, with no pinning or checksum.",
        "Download to a file, verify a pinned checksum or signature, then run it; or use a package manager."
    ),
    rule!(
        "config.docker-unpinned-image",
        Low,
        dockerfile,
        r"(?mi)^FROM\s+(?:--platform=\S+\s+)?[^\s:@$]+(?::latest)?(?:\s+AS\s+\S+)?\s*$",
        Some(r"(?i)^FROM\s+scratch\b"),
        "The base image has no version tag (or uses latest), so builds change without notice.",
        "Pin a version tag, ideally with a digest (image:1.2@sha256:...)."
    ),
    rule!(
        "config.docker-secret-env",
        High,
        dockerfile,
        r"(?mi)^(?:ENV|ARG)\s+\w*(?:PASSWORD|SECRET|TOKEN|API_?KEY|PRIVATE_KEY)\w*\s*[= ]\s*\S+",
        None,
        "A secret is baked into the image; anyone who pulls it can read it from the layers.",
        "Pass secrets at run time, or use BuildKit secrets (RUN --mount=type=secret)."
    ),
    rule!(
        "config.docker-add-url",
        Low,
        dockerfile,
        r"(?mi)^ADD\s+https?://",
        None,
        "ADD downloads a remote file at build time without checking it.",
        "Download with curl and verify a checksum, or COPY a vendored file."
    ),
    rule!(
        "config.docker-root-user",
        Medium,
        dockerfile,
        r"(?mi)^USER\s+(?:root|0)\s*$",
        None,
        "The container runs as root, so a break-out starts with full privileges.",
        "Create an unprivileged user and switch to it with USER."
    ),
    rule!(
        "config.gha-pull-request-target",
        Medium,
        workflow,
        r"(?m)^\s*pull_request_target\s*:|on:\s*\[[^\]\n]*pull_request_target",
        None,
        "pull_request_target runs with repository secrets on code from forks; checking out the PR head here is a known takeover path.",
        "Use pull_request, or never check out or run the PR's code in this workflow."
    ),
    rule!(
        "config.gha-write-all",
        Medium,
        workflow,
        r"permissions\s*:\s*write-all",
        None,
        "The workflow token can write to everything in the repository.",
        "Set permissions: contents: read, and grant writes per job only where needed."
    ),
    rule!(
        "config.gha-unpinned-action",
        Medium,
        workflow,
        r"uses:\s*[\w.\-]+/[\w./\-]+@(?:main|master|dev|develop|HEAD|latest)\b",
        None,
        "A third-party action runs from a moving branch, so any push to it runs in your CI with your secrets.",
        "Pin the action to a full commit SHA."
    ),
    rule!(
        "config.gha-script-injection",
        High,
        workflow,
        r"\$\{\{\s*github\.(?:event\.(?:issue|pull_request|comment|review|review_comment|discussion|head_commit|commits|pages)[\w.\[\]*]*\.(?:title|body|message|name|label|ref|email|default_branch)|head_ref)\s*\}\}",
        None,
        "Text an outsider controls (a PR title, issue body, branch name) is pasted into the workflow, so it can run commands.",
        "Pass it through an env: variable and use \"$VAR\" in the script."
    ),
    rule!(
        "config.privileged-container",
        High,
        yaml,
        r"(?m)^\s*(?:privileged|allowPrivilegeEscalation)\s*:\s*true\b",
        None,
        "A container runs privileged (or may gain privileges), which gives it near-root access to the host.",
        "Remove privileged and set allowPrivilegeEscalation: false; add only the capabilities you need."
    ),
    rule!(
        "config.k8s-host-access",
        High,
        yaml,
        r"(?m)^\s*host(?:Network|PID|IPC)\s*:\s*true\b",
        None,
        "The pod shares the host's network, process or IPC namespace.",
        "Remove hostNetwork/hostPID/hostIPC unless the workload truly needs it."
    ),
    rule!(
        "config.tf-open-ingress",
        Medium,
        terraform,
        r#"\bcidr_blocks\s*=\s*\[\s*"0\.0\.0\.0/0"|\bipv6_cidr_blocks\s*=\s*\[\s*"::/0""#,
        None,
        "A network rule is open to the whole internet.",
        "Limit the CIDR to known addresses, especially for SSH, RDP and databases. Ignore for public web ports or egress."
    ),
    rule!(
        "config.tf-public-bucket",
        High,
        terraform,
        r#"\bacl\s*=\s*"public-read(?:-write)?""#,
        None,
        "A storage bucket is public.",
        "Make it private and serve files through a CDN or signed URLs."
    ),
    rule!(
        "config.nginx-autoindex",
        Low,
        server_conf,
        r"(?m)^\s*autoindex\s+on\s*;",
        None,
        "Directory listing is on, so every file in the folder can be browsed.",
        "Set autoindex off."
    ),
    rule!(
        "config.weak-tls-version",
        Medium,
        server_conf,
        r"(?i)(?:ssl_protocols|SSLProtocol)[^;\n]*\b(?:SSLv[23]|TLSv1|TLSv1\.1)(?:\s|;|$)",
        None,
        "Old TLS or SSL versions are enabled; they have known attacks.",
        "Allow only TLSv1.2 and TLSv1.3."
    ),
];

static STAGE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?mi)^FROM\s+\S+\s+AS\s+(\S+)").unwrap());
static FROM: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)^\s*FROM\s+(?:--platform=\S+\s+)?(\S+)").unwrap());
static YAML_KEY: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s*-?\s*([A-Za-z_][\w-]*)\s*:\s*\S").unwrap());

pub fn keep(file: &FileInfo, text: &Text, f: &Finding) -> bool {
    match f.rule.as_str() {
        "config.docker-unpinned-image" => {
            let stages: Vec<String> = STAGE
                .captures_iter(text.src)
                .map(|c| c[1].to_ascii_lowercase())
                .collect();
            FROM.captures(text.line(f.line))
                .is_none_or(|c| !stages.contains(&c[1].to_ascii_lowercase()))
        }
        "config.gha-script-injection" if workflow(file) => YAML_KEY
            .captures(text.line(f.line))
            .is_none_or(|c| &c[1] == "run" || &c[1] == "script"),
        _ => true,
    }
}
