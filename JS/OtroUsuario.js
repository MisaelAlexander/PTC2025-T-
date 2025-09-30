const comentarios = [
    {
      texto: "Fue una experiencia excepcional. Desde el primer momento, sentí que realmente entendía lo que buscaba. No solo me mostró casas, sino que me guió con paciencia y conocimiento.",
      estrellas: 5
    },
    {
      texto: "Demostró ser un excelente asesor inmobiliario. Su conocimiento del mercado local es impresionante y siempre estuvo dispuesto a responder todas mis preguntas.",
      estrellas: 5
    },
    {
      texto: "Me hizo sentir cómoda y segura en cada paso. Su paciencia para explicar cada detalle y su dedicación para encontrar opciones que se ajustaran a mis necesidades fueron increíbles.",
      estrellas: 5
    },
    {
      texto: "Su profesionalismo y su atención al detalle son notables. Siempre estuvo disponible para las visitas y para responder mis dudas.",
      estrellas: 5
    }
  ];
  
  const contenedor = document.getElementById('comentarios');
  
  comentarios.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';
  
    div.innerHTML = `
      <div class="comment-icon"></div>
      <div class="comment-content">
        <p>${c.texto}</p>
        <div class="stars">${'★'.repeat(c.estrellas)}</div>
      </div>
    `;
  
    contenedor.appendChild(div);
  });
  