import { useState, useEffect, useCallback } from "react";
import { Layout, Modal, Button, Form, Input, TimePicker, message, Tooltip, Tag, Space, Popconfirm } from "antd";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch bookings from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Memoize fetchEvents to prevent unnecessary re-renders
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/bookings");

      // Log API response for debugging
      console.log("API Response:", response.data);

      // Ensure correct event formatting for FullCalendar
      const formattedEvents = response.data.map((event) => {
        const eventDate = moment(event.date).format("YYYY-MM-DD");
        return {
          id: event._id,
          title: `Examiner ${event.examinerId}`,
          start: `${eventDate}T${event.time}`,
          backgroundColor: event.isBooked ? "#f5222d" : "#52c41a",
          borderColor: event.isBooked ? "#a8071a" : "#237804",
          extendedProps: {
            examinerId: event.examinerId,
            rawId: event._id, // Store the original ID from the database
            originalData: { ...event } // Store the original data for reference
          }
        };
      });

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
    resetForm();
    const selectedDateTime = moment(info.start);
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
        // Ensure we have the correct ID for the update
        const eventIdToUpdate = selectedEventId;
        
        // Log before update for debugging
        console.log("Updating event with ID:", eventIdToUpdate);
        
        // Update existing booking
        payload = {
          examinerId: values.examinerId,
          date: values.date,
          time: selectedTime,
          isBooked: true,
        };

        try {
          response = await axios.put(`http://localhost:5001/api/bookings/${eventIdToUpdate}`, payload);
          
          // Log successful response
          console.log("Update response:", response.data);
          
          message.success("Slot updated successfully!");
          
          // Update the event in state with careful ID matching
          setEvents(prevEvents => prevEvents.map(event => {
            // Compare with the stored ID
            if (event.id === eventIdToUpdate) {
              console.log("Matched event for update:", event);
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
          message.error("Failed to update slot. Server error: " + (updateError.response?.data?.message || updateError.message));
          return; // Exit early on update error
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

          // Log successful create
          console.log("Created booking:", response.data);

          // Add the new event with the correct ID from the response
          const newEvent = {
            id: response.data._id || Math.random().toString(36).substr(2, 9),
            title: `Examiner ${values.examinerId}`,
            start: selectedDateTime.format("YYYY-MM-DDTHH:mm"),
            backgroundColor: "#f5222d",
            borderColor: "#a8071a",
            extendedProps: {
              examinerId: values.examinerId,
              rawId: response.data._id,
              originalData: response.data
            }
          };

          // Update the events state with the new event
          setEvents(prevEvents => [...prevEvents, newEvent]);
        } catch (createError) {
          console.error("Error creating booking:", createError);
          message.error("Failed to book slot. Server error: " + (createError.response?.data?.message || createError.message));
          return; // Exit early on create error
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
    
    console.log("Clicked on event:", {
      id: eventId,
      extendedProps: eventObj.extendedProps,
      start: eventStart.format(),
    });

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
      console.log("Deleting booking with ID:", selectedEventId);
      
      // Send delete request to the API
      await axios.delete(`http://localhost:5001/api/bookings/${selectedEventId}`);
      
      // Remove the event from state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEventId));
      
      message.success("Booking deleted successfully!");
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error deleting booking:", error);
      message.error("Failed to delete booking. Server error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Event render for better display with edit indicator
  const renderEventContent = (eventInfo) => {
    return (
      <Tooltip title={`Examiner ID: ${eventInfo.event.extendedProps.examinerId} (Click to edit/delete)`}>
        <div className="p-1 cursor-pointer">
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
                <div className="text-gray-500 text-sm">Click on a booking to edit/delete</div>
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
              eventClick={handleEventClick}
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

      {/* Booking/Editing Modal */}
      <Modal
        title={isEditMode ? "Edit Booking" : "Book a Slot"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
      >
        {isEditMode && selectedEventId && (
          <div className="mb-4 p-2 bg-blue-50 rounded text-blue-800 text-sm">
            Editing booking ID: {selectedEventId}
          </div>
        )}
        
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="examinerId" label="Examiner ID" rules={[{ required: true }]}>
            <Input placeholder="Enter examiner ID" />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input disabled={!isEditMode} />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={15} />
          </Form.Item>
          <div className="flex justify-between">
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? "Update Booking" : "Book Slot"}
            </Button>
            
            {isEditMode && (
              <Popconfirm
                title="Delete this booking?"
                description="Are you sure you want to delete this booking?"
                onConfirm={handleDeleteBooking}
                okText="Yes"
                cancelText="No"
              >
                <Button danger loading={loading}>
                  Delete Booking
                </Button>
              </Popconfirm>
            )}
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Calendar;