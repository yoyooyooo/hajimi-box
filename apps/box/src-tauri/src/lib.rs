mod database;
mod models;
mod services;

use database::init_database;
use models::{CreateUserRequest, UpdateUserRequest, UserResponse};
use services::UserService;
use tauri::AppHandle;
use sqlx::Row; // for row.get

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn init_db(app: AppHandle) -> Result<String, String> {
    init_database(&app).await.map_err(|e| e.to_string())?;
    Ok("Database initialized successfully".to_string())
}

#[tauri::command]
async fn create_user(app: AppHandle, request: CreateUserRequest) -> Result<UserResponse, String> {
    UserService::create_user(&app, request).await
}

#[tauri::command]
async fn get_user(app: AppHandle, id: i64) -> Result<UserResponse, String> {
    UserService::get_user_by_id(&app, id).await
}

#[tauri::command]
async fn get_all_users(app: AppHandle) -> Result<Vec<UserResponse>, String> {
    UserService::get_all_users(&app).await
}

#[tauri::command]
async fn update_user(app: AppHandle, id: i64, request: UpdateUserRequest) -> Result<UserResponse, String> {
    UserService::update_user(&app, id, request).await
}

#[tauri::command]
async fn delete_user(app: AppHandle, id: i64) -> Result<(), String> {
    println!("Deleting user with id: {}", id);
    UserService::delete_user(&app, id).await
}

#[tauri::command]
async fn get_migration_status(app: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let pool = database::get_database(&app).await.map_err(|e| e.to_string())?;
    
    let rows = sqlx::query("SELECT version, description, installed_on, success FROM _sqlx_migrations ORDER BY version")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let migrations: Vec<serde_json::Value> = rows.into_iter()
        .map(|row| {
            serde_json::json!({
                "version": row.get::<i64, _>("version"),
                "description": row.get::<String, _>("description"),
                "installed_on": row.get::<String, _>("installed_on"),
                "success": row.get::<bool, _>("success")
            })
        })
        .collect();
    
    Ok(migrations)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            init_db,
            create_user,
            get_user,
            get_all_users,
            update_user,
            delete_user,
            get_migration_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
