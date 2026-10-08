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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private static final Set<String> UNIDADES_VALIDAS = Set.of("kg", "litros", "unidades");

    private final InsumoRepository insumoRepository;
    private final MovimientoInsumoRepository movimientoRepository;

    public List<Insumo> listarTodas() {
        return insumoRepository.findAll();
    }

    public List<Insumo> listarStockBajo() {
        return insumoRepository.buscarStockBajo();
    }

    public Insumo buscarPorId(Long id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo no encontrado."));
    }

    @Transactional
    public Insumo crear(InsumoRequest request) {
        if (insumoRepository.existsByNombre(request.nombre())) {
            throw new NombreDuplicadoException("Ya existe un insumo con este nombre.");
        }

        validarUnidad(request.unidad());

        Insumo insumo = new Insumo();
        insumo.setNombre(request.nombre());
        insumo.setUnidad(request.unidad());
        insumo.setStockMinimo(request.stockMinimo());
        insumo.setStockActual(request.stockInicial());
        insumo.setFechaIngreso(LocalDateTime.now());

        Insumo guardado = insumoRepository.save(insumo);

        if (request.stockInicial().compareTo(BigDecimal.ZERO) > 0) {
            MovimientoInsumo movimiento = new MovimientoInsumo();
            movimiento.setInsumo(guardado);
            movimiento.setTipo(TipoMovimiento.ENTRADA);
            movimiento.setCantidad(request.stockInicial());
            movimiento.setObservacion("Stock inicial");
            movimientoRepository.save(movimiento);
        }

        return guardado;
    }

    @Transactional
    public Insumo actualizar(Long id, InsumoActualizarRequest request) {
        Insumo insumo = buscarPorId(id);

        if (insumoRepository.existsByNombreAndIdNot(request.nombre(), id)) {
            throw new NombreDuplicadoException("Ya existe un insumo con este nombre.");
        }

        validarUnidad(request.unidad());

        insumo.setNombre(request.nombre());
        insumo.setUnidad(request.unidad());
        insumo.setStockMinimo(request.stockMinimo());

        return insumoRepository.save(insumo);
    }

    @Transactional
    public Insumo cambiarEstado(Long id, boolean activo) {
        Insumo insumo = buscarPorId(id);
        insumo.setActivo(activo);
        return insumoRepository.save(insumo);
    }

    public List<MovimientoInsumo> listarMovimientos(Long id) {
        buscarPorId(id);
        return movimientoRepository.findByInsumoIdOrderByFechaDesc(id);
    }

    private void validarUnidad(String unidad) {
        if (!UNIDADES_VALIDAS.contains(unidad)) {
            throw new SolicitudInvalidaException("La unidad debe ser kg, litros o unidades.");
        }
    }

}
