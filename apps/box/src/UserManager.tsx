import React, { useState } from "react";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  useCreateUser,
  useUsersQuery,
  useUpdateUser,
  useDeleteUser,
} from "./hooks";

const UserManager: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    age: undefined,
  });
  const usersQuery = useUsersQuery();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = usersQuery.data ?? [];
  const isLoading = usersQuery.isLoading || usersQuery.isFetching;
  const deleting = deleteUser.isPending;
  const updating = updateUser.isPending;
  const creating = createUser.isPending;

  const handleRefresh = () => {
    usersQuery.refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {};
        if (formData.name !== editingUser.name) updateData.name = formData.name;
        if (formData.email !== editingUser.email)
          updateData.email = formData.email;
        if (formData.age !== editingUser.age) updateData.age = formData.age;

        await updateUser.mutateAsync({ id: editingUser.id, request: updateData });
      } else {
        await createUser.mutateAsync({ request: formData });
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age,
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    console.log("handleDelete called with id:", id, "typeof:", typeof id);

    try {
      console.log("Attempting to delete user with id:", id);
      await deleteUser.mutateAsync({ id });
      console.log("Delete successful");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("删除失败: " + error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", age: undefined });
    setEditingUser(null);
    setIsFormVisible(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>用户管理</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isFormVisible ? "取消" : "添加用户"}
        </button>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isLoading ? "刷新中..." : "刷新列表"}
        </button>
      </div>

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>{editingUser ? "编辑用户" : "添加新用户"}</h3>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              姓名:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              autoFocus
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#000",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              邮箱:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#000",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              年龄:
            </label>
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#000",
                outline: "none",
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={creating || updating}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              {creating || updating ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div>
        <h3>用户列表</h3>
        {isLoading ? (
          <p>加载中...</p>
        ) : users.length === 0 ? (
          <div>
            <p>暂无用户数据</p>
            <button
              onClick={handleRefresh}
              style={{
                padding: "8px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              重新加载
            </button>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  姓名
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  邮箱
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  年龄
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  创建时间
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {user.id}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {user.name}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {user.age || "-"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => handleEdit(user)}
                      disabled={updating}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={false}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: deleting ? "#999" : "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: deleting ? "not-allowed" : "pointer",
                      }}
                    >
                      {deleting ? "删除中..." : "删除"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManager;
