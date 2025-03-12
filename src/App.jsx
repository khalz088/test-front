import React, { useEffect, useState } from "react";

export default function mkaka() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState({ name: "", file: "" });
  const [users, setUsers] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      //  validation
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(selectedFile.type)) {
        setError({
          file: "Please upload a valid image (JPEG, PNG, GIF, or WEBP).",
        });
        return;
      }

      if (selectedFile.size > 2 * 1024 * 1024) {
        setError({ file: "File size should not exceed 2MB." });
        return;
      }

      //  Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result); // Base64 string of the image
      };
      reader.readAsDataURL(selectedFile); // Convert file to Base64
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setError({ name: "", file: "" });

    let formIsValid = true;

    // Validation
    if (!name) {
      setError((prevError) => ({ ...prevError, name: "Name is required." }));
      formIsValid = false;
    }

    if (!file) {
      setError((prevError) => ({ ...prevError, file: "File is required." }));
      formIsValid = false;
    }

    if (!formIsValid) {
      return; // Prevent form submission if validation fails
    }

    const data = {
      name,
      banner: file, // Base64 string of the image
    };

    try {
      const response = await fetch("http://localhost:8001/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const responseData = await response.json();
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
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
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>
                {user.banner && (
                  <img
                    src={"http://localhost:8001" + user.banner}
                    alt="User Banner"
                    width="100"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
