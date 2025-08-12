use sqlx::{Sqlite, SqlitePool, migrate::MigrateDatabase};
use std::sync::Arc;
use tokio::sync::OnceCell;
use tauri::{AppHandle, Manager};

pub type DbPool = Arc<SqlitePool>;

static DB_POOL: OnceCell<DbPool> = OnceCell::const_new();

pub async fn init_database(app: &AppHandle) -> Result<DbPool, sqlx::Error> {
    // 如果已经初始化，直接返回
    if let Some(pool) = DB_POOL.get() {
        return Ok(pool.clone());
    }
    
    // 获取应用数据目录
    let app_data_dir = app.path().app_data_dir().map_err(|e| {
        sqlx::Error::Configuration(format!("Failed to get app data dir: {}", e).into())
    })?;
    
    // 确保目录存在
    std::fs::create_dir_all(&app_data_dir).map_err(|e| {
        sqlx::Error::Configuration(format!("Failed to create app data dir: {}", e).into())
    })?;
    
    let db_path = app_data_dir.join("app_database.db");
    let database_url = format!("sqlite:{}", db_path.to_string_lossy());
    
    if !Sqlite::database_exists(&database_url).await.unwrap_or(false) {
        println!("Creating database {}", database_url);
        match Sqlite::create_database(&database_url).await {
            Ok(_) => println!("Create db success"),
            Err(error) => panic!("error: {}", error),
        }
    } else {
        println!("Database already exists");
    }

    let pool = SqlitePool::connect(&database_url).await?;
    
    // 运行数据库迁移
    sqlx::migrate!("./migrations").run(&pool).await?;
    
    let pool = Arc::new(pool);
    
    // 只有在还没设置时才设置
    match DB_POOL.set(pool.clone()) {
        Ok(_) => println!("Database pool initialized successfully"),
        Err(_) => {
            // 如果设置失败，说明已经被其他线程初始化了，直接返回当前的
            if let Some(existing_pool) = DB_POOL.get() {
                return Ok(existing_pool.clone());
            } else {
                return Err(sqlx::Error::Configuration("Failed to set database pool".into()));
            }
        }
    }
    
    Ok(pool)
}

pub async fn get_database(app: &AppHandle) -> Result<DbPool, sqlx::Error> {
    match DB_POOL.get() {
        Some(pool) => Ok(pool.clone()),
        None => init_database(app).await,
    }
}