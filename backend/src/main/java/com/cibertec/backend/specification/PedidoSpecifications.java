package com.cibertec.backend.specification;

import com.cibertec.backend.entity.EstadoPedido;
import com.cibertec.backend.entity.Pedido;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;

public class PedidoSpecifications {

    public static Specification<Pedido> tieneEstado(EstadoPedido estado) {
        return (root, query, cb) ->
                estado == null ? null : cb.equal(root.get("estado"), estado);
    }
    public static Specification<Pedido> fechaDesde(LocalDate desde) {
        return (root, query, cb) ->
                desde == null ? null : cb.greaterThanOrEqualTo(root.get("fecha"), desde.atStartOfDay());
    }
    public static Specification<Pedido> fechaHasta(LocalDate hasta) {
        return (root, query, cb) ->
                hasta == null ? null : cb.lessThanOrEqualTo(root.get("fecha"), hasta.atTime(LocalTime.MAX));
    }
}
