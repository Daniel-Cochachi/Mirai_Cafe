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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecetaServiceTest {

    @Mock
    private RecetaRepository recetaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private InsumoRepository insumoRepository;

    @InjectMocks
    private RecetaService recetaService;

    private Producto producto() {
        Producto producto = new Producto();
        producto.setId(2L);
        producto.setNombre("Capuccino");
        return producto;
    }

    private Insumo insumo(Long id, boolean activo) {
        Insumo insumo = new Insumo();
        insumo.setId(id);
        insumo.setNombre("Insumo " + id);
        insumo.setActivo(activo);
        return insumo;
    }

    @Test
    void listarPorProductoDeInsumoNoExistenteLanzaExcepcion() {
        when(productoRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> recetaService.listarPorProducto(404L));
    }

    @Test
    void agregarRecetaNuevaGuardaYDevuelveLista() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.existsByProductoIdAndInsumoId(2L, 1L)).thenReturn(false);
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo(1L, true)));
        when(recetaRepository.save(any(Receta.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(recetaRepository.findByProductoIdOrderByInsumoIdAsc(2L)).thenReturn(List.of(new Receta()));

        RecetaItemRequest item = new RecetaItemRequest(1L, new BigDecimal("0.02"));
        List<Receta> resultado = recetaService.agregar(2L, item);

        assertEquals(1, resultado.size());

        ArgumentCaptor<Receta> captor = ArgumentCaptor.forClass(Receta.class);
        verify(recetaRepository).save(captor.capture());
        assertEquals(new BigDecimal("0.02"), captor.getValue().getCantidad());
    }

    @Test
    void agregarInsumoYaEnRecetaLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.existsByProductoIdAndInsumoId(2L, 1L)).thenReturn(true);

        RecetaItemRequest item = new RecetaItemRequest(1L, BigDecimal.ONE);

        assertThrows(RecetaYaExisteException.class, () -> recetaService.agregar(2L, item));
        verify(recetaRepository, never()).save(any());
    }

    @Test
    void agregarInsumoInactivoLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.existsByProductoIdAndInsumoId(2L, 1L)).thenReturn(false);
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo(1L, false)));

        RecetaItemRequest item = new RecetaItemRequest(1L, BigDecimal.ONE);

        assertThrows(SolicitudInvalidaException.class, () -> recetaService.agregar(2L, item));
        verify(recetaRepository, never()).save(any());
    }

    @Test
    void agregarInsumoInexistenteLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.existsByProductoIdAndInsumoId(2L, 99L)).thenReturn(false);
        when(insumoRepository.findById(99L)).thenReturn(Optional.empty());

        RecetaItemRequest item = new RecetaItemRequest(99L, BigDecimal.ONE);

        assertThrows(RecursoNoEncontradoException.class, () -> recetaService.agregar(2L, item));
    }

    @Test
    void reemplazarEliminaAnterioresYGuardaNuevos() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo(1L, true)));
        when(insumoRepository.findById(2L)).thenReturn(Optional.of(insumo(2L, true)));
        when(recetaRepository.save(any(Receta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecetaRequest request = new RecetaRequest(List.of(
                new RecetaItemRequest(1L, new BigDecimal("0.02")),
                new RecetaItemRequest(2L, new BigDecimal("0.20"))
        ));

        List<Receta> resultado = recetaService.reemplazar(2L, request);

        assertEquals(2, resultado.size());
        verify(recetaRepository).deleteByProductoId(2L);
        verify(recetaRepository).flush();
        verify(recetaRepository, times(2)).save(any(Receta.class));
    }

    @Test
    void reemplazarConInsumoRepetidoLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo(1L, true)));

        RecetaRequest request = new RecetaRequest(List.of(
                new RecetaItemRequest(1L, BigDecimal.ONE),
                new RecetaItemRequest(1L, BigDecimal.TWO)
        ));

        assertThrows(SolicitudInvalidaException.class, () -> recetaService.reemplazar(2L, request));
        verify(recetaRepository, never()).deleteByProductoId(any());
        verify(recetaRepository, never()).save(any());
    }

    @Test
    void reemplazarConInsumoInactivoLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo(1L, false)));

        RecetaRequest request = new RecetaRequest(List.of(
                new RecetaItemRequest(1L, BigDecimal.ONE)
        ));

        assertThrows(SolicitudInvalidaException.class, () -> recetaService.reemplazar(2L, request));
        verify(recetaRepository, never()).deleteByProductoId(any());
    }

    @Test
    void eliminarItemExistenteLoElimina() {
        Receta receta = new Receta();
        receta.setId(10L);

        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.findByProductoIdAndInsumoId(2L, 1L)).thenReturn(Optional.of(receta));

        recetaService.eliminar(2L, 1L);

        verify(recetaRepository).delete(receta);
    }

    @Test
    void eliminarItemNoExistenteLanzaExcepcion() {
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto()));
        when(recetaRepository.findByProductoIdAndInsumoId(2L, 5L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> recetaService.eliminar(2L, 5L));
        verify(recetaRepository, never()).delete(any(Receta.class));
    }

}
