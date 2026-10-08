package com.cibertec.backend.service;

import com.cibertec.backend.dto.movimiento.MovimientoRequest;
import com.cibertec.backend.entity.Insumo;
import com.cibertec.backend.entity.MovimientoInsumo;
import com.cibertec.backend.entity.TipoMovimiento;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.exception.SolicitudInvalidaException;
import com.cibertec.backend.exception.StockInsuficienteException;
import com.cibertec.backend.repository.InsumoRepository;
import com.cibertec.backend.repository.MovimientoInsumoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock
    private InsumoRepository insumoRepository;

    @Mock
    private MovimientoInsumoRepository movimientoRepository;

    @InjectMocks
    private InventarioService inventarioService;

    private Insumo insumoActivo() {
        Insumo insumo = new Insumo();
        insumo.setId(1L);
        insumo.setNombre("Café molido");
        insumo.setUnidad("kg");
        insumo.setActivo(true);
        return insumo;
    }

    @Test
    void registrarEntradaActualizaStockConDeltaPositivo() {
        Insumo insumo = insumoActivo();
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo));
        when(movimientoRepository.modificarStock(eq(1L), eq(new BigDecimal("5.00")))).thenReturn(1);
        when(movimientoRepository.save(any(MovimientoInsumo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MovimientoRequest request = new MovimientoRequest(
                1L, TipoMovimiento.ENTRADA, new BigDecimal("5.00"), "Compra"
        );

        MovimientoInsumo movimiento = inventarioService.registrar(request);

        assertEquals(TipoMovimiento.ENTRADA, movimiento.getTipo());
        assertEquals(new BigDecimal("5.00"), movimiento.getCantidad());
        assertEquals("Compra", movimiento.getObservacion());
        assertNotNull(movimiento.getFecha());
        verify(movimientoRepository).modificarStock(1L, new BigDecimal("5.00"));
    }

    @Test
    void registrarSalidaActualizaStockConDeltaNegativo() {
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumoActivo()));
        when(movimientoRepository.modificarStock(eq(1L), eq(new BigDecimal("-2.00")))).thenReturn(1);
        when(movimientoRepository.save(any(MovimientoInsumo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MovimientoRequest request = new MovimientoRequest(
                1L, TipoMovimiento.SALIDA, new BigDecimal("2.00"), "Uso en capuccinos"
        );

        inventarioService.registrar(request);

        verify(movimientoRepository).modificarStock(1L, new BigDecimal("-2.00"));
    }

    @Test
    void registrarSalidaSinStockLanzaStockInsuficiente() {
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumoActivo()));
        when(movimientoRepository.modificarStock(eq(1L), any(BigDecimal.class))).thenReturn(0);

        MovimientoRequest request = new MovimientoRequest(
                1L, TipoMovimiento.SALIDA, new BigDecimal("999.00"), null
        );

        assertThrows(StockInsuficienteException.class, () -> inventarioService.registrar(request));
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void registrarMovimientoDeInsumoInactivoLanzaExcepcion() {
        Insumo insumo = insumoActivo();
        insumo.setActivo(false);
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumo));

        MovimientoRequest request = new MovimientoRequest(
                1L, TipoMovimiento.ENTRADA, BigDecimal.ONE, null
        );

        assertThrows(SolicitudInvalidaException.class, () -> inventarioService.registrar(request));
        verify(movimientoRepository, never()).modificarStock(any(), any());
    }

    @Test
    void registrarMovimientoDeInsumoInexistenteLanzaExcepcion() {
        when(insumoRepository.findById(404L)).thenReturn(Optional.empty());

        MovimientoRequest request = new MovimientoRequest(
                404L, TipoMovimiento.ENTRADA, BigDecimal.ONE, null
        );

        assertThrows(RecursoNoEncontradoException.class, () -> inventarioService.registrar(request));
    }

    @Test
    void listarMovimientosDelegaEnElRepositorio() {
        when(movimientoRepository.findAllByOrderByFechaDesc()).thenReturn(java.util.List.of());

        assertTrue(inventarioService.listarMovimientos().isEmpty());
        verify(movimientoRepository).findAllByOrderByFechaDesc();
    }

}
