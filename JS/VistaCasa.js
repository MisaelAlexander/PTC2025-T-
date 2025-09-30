const images = [
    "https://via.placeholder.com/600x300?text=Casa+1",
    "https://via.placeholder.com/600x300?text=Casa+2",
    "https://via.placeholder.com/600x300?text=Casa+3"
  ];
  let currentIndex = 0;

  function updateImage() {
    document.getElementById("carouselImage").src = images[currentIndex];
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function abrirWhatsApp() {
    const phone = "50371234567";
    const message = encodeURIComponent("Hola, estoy interesado en la casa en venta. ¿Podemos agendar una cita?");
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  }

  document.getElementById("profileToggler").addEventListener("click", () => {
    document.getElementById("perfildetails").classList.toggle("perfil-visible");
  });
  

  <button class="ButtonWP" onclick="abrirWhatsApp()">Reservar visita</button>