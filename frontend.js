document.addEventListener('DOMContentLoaded', () => {
    const thumbnails = document.querySelectorAll('.video-thumbnail-clickable');

    if (thumbnails.length > 0) {
        thumbnails.forEach(img => {
            img.addEventListener('click', () => {
                const videoSrc = img.dataset.videoSrc;

                if (!videoSrc) {
                    console.warn('No video src found in data attribute.');
                    return;
                }

                // Create overlay
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = `
                <div class="overlay-header">
                    <button class="close-video">&times;</button>
                </div>
                    <div class="video-container">
                        
                        <div class="responsive-video-wrapper">
                            <iframe src="${videoSrc.includes('?') ? `${videoSrc}&autoplay=1` : `${videoSrc}?autoplay=1`}"
                                    allow="autoplay; fullscreen"
                                    frameborder="0"></iframe>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                
                // Close logic
                overlay.querySelector('.close-video').addEventListener('click', () => {
                    overlay.remove();
                    document.body.style.overflow = ''; // re-enable scroll
                });
            });
        });
    }
});
