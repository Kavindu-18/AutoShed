// /components/VoiceBookingButton.jsx
import { Button } from "antd";
import { AudioOutlined } from "@ant-design/icons";

const VoiceBookingButton = ({ onStart, onStop, listening }) => {
  return (
    <Button
      type={listening ? "primary" : "default"}
      shape="circle"
      icon={<AudioOutlined />}
      onMouseDown={onStart}
      onMouseUp={onStop}
      style={{ width: 60, height: 60 }}
    />
  );
};

export default VoiceBookingButton;
