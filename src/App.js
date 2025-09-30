import React, { useState, useRef, useEffect } from 'react';
import { Camera, Grid, Edit3, Crop, Printer, RotateCcw, Download, Folder, Wand2, Image as ImageIcon, Save, FolderOpen } from 'lucide-react';
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
  const [selectedFolder, setSelectedFolder] = useState('');
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
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemoveProgress, setBgRemoveProgress] = useState(0);
  const [bgRemoveStatus, setBgRemoveStatus] = useState('');
  const [bgRemovedImage, setBgRemovedImage] = useState(null);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [compositeImage, setCompositeImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [selectedBackgroundFolder, setSelectedBackgroundFolder] = useState('');
  
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const imageContainerRef = useRef(null);
  // Sample background images
  const backgroundImages = [
    {
      id: 1,
      name: 'Beach',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Mountain',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'City',
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      name: 'Studio',
      url: 'https://images.unsplash.com/photo-1533575770077-052fa2c609fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      name: 'Gradient',
      url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 6,
      name: 'Nature',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
  ];
  const aspectRatios = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '5:4', value: '5:4' }
  ];
  // Function to load background images from folder
  const loadBackgroundsFromFolder = async () => {
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        
        // Use the same handler as main images
        const result = await ipcRenderer.invoke('select-folder');
        
        if (result && result.images) {
          console.log('Selected background folder:', result.folderPath);
          console.log('Loaded background images:', result.images);
          
          setCustomBackgrounds(result.images);
          setSelectedBackgroundFolder(result.folderPath);
        }
      } else {
        console.warn('Electron not available - running in browser mode');
        // Browser fallback for background images
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        input.accept = 'image/*';
        
        input.onchange = (e) => {
          const files = Array.from(e.target.files);
          const backgroundFiles = files
            .filter(file => file.type.startsWith('image/'))
            .map((file, index) => ({
              id: index + 1000, // Start from 1000 to avoid conflicts with main images
              name: file.name,
              url: URL.createObjectURL(file),
              file: file
            }));
          
          setCustomBackgrounds(backgroundFiles);
          setSelectedBackgroundFolder('Selected Folder');
        };
        
        input.click();
      }
    } catch (error) {
      console.error('Error loading background images:', error);
      alert('Error loading background images from folder: ' + error.message);
    }
  };
  // Combine default backgrounds with custom backgrounds
  const allBackgrounds = [
    ...backgroundImages, // Your existing default backgrounds
    ...customBackgrounds // Custom backgrounds from computer
  ];
// Alternative method using the legacy handler
const loadImagesFromFolder = async () => {
  try {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Use the legacy handler that's already defined in your main.js
      const result = await ipcRenderer.invoke('select-folder');
      
      if (result) {
        console.log('Selected folder:', result.folderPath);
        console.log('Loaded images:', result.images);
        
        setImages(result.images);
        setSelectedFolder(result.folderPath);
        setSelectedImage(null);
      }
    } else {
      console.warn('Electron not available - running in browser mode');
      // ... browser fallback code ...
    }
  } catch (error) {
    console.error('Error loading images:', error);
    alert('Error loading images from folder: ' + error.message);
  }
};

  // Load recent folder on app start
  useEffect(() => {
    const loadRecentFolder = async () => {
      if (window.require) {
        try {
          const { ipcRenderer } = window.require('electron');
          const recentFolder = await ipcRenderer.invoke('folder:getRecent');
          if (recentFolder) {
            const imageFiles = await ipcRenderer.invoke('folder:readImages', recentFolder);
            setImages(imageFiles);
            setSelectedFolder(recentFolder);
          }
        } catch (error) {
          console.log('No recent folder found:', error);
        }
      }
    };

    loadRecentFolder();
  }, []);

  // Save image using Electron API
  const saveImage2 = async () => {
    if (!selectedImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
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
    
    ctx.drawImage(img, 0, 0);
    
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        await ipcRenderer.invoke('image:save', imageDataUrl, `edited_${selectedImage.name}`);
      } else {
        // Browser fallback
        const link = document.createElement('a');
        link.download = `edited_${selectedImage.name}`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

   // PicWash API integration
// PicWash API integration
  const removeBackground = async () => {
    if (!selectedImage || !selectedImage.url) { // Add null check
      console.error('No image selected or image URL is invalid');
      return;
    }
    // if (!selectedImage) return;
    setOriginalImage(selectedImage);
    
    setIsRemovingBg(true);
    setBgRemoveProgress(0);
    setBgRemoveStatus('Initializing background removal...');
    
    try {
      // Create FormData for the API request
      const formData = new FormData();
      
      // Fetch the image and convert to blob
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      
      formData.append('image_file', blob);
      formData.append('sync', '0'); // Async processing
      formData.append('return_type', '1'); // Return image URL
      formData.append('output_type', '2'); // Return the image only
      formData.append('format', 'png'); // PNG format with transparency
      
      // Create the task
      const createTaskResponse = await fetch('https://techhk.aoscdn.com/api/tasks/visual/segmentation', {
        method: 'POST',
        headers: {
          // 'X-API-KEY': 'wxa8nbct595p2r0x5',
          'X-API-KEY': 'wxx4yws6eibe485sq',
        },
        body: formData
      });
      
      if (!createTaskResponse.ok) {
        throw new Error(`API error: ${createTaskResponse.status}`);
      }
      
      const taskData = await createTaskResponse.json();
      
      if (taskData.status !== 200) {
        throw new Error(`API error: ${taskData.message}`);
      }
      
      const taskId = taskData.data.task_id;
      setBgRemoveStatus('Processing image...');
      
      // Poll for results with timeout (30 seconds max)
      const maxAttempts = 30;
      let attempts = 0;
      
      const pollForResult = async () => {
        attempts++;
        setBgRemoveProgress((attempts / maxAttempts) * 100);
        
        try {
          const resultResponse = await fetch(`https://techhk.aoscdn.com/api/tasks/visual/segmentation/${taskId}`, {
            headers: {
              // 'X-API-KEY': 'wxa8nbct595p2r0x5',
              'X-API-KEY': 'wxx4yws6eibe485sq',
            }
          });
          
          if (!resultResponse.ok) {
            throw new Error(`API error: ${resultResponse.status}`);
          }
          
          const resultData = await resultResponse.json();
          
          if (resultData.status === 200) {
            if (resultData.data.state === 1) { // Task completed
              setBgRemoveStatus('Background removed successfully!');
              
              // Store the background-removed image
              const processedImageUrl = resultData.data.image;
              setBgRemovedImage({
                url: processedImageUrl,
                name: `no-bg-${selectedImage.name}`
              });
              
              // Update the displayed image
              setSelectedImage(prev => ({ 
                ...prev, 
                url: processedImageUrl 
              }));
              
              // Also update the original image reference for further editing
              const newImg = new Image();
              newImg.onload = () => {
                originalImageRef.current = newImg;
                setIsRemovingBg(false);
                
                // Auto-save the background-removed image
                saveBgRemovedImage(processedImageUrl);
              };
              newImg.src = processedImageUrl;
              
              return true;
            } else if (resultData.data.state < 0) { // Task failed
              throw new Error(`Background removal failed: ${resultData.message}`);
            }
          }
          
          // If not completed and not failed, continue polling
          if (attempts < maxAttempts) {
            setTimeout(pollForResult, 1000);
          } else {
            throw new Error('Background removal timed out');
          }
        } catch (error) {
          console.error('Error polling for result:', error);
          setBgRemoveStatus(`Error: ${error.message}`);
          setTimeout(() => setIsRemovingBg(false), 3000);
        }
      };
      
      // Start polling
      setTimeout(pollForResult, 1000);
      
    } catch (error) {
      console.error('Error removing background:', error);
      setBgRemoveStatus(`Error: ${error.message}`);
      setTimeout(() => setIsRemovingBg(false), 3000);
    }
  };

  // Save background removed image
  const saveBgRemovedImage = (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      // Create a download link
      const link = document.createElement('a');
      link.download = `no-bg-${selectedImage.name}`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // In a real Electron app, you would use the file system API here
      console.log('Background removed image saved');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };
// Apply selected background and set up for future edits
const applyBackground = async (background) => {
  if (!bgRemovedImage || !bgRemovedImage.url || !background || !background.url) {
    console.error('Invalid background application');
    return;
  }
  
  setSelectedBackground(background);
  
  // Create a canvas to composite the images
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Load both images
  const foreground = new Image();
  const backgroundImg = new Image();
  
  foreground.crossOrigin = 'anonymous';
  backgroundImg.crossOrigin = 'anonymous';
  
  // Wait for both images to load
  await new Promise((resolve) => {
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) resolve();
    };
    
    foreground.onload = onLoad;
    backgroundImg.onload = onLoad;
    
    foreground.src = bgRemovedImage.url;
    backgroundImg.src = background.url;
  });
  
  // Set canvas dimensions to match background
  canvas.width = backgroundImg.width;
  canvas.height = backgroundImg.height;
  
  // Draw background
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  
  // Calculate dimensions for foreground to fit nicely
  const maxWidth = canvas.width * 0.8;
  const maxHeight = canvas.height * 0.8;
  
  let fgWidth = foreground.width;
  let fgHeight = foreground.height;
  
  // Scale if necessary
  if (fgWidth > maxWidth) {
    const ratio = maxWidth / fgWidth;
    fgWidth = maxWidth;
    fgHeight = fgHeight * ratio;
  }
  
  if (fgHeight > maxHeight) {
    const ratio = maxHeight / fgHeight;
    fgHeight = maxHeight;
    fgWidth = fgWidth * ratio;
  }
  
  // Center the foreground image
  const x = (canvas.width - fgWidth) / 2;
  const y = (canvas.height - fgHeight) / 2;
  
  // Draw foreground
  ctx.drawImage(foreground, x, y, fgWidth, fgHeight);
  
  // Convert to data URL
  const compositeUrl = canvas.toDataURL('image/png');
  setCompositeImage(compositeUrl);
  
  // Update the displayed image - store the composite data for future reference
  setSelectedImage(prev => ({ 
    ...prev, 
    url: compositeUrl,
    compositeData: compositeUrl, // Store the composite data
    backgroundApplied: true,
    backgroundInfo: background
  }));
};
  // Apply selected background
  const applyBackground1 = async (background) => {
    if (!bgRemovedImage || !bgRemovedImage.url || !background || !background.url) {
      console.error('Invalid background application');
      return;
    }
    // if (!bgRemovedImage) return;
    
    setSelectedBackground(background);
    
    // Create a canvas to composite the images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load both images
    const foreground = new Image();
    const backgroundImg = new Image();
    
    foreground.crossOrigin = 'anonymous';
    backgroundImg.crossOrigin = 'anonymous';
    
    // Wait for both images to load
    await new Promise((resolve) => {
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded === 2) resolve();
      };
      
      foreground.onload = onLoad;
      backgroundImg.onload = onLoad;
      
      foreground.src = bgRemovedImage.url;
      backgroundImg.src = background.url;
    });
    
    // Set canvas dimensions to match background
    canvas.width = backgroundImg.width;
    canvas.height = backgroundImg.height;
    
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions for foreground to fit nicely
    const maxWidth = canvas.width * 0.8;
    const maxHeight = canvas.height * 0.8;
    
    let fgWidth = foreground.width;
    let fgHeight = foreground.height;
    
    // Scale if necessary
    if (fgWidth > maxWidth) {
      const ratio = maxWidth / fgWidth;
      fgWidth = maxWidth;
      fgHeight = fgHeight * ratio;
    }
    
    if (fgHeight > maxHeight) {
      const ratio = maxHeight / fgHeight;
      fgHeight = maxHeight;
      fgWidth = fgWidth * ratio;
    }
    
    // Center the foreground image
    const x = (canvas.width - fgWidth) / 2;
    const y = (canvas.height - fgHeight) / 2;
    
    // Draw foreground
    ctx.drawImage(foreground, x, y, fgWidth, fgHeight);
    
    // Convert to data URL
    const compositeUrl = canvas.toDataURL('image/png');
    setCompositeImage(compositeUrl);
    
    // Update the displayed image
    setSelectedImage(prev => ({ 
      ...prev, 
      url: compositeUrl 
    }));
  };

  const showImageComparison = () => {
    setShowComparison(true);
  };
  // Add a function to handle hiding comparison
  const hideImageComparison = () => {
    setShowComparison(false);
  };
  // Save composite image
  const saveCompositeImage = () => {
    if (!compositeImage) return;
    
    const link = document.createElement('a');
    link.download = `composite-${selectedImage.name}`;
    link.href = compositeImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  // Unified save function that always creates composite from source images
const saveImage = async () => {
  if (!selectedImage) return;
  
  try {
    console.log('Starting save process...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let filename;
    
    // Case 1: Composite image (background removed + custom background + edits)
    if (bgRemovedImage && selectedBackground) {
      console.log('Creating composite image with edits...');
      
      // Always create composite from source images to include edits
      const foreground = new Image();
      const backgroundImg = new Image();
      
      await new Promise((resolve) => {
        let loaded = 0;
        const onLoad = () => {
          loaded++;
          if (loaded === 2) resolve();
        };
        
        foreground.onload = onLoad;
        backgroundImg.onload = onLoad;
        
        // Use the background-removed image as foreground
        foreground.src = bgRemovedImage.url;
        backgroundImg.src = selectedBackground.url;
      });
      
      // Set canvas to background dimensions
      canvas.width = backgroundImg.width;
      canvas.height = backgroundImg.height;
      
      // Draw background first
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
      
      // Calculate dimensions for foreground
      const maxWidth = canvas.width * 0.8;
      const maxHeight = canvas.height * 0.8;
      
      let fgWidth = foreground.width;
      let fgHeight = foreground.height;
      
      // Scale if necessary
      if (fgWidth > maxWidth) {
        const ratio = maxWidth / fgWidth;
        fgWidth = maxWidth;
        fgHeight = fgHeight * ratio;
      }
      
      if (fgHeight > maxHeight) {
        const ratio = maxHeight / fgHeight;
        fgHeight = maxHeight;
        fgWidth = fgWidth * ratio;
      }
      
      // Center the foreground image
      const x = (canvas.width - fgWidth) / 2;
      const y = (canvas.height - fgHeight) / 2;
      
      // Apply edits to the ENTIRE composite image (background + foreground)
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
      
      // Redraw the entire scene with filters applied
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(foreground, x, y, fgWidth, fgHeight);
      
      filename = `composite-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
      
    } 
    // Case 2: Background removed only (no custom background) + edits
    else if (bgRemovedImage && !selectedBackground) {
      console.log('Saving background-removed image with edits...');
      
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = bgRemovedImage.url;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply edits to background-removed image
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
      
      ctx.drawImage(img, 0, 0);
      filename = `no-bg-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
      
    } 
    // Case 3: Original image with edits
    else {
      console.log('Saving edited original image...');
      
      const img = originalImageRef.current;
      if (!img) {
        console.error('No image element found');
        return;
      }
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Apply edits if editing
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
      filename = `edited_${selectedImage.name}`;
    }
    
    // Determine file format and quality
    const isPNG = filename.toLowerCase().endsWith('.png');
    const imageData = isPNG 
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', 0.95);
    
    console.log('Attempting to save:', filename);
    
    // Use Electron API if available
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('image:save', imageData, filename);
        if (result) {
          console.log('✅ Image saved successfully:', result);
          alert(`Image saved successfully as: ${filename}`);
        } else {
          console.log('Save cancelled by user');
        }
      } catch (error) {
        console.error('❌ Electron save failed:', error);
        downloadImage(imageData, filename);
      }
    } else {
      downloadImage(imageData, filename);
    }
    
  } catch (error) {
    console.error('❌ Error in save process:', error);
    alert('Error saving image: ' + error.message);
  }
};
  // Save exactly what's displayed on screen
const saveImage4 = async () => {
  if (!selectedImage) return;
  
  try {
    console.log('Starting save process...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let filename;
    
    // Get the currently displayed image from the preview
    const previewImg = originalImageRef.current;
    if (!previewImg) {
      console.error('No preview image found');
      return;
    }
    
    // Set canvas to match preview dimensions
    canvas.width = previewImg.naturalWidth || previewImg.width;
    canvas.height = previewImg.naturalHeight || previewImg.height;
    
    // Apply the same filters that are currently on the preview
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
    
    // Draw the current preview image (this includes any applied background)
    ctx.drawImage(previewImg, 0, 0, canvas.width, canvas.height);
    
    // Determine filename based on current state
    if (compositeImage && selectedBackground) {
      filename = `composite-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
    } else if (bgRemovedImage && !selectedBackground) {
      filename = `no-bg-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
    } else {
      filename = `edited_${selectedImage.name}`;
    }
    
    // Determine file format
    const isPNG = filename.toLowerCase().endsWith('.png');
    const imageData = isPNG 
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', 0.95);
    
    console.log('Attempting to save:', filename);
    
    // Use Electron API if available
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('image:save', imageData, filename);
        if (result) {
          console.log('✅ Image saved successfully:', result);
          alert(`Image saved successfully as: ${filename}`);
        } else {
          console.log('Save cancelled by user');
        }
      } catch (error) {
        console.error('❌ Electron save failed:', error);
        downloadImage(imageData, filename);
      }
    } else {
      downloadImage(imageData, filename);
    }
    
  } catch (error) {
    console.error('❌ Error in save process:', error);
    alert('Error saving image: ' + error.message);
  }
};
// Update the preview whenever edits change
useEffect(() => {
  if (selectedImage && selectedBackground && bgRemovedImage && isEditing) {
    updateCompositePreview();
  }
}, [editSettings, isEditing]);

// Function to update composite preview with current edits
const updateCompositePreview = async () => {
  if (!bgRemovedImage || !selectedBackground) return;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const foreground = new Image();
  const backgroundImg = new Image();
  
  await new Promise((resolve) => {
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) resolve();
    };
    
    foreground.onload = onLoad;
    backgroundImg.onload = onLoad;
    
    foreground.src = bgRemovedImage.url;
    backgroundImg.src = selectedBackground.url;
  });
  
  canvas.width = backgroundImg.width;
  canvas.height = backgroundImg.height;
  
  // Draw background
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  
  const maxWidth = canvas.width * 0.8;
  const maxHeight = canvas.height * 0.8;
  
  let fgWidth = foreground.width;
  let fgHeight = foreground.height;
  
  if (fgWidth > maxWidth) {
    const ratio = maxWidth / fgWidth;
    fgWidth = maxWidth;
    fgHeight = fgHeight * ratio;
  }
  
  if (fgHeight > maxHeight) {
    const ratio = maxHeight / fgHeight;
    fgHeight = maxHeight;
    fgWidth = fgWidth * ratio;
  }
  
  const x = (canvas.width - fgWidth) / 2;
  const y = (canvas.height - fgHeight) / 2;
  
  // Apply current edits
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
  
  // Redraw with filters
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(foreground, x, y, fgWidth, fgHeight);
  
  const updatedCompositeUrl = canvas.toDataURL('image/png');
  setCompositeImage(updatedCompositeUrl);
  
  // Update the displayed image
  setSelectedImage(prev => ({ 
    ...prev, 
    url: updatedCompositeUrl 
  }));
};
  // Enhanced unified save function with better quality handling
const saveImage3 = async () => {
  if (!selectedImage) return;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let filename;
    
    if (compositeImage && selectedBackground) {
      // Handle composite image - create from scratch for best quality
      const foreground = new Image();
      const backgroundImg = new Image();
      
      await new Promise((resolve) => {
        let loaded = 0;
        const onLoad = () => {
          loaded++;
          if (loaded === 2) resolve();
        };
        
        foreground.onload = onLoad;
        backgroundImg.onload = onLoad;
        
        foreground.src = bgRemovedImage.url;
        backgroundImg.src = selectedBackground.url;
      });
      
      // Set canvas to background dimensions
      canvas.width = backgroundImg.width;
      canvas.height = backgroundImg.height;
      
      // Draw background
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
      
      // Calculate dimensions for foreground
      const maxWidth = canvas.width * 0.8;
      const maxHeight = canvas.height * 0.8;
      
      let fgWidth = foreground.width;
      let fgHeight = foreground.height;
      
      // Scale if necessary
      if (fgWidth > maxWidth) {
        const ratio = maxWidth / fgWidth;
        fgWidth = maxWidth;
        fgHeight = fgHeight * ratio;
      }
      
      if (fgHeight > maxHeight) {
        const ratio = maxHeight / fgHeight;
        fgHeight = maxHeight;
        fgWidth = fgWidth * ratio;
      }
      
      // Center the foreground image
      const x = (canvas.width - fgWidth) / 2;
      const y = (canvas.height - fgHeight) / 2;
      
      // Draw foreground
      ctx.drawImage(foreground, x, y, fgWidth, fgHeight);
      
      filename = `composite-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
      
    } else if (bgRemovedImage && !selectedBackground) {
      // Handle background-removed image
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = bgRemovedImage.url;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      filename = `no-bg-${selectedImage.name.replace('.png', '').replace('.jpg', '')}.png`;
      
    } else {
      // Handle edited original image
      const img = originalImageRef.current;
      if (!img) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Apply current edits
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
      
      ctx.drawImage(img, 0, 0);
      filename = `edited_${selectedImage.name}`;
    }
    
    // Determine file format and quality
    const isPNG = filename.toLowerCase().endsWith('.png');
    const imageData = isPNG 
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', 0.95);
    
    // Save the image
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('image:save', imageData, filename);
      if (result) {
        console.log('Image saved to:', result);
        alert(`Image saved successfully as: ${filename}`);
      }
    } else {
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Image downloaded:', filename);
    }
    
  } catch (error) {
    console.error('Error saving image:', error);
    alert('Error saving image: ' + error.message);
  }
};

  // Save edited image
  const saveImageold = () => {
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
  // Print image - Fixed for Electron
const printImage = async () => {
  if (!selectedImage) return;
  
  try {
    // Check if running in Electron
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Create a temporary canvas with the current image state
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = originalImageRef.current;
      
      if (!img) return;
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Apply current filters if editing
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
      
      ctx.drawImage(img, 0, 0);
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Photo - ${selectedImage.name}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: #f0f0f0;
                }
                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                  display: block;
                }
                @media print {
                  body {
                    background: white;
                    margin: 0;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100vh;
                    page-break-inside: avoid;
                  }
                  @page {
                    margin: 0.5cm;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${imageDataUrl}" alt="${selectedImage.name}" />
              <script>
                // Wait for image to load, then print
                window.onload = function() {
                  const img = document.querySelector('img');
                  if (img.complete) {
                    setTimeout(() => {
                      window.print();
                    }, 500);
                  } else {
                    img.onload = function() {
                      setTimeout(() => {
                        window.print();
                      }, 500);
                    };
                  }
                };
                
                // Close window after printing or canceling
                window.onafterprint = function() {
                  setTimeout(() => {
                    window.close();
                  }, 100);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      // Browser fallback - original method
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
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
            <img src="${selectedImage.url}" alt="${selectedImage.name}" />
            <script>
              window.onload = function() {
                setTimeout(() => window.print(), 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  } catch (error) {
    console.error('Error printing image:', error);
    alert('Error printing image: ' + error.message);
  }
};
  const printImage0 = () => {
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
    // { id: 'all-photos', label: 'All Photos', icon: Grid },
    // { id: 'folders', label: 'Folders', icon: Folder }
  ];

// Add this function to handle image selection from comparison
// const selectImageFromComparison = (image, type) => {
//   setSelectedImage({
//     ...selectedImage,
//     url: image.url,
//     name: type === 'original' ? selectedImage.name : `no-bg-${selectedImage.name}`
//   });
  
//   // Update the original image reference for editing
//   const newImg = new Image();
//   newImg.onload = () => {
//     originalImageRef.current = newImg;
//   };
//   newImg.src = image.url;
// };
// Enhanced version that also handles composite images
const selectImageFromComparison = (image, type) => {
  const newImageData = {
    ...selectedImage,
    url: image.url,
    name: type === 'original' ? selectedImage.name : `no-bg-${selectedImage.name}`
  };
  
  setSelectedImage(newImageData);
  
  // If there's a composite image and we're selecting the background-removed version,
  // update the composite image as well
  if (compositeImage && type === 'removed' && selectedBackground) {
    applyBackground(selectedBackground);
  }
  
  // Update the original image reference for editing
  const newImg = new Image();
  newImg.onload = () => {
    originalImageRef.current = newImg;
  };
  newImg.src = image.url;
};

const selectImageFromComparison2 = (image, type) => {
  if (!selectedImage || !image || !image.url) {
    console.error('Invalid image selection');
    return;
  }
  
  const newImageData = {
    ...selectedImage,
    url: image.url,
    name: type === 'original' ? selectedImage.name : `no-bg-${selectedImage.name}`
  };
  
  setSelectedImage(newImageData);
  
  // If there's a composite image and we're selecting the background-removed version,
  // update the composite image as well
  if (compositeImage && type === 'removed' && selectedBackground) {
    applyBackground(selectedBackground);
  }
  
  // Update the original image reference for editing
  const newImg = new Image();
  newImg.onload = () => {
    originalImageRef.current = newImg;
  };
  newImg.src = image.url;
};
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
          
          {/* <div className="external-folder-section">
            <button
              onClick={() => alert('Folder loading functionality would be implemented here')}
              className="folder-button"
            >
              <Folder className="folder-icon" />
              Load External Folder
            </button>
          </div> */}
          <div className="external-folder-section">
  <button
    onClick={loadImagesFromFolder}
    className="folder-button"
  >
    <FolderOpen className="folder-icon" />
    Choose Folder
  </button>
  {selectedFolder && (
    <p className="selected-folder">
      Current: {selectedFolder.split(/[\\/]/).pop()}
    </p>
  )}
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
                onClick={removeBackground}
                className={`control-button ${isRemovingBg ? 'control-button-active' : ''}`}
                disabled={isRemovingBg}
              >
                <Wand2 className="control-icon" />
                {isRemovingBg ? 'Removing...' : 'Remove BG'}
              </button>
              {/* Add Backgrounds button */}
              {bgRemovedImage && (
                <button
                  onClick={() => setShowBackgrounds(!showBackgrounds)}
                  className={`control-button ${showBackgrounds ? 'control-button-active' : ''}`}
                >
                  <ImageIcon className="control-icon" />
                  Backgrounds
                </button>
              )}
              
              {/* Add Save Composite button */}
              {/* {compositeImage && (
                <button
                  onClick={saveCompositeImage}
                  className="control-button save-button"
                >
                  <Save className="control-icon" />
                  Save Composite
                </button>
              )} */}
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
                {/* <RotateCcw className="control-icon" /> */}
                Reset
              </button>
              {/* <button
                onClick={saveImage}
                className="control-button save-button"
              >
                <Download className="control-icon" />
                Save
              </button> */}
              <button
                onClick={saveImage}
                className="control-button save-button"
                title="Save final image (includes all edits, background removal, and applied backgrounds)"
              >
                <Download className="control-icon" />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="editor-area">
          {/* Background Selection Panel */}
          {showBackgrounds && (
            <div className="backgrounds-panel">
              <div className="backgrounds-panel-header">
                <h3 className="panel-title">
                  <ImageIcon className="panel-icon" />
                  Select Background
                </h3>
                {/* Add button to load custom backgrounds */}
                <button
                  onClick={loadBackgroundsFromFolder}
                  className="folder-button small"
                >
                  <FolderOpen className="folder-icon" />
                  Add Custom Backgrounds
                </button>
              </div>
              {/* Show selected background folder */}
            {selectedBackgroundFolder && (
              <div className="selected-folder-info">
                <p>Custom backgrounds from: {selectedBackgroundFolder.split(/[\\/]/).pop()}</p>
                <p>{customBackgrounds.length} custom background(s) loaded</p>
              </div>
            )}
              {/* Comparison Section */}
            {/* {bgRemovedImage && originalImage && (
                <div className="comparison-section">
                  <h4 className="comparison-title">Image Comparison</h4>
                  <div className="comparison-grid">
                    <div 
                      className={`comparison-item ${selectedImage.url === originalImage.url ? 'comparison-item-active' : ''}`}
                      onClick={() => selectImageFromComparison(originalImage, 'original')}
                    >
                      <img src={originalImage.url} alt="Original" />
                      <span>Original</span>
                    </div>
                    <div 
                      className={`comparison-item ${selectedImage.url === bgRemovedImage.url ? 'comparison-item-active' : ''}`}
                      onClick={() => selectImageFromComparison(bgRemovedImage, 'removed')}
                    >
                      <img src={bgRemovedImage.url} alt="Background Removed" />
                      <span>Background Removed</span>
                    </div>
                  </div>
                </div>
              )} */}
              {bgRemovedImage && originalImage && selectedImage && (
      <div className="comparison-section">
        <h4 className="comparison-title">Image Comparison</h4>
        <div className="comparison-grid">
          <div 
            className={`comparison-item ${selectedImage.url === originalImage.url ? 'comparison-item-active' : ''}`}
            onClick={() => selectImageFromComparison(originalImage, 'original')}
          >
            <img src={originalImage.url} alt="Original" />
            <span>Original</span>
          </div>
          <div 
            className={`comparison-item ${selectedImage.url === bgRemovedImage.url ? 'comparison-item-active' : ''}`}
            onClick={() => selectImageFromComparison(bgRemovedImage, 'removed')}
          >
            <img src={bgRemovedImage.url} alt="Background Removed" />
            <span>Background Removed</span>
          </div>
        </div>
      </div>
    )}
              
              {/* <div className="backgrounds-grid">
                {backgroundImages.map(bg => (
                  <div
                    key={bg.id}
                    className={`background-item ${selectedBackground?.id === bg.id ? 'background-item-active' : ''}`}
                    onClick={() => applyBackground(bg)}
                  >
                    <img src={bg.url} alt={bg.name} />
                    <span>{bg.name}</span>
                  </div>
                ))}
              </div> */}
              {/* Backgrounds Grid - Now using combined backgrounds */}
            <div className="backgrounds-grid">
              {/* Default Backgrounds Section */}
              {customBackgrounds.length === 0 && (
                <div className="backgrounds-section">
                  <h4 className="backgrounds-section-title">Default Backgrounds</h4>
                  <div className="backgrounds-grid-inner">
                    {backgroundImages.map(bg => (
                      <div
                        key={bg.id}
                        className={`background-item ${selectedBackground?.id === bg.id ? 'background-item-active' : ''}`}
                        onClick={() => applyBackground(bg)}
                      >
                        <img src={bg.url} alt={bg.name} />
                        <span>{bg.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combined Backgrounds when custom backgrounds are loaded */}
              {customBackgrounds.length > 0 && (
                <>
                  {/* Default Backgrounds */}
                  <div className="backgrounds-section">
                    <h4 className="backgrounds-section-title">Default Backgrounds</h4>
                    <div className="backgrounds-grid-inner">
                      {backgroundImages.map(bg => (
                        <div
                          key={bg.id}
                          className={`background-item ${selectedBackground?.id === bg.id ? 'background-item-active' : ''}`}
                          onClick={() => applyBackground(bg)}
                        >
                          <img src={bg.url} alt={bg.name} />
                          <span>{bg.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Backgrounds */}
                  <div className="backgrounds-section">
                    <h4 className="backgrounds-section-title">
                      Custom Backgrounds 
                      <span className="backgrounds-count">({customBackgrounds.length})</span>
                    </h4>
                    <div className="backgrounds-grid-inner">
                      {customBackgrounds.map(bg => (
                        <div
                          key={bg.id}
                          className={`background-item ${selectedBackground?.id === bg.id ? 'background-item-active' : ''}`}
                          onClick={() => applyBackground(bg)}
                        >
                          <img src={bg.url} alt={bg.name} />
                          <span className="background-name">{bg.name}</span>
                          <span className="background-type">Custom</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {customBackgrounds.length === 0 && (
              <div className="empty-backgrounds-state">
                <p>No custom backgrounds loaded yet.</p>
                <p>Click "Add Custom Backgrounds" to select a folder with your own background images.</p>
              </div>
            )}
            </div>
          )}
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
                  {/* Background removal progress overlay */}
                {isRemovingBg && (
                  <div className="bg-remove-overlay">
                    <div className="bg-remove-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${bgRemoveProgress}%` }}
                        ></div>
                      </div>
                      <p className="progress-status">{bgRemoveStatus}</p>
                    </div>
                  </div>
                )}
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
                  {/* <button
                    onClick={() => {
                      setSelectedImage(null);
                      setIsEditing(false);
                      setIsCropping(false);
                    }}
                    className="back-button"
                  >
                    ← Back to Photos
                  </button> */}
                  <button
  onClick={() => {
    setSelectedImage(null);
    setIsEditing(false);
    setIsCropping(false);
    setShowBackgrounds(false); // Add this
    setBgRemovedImage(null); // Add this
    setCompositeImage(null); // Add this
    setSelectedBackground(null); // Add this
    setOriginalImage(null); // Add this
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