// Content Sync System
// Ensures changes from Visual Editor appear on the website immediately

class ContentSyncManager {
  constructor() {
    this.init();
  }

  init() {
    console.log('🔄 Content Sync Manager initialized');
    this.setupMessageListener();
  }

  setupMessageListener() {
    // Listen for content updates from Visual Editor
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'contentUpdate') {
        this.syncContentToWebsite(event.data.page, event.data.content);
      }
    });

    // Also listen for localStorage changes
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('sssbpuc_')) {
        const page = event.key.replace('sssbpuc_', '');
        console.log(`📡 Detected content update for ${page}`);
        this.refreshWebsitePage();
      }
    });
  }

  // Sync content to website localStorage
  syncContentToWebsite(page, content) {
    try {
      console.log(`🔄 Syncing ${page} content to website...`);
      
      // Update localStorage for the website
      localStorage.setItem(`sssbpuc_${page}`, JSON.stringify(content));
      
      // Trigger a custom event for immediate update
      const syncEvent = new CustomEvent('contentSynced', {
        detail: { page, content }
      });
      window.dispatchEvent(syncEvent);
      
      console.log(`✅ Content synced for ${page}`);
    } catch (error) {
      console.error('❌ Error syncing content:', error);
    }
  }

  // Refresh website page if it's currently open
  refreshWebsitePage() {
    try {
      // If dynamic content manager exists, refresh it
      if (window.dynamicContent) {
        window.dynamicContent.refreshContent();
      }
    } catch (error) {
      console.error('Error refreshing website page:', error);
    }
  }

  // Manual sync function for testing
  testSync(page = 'homepage') {
    const testContent = {
      hero: {
        title: 'Test Update from Admin',
        subtitle: 'This is a test update',
        description: 'If you can see this, the sync is working!',
        background_video_url: 'https://www.youtube.com/watch?v=zKz4QQKx_jo'
      }
    };
    
    this.syncContentToWebsite(page, testContent);
    console.log('🧪 Test sync completed');
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  window.contentSync = new ContentSyncManager();
  
  // Debug function for manual testing
  window.testContentSync = () => {
    if (window.contentSync) {
      window.contentSync.testSync();
    }
  };
}
