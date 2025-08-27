import React, { useState, useRef, useEffect } from 'react';

// Dummy images for initial testing
const dummyImages = [
  {
    id: 1,
    name: 'sample1.jpg',
    url: 'https://picsum.photos/800/600?random=1',
    path: '/dummy/sample1.jpg'
  },
  {
    id: 2,
    name: 'sample2.jpg',
    url: 'https://picsum.photos/800/600?random=2',
    path: '/dummy/sample2.jpg'
  },
  {
    id: 3,
    name: 'sample3.jpg',
    url: 'https://picsum.photos/800/600?random=3',
    path: '/dummy/sample3.jpg'
  },
  {
    id: 4,
    name: 'sample4.jpg',
    url: 'https://picsum.photos/800/600?random=4',
    path: '/dummy/sample4.jpg'
  },
  {
    id: 5,
    name: 'sample5.jpg',
    url: 'https://picsum.photos/800/600?random=5',
    path: '/dummy/sample5.jpg'
  }
];

const PhotoEditor = () => {
  const [images, setImages] = useState(dummyImages);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editSettings, setEditSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0
  });
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  // Load folder images (for when Electron IPC is available)
  const loadFolder = async () => {
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('select-folder');
        if (result) {
          setImages(result.images.map((img, index) => ({
            id: index + 1,
            name: img.name,
            url: img.url,
            path: img.path
          })));
        }
      } else {
        alert('Folder selection is only available in Electron app');
      }
    } catch (error) {
      console.error('Error loading folder:', error);
    }
  };

  // Apply filters to the selected image
  const applyFilters = () => {
    if (!selectedImage || !canvasRef.current || !originalImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply CSS filters
    ctx.filter = `
      brightness(${editSettings.brightness}%)
      contrast(${editSettings.contrast}%)
      saturate(${editSettings.saturation}%)
      hue-rotate(${editSettings.hue}deg)
      blur(${editSettings.blur}px)
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
      blur: 0
    });
  };

  // Save edited image
  const saveImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `edited_${selectedImage.name}`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Apply filters when settings change
  useEffect(() => {
    applyFilters();
  }, [editSettings, selectedImage]);

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Photo Manager</h2>
        </div>

        <div className="load-folder">
          <button onClick={loadFolder} className="load-btn">
            Load Folder
          </button>
        </div>

        <div className="photos-list">
          <h3>All Photos ({images.length})</h3>
          <div className="photos-grid">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`photo-item ${selectedImage?.id === image.id ? 'selected' : ''}`}
              >
                <img src={image.url} alt={image.name} />
                <p>{image.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <div className="navbar">
          <div>
            <h1>Photo Editor</h1>
            {selectedImage && <p>Editing: {selectedImage.name}</p>}
          </div>
          {selectedImage && (
            <div className="nav-buttons">
              <button onClick={resetFilters} className="reset-btn">Reset</button>
              <button onClick={saveImage} className="save-btn">Save Image</button>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="editor-area">
          <div className="image-preview">
            {selectedImage ? (
              <div className="image-container">
                <img
                  ref={originalImageRef}
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="preview-image"
                  style={{
                    filter: `
                      brightness(${editSettings.brightness}%)
                      contrast(${editSettings.contrast}%)
                      saturate(${editSettings.saturation}%)
                      hue-rotate(${editSettings.hue}deg)
                      blur(${editSettings.blur}px)
                    `
                  }}
                  onLoad={() => applyFilters()}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            ) : (
              <div className="no-image">
                <div className="no-image-icon">📷</div>
                <h3>No Image Selected</h3>
                <p>Select an image from the sidebar to start editing</p>
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="edit-panel">
              <h3>Edit Tools</h3>
              
              <div className="controls">
                <div className="control-group">
                  <label>Brightness: {editSettings.brightness}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.brightness}
                    onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Contrast: {editSettings.contrast}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.contrast}
                    onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Saturation: {editSettings.saturation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={editSettings.saturation}
                    onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Hue: {editSettings.hue}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={editSettings.hue}
                    onChange={(e) => handleSliderChange('hue', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="control-group">
                  <label>Blur: {editSettings.blur}px</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={editSettings.blur}
                    onChange={(e) => handleSliderChange('blur', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              <div className="tips">
                <h4>Quick Tips:</h4>
                <ul>
                  <li>• Adjust saturation to make colors pop</li>
                  <li>• Use brightness and contrast together</li>
                  <li>• Hue rotation changes color tones</li>
                  <li>• Blur can create artistic effects</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;