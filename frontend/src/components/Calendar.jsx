import { useState, useEffect } from "react";
import { Layout, Modal, Button, Form, Input, TimePicker, message } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // Needed for event click
import axios from "axios";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import moment from "moment";

const { Header, Content } = Layout;
const socket = io("http://localhost:5001");

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
    socket.on("scheduleUpdate", fetchEvents);
    return () => socket.off("scheduleUpdate");
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/presentations");
      const formattedEvents = response.data.map((event) => ({
        id: event._id,
        title: `Examiner ${event.examinerId}`,
        start: event.date + "T" + event.time,
        backgroundColor: event.isBooked ? "red" : "green",
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleDateClick = (info) => {
    setSelectedSlot(info.dateStr);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        examinerId: values.examinerId,
        date: selectedSlot,
        time: moment(values.time).format("HH:mm"),
        isBooked: true,
      };

      await axios.post("http://localhost:5001/api/bookings", payload);
      message.success("Slot booked successfully!");
      fetchEvents();
      setModalVisible(false);
      socket.emit("scheduleUpdate");
    } catch (error) {
      message.error("Failed to book slot.");
      console.error(error);
    }
  };

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout>
        <Header className="bg-white shadow-md px-6 text-xl font-semibold">Examiner Calendar</Header>
        <Content className="p-6">
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Examiner Availability Calendar</h2>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={events}
              dateClick={handleDateClick}
              height="600px"
            />
          </div>
        </Content>
      </Layout>

      {/* Booking Modal */}
      <Modal
        title="Book a Slot"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="examinerId" label="Examiner ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Book Slot
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Calendar;
