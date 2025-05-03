// /contexts/EventsContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment";

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(false);

  const fetchEvents = useCallback(async () => {
    setFetching(true);
    try {
      const res = await axios.get("http://localhost:5001/api/bookings");
      const formatted = res.data.map(event => ({
        id: event._id,
        title: `Examiner ${event.examinerId}`,
        start: `${moment(event.date).format("YYYY-MM-DD")}T${event.time}`,
        backgroundColor: event.isBooked ? "#f5222d" : "#52c41a",
        borderColor: event.isBooked ? "#a8071a" : "#237804",
        textColor: "white",
        extendedProps: { examinerId: event.examinerId, originalData: event }
      }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
    setFetching(false);
  }, []);

  const addEvent = async (booking) => {
    const res = await axios.post("http://localhost:5001/api/bookings", booking);
    fetchEvents(); // Refresh
    return res.data;
  };

  const updateEvent = async (id, booking) => {
    await axios.put(`http://localhost:5001/api/bookings/${id}`, booking);
    fetchEvents();
  };

  const deleteEvent = async (id) => {
    await axios.delete(`http://localhost:5001/api/bookings/${id}`);
    fetchEvents();
  };

  return (
    <EventsContext.Provider value={{ events, fetching, fetchEvents, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
};
