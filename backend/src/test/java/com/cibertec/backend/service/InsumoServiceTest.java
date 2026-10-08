package com.cibertec.backend.service;

import com.cibertec.backend.dto.insumo.InsumoActualizarRequest;
import com.cibertec.backend.dto.insumo.InsumoRequest;
import com.cibertec.backend.entity.Insumo;
import com.cibertec.backend.entity.MovimientoInsumo;
import com.cibertec.backend.entity.TipoMovimiento;
import com.cibertec.backend.exception.NombreDuplicadoException;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.exception.SolicitudInvalidaException;
import com.cibertec.backend.repository.InsumoRepository;
import com.cibertec.backend.repository.MovimientoInsumoRepository;
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
class InsumoServiceTest {

    @Mock
    private InsumoRepository insumoRepository;

    @Mock
    private MovimientoInsumoRepository movimientoRepository;

    @InjectMocks
    private InsumoService insumoService;

    @Test
    void crearConStockInicialRegistraMovimientoDeEntrada() {
        when(insumoRepository.existsByNombre("Café")).thenReturn(false);
        when(insumoRepository.save(any(Insumo.class))).thenAnswer(invocation -> {
            Insumo insumo = invocation.getArgument(0);
            insumo.setId(1L);
            return insumo;
        });

        InsumoRequest request = new InsumoRequest(
                "Café", "kg", new BigDecimal("3.00"), new BigDecimal("10.00")
        );

        Insumo resultado = insumoService.crear(request);

        assertEquals(new BigDecimal("10.00"), resultado.getStockActual());
        assertTrue(resultado.isActivo());

        ArgumentCaptor<MovimientoInsumo> captor = ArgumentCaptor.forClass(MovimientoInsumo.class);
        verify(movimientoRepository).save(captor.capture());

        MovimientoInsumo movimiento = captor.getValue();
        assertEquals(TipoMovimiento.ENTRADA, movimiento.getTipo());
        assertEquals(new BigDecimal("10.00"), movimiento.getCantidad());
        assertEquals("Stock inicial", movimiento.getObservacion());
    }

    @Test
    void crearSinStockInicialNoRegistraMovimiento() {
        when(insumoRepository.existsByNombre("Servilletas")).thenReturn(false);
        when(insumoRepository.save(any(Insumo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InsumoRequest request = new InsumoRequest(
                "Servilletas", "unidades", BigDecimal.ZERO, BigDecimal.ZERO
        );

        insumoService.crear(request);

        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void crearNombreDuplicadoLanzaExcepcion() {
        when(insumoRepository.existsByNombre("Leche")).thenReturn(true);

        InsumoRequest request = new InsumoRequest(
                "Leche", "litros", new BigDecimal("5.00"), BigDecimal.ZERO
        );

        assertThrows(NombreDuplicadoException.class, () -> insumoService.crear(request));
        verify(insumoRepository, never()).save(any());
    }

    @Test
    void crearConUnidadInvalidaLanzaExcepcion() {
        when(insumoRepository.existsByNombre("Café en grano")).thenReturn(false);

        InsumoRequest request = new InsumoRequest(
                "Café en grano", "onzas", new BigDecimal("2.00"), BigDecimal.ZERO
        );

        assertThrows(SolicitudInvalidaException.class, () -> insumoService.crear(request));
        verify(insumoRepository, never()).save(any());
    }

    @Test
    void crearRegistraFechaDeIngreso() {
        when(insumoRepository.existsByNombre("Servilletas")).thenReturn(false);
        when(insumoRepository.save(any(Insumo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InsumoRequest request = new InsumoRequest(
                "Servilletas", "unidades", BigDecimal.ZERO, BigDecimal.ZERO
        );

        Insumo resultado = insumoService.crear(request);

        assertNotNull(resultado.getFechaIngreso());
    }

    @Test
    void actualizarNoModificaStockActual() {
        Insumo existente = new Insumo();
        existente.setId(1L);
        existente.setNombre("Azúcar");
        existente.setUnidad("kg");
        existente.setStockActual(new BigDecimal("8.00"));
        existente.setStockMinimo(new BigDecimal("2.00"));

        when(insumoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(insumoRepository.existsByNombreAndIdNot("Azúcar glas", 1L)).thenReturn(false);
        when(insumoRepository.save(any(Insumo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InsumoActualizarRequest request = new InsumoActualizarRequest(
                "Azúcar glas", "kg", new BigDecimal("1.50")
        );

        Insumo resultado = insumoService.actualizar(1L, request);

        assertEquals("Azúcar glas", resultado.getNombre());
        assertEquals(new BigDecimal("1.50"), resultado.getStockMinimo());
        assertEquals(new BigDecimal("8.00"), resultado.getStockActual());
    }

    @Test
    void actualizarConNombreDeOtroInsumoLanzaExcepcion() {
        Insumo existente = new Insumo();
        existente.setId(1L);
        existente.setNombre("Azúcar");

        when(insumoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(insumoRepository.existsByNombreAndIdNot("Harina", 1L)).thenReturn(true);

        InsumoActualizarRequest request = new InsumoActualizarRequest(
                "Harina", "kg", BigDecimal.ZERO
        );

        assertThrows(NombreDuplicadoException.class, () -> insumoService.actualizar(1L, request));
    }

    @Test
    void buscarPorIdInexistenteLanzaExcepcion() {
        when(insumoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> insumoService.buscarPorId(99L));
    }

    @Test
    void listarMovimientosDelegaEnElRepositorio() {
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(new Insumo()));

        insumoService.listarMovimientos(1L);

        verify(movimientoRepository).findByInsumoIdOrderByFechaDesc(1L);
    }

    @Test
    void listarMovimientosDeInsumoInexistenteLanzaExcepcion() {
        when(insumoRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> insumoService.listarMovimientos(404L));
    }

    @Test
    void listarStockBajoDelegaEnElRepositorio() {
        when(insumoRepository.buscarStockBajo()).thenReturn(List.of(new Insumo()));

        List<Insumo> resultado = insumoService.listarStockBajo();

        assertEquals(1, resultado.size());
    }

}
