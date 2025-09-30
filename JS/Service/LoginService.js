const API_ELIMINAR_DESCRIPCION = 'https://arqosapi-9796070a345d.herokuapp.com/Descripcion/Eliminar';

// Función para eliminar descripción
export async function eliminarDescripcionService(id) {
    try {
        console.log('Eliminando descripción ID:', id);
        const response = await fetch(`${API_ELIMINAR_DESCRIPCION}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        if (!response.ok) {
            console.error('Error eliminando descripción:', result.message);
            throw new Error(result.message || "Error al eliminar el registro");
        }

        console.log('Descripción eliminada correctamente');
        return result;
    } catch (error) {
        console.error('Error en eliminarDescripcionService:', error);
        throw error;
    }
}

