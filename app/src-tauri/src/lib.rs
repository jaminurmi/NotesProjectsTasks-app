use std::fs;
use std::path::{Path, PathBuf};

const EMPTY_DATA: &str = r#"{"notes":[],"projects":[],"tasks":[]}"#;

fn documents_data_file() -> Result<PathBuf, String> {
    let docs = dirs::document_dir().ok_or_else(|| "Asiakirjakansiota ei löydy".to_string())?;
    Ok(docs
        .join("Projects & Notes")
        .join("data")
        .join("muistio.json"))
}

fn atomic_write(path: &Path, contents: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }

    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, contents).map_err(|err| err.to_string())?;

    if path.exists() {
        let bak = path.with_extension("json.bak");
        if bak.exists() {
            fs::remove_file(&bak).map_err(|err| err.to_string())?;
        }
        fs::rename(path, &bak).map_err(|err| err.to_string())?;
        if let Err(err) = fs::rename(&tmp, path) {
            let _ = fs::rename(&bak, path);
            return Err(err.to_string());
        }
        let _ = fs::remove_file(&bak);
    } else if let Err(err) = fs::rename(&tmp, path) {
        return Err(err.to_string());
    }

    Ok(())
}

fn read_or_empty(path: &Path) -> Result<String, String> {
    if !path.exists() {
        return Ok(EMPTY_DATA.to_string());
    }
    fs::read_to_string(path).map_err(|err| err.to_string())
}

#[tauri::command]
fn load_data() -> Result<String, String> {
    read_or_empty(&documents_data_file()?)
}

#[tauri::command]
fn save_data(contents: String) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(&contents)
        .map_err(|err| format!("Virheellinen JSON: {err}"))?;
    atomic_write(&documents_data_file()?, &contents)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_data, save_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn atomic_write_creates_and_replaces_file() {
        let dir = std::env::temp_dir().join(format!("muistio-test-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join("muistio.json");

        atomic_write(&path, r#"{"notes":[]}"#).unwrap();
        atomic_write(&path, r#"{"notes":[{"id":"a"}]}"#).unwrap();

        assert_eq!(
            fs::read_to_string(&path).unwrap(),
            r#"{"notes":[{"id":"a"}]}"#
        );
        assert!(!path.with_extension("json.tmp").exists());
        assert!(!path.with_extension("json.bak").exists());
        assert_eq!(
            read_or_empty(&dir.join("missing.json")).unwrap(),
            EMPTY_DATA
        );

        let _ = fs::remove_dir_all(&dir);
    }
}
