import React, { useState, useRef, useEffect } from 'react';
import { Camera, Grid, Edit3, Crop, Printer, RotateCcw, Download, Folder } from 'lucide-react';
// Automatically import all images from src/assets/images
const importAll = (r) => {
  return r.keys().map((file, index) => ({
    id: index + 1,
    name: file.replace("./", ""),
    url: r(file),
    path: r(file)
  }));
};

// Import from your local folder
const localImages = importAll(require.context("./assets/images", false, /\.(png|jpe?g|svg)$/));
// Using CORS-compatible images from a different source
const dummyImages = [
  {
    id: 1,
    name: 'nature1.jpg',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature1.jpg'
  },
  {
    id: 2,
    name: 'nature2.jpg',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature2.jpg'
  },
  {
    id: 3,
    name: 'nature3.jpg',
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature3.jpg'
  },
  {
    id: 4,
    name: 'nature4.jpg',
    url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature4.jpg'
  },
  {
    id: 5,
    name: 'nature5.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature5.jpg'
  },
  {
    id: 6,
    name: 'nature6.jpg',
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    path: '/dummy/nature6.jpg'
  }
];

const PhotoEditor = () => {
  const [activeTab, setActiveTab] = useState('all-photos');
  const [images, setImages] = useState(localImages);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [editSettings, setEditSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  
  const [cropSettings, setCropSettings] = useState({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
    aspectRatio: 'free'
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const imageContainerRef = useRef(null);

  const aspectRatios = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '5:4', value: '5:4' }
  ];

  // Apply filters to the selected image
  const applyFilters = () => {
    if (!selectedImage || !canvasRef.current || !originalImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `
      brightness(${editSettings.brightness}%)
      contrast(${editSettings.contrast}%)
      saturate(${editSettings.saturation}%)
      hue-rotate(${editSettings.hue}deg)
      blur(${editSettings.blur}px)
      sepia(${editSettings.sepia}%)
      grayscale(${editSettings.grayscale}%)
    `;

    ctx.drawImage(img, 0, 0);
  };

  // Handle slider changes
  const handleSliderChange = (property, value) => {
    setEditSettings(prev => ({
      ...prev,
      [property]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setEditSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0
    });
  };

  // Save edited image
  const saveImage = () => {
    if (!selectedImage) return;
    
    // Create a temporary canvas to draw the final image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;
    
    // Set canvas dimensions to match the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Apply filters if editing
    if (isEditing) {
      ctx.filter = `
        brightness(${editSettings.brightness}%)
        contrast(${editSettings.contrast}%)
        saturate(${editSettings.saturation}%)
        hue-rotate(${editSettings.hue}deg)
        blur(${editSettings.blur}px)
        sepia(${editSettings.sepia}%)
        grayscale(${editSettings.grayscale}%)
      `;
    }
    
    // Draw the image
    ctx.drawImage(img, 0, 0);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `edited_${selectedImage.name}`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print image
  const printImage = () => {
    if (!selectedImage) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
            @media print {
              body { margin: 0; }
              img { max-width: 100%; max-height: 100vh; }
            }
          </style>
        </head>
        <body>
          <img src="${selectedImage.url}" alt="${selectedImage.name}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Apply crop
  const applyCrop = () => {
    if (!selectedImage || !cropCanvasRef.current || !originalImageRef.current) return;
    
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;
    
    const { x, y, width, height } = cropSettings;
    const cropX = (x / 100) * img.naturalWidth;
    const cropY = (y / 100) * img.naturalHeight;
    const cropWidth = (width / 100) * img.naturalWidth;
    const cropHeight = (height / 100) * img.naturalHeight;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    // Convert to data URL and create new image URL
    try {
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSelectedImage(prev => ({ ...prev, url: croppedUrl }));
      setIsCropping(false);
      
      // Also update the original image reference for further editing
      const newImg = new Image();
      newImg.onload = () => {
        originalImageRef.current = newImg;
      };
      newImg.src = croppedUrl;
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image. Please try again.');
    }
  };

  // Handle mouse events for crop area
  const handleCropMouseDown = (e, type = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: cropSettings.width,
      height: cropSettings.height,
      origX: cropSettings.x,
      origY: cropSettings.y
    });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / 100;
    const scaleY = rect.height / 100;
    
    const deltaX = (e.clientX - dragStart.x) / scaleX;
    const deltaY = (e.clientY - dragStart.y) / scaleY;
    
    if (dragType === 'move') {
      // Moving the entire crop area
      const newX = Math.max(0, Math.min(100 - cropSettings.width, dragStart.origX + deltaX));
      const newY = Math.max(0, Math.min(100 - cropSettings.height, dragStart.origY + deltaY));
      
      setCropSettings(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else {
      // Resizing based on handle type
      let newWidth = dragStart.width;
      let newHeight = dragStart.height;
      let newX = dragStart.origX;
      let newY = dragStart.origY;
      
      if (dragType.includes('e')) {
        newWidth = Math.max(10, Math.min(100 - newX, dragStart.width + deltaX));
      }
      if (dragType.includes('w')) {
        const widthChange = Math.max(-dragStart.origX, Math.min(dragStart.width - 10, -deltaX));
        newWidth = dragStart.width - widthChange;
        newX = dragStart.origX + widthChange;
      }
      if (dragType.includes('s')) {
        newHeight = Math.max(10, Math.min(100 - newY, dragStart.height + deltaY));
      }
      if (dragType.includes('n')) {
        const heightChange = Math.max(-dragStart.origY, Math.min(dragStart.height - 10, -deltaY));
        newHeight = dragStart.height - heightChange;
        newY = dragStart.origY + heightChange;
      }
      
      // Maintain aspect ratio if not free
      if (cropSettings.aspectRatio !== 'free') {
        const ratio = cropSettings.aspectRatio === '1:1' ? 1 :
          cropSettings.aspectRatio === '4:3' ? 3/4 :
          cropSettings.aspectRatio === '16:9' ? 9/16 :
          cropSettings.aspectRatio === '3:2' ? 2/3 :
          cropSettings.aspectRatio === '5:4' ? 4/5 : 1;
        
        if (dragType.includes('e') || dragType.includes('w')) {
          newHeight = newWidth * ratio;
          if (newY + newHeight > 100) {
            newHeight = 100 - newY;
            newWidth = newHeight / ratio;
          }
        } else if (dragType.includes('s') || dragType.includes('n')) {
          newWidth = newHeight / ratio;
          if (newX + newWidth > 100) {
            newWidth = 100 - newX;
            newHeight = newWidth * ratio;
          }
        }
      }
      
      setCropSettings(prev => ({
        ...prev,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  // Apply filters when settings change
  useEffect(() => {
    if (isEditing && selectedImage) {
      applyFilters();
    }
  }, [editSettings, selectedImage, isEditing]);

  // Set up event listeners for crop dragging
  useEffect(() => {
    if (isCropping) {
      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [isCropping, isDragging, dragType, dragStart, cropSettings]);

  const sidebarItems = [
    { id: 'all-photos', label: 'All Photos', icon: Grid },
    { id: 'folders', label: 'Folders', icon: Folder }
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="header-content">
            <div className="icon-container">
              <Camera className="icon" />
            </div>
            <h1 className="app-title">Photo Editor</h1>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-button ${activeTab === item.id ? 'nav-button-active' : ''}`}
                  >
                    <Icon className="nav-icon" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          
          <div className="external-folder-section">
            <button
              onClick={() => alert('Folder loading functionality would be implemented here')}
              className="folder-button"
            >
              <Folder className="folder-icon" />
              Load External Folder
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="navbar">
          <div className="navbar-title">
            <h2 className="navbar-heading">
              {activeTab === 'all-photos' ? 'All Photos' : 'Folders'}
            </h2>
            <p className="navbar-subtitle">
              {selectedImage ? `Editing: ${selectedImage.name}` : `${images.length} photos available`}
            </p>
          </div>
          
          {selectedImage && (
            <div className="navbar-controls">
              <button
                onClick={() => {
                  setIsCropping(!isCropping);
                  setIsEditing(false);
                }}
                className={`control-button ${isCropping ? 'control-button-active' : ''}`}
              >
                <Crop className="control-icon" />
                Crop
              </button>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsCropping(false);
                }}
                className={`control-button ${isEditing ? 'control-button-active' : ''}`}
              >
                <Edit3 className="control-icon" />
                Edit
              </button>
              <button
                onClick={printImage}
                className="control-button print-button"
              >
                <Printer className="control-icon" />
                Print
              </button>
              <button
                onClick={resetFilters}
                className="control-button reset-button"
              >
                <RotateCcw className="control-icon" />
                Reset
              </button>
              <button
                onClick={saveImage}
                className="control-button save-button"
              >
                <Download className="control-icon" />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="editor-area">
          {/* Image Grid */}
          <div className="image-grid-container">
            {activeTab === 'all-photos' && !selectedImage && (
              <div className="photos-grid">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="photo-item"
                  >
                    <div className="photo-image-container">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="photo-image"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>
                    <div className="photo-details">
                      <p className="photo-name">
                        {image.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Editor */}
            {selectedImage && (
              <div className="image-editor">
                <div 
                  className="image-container"
                  ref={imageContainerRef}
                >
                  <img
                    ref={originalImageRef}
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="preview-image"
                    crossOrigin="anonymous"
                    style={{
                      filter: isEditing ? `
                        brightness(${editSettings.brightness}%)
                        contrast(${editSettings.contrast}%)
                        saturate(${editSettings.saturation}%)
                        hue-rotate(${editSettings.hue}deg)
                        blur(${editSettings.blur}px)
                        sepia(${editSettings.sepia}%)
                        grayscale(${editSettings.grayscale}%)
                      ` : 'none'
                    }}
                    onLoad={() => {
                      if (isEditing) applyFilters();
                    }}
                  />
                  
                  {/* Crop overlay */}
                  {isCropping && (
                    <div 
                      className="crop-overlay"
                      onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                    >
                      <div 
                        className="crop-area"
                        style={{
                          left: `${cropSettings.x}%`,
                          top: `${cropSettings.y}%`,
                          width: `${cropSettings.width}%`,
                          height: `${cropSettings.height}%`
                        }}
                      >
                        <div 
                          className="crop-handle crop-handle-top-left"
                          onMouseDown={(e) => handleCropMouseDown(e, 'nw')}
                        ></div>
                        <div 
                          className="crop-handle crop-handle-top-right"
                          onMouseDown={(e) => handleCropMouseDown(e, 'ne')}
                        ></div>
                        <div 
                          className="crop-handle crop-handle-bottom-left"
                          onMouseDown={(e) => handleCropMouseDown(e, 'sw')}
                        ></div>
                        <div 
                          className="crop-handle crop-handle-bottom-right"
                          onMouseDown={(e) => handleCropMouseDown(e, 'se')}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden-canvas" />
                  <canvas ref={cropCanvasRef} className="hidden-canvas" />
                  
                  {/* Back to grid button */}
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setIsEditing(false);
                      setIsCropping(false);
                    }}
                    className="back-button"
                  >
                    ← Back to Photos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Edit Panel */}
          {selectedImage && (isEditing || isCropping) && (
            <div className="edit-panel">
              {isCropping ? (
                <div className="crop-panel">
                  <h3 className="panel-title">
                    <Crop className="panel-icon" />
                    Crop Image
                  </h3>
                  
                  <div className="crop-controls">
                    <div className="control-group">
                      <label className="control-label">
                        Aspect Ratio
                      </label>
                      <div className="aspect-ratio-grid">
                        {aspectRatios.map((ratio) => (
                          <button
                            key={ratio.value}
                            onClick={() => {
                              const newSettings = { ...cropSettings, aspectRatio: ratio.value };
                              
                              // Adjust height based on aspect ratio
                              if (ratio.value !== 'free') {
                                const ratioValue = ratio.value === '1:1' ? 1 :
                                  ratio.value === '4:3' ? 3/4 :
                                  ratio.value === '16:9' ? 9/16 :
                                  ratio.value === '3:2' ? 2/3 :
                                  ratio.value === '5:4' ? 4/5 : 1;
                                
                                newSettings.height = newSettings.width * ratioValue;
                                
                                // Ensure crop area stays within bounds
                                if (newSettings.y + newSettings.height > 100) {
                                  newSettings.height = 100 - newSettings.y;
                                  newSettings.width = newSettings.height / ratioValue;
                                }
                              }
                              
                              setCropSettings(newSettings);
                            }}
                            className={`aspect-ratio-button ${cropSettings.aspectRatio === ratio.value ? 'aspect-ratio-button-active' : ''}`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="crop-sliders">
                      <div className="slider-group">
                        <label className="slider-label">
                          X Position: {Math.round(cropSettings.x)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cropSettings.x}
                          onChange={(e) => setCropSettings(prev => ({ 
                            ...prev, 
                            x: Math.min(100 - prev.width, parseInt(e.target.value))
                          }))}
                          className="slider"
                        />
                      </div>

                      <div className="slider-group">
                        <label className="slider-label">
                          Y Position: {Math.round(cropSettings.y)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cropSettings.y}
                          onChange={(e) => setCropSettings(prev => ({ 
                            ...prev, 
                            y: Math.min(100 - prev.height, parseInt(e.target.value))
                          }))}
                          className="slider"
                        />
                      </div>

                      <div className="slider-group">
                        <label className="slider-label">
                          Width: {Math.round(cropSettings.width)}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={cropSettings.width}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            setCropSettings(prev => {
                              const newSettings = { ...prev, width: newWidth };
                              
                              // Maintain aspect ratio if not free
                              if (prev.aspectRatio !== 'free') {
                                const ratio = prev.aspectRatio === '1:1' ? 1 :
                                  prev.aspectRatio === '4:3' ? 3/4 :
                                  prev.aspectRatio === '16:9' ? 9/16 :
                                  prev.aspectRatio === '3:2' ? 2/3 :
                                  prev.aspectRatio === '5:4' ? 4/5 : 1;
                                
                                newSettings.height = newWidth * ratio;
                                
                                // Ensure crop area stays within bounds
                                if (newSettings.y + newSettings.height > 100) {
                                  newSettings.height = 100 - newSettings.y;
                                  newSettings.width = newSettings.height / ratio;
                                }
                              }
                              
                              return newSettings;
                            });
                          }}
                          className="slider"
                        />
                      </div>

                      <div className="slider-group">
                        <label className="slider-label">
                          Height: {Math.round(cropSettings.height)}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={cropSettings.height}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value);
                            setCropSettings(prev => {
                              const newSettings = { ...prev, height: newHeight };
                              
                              // Maintain aspect ratio if not free
                              if (prev.aspectRatio !== 'free') {
                                const ratio = prev.aspectRatio === '1:1' ? 1 :
                                  prev.aspectRatio === '4:3' ? 3/4 :
                                  prev.aspectRatio === '16:9' ? 9/16 :
                                  prev.aspectRatio === '3:2' ? 2/3 :
                                  prev.aspectRatio === '5:4' ? 4/5 : 1;
                                
                                newSettings.width = newHeight / ratio;
                                
                                // Ensure crop area stays within bounds
                                if (newSettings.x + newSettings.width > 100) {
                                  newSettings.width = 100 - newSettings.x;
                                  newSettings.height = newSettings.width * ratio;
                                }
                              }
                              
                              return newSettings;
                            });
                          }}
                          className="slider"
                        />
                      </div>
                    </div>

                    <button
                      onClick={applyCrop}
                      className="apply-crop-button"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="edit-tools-panel">
                  <h3 className="panel-title">
                    <Edit3 className="panel-icon" />
                    Edit Tools
                  </h3>
                  
                  <div className="edit-controls">
                    <div className="slider-group">
                      <label className="slider-label">
                        Brightness: {editSettings.brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={editSettings.brightness}
                        onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Contrast: {editSettings.contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={editSettings.contrast}
                        onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Saturation: {editSettings.saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={editSettings.saturation}
                        onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Hue: {editSettings.hue}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={editSettings.hue}
                        onChange={(e) => handleSliderChange('hue', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Blur: {editSettings.blur}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={editSettings.blur}
                        onChange={(e) => handleSliderChange('blur', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Sepia: {editSettings.sepia}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editSettings.sepia}
                        onChange={(e) => handleSliderChange('sepia', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group">
                      <label className="slider-label">
                        Grayscale: {editSettings.grayscale}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editSettings.grayscale}
                        onChange={(e) => handleSliderChange('grayscale', parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>
                  </div>

                  <div className="tips-container">
                    <h4 className="tips-title">Quick Tips</h4>
                    <ul className="tips-list">
                      <li>• Use saturation to make colors pop</li>
                      <li>• Combine brightness and contrast</li>
                      <li>• Try sepia for vintage looks</li>
                      <li>• Blur creates artistic effects</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;