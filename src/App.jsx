import React, { useEffect, useState } from "react";

export default function Mkaka() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState({ name: "", file: "" });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(selectedFile.type)) {
        setError({ file: "Please upload a valid image (JPEG, PNG, GIF, or WEBP)." });
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError({ file: "File size should not exceed 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ name: "", file: "" });
    let formIsValid = true;
    if (!name) {
      setError((prevError) => ({ ...prevError, name: "Name is required." }));
      formIsValid = false;
    }
    if (!file) {
      setError((prevError) => ({ ...prevError, file: "File is required." }));
      formIsValid = false;
    }
    if (!formIsValid) return;
    const data = { name, banner: file };
    try {
      const response = await fetch("http://localhost:8001/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to upload image");
      await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8001/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8001/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleUpdateClick = (user) => {
    setCurrentUser(user);
    setName(user.name);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!name) {
      setError({ name: "Name is required." });
      return;
    }
    const data = { name, banner: file || currentUser.banner };
    try {
      const response = await fetch(`http://localhost:8001/update/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Update failed");
      setShowModal(false);
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error.name && <p style={{ color: "red" }}>{error.name}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input type="file" onChange={handleFileChange} />
          {error.file && <p style={{ color: "red" }}>{error.file}</p>}
        </div>
        <button type="submit">Submit</button>
      </form>

      <h2>Users List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Banner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>
                {user.banner && (
                  <img
                    src={`http://localhost:8001${user.banner}`}
                    alt="User Banner"
                    width="100"
                  />
                )}
              </td>
              <td>
                <button style={{ color: "red" }} onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
                <button style={{ marginLeft: "10px" }} onClick={() => handleUpdateClick(user)}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <h3>Update User</h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpdate}>Save Changes</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}