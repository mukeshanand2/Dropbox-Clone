import _ from "lodash";

const CONTENT_RENDER_STRATEGIES = {
  image: {
    type: 'blob',
    renderer: 'image',
  },
  pdf: {
    type: 'blob',
    renderer: 'pdf',
  },
  video: {
    type: 'blob',
    renderer: 'video',
  },
  audio: {
    type: 'blob',
    renderer: 'audio',
  },
  text: {
    type: 'text',
    renderer: 'text',
  },
  default: {
    type: 'text',
    renderer: 'binary',
  },
};

const getContentTypeCategory = (contentType) => {
  if (!contentType) return 'default';
  
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.includes('pdf')) return 'pdf';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml')) {
    return 'text';
  }
  
  return 'default';
};

export const processFileContent = async (blobData, contentType) => {
  const category = getContentTypeCategory(contentType);
  const strategy = CONTENT_RENDER_STRATEGIES[category] || CONTENT_RENDER_STRATEGIES.default;

  if (strategy.type === 'blob') {
    const blob = new Blob([blobData], { type: contentType });
    const url = URL.createObjectURL(blob);
    return {
      renderType: strategy.renderer,
      blobUrl: url,
      content: null,
    };
  } else {
    try {
      const text = await blobData.text();
      return {
        renderType: strategy.renderer,
        blobUrl: null,
        content: text,
      };
    } catch {
      return {
        renderType: 'binary',
        blobUrl: null,
        content: "Binary content - cannot display as text",
      };
    }
  }
};

