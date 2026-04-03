/**
 * Deep Link Fallback Script
 * Automatically redirects Android users to the Play Store if they land on the website.
 * This handles cases where the App Link failed to open the app (e.g. app not installed).
 */
(function() {
    // Detect Android
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    
    // Check if we are already on the download page or if there's a manual override
    var isDownloadPage = window.location.pathname.indexOf('download.html') > -1;
    var hasOverride = window.location.search.indexOf('no_redirect=true') > -1;

    if (isAndroid && !isDownloadPage && !hasOverride) {
        // Build the Play Store URL
        var playStoreUrl = "https://play.google.com/store/apps/details?id=com.c2club.uniqueapp";
        
        // Optional: Log analytics or handle specific paths if needed
        // console.log("Redirecting to Play Store...");
        
        // Execute redirect
        window.location.replace(playStoreUrl);
    }
})();
