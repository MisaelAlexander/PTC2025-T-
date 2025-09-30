document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaHistorial");

  const datos = [
    { producto: "Casa en el Ricald", precio: "$100000", fecha: "2025-05-01", estado: "Pagado" },
    { producto: "Pago de mantenimiento", precio: "$75", fecha: "2025-04-25", estado: "Pagado" },
    { producto: "Reserva de casa en zona residencial", precio: "$1,200", fecha: "2025-04-10", estado: "Pendiente" },
    { producto: "Compra de terreno rural", precio: "$6,500", fecha: "2025-03-30", estado: "Finalizado" },
    { producto: "Cuota hipotecaria", precio: "$300", fecha: "2025-03-15", estado: "Pagado" },
  ];

  datos.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.producto}</td>
      <td>${item.precio}</td>
      <td>${item.fecha}</td>
      <td>${item.estado}</td>
    `;
    tabla.appendChild(row);
  });


  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
});