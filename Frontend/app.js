const API_BASE_URL = 'http://localhost:5000/api';

// Hàm chung để lấy dữ liệu từ API
async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    return response.json();
}

// Hiển thị danh sách sản phẩm
async function fetchProducts(filter = '') {
    const products = await fetchData('products');
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    // Lọc sản phẩm nếu có filter
    const filteredProducts = products.filter(product =>
        product.Product_name.toLowerCase().includes(filter.toLowerCase())
    );

    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.Product_name}</td>
            <td>${product.Price}</td>
            <td>${product.Quantity}</td>
            <td>
                <button onclick="editProduct('${product.Product_id}')">Sửa</button>
                <button onclick="deleteProduct('${product.Product_id}')">Xóa</button>
                <button onclick="sellProduct('${product.Product_id}')">Bán</button>
            </td>
        `;
        productList.appendChild(row);
    });
}

// Hiển thị danh sách danh mục sản phẩm
async function fetchCategories() {
    const categories = await fetchData('categories');
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.Category_id}</td>
            <td>${category.Category_name}</td>
        `;
        categoryList.appendChild(row);
    });
}

// Hiển thị danh sách nhà cung cấp
async function fetchSuppliers() {
    const suppliers = await fetchData('suppliers');
    const supplierList = document.getElementById('supplierList');
    supplierList.innerHTML = '';

    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.Supplier_id}</td>
            <td>${supplier.Supplier_name}</td>
            <td>${supplier.Address}</td>
            <td>${supplier.Phone}</td>
            <td>${supplier.Email}</td>
        `;
        supplierList.appendChild(row);
    });
}

// Hiển thị danh sách sản phẩm trong kho
async function fetchWarehouse() {
    const warehouse = await fetchData('warehouse');
    const warehouseList = document.getElementById('warehouseList');
    warehouseList.innerHTML = '';

    warehouse.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.Product_id}</td>
            <td>${item.Quantity}</td>
            <td>${item.Expiration_date}</td>
            <td>${item.Received_date}</td>
        `;
        warehouseList.appendChild(row);
    });
}

// Hiển thị lịch sử giao dịch
async function fetchSales() {
    const sales = await fetchData('sales');
    const salesList = document.getElementById('salesList');
    salesList.innerHTML = '';

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.Sale_id}</td>
            <td>${sale.Product_id}</td>
            <td>${sale.Quantity}</td>
            <td>${sale.Sale_date}</td>
            <td>${sale.Subtotal}</td>
            <td>${sale.Customer_name}</td>
            <td>${sale.Payment_method}</td>
        `;
        salesList.appendChild(row);
    });
}

// Gắn sự kiện cho form thêm sản phẩm
document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productQuantity = document.getElementById('productQuantity').value;

    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Product_name: productName,
            Price: productPrice,
            Quantity: productQuantity
        })
    });

    if (response.ok) {
        alert('Thêm sản phẩm thành công!');
        fetchProducts();
    }
});

// Gắn sự kiện lọc sản phẩm
document.getElementById('filterInput').addEventListener('input', (event) => {
    fetchProducts(event.target.value);
});

// Gọi các hàm để hiển thị dữ liệu ban đầu
fetchProducts();
fetchCategories();
fetchSuppliers();
fetchWarehouse();
fetchSales();
