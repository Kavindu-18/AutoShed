import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5001"); // Connect to backend

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();

    // Listen for real-time updates
    socket.on("scheduleUpdate", (data) => {
      console.log("Real-time update received:", data);
      fetchEvents();
    });

    return () => {
      socket.off("scheduleUpdate");
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/presentations");
      const formattedEvents = response.data.map((event) => ({
        id: event._id,
        title: `Examiner ${event.examinerId}`,
        start: event.date + "T" + event.time,
        backgroundColor: "green",
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Examiner Availability Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={events}
        height="600px"
      />
    </div>
  );
};

export default Calendar;
