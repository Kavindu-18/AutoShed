import { useState, useEffect } from "react";
import { Layout, Modal, Button, Form, Input, TimePicker, message } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import moment from "moment";

const { Header, Content } = Layout;

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form] = Form.useForm();

  // Fetch bookings from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch existing bookings
  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/bookings");
      const formattedEvents = response.data.map((event) => ({
        id: event._id,
        title: `Examiner ${event.examinerId}`,
        start: `${event.date}T${event.time}`, 
        backgroundColor: event.isBooked ? "red" : "green", 
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to load events.");
    }
  };

  // Handle slot selection in the calendar
  const handleSelect = (info) => {
    const selectedDateTime = moment(info.start);
    setSelectedSlot(selectedDateTime);

    // Pre-fill the form with date & time
    form.setFieldsValue({
      time: selectedDateTime,
    });

    setModalVisible(true);
  };

  // Handle form submission for booking
  const handleSubmit = async (values) => {
    try {
      const selectedDateTime = moment(selectedSlot);

      if (selectedDateTime.isBefore(moment())) {
        message.error("You cannot book a past time slot.");
        return;
      }

      const payload = {
        examinerId: values.examinerId,
        date: selectedDateTime.format("YYYY-MM-DD"),
        time: selectedDateTime.format("HH:mm"),
        isBooked: true,
      };

      await axios.post("http://localhost:5001/api/bookings", payload);
      message.success("Slot booked successfully!");

      fetchEvents(); 
      setModalVisible(false);
    } catch (error) {
      console.error("Error booking slot:", error);
      message.error("Failed to book slot.");
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
              selectable={true} // Enable time slot selection
              select={handleSelect} // Handle slot selection
              events={events} 
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
