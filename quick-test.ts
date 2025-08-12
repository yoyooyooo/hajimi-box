#!/usr/bin/env bun
import { invoke } from "@tauri-apps/api/core";

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  created_at: string;
  updated_at: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

async function quickTest() {
  console.log("🧪 快速测试 SQLx CRUD 功能...");

  try {
    // 测试数据库初始化
    console.log("1. 初始化数据库...");
    const initResult = await invoke<string>("init_db");
    console.log("✅", initResult);

    // 测试创建用户
    console.log("2. 创建测试用户...");
    const newUser: CreateUserRequest = {
      name: "测试用户",
      email: "test@example.com",
      age: 28
    };
    
    const createdUser = await invoke<User>("create_user", { request: newUser });
    console.log("✅ 用户创建成功:", createdUser);

    // 测试获取所有用户
    console.log("3. 获取用户列表...");
    const users = await invoke<User[]>("get_all_users");
    console.log("✅ 当前用户数量:", users.length);

    console.log("🎉 基本 CRUD 功能测试通过！");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

quickTest();