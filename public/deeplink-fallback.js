/**
 * Deep Link Fallback Script
 * Instead of aggressive redirection, it provides a "Smart App Banner" for Android users.
 * This preserves website accessibility while promoting the app experience.
 */
(function() {
    // Detect Android
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    
    // Check if we are already on the download page or if there's a manual override
    var isDownloadPage = window.location.pathname.indexOf('download.html') > -1;
    var hasOverride = window.location.search.indexOf('no_redirect=true') > -1;

    // --- REFERRAL CAPTURE LOGIC ---
    function getReferralCode() {
        var code = null;
        
        // 1. Try Query Parameter: ?ref=ABC123
        var params = new URLSearchParams(window.location.search);
        if (params.has('ref')) {
            code = params.get('ref');
        }
        
        // 2. Try Path Segment: /ref/ABC123
        if (!code) {
            var segments = window.location.pathname.split('/');
            var refIndex = segments.indexOf('ref');
            if (refIndex !== -1 && segments.length > refIndex + 1) {
                code = segments[refIndex + 1];
            }
        }
        
        return code ? code.trim() : null;
    }

    var refCode = getReferralCode();
    var playStoreUrl = "https://play.google.com/store/apps/details?id=com.c2club.uniqueapp";

    if (refCode) {
        console.log("🎁 REFERRAL: Detected code [" + refCode + "]");
        // Construct referrer param: ref=ABC123 (URL encoded: ref%3DABC123)
        playStoreUrl += "&referrer=ref%3D" + encodeURIComponent(refCode);
    } else {
        console.log("🎁 REFERRAL: No code detected in URL");
    }

    console.log("🚀 FINAL PLAY STORE URL: " + playStoreUrl);
    // ------------------------------

    if (isAndroid && !isDownloadPage && !hasOverride) {
        // Wait for DOM to be ready to inject the banner
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectBanner);
        } else {
            injectBanner();
        }
    }

    function injectBanner() {
        if (document.getElementById('app-link-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'app-link-banner';
        
        // C2 Club Branding Colors
        var accentColor = '#39FF14'; 
        
        banner.innerHTML = `
            <div class="banner-inner">
                <div class="banner-left">
                    <img src="/favicon.ico" alt="C2 Club" class="banner-app-icon">
                    <div class="banner-info">
                        <div class="banner-title">C2 Club App</div>
                        <div class="banner-subtitle">Get the full student experience</div>
                    </div>
                </div>
                <div class="banner-right">
                    <a href="${playStoreUrl}" class="banner-cta">OPEN</a>
                    <button class="banner-close" aria-label="Close banner">&times;</button>
                </div>
            </div>
            <style>
                #app-link-banner {
                    width: 100%;
                    background: #1a1a1a;
                    color: white;
                    padding: 10px 16px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    z-index: 10001;
                    position: relative;
                }
                .banner-inner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .banner-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .banner-app-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 10px;
                    background: #fff;
                }
                .banner-info {
                    display: flex;
                    flex-direction: column;
                }
                .banner-title {
                    font-weight: 700;
                    font-size: 14px;
                    line-height: 1.2;
                }
                .banner-subtitle {
                    font-size: 12px;
                    color: #aaa;
                    line-height: 1.2;
                }
                .banner-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .banner-cta {
                    background: ${accentColor};
                    color: #000 !important;
                    padding: 6px 18px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 13px;
                    text-decoration: none;
                    text-transform: uppercase;
                    transition: transform 0.2s;
                }
                .banner-cta:hover {
                    transform: scale(1.05);
                }
                .banner-close {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 24px;
                    padding: 0 4px;
                    cursor: pointer;
                    line-height: 1;
                    opacity: 0.6;
                }
                .banner-close:hover {
                    opacity: 1;
                }
                
                /* Ensure body has no top margin issues */
                body { margin-top: 0 !important; }
            </style>
        `;
        
        // Add close functionality
        var closeBtn = banner.querySelector('.banner-close');
        closeBtn.onclick = function() {
            banner.style.display = 'none';
            // Optional: Set a session cookie/localStorage to not show it again
            try {
                sessionStorage.setItem('c2club_banner_closed', 'true');
            } catch(e) {}
        };

        // Check if previously closed in this session
        if (sessionStorage.getItem('c2club_banner_closed') === 'true') {
            return;
        }

        // Insert at the very top of the body
        document.body.prepend(banner);
    }
})();
