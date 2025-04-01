import { useState, useEffect, useCallback } from "react";
import { Layout, Modal, Button, Form, Input, TimePicker, message, Tooltip, Tag, Space } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import moment from "moment";

const { Header, Content } = Layout;

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const [form] = Form.useForm();

  // Fetch bookings from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Memoize fetchEvents to prevent unnecessary re-renders
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/bookings");

      // Ensure correct event formatting for FullCalendar
      const formattedEvents = response.data.map((event) => ({
        id: event._id,
        title: `Examiner ${event.examinerId}`,
        start: `${event.date}T${event.time}`,
        backgroundColor: event.isBooked ? "#f5222d" : "#52c41a",
        borderColor: event.isBooked ? "#a8071a" : "#237804",
        extendedProps: {
          examinerId: event.examinerId
        }
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle time slot selection in the calendar
  const handleSelect = (info) => {
    const selectedDateTime = moment(info.start);
    setSelectedSlot(selectedDateTime);

    // Pre-fill the form with selected date & time
    form.setFieldsValue({
      time: moment(selectedDateTime, "HH:mm"),
      date: selectedDateTime.format("YYYY-MM-DD"),
    });

    setModalVisible(true);
  };

  // Handle form submission for booking
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Ensure selected date & time are combined correctly
      const selectedDateTime = moment(selectedSlot).set({
        hour: moment(values.time).hour(),
        minute: moment(values.time).minute(),
      });

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

      const response = await axios.post("http://localhost:5001/api/bookings", payload);
      message.success("Slot booked successfully!");

      // Add the new event with the correct ID from the response
      const newEvent = {
        id: response.data._id || Math.random().toString(36).substr(2, 9),
        title: `Examiner ${values.examinerId}`,
        start: selectedDateTime.format("YYYY-MM-DDTHH:mm"),
        backgroundColor: "#f5222d",
        borderColor: "#a8071a",
        extendedProps: {
          examinerId: values.examinerId
        }
      };

      // Update the events state with the new event
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // Close the modal
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error booking slot:", error);
      message.error("Failed to book slot.");
    } finally {
      setLoading(false);
    }
  };

  // Event render for better display
  const renderEventContent = (eventInfo) => {
    return (
      <Tooltip title={`Examiner ID: ${eventInfo.event.extendedProps.examinerId}`}>
        <div className="p-1">
          <div className="font-semibold text-white">{eventInfo.timeText}</div>
          <div className="text-white text-sm truncate">{eventInfo.event.title}</div>
        </div>
      </Tooltip>
    );
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout>
        <Header className="bg-white shadow-md px-6 flex items-center justify-between">
          <div className="text-xl font-semibold">Examiner Calendar</div>
          <Space>
            <Button 
              type={calendarView === "timeGridDay" ? "primary" : "default"} 
              onClick={() => handleViewChange("timeGridDay")}
            >
              Day
            </Button>
            <Button 
              type={calendarView === "timeGridWeek" ? "primary" : "default"} 
              onClick={() => handleViewChange("timeGridWeek")}
            >
              Week
            </Button>
            <Button 
              type={calendarView === "dayGridMonth" ? "primary" : "default"} 
              onClick={() => handleViewChange("dayGridMonth")}
            >
              Month
            </Button>
            <Button 
              type={calendarView === "listWeek" ? "primary" : "default"} 
              onClick={() => handleViewChange("listWeek")}
            >
              List
            </Button>
            <Button type="default" onClick={fetchEvents}>
              Refresh
            </Button>
          </Space>
        </Header>
        <Content className="p-6">
          <div className="p-6 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Examiner Availability Calendar</h2>
              <Space>
                <Tag color="green">Available</Tag>
                <Tag color="red">Booked</Tag>
              </Space>
            </div>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              selectable={true}
              select={handleSelect}
              events={events}
              eventContent={renderEventContent}
              height="700px"
              loading={loading}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '09:00',
                endTime: '17:00',
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              weekends={true}
              allDaySlot={false}
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
            <Input placeholder="Enter examiner ID" />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input disabled />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={15} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Book Slot
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Calendar;