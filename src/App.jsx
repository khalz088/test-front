import React, { useState } from "react";

export default function mkaka() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState({ name: "", file: "" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // File validation (image type and size)
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

      // Convert to Base64
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
      console.log(responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error.name && <p style={{ color: "red" }}>{error.name}</p>}
        <br />
        <input type="file" onChange={handleFileChange} />
        {error.file && <p style={{ color: "red" }}>{error.file}</p>}
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
