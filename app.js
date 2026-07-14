const INSTAGRAM = "https://www.instagram.com/brandaostdio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
const WHATSAPP = "https://wa.me/557381823074";
const MAPS = "https://maps.app.goo.gl/Hwtn5vLicmN1LrU36";

const App = {
    init() {
        this.setupSocialLinks();
        this.setupGallery();
        this.setupScrollAnimations();
    },

    setupSocialLinks() {
        document.querySelectorAll('.social-link').forEach(link => {
            const label = link.getAttribute('aria-label');
            if (label === 'Instagram') link.href = INSTAGRAM;
            if (label === 'WhatsApp') link.href = WHATSAPP;
            if (label === 'Google Maps') link.href = MAPS;
            link.target = '_blank';
        });
    },

    setupGallery() {
        const carousel = document.querySelector('.gallery__carousel');
        if (!carousel) return;

        // Cria o wrapper e os botões de navegação dinamicamente
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        carousel.parentNode.insertBefore(wrapper, carousel);
        wrapper.appendChild(carousel);

        const createNavButton = (icon, isNext) => {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            Object.assign(btn.style, {
                position: 'absolute',
                top: '50%',
                [isNext ? 'right' : 'left']: '10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 200, 83, 0.85)',
                color: '#FFF',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                cursor: 'pointer',
                zIndex: '10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'transform 0.2s'
            });
            btn.onmouseover = () => btn.style.transform = 'translateY(-50%) scale(1.1)';
            btn.onmouseout = () => btn.style.transform = 'translateY(-50%) scale(1)';
            return btn;
        };

        const prevBtn = createNavButton('&#10094;', false);
        const nextBtn = createNavButton('&#10095;', true);
        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);

        // Movimentação via click
        const scrollAmount = 350;
        prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

        // Drag to scroll (Mouse / Touch)
        let isDown = false;
        let startX, scrollLeft;

        const startDrag = (e) => {
            isDown = true;
            startX = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        };

        const stopDrag = () => isDown = false;

        const moveDrag = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Multiplicador de velocidade
            carousel.scrollLeft = scrollLeft - walk;
        };

        carousel.addEventListener('mousedown', startDrag);
        carousel.addEventListener('touchstart', startDrag, { passive: true });

        carousel.addEventListener('mouseleave', stopDrag);
        carousel.addEventListener('mouseup', stopDrag);
        carousel.addEventListener('touchend', stopDrag);

        carousel.addEventListener('mousemove', moveDrag);
        carousel.addEventListener('touchmove', moveDrag, { passive: false });
    },

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.gallery__item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(item);
        });
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
