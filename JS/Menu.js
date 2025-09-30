// JavaScript
document.addEventListener('DOMContentLoaded', () => {
  /*Modal Quienes*/
  const boxQuien = document.getElementById('Quien');
  const modalQuienes = document.getElementById('ModalQuienes');
  const boxServicio = document.getElementById('Servicio');
  const modalServicios = document.getElementById('ModalServicios');

  // Abrir modal al hacer clic en el box
  /*Abrir Modal Quien*/
  boxQuien.addEventListener('click', () => {
    modalQuienes.showModal();
    modalQuienes.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
  /*Abrir Modal Servicio*/
  boxServicio.addEventListener('click', () => {
    modalServicios.showModal();
    modalServicios.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  // Cerrar modal al hacer clic fuera del contenido
  /*Cerrar el Modal Quienes al dar click afuera*/
  modalQuienes.addEventListener('click', (e) => {
    if (e.target === modalQuienes) {
      modalQuienes.close();
    }
  }); 
  /*Cerrar el Modal Servicio al dar click afuera*/
  modalServicios.addEventListener('click', (e) => {
    if (e.target === modalServicios) {
      modalServicios.close();
    }
  }); 

  // Restablecer el overflow despues de cerrar el modal
  /*Modal Quienes*/
  modalQuienes.addEventListener('close', () => {
    document.body.style.overflow = ''; 
  });
   /*Modal Quienes*/
 modalServicios.addEventListener('close', () => {
    document.body.style.overflow = ''; 
  });
  /*Codigo de la tabla de Chart.js*/
   const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      responsive: true, // Hace que el gráfico sea responsivo
    maintainAspectRatio: false, // 
      labels: ['15/06/25', '16/06/25', '17/06/25', '18/06/25', '19/06/25', '20/06/25'],
      datasets: [{
        label: '# de Usuarios Registrados',
        data: [20, 10, 30, 35, 20, 42],
        backgroundColor: '#2c3e50',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});