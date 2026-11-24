use std::io::{BufRead, Write};
use std::path::PathBuf;

use serde_json::{Value, json};

use crate::{Options, Severity};

pub fn serve() -> std::io::Result<()> {
    let stdin = std::io::stdin();
    let mut stdout = std::io::stdout();
    for line in stdin.lock().lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }
        let Ok(msg) = serde_json::from_str::<Value>(&line) else {
            writeln!(
                stdout,
                "{}",
                json!({"jsonrpc": "2.0", "id": null, "error": {"code": -32700, "message": "parse error"}})
            )?;
            stdout.flush()?;
            continue;
        };
        let Some(id) = msg.get("id").cloned() else {
            continue;
        };
        let method = msg["method"].as_str().unwrap_or("");
        let reply = match method {
            "initialize" => Ok(json!({
                "protocolVersion": msg["params"]["protocolVersion"].as_str().unwrap_or("2025-06-18"),
                "capabilities": { "tools": {} },
                "serverInfo": { "name": "safe-anything", "version": env!("CARGO_PKG_VERSION") },
                "instructions": "Use `scan` to check a folder for vulnerabilities, leaked secrets, risky mobile and cloud config, vulnerable dependencies and unsafe AI agent setups. Each finding has a file, a line, why it matters and how to fix it.",
            })),
            "ping" => Ok(json!({})),
            "tools/list" => Ok(json!({ "tools": tools() })),
            "tools/call" => Ok(call(&msg["params"])),
            _ => Err(json!({"code": -32601, "message": format!("unknown method {method}")})),
        };
        let out = match reply {
            Ok(result) => json!({"jsonrpc": "2.0", "id": id, "result": result}),
            Err(error) => json!({"jsonrpc": "2.0", "id": id, "error": error}),
        };
        writeln!(stdout, "{out}")?;
        stdout.flush()?;
    }
    Ok(())
}

fn tools() -> Value {
    json!([
        {
            "name": "scan",
            "description": "Scan a folder or file for security problems: code vulnerabilities (SQL/command injection, XSS, SSRF...), leaked secrets, mobile and cloud misconfiguration, dependencies with known CVEs (OSV.dev), and unsafe AI agent setups (MCP servers, hooks, skills, permissions). Returns JSON findings with file, line, severity, CWE and a fix.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": { "type": "string", "description": "Folder or file to scan (absolute path)." },
                    "offline": { "type": "boolean", "description": "Skip the dependency lookup on OSV.dev (no network). Default false." },
                    "severity": { "type": "string", "enum": ["low", "medium", "high", "critical"], "description": "Lowest severity to return. Default low." },
                    "include_tests": { "type": "boolean", "description": "Also report findings in test and fixture files. Default false." }
                },
                "required": ["path"]
            },
            "annotations": { "readOnlyHint": true, "openWorldHint": true }
        },
        {
            "name": "list_rules",
            "description": "List every rule safe-anything checks, with its severity, CWE and OWASP category.",
            "inputSchema": { "type": "object", "properties": {} },
            "annotations": { "readOnlyHint": true }
        }
    ])
}

fn call(params: &Value) -> Value {
    let args = &params["arguments"];
    let text = match params["name"].as_str() {
        Some("scan") => {
            let Some(path) = args["path"].as_str() else {
                return error("`path` is required");
            };
            let mut options = if args["offline"].as_bool().unwrap_or(false) {
                Options::offline()
            } else {
                Options::online()
            };
            options.include_tests = args["include_tests"].as_bool().unwrap_or(false);
            let min = args["severity"]
                .as_str()
                .and_then(Severity::parse)
                .unwrap_or(Severity::Low);
            match crate::scan(&PathBuf::from(path), &options) {
                Ok(mut report) => {
                    report.findings.retain(|f| f.severity >= min);
                    serde_json::to_string_pretty(&report).unwrap_or_default()
                }
                Err(e) => return error(&e.to_string()),
            }
        }
        Some("list_rules") => serde_json::to_string_pretty(&crate::rules()).unwrap_or_default(),
        other => return error(&format!("unknown tool {}", other.unwrap_or("(none)"))),
    };
    json!({ "content": [{ "type": "text", "text": text }] })
}

fn error(msg: &str) -> Value {
    json!({ "content": [{ "type": "text", "text": msg }], "isError": true })
}
