
import React, { useEffect, useState } from "react";

function Tasks() {
  const [username, setUsername] = useState("");

  // Fetching the username on the component mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("http://localhost:5000/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUsername(data.username);
        } else {
          console.log("Failed to fetch username:", data.message);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, []);

  return <h1>Welcome back, {username}</h1>;
}

export default Tasks;
