import React, { useEffect, useState } from "react";
import "./styles/Tasks.css";
import axios from "axios";

function Tasks() {
  const [username, setUsername] = useState("");
  const [eventDetails, setEventDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formDetails, setFormDetails] = useState({
    eventName: "",
    venue: "",
    date: "",
  });

  // Fetch user details
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setUsername(response.data.username);
        } else {
          setError("Failed to load user information.");
        }
      } catch (error) {
        setError("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsername();
  }, []);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/fetchEvents", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
       
        if (response.status === 200) {
  setEventDetails(response.data.events);
} else {
  setError("Failed to fetch event details.");
}

      } catch (error) {
        setError("Error occurred while fetching event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/events",
        formDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 201) {
        alert(`Event "${formDetails.eventName}" scheduled successfully!`);
        setFormDetails({ eventName: "", venue: "", date: "" });
        setShowForm(false);
        setEventDetails([...eventDetails, formDetails]); // Update local state
      } else {
        alert("Failed to schedule the event. Please try again.");
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this event?"
  );
  if (!confirmDelete) return;

  try {
    const response = await axios.delete(`http://localhost:5000/deleteEvent/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 200) {
      alert("Event deleted successfully!");
      setEventDetails(eventDetails.filter((event) => event.id !== id));
    } else {
      alert("Failed to delete the event.");
    }
  } catch (error) {
    alert(error.response?.data?.message || "An error occurred. Please try again.");
  }
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tasks-container">
      <header className="welcome-message">
        <h1>Welcome back, {username}!</h1>
      </header>

      <section className="description">
        <h2>Plan Your Events with Ease</h2>
        <p>
          Use our event management system to effortlessly create and schedule
          events. Enjoy stress-free planning!
        </p>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          Schedule an Event
        </button>
      </section>

      {showForm && (
        <section className="event-form">
          <h2>Schedule an Event</h2>
          <button className="close-btn" onClick={() => setShowForm(false)}>
              &times;
            </button>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="eventName">Event Name:</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formDetails.eventName}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
            />

            <label htmlFor="venue">Venue:</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formDetails.venue}
              onChange={handleInputChange}
              placeholder="Enter venue"
              required
            />

            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formDetails.date}
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="primary-btn">
              Submit
            </button>
          </form>
        </section>
      )}

      <div className="event-details">
        <h2>Event Details</h2>
        <table className="events-table">
         <thead>
  <tr>
    <th>#</th>
    <th>Event Name</th>
    <th>Venue</th>
    <th>Date</th>
    <th>Action</th>
  </tr>
</thead>

          <tbody>
  {eventDetails.length > 0 ? (
    eventDetails.map((event, index) => (
      <tr key={event.id}>
        <td>{index + 1}</td>
        <td>{event.eventName}</td>
        <td>{event.venue}</td>
        <td>{new Date(event.date).toLocaleDateString()}</td>
        <td>
          <button
            className="delete-btn"
            onClick={() => handleDelete(event.id)}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5">No events scheduled.</td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
}

export default Tasks;
