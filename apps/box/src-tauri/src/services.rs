use crate::database::get_database;
use crate::models::{CreateUserRequest, UpdateUserRequest, UserResponse};
use chrono::Utc;
use sqlx::Row;
use tauri::AppHandle;

pub struct UserService;

impl UserService {
    pub async fn create_user(app: &AppHandle, request: CreateUserRequest) -> Result<UserResponse, String> {
        let pool = get_database(app).await.map_err(|e| e.to_string())?;
        
        let now = Utc::now();
        let result = sqlx::query(
            "INSERT INTO users (name, email, age, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)"
        )
        .bind(&request.name)
        .bind(&request.email)
        .bind(request.age)
        .bind(now.to_rfc3339())
        .bind(now.to_rfc3339())
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;

        let user_id = result.last_insert_rowid();
        
        Self::get_user_by_id(app, user_id).await
    }

    pub async fn get_user_by_id(app: &AppHandle, id: i64) -> Result<UserResponse, String> {
        let pool = get_database(app).await.map_err(|e| e.to_string())?;
        
        let row = sqlx::query(
            "SELECT id, name, email, age, created_at, updated_at FROM users WHERE id = ?1"
        )
        .bind(id)
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(UserResponse {
            id: row.get("id"),
            name: row.get("name"),
            email: row.get("email"),
            age: row.get("age"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn get_all_users(app: &AppHandle) -> Result<Vec<UserResponse>, String> {
        let pool = get_database(app).await.map_err(|e| e.to_string())?;
        
        let rows = sqlx::query(
            "SELECT id, name, email, age, created_at, updated_at FROM users ORDER BY created_at DESC"
        )
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;

        let users: Vec<UserResponse> = rows.into_iter().map(|row| {
            UserResponse {
                id: row.get("id"),
                name: row.get("name"),
                email: row.get("email"),
                age: row.get("age"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }
        }).collect();

        Ok(users)
    }

    pub async fn update_user(app: &AppHandle, id: i64, request: UpdateUserRequest) -> Result<UserResponse, String> {
        let pool = get_database(app).await.map_err(|e| e.to_string())?;
        
        let now = Utc::now();
        
        // 构建动态更新查询
        let mut query_builder = sqlx::QueryBuilder::new("UPDATE users SET ");
        let mut first = true;
        
        if let Some(name) = &request.name {
            if !first {
                query_builder.push(", ");
            }
            query_builder.push("name = ").push_bind(name);
            first = false;
        }
        
        if let Some(email) = &request.email {
            if !first {
                query_builder.push(", ");
            }
            query_builder.push("email = ").push_bind(email);
            first = false;
        }
        
        if let Some(age) = request.age {
            if !first {
                query_builder.push(", ");
            }
            query_builder.push("age = ").push_bind(age);
            first = false;
        }
        
        if !first {
            query_builder.push(", ");
        }
        query_builder.push("updated_at = ").push_bind(now.to_rfc3339());
        
        query_builder.push(" WHERE id = ").push_bind(id);
        
        if first {
            return Err("No fields to update".to_string());
        }
        
        let result = query_builder.build().execute(&*pool).await.map_err(|e| e.to_string())?;
        
        if result.rows_affected() == 0 {
            return Err("User not found".to_string());
        }

        Self::get_user_by_id(app, id).await
    }

    pub async fn delete_user(app: &AppHandle, id: i64) -> Result<(), String> {
        let pool = get_database(app).await.map_err(|e| e.to_string())?;
        
        let result = sqlx::query("DELETE FROM users WHERE id = ?1")
            .bind(id)
            .execute(&*pool)
            .await
            .map_err(|e| e.to_string())?;

        if result.rows_affected() == 0 {
            return Err("User not found".to_string());
        }

        Ok(())
    }
}