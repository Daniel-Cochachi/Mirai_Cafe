package com.cibertec.backend.service;

import com.cibertec.backend.entity.Categoria;
import com.cibertec.backend.exception.NombreDuplicadoException;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.repository.CategoriaRepository;
import com.cibertec.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada."));
    }

    public Categoria guardar(Categoria categoria) {
        if (categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new NombreDuplicadoException("Ya existe una categoria con este nombre.");
        }
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        String nombreActualizado = categoriaActualizada.getNombre();
        if (categoriaRepository.existsByNombre(nombreActualizado) && !Objects.equals(nombreActualizado, buscarPorId(id).getNombre())) {
            throw new NombreDuplicadoException("Ya existe una categoria con este nombre.");
        }
        Categoria categoriaAntigua = buscarPorId(id);
        categoriaAntigua.setNombre(categoriaActualizada.getNombre());
        categoriaAntigua.setDescripcion(categoriaActualizada.getDescripcion());
        return categoriaRepository.save(categoriaAntigua);
    }

    public void eliminar(Long id) {

        if (productoRepository.existsByCategoriaId(id)) {
            throw new RuntimeException("No se puede eliminar la categoría ya que existe un producto de este tipo.");
        }
        categoriaRepository.deleteById(id);

    }

}
