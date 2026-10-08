package com.cibertec.backend.service;

import com.cibertec.backend.dto.receta.RecetaItemRequest;
import com.cibertec.backend.dto.receta.RecetaRequest;
import com.cibertec.backend.entity.Insumo;
import com.cibertec.backend.entity.Producto;
import com.cibertec.backend.entity.Receta;
import com.cibertec.backend.exception.RecetaYaExisteException;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.exception.SolicitudInvalidaException;
import com.cibertec.backend.repository.InsumoRepository;
import com.cibertec.backend.repository.ProductoRepository;
import com.cibertec.backend.repository.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RecetaService {

    private final RecetaRepository recetaRepository;
    private final ProductoRepository productoRepository;
    private final InsumoRepository insumoRepository;

    public List<Receta> listarPorProducto(Long productoId) {
        buscarProducto(productoId);
        return recetaRepository.findByProductoIdOrderByInsumoIdAsc(productoId);
    }

    @Transactional
    public List<Receta> agregar(Long productoId, RecetaItemRequest item) {
        Producto producto = buscarProducto(productoId);

        if (recetaRepository.existsByProductoIdAndInsumoId(productoId, item.insumoId())) {
            throw new RecetaYaExisteException("El producto ya tiene este insumo en su receta.");
        }

        Insumo insumo = buscarInsumoActivo(item.insumoId());

        Receta receta = new Receta();
        receta.setProducto(producto);
        receta.setInsumo(insumo);
        receta.setCantidad(item.cantidad());
        recetaRepository.save(receta);

        return recetaRepository.findByProductoIdOrderByInsumoIdAsc(productoId);
    }

    @Transactional
    public List<Receta> reemplazar(Long productoId, RecetaRequest request) {
        Producto producto = buscarProducto(productoId);

        Set<Long> insumosVistos = new HashSet<>();
        for (RecetaItemRequest item : request.items()) {
            if (!insumosVistos.add(item.insumoId())) {
                throw new SolicitudInvalidaException("La receta no puede repetir el mismo insumo.");
            }
            buscarInsumoActivo(item.insumoId());
        }

        recetaRepository.deleteByProductoId(productoId);
        recetaRepository.flush();

        List<Receta> nuevas = new ArrayList<>();
        for (RecetaItemRequest item : request.items()) {
            Receta receta = new Receta();
            receta.setProducto(producto);
            receta.setInsumo(insumoRepository.findById(item.insumoId()).orElseThrow(
                    () -> new RecursoNoEncontradoException("Insumo no encontrado.")
            ));
            receta.setCantidad(item.cantidad());
            nuevas.add(recetaRepository.save(receta));
        }

        return nuevas;
    }

    @Transactional
    public void eliminar(Long productoId, Long insumoId) {
        buscarProducto(productoId);
        Receta receta = recetaRepository.findByProductoIdAndInsumoId(productoId, insumoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("El producto no tiene este insumo en su receta."));
        recetaRepository.delete(receta);
    }

    private Producto buscarProducto(Long productoId) {
        return productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));
    }

    private Insumo buscarInsumoActivo(Long insumoId) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo no encontrado."));

        if (!insumo.isActivo()) {
            throw new SolicitudInvalidaException("No se pueden usar insumos inactivos en recetas.");
        }

        return insumo;
    }

}
