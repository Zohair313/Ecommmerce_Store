use std::collections::BTreeSet;

use serde_json::{Value, json};

use crate::{Report, Severity};

fn level(s: Severity) -> &'static str {
    match s {
        Severity::Critical | Severity::High => "error",
        Severity::Medium => "warning",
        Severity::Low => "note",
    }
}

fn score(s: Severity) -> &'static str {
    match s {
        Severity::Critical => "9.5",
        Severity::High => "8.0",
        Severity::Medium => "5.5",
        Severity::Low => "3.0",
    }
}

pub fn render(report: &Report) -> Value {
    let used: BTreeSet<&str> = report.findings.iter().map(|f| f.rule.as_str()).collect();
    let rules: Vec<Value> = crate::rules()
        .into_iter()
        .filter(|r| used.contains(r.id))
        .map(|r| {
            json!({
                "id": r.id,
                "name": r.id,
                "shortDescription": { "text": r.message },
                "helpUri": r.learn_more,
                "defaultConfiguration": { "level": level(r.severity) },
                "properties": {
                    "tags": ["security", r.family.as_str(), r.cwe, r.owasp],
                    "security-severity": score(r.severity),
                },
            })
        })
        .collect();
    let results: Vec<Value> = report
        .findings
        .iter()
        .map(|f| {
            json!({
                "ruleId": f.rule,
                "level": level(f.severity),
                "message": { "text": format!("{} Fix: {}", f.message, f.fix) },
                "locations": [{
                    "physicalLocation": {
                        "artifactLocation": { "uri": f.path },
                        "region": { "startLine": f.line },
                    },
                }],
                "properties": { "security-severity": score(f.severity) },
            })
        })
        .collect();
    json!({
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "version": "2.1.0",
        "runs": [{
            "tool": { "driver": {
                "name": "safe-anything",
                "version": env!("CARGO_PKG_VERSION"),
                "informationUri": "https://github.com/erkamyaman/safe-anything",
                "rules": rules,
            }},
            "results": results,
        }],
    })
}
