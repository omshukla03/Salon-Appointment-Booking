// src/pages/User.jsx

import { useEffect, useState } from "react";
import { getAllUsers } from "../services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        console.log("Users fetched:", res.data);
        setUsers(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="border p-2 rounded">
              {user.fullName} - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}