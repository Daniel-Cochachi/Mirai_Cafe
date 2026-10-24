package com.cibertec.backend.service;

import com.cibertec.backend.dto.pedido.CrearPedidoRequest;
import com.cibertec.backend.dto.pedido.DetallePedidoResponse;
import com.cibertec.backend.dto.pedido.ItemPedidoRequest;
import com.cibertec.backend.dto.pedido.PedidoResponse;
import com.cibertec.backend.entity.DetallePedido;
import com.cibertec.backend.entity.EstadoPedido;
import com.cibertec.backend.entity.Pedido;
import com.cibertec.backend.entity.Producto;
import com.cibertec.backend.entity.Rol;
import com.cibertec.backend.entity.Usuario;
import com.cibertec.backend.exception.RecursoNoEncontradoException;
import com.cibertec.backend.exception.ReglaNegocioException;
import com.cibertec.backend.repository.PedidoRepository;
import com.cibertec.backend.repository.ProductoRepository;
import com.cibertec.backend.repository.UsuarioRepository;
import com.cibertec.backend.specification.PedidoSpecifications;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public PedidoResponse crearPedido(
            String emailUsuario,
            CrearPedidoRequest request
    ) {
        Usuario usuario = usuarioRepository
                .findByEmail(emailUsuario)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario no encontrado"
                        )
                );

        if (!usuario.getActivo()) {
            throw new ReglaNegocioException(
                    "El usuario se encuentra desactivado"
            );
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setObservacion(request.observacion());

        /*
         * Agrupamos los productos repetidos.
         *
         * Ejemplo:
         * producto 2, cantidad 3
         * producto 2, cantidad 2
         *
         * Resultado:
         * producto 2, cantidad 5
         */
        Map<Long, Integer> cantidadesPorProducto = request
                .items()
                .stream()
                .collect(
                        Collectors.toMap(
                                ItemPedidoRequest::productoId,
                                ItemPedidoRequest::cantidad,
                                Integer::sum,
                                LinkedHashMap::new
                        )
                );

        BigDecimal total = BigDecimal.ZERO;

        for (
                Map.Entry<Long, Integer> item
                : cantidadesPorProducto.entrySet()
        ) {
            Long productoId = item.getKey();
            Integer cantidad = item.getValue();

            /*
             * Se busca el producto con bloqueo pesimista.
             * Otra transacción no podrá modificarlo hasta que
             * esta transacción termine.
             */
            Producto producto = productoRepository
                    .buscarPorIdConBloqueo(productoId)
                    .orElseThrow(() ->
                            new RecursoNoEncontradoException(
                                    "Producto no encontrado: " + productoId
                            )
                    );

            validarProducto(producto, cantidad);

            /*
             * El precio siempre se obtiene de la base de datos,
             * nunca desde la solicitud del cliente.
             */
            BigDecimal precioUnitario = producto.getPrecio();

            BigDecimal subtotal = precioUnitario.multiply(
                    BigDecimal.valueOf(cantidad)
            );

            DetallePedido detalle = new DetallePedido();
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(subtotal);

            pedido.agregarDetalle(detalle);

            total = total.add(subtotal);

            /*
             * Descontamos el stock del producto.
             * Hibernate guardará el cambio automáticamente.
             */
            producto.setStock(
                    producto.getStock() - cantidad
            );
        }

        pedido.setTotal(total);

        /*
         * Se guarda el pedido junto con sus detalles gracias
         * a CascadeType.ALL.
         */
        Pedido pedidoGuardado = pedidoRepository.saveAndFlush(pedido);

        /*
         * Se vuelve a consultar para recuperar la fecha generada
         * por MySQL y todas las relaciones necesarias.
         */
        Pedido pedidoCompleto = pedidoRepository
                .findById(pedidoGuardado.getId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "No se pudo recuperar el pedido creado"
                        )
                );

        return convertirAResponse(pedidoCompleto);
    }

    private void validarProducto(
            Producto producto,
            Integer cantidad
    ) {
        if (!producto.isDisponible()) {
            throw new ReglaNegocioException(
                    "El producto " +
                            producto.getNombre() +
                            " no está disponible"
            );
        }

        if (producto.getStock() < cantidad) {
            throw new ReglaNegocioException(
                    "Stock insuficiente para " +
                            producto.getNombre() +
                            ". Disponible: " +
                            producto.getStock()
            );
        }
    }

    private PedidoResponse convertirAResponse(Pedido pedido) {
        List<DetallePedidoResponse> detalles = pedido
                .getDetalles()
                .stream()
                .map(detalle ->
                        new DetallePedidoResponse(
                                detalle.getId(),
                                detalle.getProducto().getId(),
                                detalle.getProducto().getNombre(),
                                detalle.getCantidad(),
                                detalle.getPrecioUnitario(),
                                detalle.getSubtotal()
                        )
                )
                .toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getUsuario().getId(),
                pedido.getUsuario().getNombre(),
                pedido.getFecha(),
                pedido.getTotal(),
                pedido.getEstado(),
                pedido.getObservacion(),
                detalles
        );
    }

    // 1. Historial del cliente autenticado
    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMisPedidos(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId)
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }
    // 2. Listado general para Admin/Cajero con filtros Specifications
    @Transactional(readOnly = true)
        public List<PedidoResponse> listarTodos(EstadoPedido estado, LocalDate desde, LocalDate hasta) {
     
            if (desde != null && hasta != null && desde.isAfter(hasta)) {
                throw new ReglaNegocioException(
                        "La fecha inicial no puede ser posterior a la fecha final"
                );
            }
     
        	Specification<Pedido> spec = Specification
                    .where(PedidoSpecifications.tieneEstado(estado))
                    .and(PedidoSpecifications.fechaDesde(desde))
                    .and(PedidoSpecifications.fechaHasta(hasta));
            return pedidoRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "fecha"))
     
            		.stream()
                    .map(this::convertirAResponse)
                    .toList();
        }
    // 3. Consultar detalle de un pedido (valida que si es cliente sea el dueño)
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPorId(Long pedidoId, Usuario usuarioAutenticado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + pedidoId));
        boolean esAdminOCajero = usuarioAutenticado.getRol() == Rol.ADMIN || usuarioAutenticado.getRol() == Rol.CAJERO;
        if (!esAdminOCajero && !pedido.getUsuario().getId().equals(usuarioAutenticado.getId())) {
            throw new ReglaNegocioException("No tienes permisos para ver este pedido");
        }
        return convertirAResponse(pedido);
    }
    // 4. Cambiar estado (Admin/Cajero)
    @Transactional
    public PedidoResponse actualizarEstado(
            Long pedidoId,
            EstadoPedido nuevoEstado
    ) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Pedido no encontrado: " + pedidoId
                        )
                );
    
        EstadoPedido estadoActual = pedido.getEstado();
    
        if (estadoActual == EstadoPedido.CANCELADO) {
            throw new ReglaNegocioException(
                    "No se puede modificar un pedido cancelado"
            );
        }
    
        if (estadoActual == EstadoPedido.PAGADO) {
            throw new ReglaNegocioException(
                    "No se puede modificar un pedido pagado"
            );
        }

    boolean transicionValida =
            (estadoActual == EstadoPedido.PENDIENTE
                    && nuevoEstado == EstadoPedido.EN_PROCESO)
            ||
            (estadoActual == EstadoPedido.EN_PROCESO
                    && nuevoEstado == EstadoPedido.LISTO);

    if (!transicionValida) {
        throw new ReglaNegocioException(
                "No se puede cambiar el pedido de "
                        + estadoActual
                        + " a "
                        + nuevoEstado
        );
    }

    pedido.setEstado(nuevoEstado);

    return convertirAResponse(
            pedidoRepository.save(pedido)
    );
}

    // 5. Cancelar pedido (devuelve el stock a los productos)
    @Transactional
    public PedidoResponse cancelarPedido(Long pedidoId, Usuario usuarioAutenticado) {
        Pedido pedido = pedidoRepository.buscarPorIdConBloqueo(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + pedidoId));
        boolean esAdminOCajero = usuarioAutenticado.getRol() == Rol.ADMIN || usuarioAutenticado.getRol() == Rol.CAJERO;
        if (!esAdminOCajero && !pedido.getUsuario().getId().equals(usuarioAutenticado.getId())) {
            throw new ReglaNegocioException("No tienes permisos para cancelar este pedido");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ReglaNegocioException("El pedido ya está cancelado");
        }
        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new ReglaNegocioException("No se puede cancelar un pedido que ya fue pagado");
        }
        if (pedido.getEstado() == EstadoPedido.LISTO) {
            throw new ReglaNegocioException("No se puede cancelar un pedido que ya está listo");
        }
        // Devolvemos el stock a cada producto
        for (DetallePedido detalle : pedido.getDetalles()) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        return convertirAResponse(pedidoRepository.save(pedido));
    }
    // 6. Confirmar pago y cerrar pedido
    @Transactional
    public PedidoResponse pagarPedido(Long pedidoId) {
    
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Pedido no encontrado: " + pedidoId
                        )
                );
    
        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ReglaNegocioException(
                    "No se puede pagar un pedido cancelado"
            );
        }
    
        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new ReglaNegocioException(
                    "El pedido ya se encuentra pagado"
            );
        }
    
        if (pedido.getEstado() != EstadoPedido.LISTO) {
            throw new ReglaNegocioException(
                    "Solo se puede pagar un pedido que esté LISTO"
            );
        }
    
        pedido.setEstado(EstadoPedido.PAGADO);
    
        return convertirAResponse(
                pedidoRepository.save(pedido)
        );
    }
}
