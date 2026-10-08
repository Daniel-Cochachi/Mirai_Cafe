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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InsumoRepository insumoRepository;
    private final MovimientoInsumoRepository movimientoRepository;

    public List<MovimientoInsumo> listarMovimientos() {
        return movimientoRepository.findAllByOrderByFechaDesc();
    }

    @Transactional
    public MovimientoInsumo registrar(MovimientoRequest request) {
        Insumo insumo = insumoRepository.findById(request.insumoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo no encontrado."));

        if (!insumo.isActivo()) {
            throw new SolicitudInvalidaException("No se pueden registrar movimientos de un insumo inactivo.");
        }

        BigDecimal delta = request.tipo() == TipoMovimiento.ENTRADA
                ? request.cantidad()
                : request.cantidad().negate();

        int filas = movimientoRepository.modificarStock(insumo.getId(), delta);
        if (filas == 0) {
            throw new StockInsuficienteException("Stock insuficiente para el insumo '" + insumo.getNombre() + "'.");
        }

        MovimientoInsumo movimiento = new MovimientoInsumo();
        movimiento.setInsumo(insumo);
        movimiento.setTipo(request.tipo());
        movimiento.setCantidad(request.cantidad());
        movimiento.setObservacion(request.observacion());
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

}
