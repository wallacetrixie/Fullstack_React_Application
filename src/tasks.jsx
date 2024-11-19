import React, { useEffect, useState } from "react";
import "./styles/Tasks.css"; 

function Tasks() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [eventDetails, setEventDetails] = useState({
    eventName: "",
    venue: "",
    date: "",
  });

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("http://localhost:5000/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUsername(data.username);
        } else {
          setError("Failed to load user information");
        }
      } catch (error) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsername();
  }, []);

  // Handle form submissions
  const handleInputChange = (e) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Event Details Submitted:", eventDetails);
    // Add API call to submit the event details if needed
    alert(`Event "${eventDetails.eventName}" scheduled successfully!`);
    setEventDetails({ eventName: "", venue: "", date: "" }); // Reset form
    setShowForm(false); // Hide form after submission
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tasks-container">
      {/* Welcome Message */}
      <header className="welcome-message">
        <h1>Welcome back, {username}!</h1>
      </header>

      {/* Description */}
      <section className="description">
        <h2>Plan Your Events with Ease</h2>
        <p>
          Use our event management system to effortlessly create and schedule events like
          weddings, meetings, or parties. Enjoy stress-free planning!
        </p>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          Schedule an Event
        </button>
      </section>

      {/* Event Form */}
      {showForm && (
        <section className="event-form">
          <h2>Schedule an Event</h2>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="eventName">Event Name:</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={eventDetails.eventName}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
            />

            <label htmlFor="venue">Venue:</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={eventDetails.venue}
              onChange={handleInputChange}
              placeholder="Enter venue"
              required
            />

            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={eventDetails.date}
              onChange={handleInputChange}
              required
            />

            <button type="submit" className="primary-btn">
              Submit
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default Tasks;
