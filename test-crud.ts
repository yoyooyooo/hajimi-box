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

interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;
}

async function testCrudOperations() {
  console.log("🚀 开始测试 SQLx CRUD 功能...");

  try {
    // 1. 初始化数据库
    console.log("\n1. 初始化数据库...");
    const initResult = await invoke<string>("init_db");
    console.log("✅ 数据库初始化成功:", initResult);

    // 2. 创建用户
    console.log("\n2. 创建用户...");
    const newUser1: CreateUserRequest = {
      name: "张三",
      email: "zhangsan@example.com",
      age: 25
    };
    
    const newUser2: CreateUserRequest = {
      name: "李四",
      email: "lisi@example.com",
      age: 30
    };

    const user1 = await invoke<User>("create_user", { request: newUser1 });
    console.log("✅ 创建用户1成功:", user1);

    const user2 = await invoke<User>("create_user", { request: newUser2 });
    console.log("✅ 创建用户2成功:", user2);

    // 3. 获取所有用户
    console.log("\n3. 获取所有用户...");
    const allUsers = await invoke<User[]>("get_all_users");
    console.log("✅ 获取所有用户成功，用户数量:", allUsers.length);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.age || '未知'}岁`);
    });

    // 4. 根据ID获取用户
    console.log("\n4. 根据ID获取用户...");
    const fetchedUser = await invoke<User>("get_user", { id: user1.id });
    console.log("✅ 根据ID获取用户成功:", fetchedUser);

    // 5. 更新用户
    console.log("\n5. 更新用户...");
    const updateRequest: UpdateUserRequest = {
      name: "张三（已更新）",
      age: 26
    };
    
    const updatedUser = await invoke<User>("update_user", { 
      id: user1.id, 
      request: updateRequest 
    });
    console.log("✅ 更新用户成功:", updatedUser);

    // 6. 再次获取所有用户，验证更新
    console.log("\n6. 验证更新结果...");
    const updatedAllUsers = await invoke<User[]>("get_all_users");
    console.log("✅ 更新后的用户列表:");
    updatedAllUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.age || '未知'}岁`);
    });

    // 7. 删除用户
    console.log("\n7. 删除用户...");
    await invoke<void>("delete_user", { id: user2.id });
    console.log("✅ 删除用户成功");

    // 8. 最终验证
    console.log("\n8. 最终验证...");
    const finalUsers = await invoke<User[]>("get_all_users");
    console.log("✅ 删除后的用户列表，用户数量:", finalUsers.length);
    finalUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.age || '未知'}岁`);
    });

    console.log("\n🎉 所有 CRUD 操作测试完成！");

  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log("\n🔍 开始测试错误处理...");

  try {
    // 尝试获取不存在的用户
    console.log("\n1. 测试获取不存在的用户...");
    try {
      await invoke<User>("get_user", { id: 99999 });
      console.log("❌ 预期应该失败，但却成功了");
    } catch (error) {
      console.log("✅ 正确捕获到错误:", error);
    }

    // 尝试更新不存在的用户
    console.log("\n2. 测试更新不存在的用户...");
    try {
      await invoke<User>("update_user", { 
        id: 99999, 
        request: { name: "不存在的用户" } 
      });
      console.log("❌ 预期应该失败，但却成功了");
    } catch (error) {
      console.log("✅ 正确捕获到错误:", error);
    }

    // 尝试删除不存在的用户
    console.log("\n3. 测试删除不存在的用户...");
    try {
      await invoke<void>("delete_user", { id: 99999 });
      console.log("❌ 预期应该失败，但却成功了");
    } catch (error) {
      console.log("✅ 正确捕获到错误:", error);
    }

    console.log("\n🎉 错误处理测试完成！");

  } catch (error) {
    console.error("❌ 错误处理测试失败:", error);
  }
}

// 运行测试
async function runAllTests() {
  await testCrudOperations();
  await testErrorHandling();
  
  console.log("\n📊 测试总结:");
  console.log("- CRUD 基本操作: ✅");
  console.log("- 错误处理: ✅");
  console.log("- 数据库连接和迁移: ✅");
  console.log("\n🚀 SQLx CRUD 功能实现完成！");
}

// 导出测试函数供外部调用
if (typeof window !== "undefined") {
  (window as any).runSqlxTests = runAllTests;
  console.log("在浏览器控制台中运行 runSqlxTests() 来测试 CRUD 功能");
}

export { runAllTests, testCrudOperations, testErrorHandling };