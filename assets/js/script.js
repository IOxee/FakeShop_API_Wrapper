$(document).ready(function () {
    cargarProductos();
    fetch('https://fakestoreapi.com/carts')
        .then(response => response.json())
        .then(data => console.log(data));

});

let categories = {
    "all": "Todos los productos",
    "electronics": "Electrónicos",
    "jewelery": "Joyería",
    "men's clothing": "Ropa para hombres",
    "women's clothing": "Ropa para mujeres"
}
let activeCategory = 'all';
let limitedPressed = false;
let sortPressed = false;
let myCart = 0;
let nextCart = 0;
let deleteProductsCars = [];

function cargarProductos() {
    // Hacer una petición AJAX para obtener los productos de la API de FakeStore
    $.ajax({
        url: 'https://fakestoreapi.com/products', // URL de la API de FakeStore
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // Limpiar el contenedor de productos
            $('#productosContainer').empty();
            localStorage.setItem('products', JSON.stringify(data));
            $('#productstitle').text(categories['all']);

            // Recorrer los productos y agregarlos al contenedor
            $.each(data, function (index, producto) {
                $('#productosContainer').append(`
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${producto.title}</h5>
                                <p class="card-text">${producto.description}</p>
                                <p class="card-text">Precio: $${producto.price}</p>
                                <div class="text-end">
                                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });

            // Agregar listeners de eventos para los botones de editar y eliminar producto
            $('.editar-producto').click(function () {
                // Obtener el ID del producto a editar
                var productoId = $(this).data('id');

                // Obtener los datos del producto a editar
                $.ajax({
                    url: 'https://fakestoreapi.com/products/' + productoId,
                    type: 'GET',
                    success: function (producto) {
                        // Rellenar los campos del modal con los datos del producto
                        $('#productoNombre').val(producto.title);
                        $('#productoPrecio').val(producto.price);
                        $('#productoDescripcion').val(producto.description);
                        $('#productoImagen').attr('src', producto.image);

                        // Abrir el modal de edición
                        $('#productoModal').modal('show');

                        // Manejar el evento de click en el botón de guardar del modal
                        $('#saveProduct').click(function () {
                            // Obtener los nuevos valores de los campos del modal
                            var nuevoTitulo = $('#productoNombre').val();
                            var nuevoPrecio = $('#productoPrecio').val();
                            var nuevaDescripcion = $('#productoDescripcion').val();
                            var nuevaImagen = $('#productoImagen').attr('src');

                            // Realizar la petición PUT o PATCH para actualizar el producto
                            $.ajax({
                                url: 'https://fakestoreapi.com/products/' + productoId,
                                type: 'PATCH', // Cambiar a 'PUT' si se desea utilizar el método PUT
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    title: nuevoTitulo,
                                    price: nuevoPrecio,
                                    description: nuevaDescripcion,
                                    image: nuevaImagen
                                }),
                                success: function (json) {
                                    console.log(json);
                                },
                                error: function (error) {
                                    console.log(error);
                                }
                            });

                            // Cerrar el modal de edición
                            $('#productoModal').modal('hide');
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        // Aquí puedes manejar los errores en caso de que la petición falle
                    }
                });
            });


            $('.eliminar-producto').click(function () {
                // Obtener el ID del producto seleccionado
                var productoId = $(this).data('id');

                // Hacer una petición DELETE para eliminar el producto seleccionado
                fetch('https://fakestoreapi.com/products/' + productoId, {
                    method: "DELETE"
                }).then(response => {
                    if (response.ok) {
                        // Eliminación exitosa
                        console.log("Producto eliminado con éxito");
                        // Aquí puedes realizar las acciones necesarias en el DOM, como eliminar el elemento del producto eliminado
                    } else {
                        console.error("Error al eliminar el producto:", response.status);
                    }
                }).catch(error => console.error("Error al eliminar el producto:", error));
            });
        }
    });
}

// Función para manejar el clic en los enlaces de categoría
$('.nav-link-category').click(function (e) {
    e.preventDefault(); // Evitar comportamiento predeterminado de los enlaces

    // Obtener la categoría de data-category del enlace
    var category = $(this).data('category');

    $('.nav-link').removeClass('active'); // Remover la clase "active" de todos los enlaces
    $(this).addClass('active'); // Agregar la clase "active" al enlace seleccionado   
    console.log(category);
    if (category == 'all') {
        cargarProductos();
        return;
    }
    console.log('https://fakestoreapi.com/products/category/' + category);

    // Realizar la búsqueda por categoría
    $.ajax({
        url: 'https://fakestoreapi.com/products/category/' + category,
        method: 'GET',
        success: function (data) {
            // Actualizar la vista con los productos de la categoría seleccionada
            $('#productosContainer').empty(); // Vaciar el contenedor de productos antes de actualizar

            // Actualizar el título de la categoría
            activeCategory = category;
            $('#productstitle').text(categories[category]);

            // Recorrer los productos y agregarlos a la vista
            $.each(data, function (index, producto) {
                $('#productosContainer').append(`
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${producto.title}</h5>
                                <p class="card-text">${producto.description}</p>
                                <p class="card-text">Precio: $${producto.price}</p>
                                <div class="text-end">
                                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });
        },
        error: function (err) {
            console.error(err);
        }
    });
});

// Función para limiar los productos por categoria y cantidad
$("#btnLimitar").click(function () {
    let categoria = activeCategory;
    let limite = $("#limitInput").val();
    if (categoria == "all") {
        $.ajax({
            url: `https://fakestoreapi.com/products`,
            method: "GET",
            success: function (productos) {
                console.log(productos + " " + limite);

                let productosLimitados = productos.slice(0, limite);
                $("#productosContainer").empty();
                $("#productstitle").text(`Productos limitados a ${limite}`);

                productosLimitados.forEach(function (producto) {
                    $("#productosContainer").append(`
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.title}</h5>
                                    <p class="card-text">${producto.description}</p>
                                    <p class="card-text">Precio: $${producto.price}</p>
                                    <div class="text-end">
                                        <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                        <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error en la petición:", textStatus, errorThrown);
            }
        });
        return
    }
    $.ajax({
        url: `https://fakestoreapi.com/products/category/${categoria}`,
        method: "GET",
        success: function (productos) {
            console.log(productos + " " + limite);
            
            let productosLimitados = productos.slice(0, limite);
            $("#productosContainer").empty();
            $("#productstitle").text(`${categoria} (${productosLimitados.length} productos)`);
            
            productosLimitados.forEach(function (producto) {
                $("#productosContainer").append(`
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${producto.title}</h5>
                                <p class="card-text">${producto.description}</p>
                                <p class="card-text">Precio: $${producto.price}</p>
                                <div class="text-end">
                                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            console.error("Error en la petición:", textStatus, errorThrown);
        }
    });
});

$("#btnOrdenar").click(function () {
    let criterio = $("#ordenarSelect").val();
    fetch(`https://fakestoreapi.com/products?sort=${criterio}`)
        .then(response => response.json())
        .then(data => {
            console.clear();
            console.log(`https://fakestoreapi.com/products?sort=${criterio}`)
            $("#productosContainer").empty();
            data.forEach(function (producto) {
                console.log(producto);
                $('#productosContainer').append(`
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${producto.title}</h5>
                                <p class="card-text">${producto.description}</p>
                                <p class="card-text">Precio: $${producto.price}</p>
                                <div class="text-end">
                                    <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                    <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });
        })
        .catch(err => console.error(err));
});

$("#btnCombine").click(function () {
    let categoria = activeCategory;
    let limite = $("#limitInput").val();
    let criterio = $("#ordenarSelect").val();
    if (categoria == "all") {
        fetch(`https://fakestoreapi.com/products?sort=${criterio}&limit=${limite}`)
            .then(response => response.json())
            .then(data => {
                let productosLimitados = data.slice(0, limite);
                $("#productosContainer").empty();
                data.forEach(function (producto) {
                    $("#productosContainer").append(`
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.title}</h5>
                                    <p class="card-text">${producto.description}</p>
                                    <p class="card-text">Precio: $${producto.price}</p>
                                    <div class="text-end">
                                        <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                        <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                });
            });
    } else {
        fetch(`https://fakestoreapi.com/products/category/${categoria}?sort=${criterio}&limit=${limite}`)
            .then(response => response.json())
            .then(data => {
                let productosLimitados = data.slice(0, limite);
                $("#productosContainer").empty();
                data.forEach(function (producto) {
                    $("#productosContainer").append(`
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <img src="${producto.image}" alt="${producto.title}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.title}</h5>
                                    <p class="card-text">${producto.description}</p>
                                    <p class="card-text">Precio: $${producto.price}</p>
                                    <div class="text-end">
                                        <button class="btn btn-primary btn-sm editar-producto" data-id="${producto.id}">Editar</button>
                                        <button class="btn btn-danger btn-sm eliminar-producto" data-id="${producto.id}">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                });
            });
    }
});


$("#btnAddProduct").click(function () {
    $("#addProductModal").modal("show");
});

$("#saveAddProduct").click(function () {
    console.log(JSON.stringify({
        title: $("#addProductNombre").val(),
        price: $("#addProductPrecio").val(),
        description: $("#addProductDescripcion").val(),
        category: $("#addProductCategory").val(),
        image: $("#addProductImagen").files
    }));

    fetch('https://fakestoreapi.com/products',{
        method:"POST",
        body:JSON.stringify(
            {
                title: $("#addProductNombre").val(),
                price: $("#addProductPrecio").val(),
                description: $("#addProductDescripcion").val(),
                image: $("#addProductImagen").val(),
                category: $("#addProductCategory").val()
            }
        )
    })
    .then(res=>res.json())
    .then(json => {
        console.log(json);
        $("#addProductModal").modal("hide");
        $("#addProductNombre").val("");
        $("#addProductPrecio").val("");
        $("#addProductDescripcion").val("");
        $("#addProductImagen").val("");
        $("#addProductCategory").val("");

        let alert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Has creado un producto con éxito
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        $("#alertContainer").append(alert);

        setTimeout(function () {
            $(".alert").alert("close");
        },3000);
    })   
});

$("#showCartShopping").click(function () {
    $('#carritoModal').modal('show')
    myCart = Math.floor(Math.random() * 6) + 1;
    console.log(myCart);
    showMyCart();
    deleteProductsCars = document.querySelectorAll('.eliminar-producto-cart');
});

$('#randomCart').click(function () {
    let randomCart = Math.floor(Math.random() * 6) + 1;
    fetch(`https://fakestoreapi.com/carts/${randomCart}`)
        .then(response => response.json())
        .then(data => {
            $('#cartTable').removeClass('hidden');
            $('#cartTable').empty();
            let productos = JSON.parse(localStorage.getItem('products'));

            data.products.forEach(productoCarrito => {
                let producto = productos.find(producto => producto.id == productoCarrito.productId);
                $('#cartDate').text(productoCarrito.date);
                $('#cartTable').append(`
                    <tr>
                        <td>${producto.title}</td>
                        <td>${producto.price} €</td>
                        <td>${productoCarrito.quantity}</td>
                        <td>${producto.price * productoCarrito.quantity} €</td>
                        <td><button class="btn btn-danger btn-sm eliminar-producto-cart"  type="button"  data-id="${producto.id}">Eliminar</button></td>
                    </tr>
                `);
            });
        })
        .catch(err => console.error(err));
});

$('#myCart').click(function () {
    showMyCart();
});

function showMyCart() {
    fetch(`https://fakestoreapi.com/carts/${myCart}`)
    .then(response => response.json())
    .then(data => {
        $('#cartTable').removeClass('hidden');
        $('#cartTable').empty();
        let productos = JSON.parse(localStorage.getItem('products'));

        data.products.forEach(productoCarrito => {
            let producto = productos.find(producto => producto.id == productoCarrito.productId);
            $('#cartDate').text(productoCarrito.date);
            $('#cartTable').append(`
                <tr>
                    <td>${producto.title}</td>
                    <td>${producto.price} €</td>
                    <td>${productoCarrito.quantity}</td>
                    <td>${producto.price * productoCarrito.quantity} €</td>
                    <td><button class="btn btn-danger btn-sm eliminar-producto-cart"  type="button"  data-id="${producto.id}">Eliminar</button></td>
                </tr>
            `);
        });
    })
    .catch(err => console.error(err));
}


$('#nextCart').click(function () {
    if (nextCart == 0) {
        nextCart = myCart + 1;
    } else {
        if (nextCart == 6) {
            nextCart = 1;
        } else {
            nextCart++;
        }
    }
    fetch(`https://fakestoreapi.com/carts/${nextCart}`)
    .then(response => response.json())
    .then(data => {
        $('#cartTable').removeClass('hidden');
        $('#cartTable').empty();
        let productos = JSON.parse(localStorage.getItem('products'));

        data.products.forEach(productoCarrito => {
            let producto = productos.find(producto => producto.id == productoCarrito.productId);
            $('#cartDate').text(productoCarrito.date);
            $('#cartTable').append(`
                <tr>
                    <td>${producto.title}</td>
                    <td>${producto.price} €</td>
                    <td>${productoCarrito.quantity}</td>
                    <td>${producto.price * productoCarrito.quantity} €</td>
                    <td><button class="btn btn-danger btn-sm eliminar-producto-cart" type="button"  data-id="${producto.id}">Eliminar</button></td>
                </tr>
            `);
        });
    })
    .catch(err => console.error(err));
});

deleteProductsCars.forEach(deleteProductCart => {
    deleteProductCart.addEventListener('click', function () {
        console.log('click');
        let productId = this.getAttribute('data-id');
        let cartTable = document.querySelector('#cartTable');
        
        let alert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">   
                Oops! Algo ha ido mal, no se ha podido eliminar el producto del carrito
            </div>
        `;

        let carritoModal = document.querySelector('#carritoModalHeader');
        carritoModal.innerHTML += alert;
    });
});