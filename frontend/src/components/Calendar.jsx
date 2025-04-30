import { useState, useEffect, useCallback } from "react";
import { Layout, Modal, Button, Form, Input, TimePicker, message, Tooltip, Tag, Space, Popconfirm, Card, Typography, Spin } from "antd";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import moment from "moment";
import { CalendarOutlined, UserOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;


const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({ total: 0, booked: 0, available: 0 });

  // Color scheme
  const colors = {
    booked: { bg: "#f5222d", border: "#a8071a", text: "white" },
    available: { bg: "#52c41a", border: "#237804", text: "white" },
    primary: "#1890ff"
  };

  // Calculate statistics from events
  const calculateStats = useCallback((eventsList) => {
    const total = eventsList.length;
    const booked = eventsList.filter(event => 
      event.backgroundColor === colors.booked.bg || 
      event.extendedProps?.originalData?.isBooked).length;
    
    setStats({
      total,
      booked,
      available: total - booked
    });
  }, [colors.booked.bg]);

  // Fetch bookings from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Memoize fetchEvents to prevent unnecessary re-renders
  const fetchEvents = useCallback(async () => {
    try {
      setFetchingEvents(true);
      const response = await axios.get("http://localhost:5001/api/bookings");

      // Ensure correct event formatting for FullCalendar
      const formattedEvents = response.data.map((event) => {
        const eventDate = moment(event.date).format("YYYY-MM-DD");
        return {
          id: event._id,
          title: `Examiner ${event.examinerId}`,
          start: `${eventDate}T${event.time}`,
          backgroundColor: event.isBooked ? colors.booked.bg : colors.available.bg,
          borderColor: event.isBooked ? colors.booked.border : colors.available.border,
          textColor: event.isBooked ? colors.booked.text : colors.available.text,
          extendedProps: {
            examinerId: event.examinerId,
            rawId: event._id,
            originalData: { ...event }
          }
        };
      });

      setEvents(formattedEvents);
      calculateStats(formattedEvents);
      
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to load events.");
    } finally {
      setFetchingEvents(false);
    }
  }, [calculateStats, colors]);

  // Handle time slot selection in the calendar
  const handleSelect = (info) => {
    resetForm();
    const selectedDateTime = moment(info.start);
    
    // Prevent booking past dates
    if (selectedDateTime.isBefore(moment(), 'day')) {
      message.warning("Cannot book past dates");
      return;
    }
    
    setSelectedSlot(selectedDateTime);

    // Pre-fill the form with selected date & time
    form.setFieldsValue({
      time: moment(selectedDateTime, "HH:mm"),
      date: selectedDateTime.format("YYYY-MM-DD"),
    });

    setIsEditMode(false);
    setSelectedEvent(null);
    setSelectedEventId(null);
    setModalVisible(true);
  };

  // Reset form and editing state
  const resetForm = () => {
    form.resetFields();
    setIsEditMode(false);
    setSelectedEventId(null);
    setSelectedEvent(null);
  };

  // Handle form submission for booking
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Get the selected time
      const selectedTime = moment(values.time).format("HH:mm");
      let payload;
      let response;

      if (isEditMode && selectedEventId) {
        // Update existing booking
        payload = {
          examinerId: values.examinerId,
          date: values.date,
          time: selectedTime,
          isBooked: true,
        };

        try {
          response = await axios.put(`http://localhost:5001/api/bookings/${selectedEventId}`, payload);
          message.success("Slot updated successfully!");
          
          // Update the event in state with careful ID matching
          setEvents(prevEvents => prevEvents.map(event => {
            if (event.id === selectedEventId) {
              return {
                ...event,
                title: `Examiner ${values.examinerId}`,
                start: `${values.date}T${selectedTime}`,
                extendedProps: {
                  ...event.extendedProps,
                  examinerId: values.examinerId
                }
              };
            }
            return event;
          }));
        } catch (updateError) {
          console.error("Error updating booking:", updateError);
          message.error("Failed to update slot: " + (updateError.response?.data?.message || updateError.message));
          return;
        }
      } else {
        // Create new booking
        // Ensure selected date & time are combined correctly
        const selectedDateTime = moment(selectedSlot).set({
          hour: moment(values.time).hour(),
          minute: moment(values.time).minute(),
        });

        if (selectedDateTime.isBefore(moment())) {
          message.error("You cannot book a past time slot.");
          return;
        }

        payload = {
          examinerId: values.examinerId,
          date: selectedDateTime.format("YYYY-MM-DD"),
          time: selectedDateTime.format("HH:mm"),
          isBooked: true,
        };

        try {
          response = await axios.post("http://localhost:5001/api/bookings", payload);
          message.success("Slot booked successfully!");

          // Add the new event with the correct ID from the response
          const newEvent = {
            id: response.data._id || Math.random().toString(36).substr(2, 9),
            title: `Examiner ${values.examinerId}`,
            start: selectedDateTime.format("YYYY-MM-DDTHH:mm"),
            backgroundColor: colors.booked.bg,
            borderColor: colors.booked.border,
            textColor: colors.booked.text,
            extendedProps: {
              examinerId: values.examinerId,
              rawId: response.data._id,
              originalData: response.data
            }
          };

          // Update the events state with the new event
          setEvents(prevEvents => {
            const updatedEvents = [...prevEvents, newEvent];
            calculateStats(updatedEvents);
            return updatedEvents;
          });
        } catch (createError) {
          console.error("Error creating booking:", createError);
          message.error("Failed to book slot: " + (createError.response?.data?.message || createError.message));
          return;
        }
      }
      
      // Close the modal
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error with booking slot:", error);
      message.error(isEditMode ? "Failed to update slot." : "Failed to book slot.");
    } finally {
      setLoading(false);
    }
  };

  // Handle event click for editing existing booking
  const handleEventClick = (info) => {
    // Capture the full event object for reference
    const eventObj = info.event;
    const eventId = eventObj.id;
    const eventStart = moment(eventObj.start);
    const examinerId = eventObj.extendedProps.examinerId;
    
    // Set edit mode and selected event
    setIsEditMode(true);
    setSelectedEventId(eventId);
    setSelectedEvent(eventObj);
    
    // Pre-fill form with event data
    form.setFieldsValue({
      examinerId: examinerId,
      date: eventStart.format("YYYY-MM-DD"),
      time: eventStart,
    });
    
    setModalVisible(true);
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!selectedEventId) {
      message.error("No booking selected for deletion");
      return;
    }
    
    try {
      setLoading(true);
      
      // Send delete request to the API
      await axios.delete(`http://localhost:5001/api/bookings/${selectedEventId}`);
      
      // Remove the event from state
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(event => event.id !== selectedEventId);
        calculateStats(updatedEvents);
        return updatedEvents;
      });
      
      message.success("Booking deleted successfully!");
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error deleting booking:", error);
      message.error("Failed to delete booking: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Event render for better display with edit indicator
  const renderEventContent = (eventInfo) => {
    const isBooked = eventInfo.event.backgroundColor === colors.booked.bg;
    return (
      <Tooltip title={`Examiner ${eventInfo.event.extendedProps.examinerId} (${isBooked ? 'Booked' : 'Available'})`}>
        <div className="p-1 cursor-pointer">
          <div className="font-semibold">{eventInfo.timeText}</div>
          <div className="text-sm truncate flex items-center">
            <UserOutlined className="mr-1" />
            {eventInfo.event.title}
          </div>
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
          <div className="flex items-center">
            <CalendarOutlined className="text-xl mr-2" />
            <Title level={4} style={{ margin: 0 }}>Examiner Calendar</Title>
          </div>
          <Space>
            <Button 
              type={calendarView === "timeGridDay" ? "primary" : "default"} 
              onClick={() => handleViewChange("timeGridDay")}
              icon={<CalendarOutlined />}
            >
              Day
            </Button>
            <Button 
              type={calendarView === "timeGridWeek" ? "primary" : "default"} 
              onClick={() => handleViewChange("timeGridWeek")}
              icon={<CalendarOutlined />}
            >
              Week
            </Button>
            <Button 
              type={calendarView === "dayGridMonth" ? "primary" : "default"} 
              onClick={() => handleViewChange("dayGridMonth")}
              icon={<CalendarOutlined />}
            >
              Month
            </Button>
            <Button 
              type={calendarView === "listWeek" ? "primary" : "default"} 
              onClick={() => handleViewChange("listWeek")}
              icon={<CalendarOutlined />}
            >
              List
            </Button>
            <Button 
              type="default" 
              onClick={fetchEvents} 
              icon={<ReloadOutlined />}
              loading={fetchingEvents}
            >
              Refresh
            </Button>
          </Space>
        </Header>
        <Content className="p-6 bg-gray-50">
          <div className="space-y-6">
            {/* Stats Cards - Now at the top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <Statistic 
                  title="Overview" 
                  total={stats.total} 
                  booked={stats.booked} 
                  available={stats.available} 
                  colors={colors}
                />
              </Card>
              <Card className="shadow-md">
                <div className="text-base font-medium mb-2">Legend</div>
                <Space direction="vertical" className="w-full">
                  <Tag className="w-full" color="green">
                    <div className="flex justify-between">
                      <span>Available</span>
                      <span>{stats.available}</span>
                    </div>
                  </Tag>
                  <Tag className="w-full" color="red">
                    <div className="flex justify-between">
                      <span>Booked</span>
                      <span>{stats.booked}</span>
                    </div>
                  </Tag>
                  <div className="text-gray-500 text-sm mt-2">
                    • Click on time slot to book
                    <br />
                    • Click on booking to edit/delete
                  </div>
                </Space>
              </Card>
            </div>
            
            {/* Calendar */}
            <Card className="shadow-md">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} style={{ margin: 0 }}>
                  Examiner Availability Calendar
                </Title>
              </div>
              
              <Spin spinning={fetchingEvents} tip="Loading events...">
                <div className="calendar-container" style={{ height: '700px' }}>
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
                    eventClick={handleEventClick}
                    height="100%"
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
                    dayMaxEvents={4}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }}
                  />
                </div>
              </Spin>
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Booking/Editing Modal */}
      <Modal
        title={
          <div className="flex items-center">
            {isEditMode ? <EditOutlined className="mr-2" /> : <ClockCircleOutlined className="mr-2" />}
            {isEditMode ? "Edit Booking" : "Book a Slot"}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
        destroyOnClose={true}
      >
        {isEditMode && selectedEventId && (
          <div className="mb-4 p-3 bg-blue-50 rounded flex items-center text-blue-800 text-sm">
            <InfoCircleOutlined className="mr-2" />
            Editing booking ID: {selectedEventId.substring(0, 10)}...
          </div>
        )}
        
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="examinerId" label="Examiner ID" rules={[{ required: true, message: 'Please enter examiner ID' }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter examiner ID" />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input disabled />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Please select a time' }]}>
            <TimePicker 
              format="HH:mm" 
              minuteStep={15} 
              placeholder="Select time"
              className="w-full"
              allowClear={false}
            />
          </Form.Item>
          <div className="flex justify-between mt-4">
            <Button type="primary" htmlType="submit" loading={loading} icon={isEditMode ? <EditOutlined /> : <CalendarOutlined />}>
              {isEditMode ? "Update" : "Book"}
            </Button>
            
            {isEditMode && (
              <Popconfirm
                title="Delete this booking?"
                description="Are you sure you want to delete this booking?"
                onConfirm={handleDeleteBooking}
                okText="Yes"
                cancelText="No"
              >
                <Button danger loading={loading} icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            )}
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

// Stats component
const Statistic = ({ title, total, booked, available, colors }) => {
  return (
    <div>
      <div className="text-base font-medium mb-2">{title}</div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Text>Total Slots:</Text>
          <Text strong>{total}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Booked:</Text>
          <Text type="danger">{booked}</Text>
        </div>
        <div className="flex justify-between">
          <Text>Available:</Text>
          <Text type="success">{available}</Text>
        </div>
      </div>
      
      {total > 0 && (
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500"
            style={{ 
              width: `${(booked/total) * 100}%`,
              backgroundColor: colors.booked.bg
            }}
          />
        </div>
      )}
    </div>
  );
};

// Icon components
const InfoCircleOutlined = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" {...props}>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
  </svg>
);

export default Calendar;