import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { 
  Layout, 
  Spin, 
  Carousel, 
  Statistic, 
  Card, 
  Row, 
  Col, 
  Button, 
  Empty, 
  Badge, 
  Input, 
  Tooltip, 
  List, 
  Typography,
  message,
  Divider,
  Modal,
  Select,
  Image,
  Space,
  Tag,
  Checkbox
} from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  TeamOutlined, 
  BellOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextTwoTone,
  FilePdfTwoTone,
  FileImageTwoTone,
  FileExcelTwoTone,
  FileWordTwoTone,
  FileZipTwoTone,
  FileUnknownTwoTone
} from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Meta } = Card;
const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to determine file type from filename or URL
const getFileType = (fileName, fileUrl) => {
  // First try to get extension from filename if available
  if (fileName && typeof fileName === 'string' && fileName.includes('.')) {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension) return extension;
  }
  
  // For blob URLs or URLs without clear filename
  if (fileUrl && typeof fileUrl === 'string') {
    // For blob URLs, try to extract info from the blob ID
    if (fileUrl.startsWith('blob:')) {
      // Sometimes the blob ID contains hints about the type
      const blobId = fileUrl.split('/').pop();
      
      // Check if the blob ID itself has an extension pattern
      if (blobId && blobId.includes('.')) {
        return blobId.split('.').pop().toLowerCase();
      }
      
      // Default for blobs without extension info
      return 'blob';
    }
    
    // For regular URLs, try to extract extension
    const urlPath = fileUrl.split('?')[0];
    if (urlPath.includes('.')) {
      return urlPath.split('.').pop().toLowerCase();
    }
  }
  
  // Default fallback
  return 'unknown';
};

// Function to determine file icon based on file type
const getFileIcon = (fileName, fileUrl) => {
  const fileType = getFileType(fileName, fileUrl);
  
  switch (fileType) {
    case 'pdf':
      return <FilePdfTwoTone twoToneColor="#ff4d4f" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <FileImageTwoTone twoToneColor="#1890ff" />;
    case 'doc':
    case 'docx':
      return <FileWordTwoTone twoToneColor="#1890ff" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileExcelTwoTone twoToneColor="#52c41a" />;
    case 'zip':
    case 'rar':
      return <FileZipTwoTone twoToneColor="#722ed1" />;
    case 'blob':
      return <FileTextTwoTone twoToneColor="#1890ff" />; // Custom icon for blobs
    default:
      return <FileUnknownTwoTone />;
  }
};

// Helper function to get file name from attachment
const getFileName = (attachment) => {
  if (!attachment) return 'Attachment';
  
  // If attachment is a string (URL)
  if (typeof attachment === 'string') {
    // Try to extract filename from URL path
    const parts = attachment.split('/');
    let fileName = parts[parts.length - 1];
    
    // Remove query parameters if present
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // For blob URLs, extract the blob ID as filename
    if (attachment.startsWith('blob:')) {
      return `file-${parts[parts.length - 1]}`;
    }
    
    return fileName || 'Attachment';
  } 
  // If attachment is an object
  else if (typeof attachment === 'object' && attachment !== null) {
    // Return first available property that might contain the filename
    return attachment.filename || 
           attachment.name || 
           attachment.title || 
           attachment.displayName || 
           'Attachment';
  }
  
  return 'Attachment';
};

// Helper function to get file URL from attachment
const getFileUrl = (attachment) => {
  if (!attachment) return '';
  
  // If attachment is already a URL string
  if (typeof attachment === 'string') {
    return attachment;
  } 
  // If attachment is an object
  else if (typeof attachment === 'object' && attachment !== null) {
    // Return first available property that might contain the URL
    return attachment.url || 
           attachment.fileUrl || 
           attachment.downloadUrl || 
           attachment.displayUrl || 
           attachment.uri ||
           attachment.link ||
           '';
  }
  
  return '';
};

// Function to determine if a file type is previewable
const isFilePreviewable = (fileName, fileUrl) => {
  const fileType = getFileType(fileName, fileUrl);
  
  // For blob URLs, make them previewable by default since modern browsers can handle many formats
  if (fileUrl && fileUrl.startsWith('blob:')) {
    return true;
  }
  
  // Expanded list of extensions that can be previewed
  const previewableExtensions = [
    'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 
    'txt', 'csv', 'md', 'html', 'htm', 'svg', 'xml', 'json'
  ];
  
  return previewableExtensions.includes(fileType);
};

// Improved download function for blob URLs
const downloadAttachment = (attachment) => {
  try {
    const url = getFileUrl(attachment);
    const fileName = getFileName(attachment);
    
    if (!url) {
      message.error('No valid URL found for this attachment');
      return;
    }
    
    console.log(`Attempting to download/open: ${fileName} from URL: ${url}`);
    
    // For blob URLs, there are two approaches we can take
    if (url.startsWith('blob:')) {
      // APPROACH 1: Open in new tab (this always works for viewing)
      window.open(url, '_blank');
      message.success(`File opened in new tab`);
      
      // APPROACH 2: For actual downloading (optional addition)
      // Only use if you need to force a download rather than just viewing
      /*
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
          message.success(`Download initiated for ${fileName}`);
        })
        .catch(error => {
          console.error('Error downloading blob:', error);
          window.open(url, '_blank');
          message.info(`Opened file in new tab instead`);
        });
      */
      
      return;
    }
    
    // For regular URLs (non-blob)
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    message.success(`Download initiated for ${fileName}`);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    message.error('Failed to download attachment');
    
    // Fallback method - just try to open it
    try {
      window.open(getFileUrl(attachment), '_blank');
      message.info('Opened file in new tab instead');
    } catch (fallbackError) {
      console.error('Fallback download failed:', fallbackError);
      message.error('All download methods failed. Please try again later.');
    }
  }
};

// Enhanced File Preview Component specifically optimized for blob URLs
const FilePreview = ({ attachment }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileName = getFileName(attachment);
  const fileUrl = getFileUrl(attachment);
  const fileType = getFileType(fileName, fileUrl);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Add a small delay to ensure the modal is fully rendered before loading content
    const timer = setTimeout(() => {
      console.log(`Preparing to load preview for: ${fileName}`);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [attachment, fileName]);
  
  const handleLoad = () => {
    console.log(`Successfully loaded preview for: ${fileName}`);
    setLoading(false);
  };
  
  const handleError = (e) => {
    console.error(`Error loading preview for ${fileName}:`, e);
    setLoading(false);
    setError(`Failed to load file: ${fileName}`);
    message.error(`Failed to preview ${fileName}`);
  };

  // For blob URLs (which is what you're dealing with)
  if (fileUrl && fileUrl.startsWith('blob:')) {
    // Detect if it's an image by checking the file type
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType);
    
    if (isImage) {
      return (
        <div className="flex justify-center">
          {loading && <Spin size="large" />}
          <Image 
            src={fileUrl} 
            alt={fileName || 'Image Preview'}
            style={{ maxHeight: '70vh', display: loading ? 'none' : 'block' }}
            onLoad={handleLoad}
            onError={handleError}
            preview={false}
          />
        </div>
      );
    }
    
    // For PDF files, use the object tag which works better with blobs
    if (fileType === 'pdf') {
      return (
        <div className="h-full">
          {loading && <div className="flex justify-center my-4"><Spin size="large" /></div>}
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height="600px"
            className={loading ? 'hidden' : ''}
            onLoad={handleLoad}
            onError={handleError}
          >
            <p>Unable to display PDF file. <Button type="link" onClick={() => window.open(fileUrl, '_blank')}>Open in new tab</Button> instead.</p>
          </object>
        </div>
      );
    }
    
    // For any other type of blob, use an iframe with direct access
    return (
      <div className="h-full">
        {loading && <div className="flex justify-center my-4"><Spin size="large" /></div>}
        <iframe
          src={fileUrl}
          title={fileName || 'File Preview'}
          width="100%"
          height="600px"
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  // Show error state if we have an error
  if (error) {
    return (
      <div className="text-center p-8">
        <Text type="danger" className="text-lg mb-4">
          {error}
        </Text>
        <div className="mt-4">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => window.open(fileUrl, '_blank')}
          >
            Open File Instead
          </Button>
        </div>
      </div>
    );
  }

  // Default plain preview based on file type
  return (
    <div className="text-center p-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">{getFileIcon(fileName, fileUrl)}</div>
        <Text className="block text-lg">{fileName || "Attachment"}</Text>
        <Text type="secondary" className="block mt-2">{fileType.toUpperCase()} file</Text>
      </div>
      <Text type="secondary" className="block mb-4">
        This file type cannot be displayed in the preview.
      </Text>
      <Button 
        type="primary" 
        icon={<DownloadOutlined />} 
        onClick={() => window.open(fileUrl, '_blank')}
      >
        Open File
      </Button>
    </div>
  );
};

// Enhanced component to display attachments with preview capability
const AttachmentList = ({ attachments }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
        <Text type="secondary">No attachments available</Text>
      </div>
    );
  }

  const showPreview = (attachment) => {
    console.log("Opening preview for:", attachment);
    setCurrentAttachment(attachment);
    setPreviewVisible(true);
  };

  const handleCancel = () => {
    console.log("Closing preview");
    setPreviewVisible(false);
    // Don't immediately set currentAttachment to null to avoid flicker during modal closing animation
    setTimeout(() => {
      setCurrentAttachment(null);
    }, 300);
  };

  return (
    <>
      <List
        size="small"
        bordered
        className="mt-4 bg-gray-50 rounded-md overflow-hidden"
        dataSource={attachments}
        renderItem={(attachment) => {
          const fileName = getFileName(attachment);
          const fileUrl = getFileUrl(attachment);
          // Assume all blob URLs are previewable for simplicity
          const isPreviewable = fileUrl && fileUrl.startsWith('blob:') ? true : isFilePreviewable(fileName, fileUrl);
          
          return (
            <List.Item
              className="hover:bg-gray-100 transition-colors duration-200"
              actions={[
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined />} 
                  onClick={() => showPreview(attachment)}
                  disabled={!isPreviewable}
                >
                  {isPreviewable ? "View" : "Preview unavailable"}
                </Button>,
                <Button 
                  type="link" 
                  size="small" 
                  icon={<DownloadOutlined />} 
                  onClick={() => downloadAttachment(attachment)}
                >
                  Open
                </Button>
              ]}
            >
              <div className="flex items-center">
                <span className="mr-2">{getFileIcon(fileName, fileUrl)}</span>
                <span className="text-gray-700 overflow-hidden text-ellipsis" style={{ maxWidth: '150px' }}>
                  {fileName || "Attachment"}
                </span>
              </div>
            </List.Item>
          );
        }}
      />

      {/* Modal for file preview */}
      <Modal
        title={currentAttachment ? (getFileName(currentAttachment) || "File Preview") : 'File Preview'}
        open={previewVisible}
        onCancel={handleCancel}
        destroyOnClose={true} // Important: This ensures cleanup when modal closes
        maskClosable={true}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => downloadAttachment(currentAttachment)}
          >
            Open File
          </Button>
        ]}
        width="90%"
        style={{ top: 20 }}
        styles={{ 
          body: { 
            padding: '24px', 
            maxHeight: 'calc(100vh - 200px)', 
            overflow: 'auto' 
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.65)'
          }
        }}
      >
        {currentAttachment && <FilePreview attachment={currentAttachment} />}
      </Modal>
    </>
  );
};

// Enhanced search component with filters
const EnhancedSearch = ({ onSearch, searchValue, setSearchValue, notices }) => {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [hasAttachments, setHasAttachments] = useState(false);
  
  // Extract unique types and priorities from notices
  const types = [...new Set(notices.map(notice => notice.type))].filter(Boolean);
  const priorities = [...new Set(notices.map(notice => notice.priority))].filter(Boolean);
  
  const handleSearch = (value) => {
    if (advancedMode) {
      const filtered = notices.filter(notice => {
        // Text search
        const matchesText = !value || (
          (notice.title && notice.title.toLowerCase().includes(value.toLowerCase())) ||
          (notice.body && notice.body.toLowerCase().includes(value.toLowerCase())) ||
          (notice.author && notice.author.toLowerCase().includes(value.toLowerCase()))
        );
        
        // Type filter
        const matchesType = typeFilter.length === 0 || typeFilter.includes(notice.type);
        
        // Priority filter
        const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(notice.priority);
        
        // Attachments filter
        const matchesAttachments = !hasAttachments || 
          (notice.attachments && notice.attachments.length > 0);
          
        return matchesText && matchesType && matchesPriority && matchesAttachments;
      });
      
      onSearch(filtered);
    } else {
      // Simple search mode
      onSearch(value);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setTypeFilter([]);
    setPriorityFilter([]);
    setHasAttachments(false);
    onSearch('');
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-gray-700">Search Notices</span>
        <Button 
          type="link" 
          onClick={() => setAdvancedMode(!advancedMode)}
          className="p-0 h-auto"
        >
          {advancedMode ? 'Simple Search' : 'Advanced Search'}
        </Button>
      </div>
      
      {advancedMode ? (
        <div className="space-y-4">
          <Input
            placeholder="Search by title, content, or author..."
            allowClear
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-sm text-gray-600">Notice Type</div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by type"
                value={typeFilter}
                onChange={setTypeFilter}
              >
                {types.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </div>
            
            <div>
              <div className="mb-1 text-sm text-gray-600">Priority</div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by priority"
                value={priorityFilter}
                onChange={setPriorityFilter}
              >
                {priorities.map(priority => (
                  <Option key={priority} value={priority}>{priority}</Option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              checked={hasAttachments} 
              onChange={e => setHasAttachments(e.target.checked)}
            >
              Has attachments
            </Checkbox>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleReset}>Reset</Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchValue)}>
              Search
            </Button>
          </div>
        </div>
      ) : (
        <Search
          placeholder="Search notices..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
        />
      )}
    </div>
  );
};

// Component to display a single notice
const NoticeCard = ({ notice }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Academic': return { color: '#1890ff', bg: '#e6f7ff' };
      case 'Administrative': return { color: '#722ed1', bg: '#f9f0ff' };
      case 'Event': return { color: '#52c41a', bg: '#f6ffed' };
      default: return { color: '#595959', bg: '#fafafa' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return { color: '#f5222d', bg: '#fff1f0' };
      case 'Medium': return { color: '#fa8c16', bg: '#fff7e6' };
      case 'Low': return { color: '#52c41a', bg: '#f6ffed' };
      default: return { color: '#595959', bg: '#fafafa' };
    }
  };

  const typeStyle = getTypeColor(notice.type);
  const priorityStyle = getPriorityColor(notice.priority);

  return (
    <Card 
      hoverable 
      className="h-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0"
      styles={{ body: { padding: '20px' } }}
      style={{ 
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      cover={
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex flex-wrap gap-2">
            <Badge 
              count={notice.type} 
              style={{ backgroundColor: typeStyle.color, color: 'white' }} 
              className="site-badge-count-4"
            />
            <Badge 
              count={notice.priority} 
              style={{ backgroundColor: priorityStyle.color, color: 'white' }} 
              className="site-badge-count-4"
            />
            {notice.highlightNotice && (
              <Badge count="Important" style={{ backgroundColor: '#faad14', color: 'white' }} />
            )}
          </div>
        </div>
      }
    >
      <Meta
        title={<Text strong className="text-lg">{notice.title}</Text>}
        description={
          <div>
            <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 3 }}>
              {notice.body}
            </Paragraph>
            
            {/* Enhanced Attachments section with preview capability */}
            <AttachmentList attachments={notice.attachments} />
            
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>By: {notice.author || 'Admin'}</span>
              <Tooltip title={`Valid until: ${formatDate(notice.expirationDate)}`}>
                <span>{formatDate(notice.effectiveDate)}</span>
              </Tooltip>
            </div>
          </div>
        }
      />
    </Card>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description, linkTo, color }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return {
        border: 'border-blue-500',
        hover: 'hover:bg-blue-50',
        shadow: 'hover:shadow-blue-100',
        gradient: 'from-blue-50 to-indigo-50'
      };
      case 'emerald': return {
        border: 'border-emerald-500',
        hover: 'hover:bg-emerald-50',
        shadow: 'hover:shadow-emerald-100',
        gradient: 'from-emerald-50 to-green-50'
      };
      case 'purple': return {
        border: 'border-purple-500',
        hover: 'hover:bg-purple-50',
        shadow: 'hover:shadow-purple-100',
        gradient: 'from-purple-50 to-fuchsia-50'
      };
      case 'amber': return {
        border: 'border-amber-500',
        hover: 'hover:bg-amber-50',
        shadow: 'hover:shadow-amber-100',
        gradient: 'from-amber-50 to-yellow-50'
      };
      default: return {
        border: 'border-gray-300',
        hover: 'hover:bg-gray-50',
        shadow: 'hover:shadow-gray-100',
        gradient: 'from-gray-50 to-gray-100'
      };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Link to={linkTo} className="block">
      <Card 
        hoverable 
        className={`h-full border-t-4 ${colorClasses.border} ${colorClasses.hover} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
        styles={{ body: { padding: '24px' } }}
        style={{ 
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        cover={
          <div className={`h-12 bg-gradient-to-r ${colorClasses.gradient}`}></div>
        }
      >
        <div className="text-5xl mb-6 text-center">{icon}</div>
        <Meta
          title={<Title level={4} className="text-center mb-4">{title}</Title>}
          description={<Paragraph className="text-gray-600 text-center">{description}</Paragraph>}
        />
      </Card>
    </Link>
  );
};

function HomePage() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExaminers: 0,
    scheduledPresentations: 0,
    completedPresentations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all notices from API
        const allNotices = await NoticeMng.getNotices();
        
        // Filter for notices published to both students AND examiners
        const filteredNotices = allNotices.filter(notice => 
          notice.publishToStudents && notice.publishToExaminers
        );
        
        // Sort by priority and effective date
        filteredNotices.sort((a, b) => {
          // First sort by priority (High > Medium > Low)
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by highlightNotice flag
          if (a.highlightNotice && !b.highlightNotice) return -1;
          if (!a.highlightNotice && b.highlightNotice) return 1;
          
          // Then sort by effective date (newest first)
          return new Date(b.effectiveDate) - new Date(a.effectiveDate);
        });
        
        setNotices(filteredNotices);
        setFilteredNotices(filteredNotices);
        
        // TODO: Fetch stats from API
        // For a real application, we would fetch these from a backend API
        // For now, use placeholder stats
        setStats({
          totalStudents: 0,
          totalExaminers: 0,
          scheduledPresentations: 0,
          completedPresentations: 0
        });
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please refresh the page or try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Enhanced search handler that supports both simple and advanced search
  const handleSearch = (valueOrFiltered) => {
    if (typeof valueOrFiltered === 'string') {
      const value = valueOrFiltered;
      setSearchValue(value);
      
      if (!value.trim()) {
        setFilteredNotices(notices);
        return;
      }
      
      const searchTermLower = value.toLowerCase();
      const filtered = notices.filter(notice => 
        (notice.title && notice.title.toLowerCase().includes(searchTermLower)) ||
        (notice.body && notice.body.toLowerCase().includes(searchTermLower)) ||
        (notice.author && notice.author.toLowerCase().includes(searchTermLower)) ||
        (notice.type && notice.type.toLowerCase().includes(searchTermLower))
      );
      
      setFilteredNotices(filtered);
    } else if (Array.isArray(valueOrFiltered)) {
      // Handle pre-filtered results from advanced search
      setFilteredNotices(valueOrFiltered);
    }
  };
  
  const carouselItems = [
    {
      title: "Streamlined Exam Scheduling",
      description: "Easily schedule and manage examination presentations with our comprehensive platform.",
      icon: <CalendarOutlined style={{ fontSize: 48 }} />,
      color: "from-blue-500 to-indigo-700"
    },
    {
      title: "Student & Examiner Management",
      description: "Efficiently manage student profiles and examiner assignments in one place.",
      icon: <TeamOutlined style={{ fontSize: 48 }} />,
      color: "from-green-500 to-teal-700"
    },
    {
      title: "Smart Notifications",
      description: "Stay updated with important announcements and upcoming presentations.",
      icon: <BellOutlined style={{ fontSize: 48 }} />,
      color: "from-amber-500 to-orange-700"
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Content className="pb-16">
        {/* Hero Carousel Section */}
        <section className="relative overflow-hidden">
          <Carousel 
            autoplay 
            effect="fade" 
            dots={{ className: "custom-dots" }} 
            className="h-screen max-h-[700px] bg-gradient-to-r from-blue-700 to-indigo-900"
          >
            {carouselItems.map((item, index) => (
              <div key={index} className="h-screen max-h-[700px] flex items-center">
                <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center">
                  <div className="lg:w-7/12 text-white">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight animate__animated animate__fadeIn">
                      {item.title}
                    </h1>
                    <p className="text-xl opacity-90 mb-8 animate__animated animate__fadeIn animate__delay-1s">
                      {item.description}
                    </p>
                    <div className="flex gap-4 animate__animated animate__fadeIn animate__delay-2s">
                      <Link to="/login">
                        <Button 
                          type="primary" 
                          size="large" 
                          className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 shadow-lg hover:shadow-xl border-0 transition-all"
                          style={{ height: '48px', padding: '0 24px', borderRadius: '8px' }}
                        >
                          Get Started
                        </Button>
                      </Link>
                      <Link to="/learn-more">
                        <Button 
                          ghost 
                          size="large"
                          style={{ height: '48px', padding: '0 24px', borderRadius: '8px' }}
                          className="border-2 hover:border-white hover:text-white transition-all"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:flex lg:w-5/12 justify-center animate__animated animate__fadeInRight">
                    <div className="bg-white/20 rounded-full p-12 backdrop-blur-sm shadow-2xl">
                      {item.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          
          {/* Stats Section overlapping the hero */}
          <div className="container mx-auto px-4 relative -mt-24 z-10">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <Row gutter={16} justify="space-around" align="middle" className="text-center">
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Students</div>} 
                    value={stats.totalStudents} 
                    prefix={<UserOutlined className="mr-2" />} 
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Examiners</div>} 
                    value={stats.totalExaminers} 
                    prefix={<TeamOutlined className="mr-2" />} 
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Scheduled Presentations</div>} 
                    value={stats.scheduledPresentations} 
                    prefix={<CalendarOutlined className="mr-2" />} 
                    valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Completed Presentations</div>} 
                    value={stats.completedPresentations} 
                    prefix={<CheckCircleOutlined className="mr-2" />} 
                    valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </section>
        
        {/* Main Features Section */}
        <section className="container mx-auto px-4 py-24">
          <Title level={2} className="text-center text-gray-800 mb-16 text-4xl font-bold">
            <Divider>Main Features</Divider>
          </Title>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<CalendarOutlined className="text-blue-600" />}
              title="Exam Scheduling"
              description="Schedule exams with automatic conflict detection and intuitive calendar interface."
              linkTo="/login"
              color="blue"
            />
            
            <FeatureCard 
              icon={<FileTextOutlined className="text-emerald-600" />}
              title="Presentations"
              description="Organize and track presentations with comprehensive management tools."
              linkTo="/login"
              color="emerald"
            />
            
            <FeatureCard 
              icon={<UserOutlined className="text-purple-600" />}
              title="Student Management"
              description="Track student progress, manage profiles, and monitor examination status."
              linkTo="/login"
              color="purple"
            />
            
            <FeatureCard 
              icon={<TeamOutlined className="text-amber-600" />}
              title="Examiner Management"
              description="Manage examiners, their availability, and specialization areas."
              linkTo="/login"
              color="amber"
            />
          </div>
        </section>
        
        {/* Notices Section */}
        <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <Title level={2} className="text-gray-800 mb-4 md:mb-0">Important Notices</Title>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <EnhancedSearch 
                  onSearch={handleSearch}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  notices={notices}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredNotices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNotices.slice(0, 6).map(notice => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-lg shadow-md border border-gray-100 text-center">
                <Empty 
                  description={
                    searchValue 
                      ? <Text className="text-gray-500">No notices match your search</Text>
                      : <Text className="text-gray-500">{error || "No notices available"}</Text>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link to="/notices">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-blue-600 hover:bg-blue-700 border-0"
                >
                  View All Notices
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Call-to-Action Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join our platform today and simplify your exam scheduling and presentation management
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link to="/login">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  style={{ height: '50px', padding: '0 32px', borderRadius: '8px', fontSize: '16px' }}
                >
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  ghost 
                  size="large"
                  style={{ height: '50px', padding: '0 32px', borderRadius: '8px', fontSize: '16px' }}
                  className="border-2 hover:border-white hover:text-white transition-all w-full sm:w-auto mt-4 sm:mt-0"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Content>
      
      <Footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <Row gutter={24}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <h3 className="text-2xl font-bold mb-6">AutoShed</h3>
              <p className="text-gray-400 mb-4 text-base">
                A comprehensive platform for managing exam scheduling and presentations.
                Streamline your academic workflow with our intuitive tools.
              </p>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/presentationdetails" className="hover:text-white transition-colors">Presentations</Link></li>
                <li><Link to="/Studentdetails" className="hover:text-white transition-colors">Students</Link></li>
                <li><Link to="/examinerdetails" className="hover:text-white transition-colors">Examiners</Link></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <address className="text-gray-400 not-italic space-y-3">
                <p>Email: info@autoshed.com</p>
                <p>Phone: (123) 456-7890</p>
                <p>Address: 123 University Way, Education City</p>
              </address>
            </Col>
          </Row>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AutoShed. All rights reserved.</p>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

export default HomePage;