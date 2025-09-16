// Console Debug Commands for Navigation Refresh Issues
// Copy and paste these commands into your browser console (F12) to debug

console.log("🔧 Navigation Debug Commands Loaded");

// Command 1: Check current cache status
window.debugNav = {
    checkCache() {
        const navCache = localStorage.getItem('sssbpuc_navigation_cache');
        const forceFlag = localStorage.getItem('forceContentRefresh');
        
        console.log("📊 Cache Status:");
        console.log("Navigation Cache:", navCache ? "Present" : "Not found");
        console.log("Force Refresh Flag:", forceFlag || "Not set");
        
        if (navCache) {
            try {
                const data = JSON.parse(navCache);
                console.log("Last Updated:", new Date(data.navigation?.last_updated || 0));
                console.log("College Name:", data.navigation?.branding?.college_name);
            } catch (error) {
                console.error("Cache Parse Error:", error);
            }
        }
        
        return { navCache, forceFlag };
    },
    
    // Command 2: Clear all cache
    clearCache() {
        localStorage.removeItem('sssbpuc_navigation_cache');
        localStorage.removeItem('sssbpuc_footer_cache');
        localStorage.removeItem('forceContentRefresh');
        console.log("🗑️ All cache cleared");
    },
    
    // Command 3: Force refresh navigation
    forceRefresh() {
        localStorage.setItem('forceContentRefresh', 'true');
        console.log("🔄 Force refresh flag set");
        
        if (window.navigationLoader) {
            window.navigationLoader.refreshNavigation();
            console.log("📡 Navigation refresh triggered");
        } else {
            console.warn("❌ Navigation loader not found");
        }
    },
    
    // Command 4: Test API directly
    async testAPI() {
        try {
            console.log("🌐 Testing API...");
            const response = await fetch('/.netlify/functions/api?endpoint=get-navigation&_t=' + Date.now());
            const data = await response.json();
            
            console.log("API Response:", data);
            
            if (data.success) {
                console.log("✅ API Working");
                console.log("Data timestamp:", new Date(data.data.last_updated));
            } else {
                console.error("❌ API Error:", data.error);
            }
            
            return data;
        } catch (error) {
            console.error("❌ API Failed:", error);
            return null;
        }
    },
    
    // Command 5: Compare cache vs API
    async compareData() {
        console.log("🔍 Comparing cache vs API data...");
        
        // Get cached data
        const navCache = localStorage.getItem('sssbpuc_navigation_cache');
        let cachedTimestamp = 0;
        if (navCache) {
            try {
                const cached = JSON.parse(navCache);
                cachedTimestamp = cached.navigation?.last_updated || 0;
            } catch (error) {
                console.error("Cache parse error:", error);
            }
        }
        
        // Get API data
        const apiData = await this.testAPI();
        const apiTimestamp = apiData?.data?.last_updated || 0;
        
        console.log("📊 Comparison:");
        console.log("Cached timestamp:", new Date(cachedTimestamp));
        console.log("API timestamp:", new Date(apiTimestamp));
        console.log("API is newer:", apiTimestamp > cachedTimestamp);
        
        return {
            cachedTimestamp,
            apiTimestamp,
            apiNewer: apiTimestamp > cachedTimestamp
        };
    },
    
    // Command 6: Manual navigation update
    async updateNavigation() {
        console.log("🔄 Manually updating navigation...");
        
        try {
            const response = await fetch('/.netlify/functions/api?endpoint=get-navigation&_t=' + Date.now());
            const result = await response.json();
            
            if (result.success && result.data) {
                // Update cache
                const cacheData = {
                    navigation: result.data,
                    timestamp: Date.now()
                };
                localStorage.setItem('sssbpuc_navigation_cache', JSON.stringify(cacheData));
                console.log("💾 Cache updated");
                
                // Trigger navigation loader if available
                if (window.navigationLoader) {
                    await window.navigationLoader.loadNavigation();
                    console.log("🎯 Navigation rendered");
                } else {
                    console.warn("❌ Navigation loader not found");
                }
            } else {
                console.error("❌ Failed to get navigation data");
            }
        } catch (error) {
            console.error("❌ Update failed:", error);
        }
    }
};

// Quick access functions
window.clearNavCache = () => window.debugNav.clearCache();
window.forceNavRefresh = () => window.debugNav.forceRefresh();
window.checkNavCache = () => window.debugNav.checkCache();
window.testNavAPI = () => window.debugNav.testAPI();

console.log("🎯 Available commands:");
console.log("- debugNav.checkCache() - Check cache status");
console.log("- debugNav.clearCache() - Clear all cache");
console.log("- debugNav.forceRefresh() - Force navigation refresh");
console.log("- debugNav.testAPI() - Test API call");
console.log("- debugNav.compareData() - Compare cache vs API");
console.log("- debugNav.updateNavigation() - Manual update");
console.log("");
console.log("🚀 Quick commands:");
console.log("- clearNavCache()");
console.log("- forceNavRefresh()");
console.log("- checkNavCache()");
console.log("- testNavAPI()");
